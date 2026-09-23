import React, { createContext, useContext, useState, useMemo } from 'react';
import { Product, CartItem, Business, Order } from '../types';
import { useBusiness } from './BusinessContext';

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (product: Product, quantity?: number, notes?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  total: number;
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  deliveryAddress: string;
  setDeliveryAddress: (address: string) => void;
  orderNotes: string;
  setOrderNotes: (notes: string) => void;
  sendWhatsAppOrder: (business: Business) => Promise<void>;
  generateWhatsAppMessage: (business: Business) => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const { createOrder } = useBusiness();

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  const addToCart = (product: Product, quantity = 1, notes = '') => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity, customNotes: notes || item.customNotes }
            : item
        );
      }
      return [...prev, { product, quantity, customNotes: notes }];
    });
    setIsOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setCustomerName('');
    setCustomerPhone('');
    setDeliveryAddress('');
    setOrderNotes('');
  };

  const totalItems = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [items]);

  const total = subtotal;

  const generateWhatsAppMessage = (business: Business): string => {
    const currency = business.currency || '$';
    let msg = `Hola *${business.name}*, quiero realizar el siguiente pedido:\n\n`;

    items.forEach((item) => {
      const lineTotal = (item.product.price * item.quantity).toFixed(2);
      msg += `▪ ${item.quantity}x ${item.product.name} - ${currency}${lineTotal}\n`;
      if (item.customNotes) {
        msg += `   _Nota: ${item.customNotes}_\n`;
      }
    });

    msg += `\n*Subtotal:* ${currency}${subtotal.toFixed(2)}`;

    if (business.deliveryAvailable && deliveryAddress) {
      const cost = business.deliveryCost || 0;
      msg += `\n*Envío a domicilio:* ${currency}${cost.toFixed(2)}`;
      msg += `\n*Total estimado:* ${currency}${(subtotal + cost).toFixed(2)}`;
    } else {
      msg += `\n*Total:* ${currency}${total.toFixed(2)}`;
    }

    if (customerName.trim()) {
      msg += `\n\n*Cliente:* ${customerName.trim()}`;
    }
    if (customerPhone.trim()) {
      msg += `\n*Teléfono:* ${customerPhone.trim()}`;
    }
    if (deliveryAddress.trim()) {
      msg += `\n*Dirección de entrega:* ${deliveryAddress.trim()}`;
    }
    if (orderNotes.trim()) {
      msg += `\n*Observaciones adicionales:* ${orderNotes.trim()}`;
    }

    msg += `\n\n_Generado a través de nuestro sitio web impulsado por D. E. K NovaCore_`;
    return msg;
  };

  const sendWhatsAppOrder = async (business: Business) => {
    if (items.length === 0) return;

    // Log the order in history
    try {
      await createOrder({
        businessId: business.id,
        customerName: customerName.trim() || 'Cliente WhatsApp',
        customerPhone: customerPhone.trim() || business.whatsapp,
        deliveryAddress: deliveryAddress.trim() || undefined,
        items: items.map((i) => ({
          productId: i.product.id,
          productName: i.product.name,
          quantity: i.quantity,
          unitPrice: i.product.price,
          subtotal: i.product.price * i.quantity,
        })),
        totalAmount: total,
        status: 'pending',
        notes: orderNotes.trim() || undefined,
        channel: 'whatsapp',
      });
    } catch (e) {
      console.warn('Could not record order to database:', e);
    }

    const message = generateWhatsAppMessage(business);
    // Número directo oficial de Panamá (+507 6024 4779) para recepción de pedidos
    const bizDigits = business.whatsapp ? business.whatsapp.replace(/\D/g, '') : '';
    const cleanPhone = (bizDigits.length >= 7 && !bizDigits.includes('60000000'))
      ? bizDigits
      : '50760244779';

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        total,
        customerName,
        setCustomerName,
        customerPhone,
        setCustomerPhone,
        deliveryAddress,
        setDeliveryAddress,
        orderNotes,
        setOrderNotes,
        sendWhatsAppOrder,
        generateWhatsAppMessage,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
