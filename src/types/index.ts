export type TemplateType = 'restaurant' | 'bakery' | 'fashion' | 'hardware' | 'general';

export interface Business {
  id: string;
  slug: string;
  name: string;
  businessType: string;
  tagline: string;
  description: string;
  logoUrl: string;
  coverUrl: string;
  phone: string;
  whatsapp: string;
  address: string;
  schedule: string;
  websiteUrl?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  primaryColor: string;
  secondaryColor: string;
  template: TemplateType;
  isActive: boolean;
  currency: string;
  deliveryAvailable?: boolean;
  deliveryCost?: number;
  featuredNotice?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  businessId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  imageUrl: string;
  tags: string[];
  isFeatured: boolean;
  isAvailable: boolean;
  sku?: string;
  unit?: string;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  customNotes?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  businessId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'contacted' | 'completed' | 'cancelled';
  notes?: string;
  channel: 'whatsapp' | 'web';
  createdAt: string;
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'superadmin' | 'owner';
  photoURL?: string;
}

export interface TemplateInfo {
  id: TemplateType;
  name: string;
  category: string;
  description: string;
  bestFor: string;
  previewColor: string;
  features: string[];
  icon: string;
}
