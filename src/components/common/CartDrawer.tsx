import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  MessageCircle,
  Truck,
  MapPin,
  User,
  Phone,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { Business } from '../../types';

interface CartDrawerProps {
  business: Business;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ business }) => {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
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
  } = useCart();

  const [showDetails, setShowDetails] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const currency = business.currency || '$';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Container */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#16222f] dark:bg-[#111a24] text-white shadow-2xl flex flex-col border-l border-slate-700/80">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-700/80 flex items-center justify-between bg-[#111a24]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-500 text-slate-950 font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  Tu Pedido
                </h3>
                <p className="text-xs text-sky-300">
                  {business.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="p-2 text-rose-400 hover:bg-rose-950/40 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  title="Vaciar carrito"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={closeCart}
                className="p-2 text-sky-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-sky-950/80 border border-sky-800/60 flex items-center justify-center text-sky-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-white text-base">
                  El carrito está vacío
                </h4>
                <p className="text-xs text-sky-200 max-w-xs">
                  Explora el catálogo o menú de {business.name} y agrega los productos que deseas ordenar.
                </p>
                <button
                  onClick={closeCart}
                  className="mt-2 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              <>
                {/* Items List */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-3 bg-[#0f1722] rounded-xl border border-slate-700/80 flex items-start gap-3"
                    >
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-14 h-14 object-cover rounded-lg shrink-0 border border-slate-700"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-semibold text-xs text-white truncate">
                            {item.product.name}
                          </h4>
                          <span className="font-bold text-xs text-white shrink-0">
                            {currency}{(item.product.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-sky-300 font-semibold">
                          {currency}{item.product.price.toFixed(2)} c/u
                        </p>
                        {item.customNotes && (
                          <p className="text-[11px] text-amber-300 italic truncate mt-0.5 font-medium">
                            &quot;{item.customNotes}&quot;
                          </p>
                        )}

                        {/* Quantity controls */}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/60">
                          <div className="flex items-center gap-1.5 bg-[#16222f] rounded-lg border border-slate-700 p-0.5">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center text-sky-200 hover:bg-slate-700 rounded transition-colors cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-black px-1 text-white min-w-[18px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center text-sky-200 hover:bg-slate-700 rounded transition-colors cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-xs text-rose-400 hover:underline font-bold cursor-pointer"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Additional Customer Information Toggle */}
                <div className="border-t border-slate-700/70 pt-3">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="w-full text-left flex items-center justify-between text-xs font-bold text-sky-200 p-2.5 rounded-xl bg-[#0f1722] hover:bg-slate-800 border border-slate-700/80 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-sky-400" />
                      Datos de Envío y Contacto (Opcional)
                    </span>
                    <span className="text-[11px] text-sky-400 font-semibold">
                      {showDetails ? 'Ocultar' : 'Agregar'}
                    </span>
                  </button>

                  {showDetails && (
                    <div className="mt-3 p-3 bg-[#0f1722] rounded-xl space-y-2.5 border border-slate-700/80 animate-fade-in text-xs">
                      <div>
                        <label className="block text-xs font-bold text-sky-200 mb-1 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-sky-400" /> Tu Nombre:
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Laura Gómez"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-700 bg-[#16222f] text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-sky-200 mb-1 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-sky-400" /> Tu Teléfono:
                        </label>
                        <input
                          type="tel"
                          placeholder="Ej: +507 6123-4567"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-700 bg-[#16222f] text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-sky-200 mb-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-sky-400" /> Dirección de Entrega:
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Calle 50, Edif. Torre Marina Apto 4B"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-700 bg-[#16222f] text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-sky-200 mb-1 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-sky-400" /> Observaciones o Instrucciones:
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Ej: Sin cebolla, llamar al llegar, factura con RUC..."
                          value={orderNotes}
                          onChange={(e) => setOrderNotes(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-700 bg-[#16222f] text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* WhatsApp Message Preview Toggle */}
                <div className="pt-1">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-[11px] text-sky-400 hover:text-sky-300 underline font-medium cursor-pointer"
                  >
                    {showPreview ? 'Ocultar vista previa del mensaje' : 'Ver mensaje exacto que se enviará'}
                  </button>
                  {showPreview && (
                    <pre className="mt-2 p-3 bg-[#0f1722] text-emerald-300 text-[11px] rounded-xl border border-emerald-800/60 whitespace-pre-wrap font-mono">
                      {generateWhatsAppMessage(business)}
                    </pre>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer with Totals and WhatsApp CTA */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-700/80 bg-[#111a24] space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-sky-200">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-white">
                    {currency}{subtotal.toFixed(2)}
                  </span>
                </div>

                {business.deliveryAvailable && deliveryAddress && (
                  <div className="flex justify-between text-sky-200">
                    <span>Costo de envío:</span>
                    <span className="font-semibold text-white">
                      {currency}{(business.deliveryCost || 0).toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-700/80">
                  <span>Total a Pagar:</span>
                  <span className="text-base text-emerald-400">
                    {currency}
                    {(
                      subtotal +
                      (business.deliveryAvailable && deliveryAddress ? business.deliveryCost || 0 : 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Main CTA: Realizar pedido por WhatsApp */}
              <button
                onClick={() => sendWhatsAppOrder(business)}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/25 transition-all shine-effect cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>Realizar pedido por WhatsApp</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </button>

              <p className="text-[11px] text-center text-sky-300/80">
                Se abrirá tu WhatsApp con el mensaje pre-cargado para confirmar con {business.name}.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
