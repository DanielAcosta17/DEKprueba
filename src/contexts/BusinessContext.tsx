import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Business, Category, Product, Order, TemplateType } from '../types';
import { DataService } from '../firebase/service';

// Reset old demo data once so the web starts completely at 0 as requested by the user
if (typeof window !== 'undefined' && !localStorage.getItem('deknovacore_zero_cleaned_v3')) {
  DataService.resetDemoData();
  localStorage.setItem('deknovacore_zero_cleaned_v3', 'true');
}

interface BusinessContextType {
  businesses: Business[];
  categories: Category[];
  products: Product[];
  orders: Order[];
  selectedBusinessId: string;
  activeBusiness: Business | null;
  isLoading: boolean;
  activeView: 'landing' | 'admin' | 'public_store';
  currentPublicSlug: string | null;
  
  // Navigation & View switching
  goToLanding: () => void;
  goToAdmin: () => void;
  goToPublicStore: (slug: string) => void;
  setSelectedBusinessId: (id: string) => void;
  
  // Business CRUD
  createBusiness: (bizData: Partial<Business>) => Promise<Business>;
  updateBusiness: (biz: Business) => Promise<void>;
  deleteBusiness: (id: string) => Promise<void>;
  toggleBusinessActive: (id: string) => Promise<void>;
  getBusinessBySlug: (slug: string) => Business | undefined;
  
  // Product CRUD
  createProduct: (prodData: Partial<Product>) => Promise<Product>;
  updateProduct: (prod: Product) => Promise<void>;
  deleteProduct: (id: string, businessId: string) => Promise<void>;
  toggleProductAvailable: (id: string) => Promise<void>;
  
  // Category CRUD
  createCategory: (catData: Partial<Category>) => Promise<Category>;
  updateCategory: (cat: Category) => Promise<void>;
  deleteCategory: (id: string, businessId: string) => Promise<void>;
  
  // Order submission & status management
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, businessId: string, status: Order['status']) => Promise<void>;
  deleteOrder: (orderId: string, businessId: string) => Promise<void>;
  
  // Direct Firestore Sync
  syncAllToFirestore: () => Promise<{ success: boolean; message: string }>;
  lastFirestoreSyncTime: string | null;
  syncNotification: string | null;

  // Default home page setting
  defaultHomePage: 'landing' | 'store';
  setDefaultHomePage: (mode: 'landing' | 'store') => void;

  // Purge / Reset to zero
  purgeAllData: () => Promise<{ success: boolean; deletedCount: number; message: string }>;
  resetData: () => Promise<void>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

// Utility to extract a clean slug from any format (URL, hash, path, or raw slug)
export const extractCleanSlug = (input: string): string => {
  if (!input) return '';
  let cleaned = input.trim();

  // Try parsing as URL if starts with http://, https://, or //
  if (/^(?:https?:)?\/\//i.test(cleaned)) {
    try {
      // Ensure protocol for valid URL constructor
      const fullUrl = cleaned.startsWith('//') ? `https:${cleaned}` : cleaned;
      const url = new URL(fullUrl);

      // Case A: Hash present: e.g. #negocio/mi-slug or #mi-slug
      if (url.hash) {
        const hashClean = url.hash.replace(/^#\/?(?:negocio|tienda)?\/?/i, '').split('?')[0];
        if (hashClean && hashClean !== 'admin' && hashClean !== 'inicio') {
          cleaned = hashClean;
        }
      }

      // Case B: If not resolved by hash, check pathname: e.g. /negocio/mi-slug or /mi-slug
      if (/^(?:https?:)?\/\//i.test(cleaned)) {
        const pathClean = url.pathname.replace(/^\/?(?:negocio|tienda)?\/?/i, '').replace(/^\/+|\/+$/g, '');
        if (pathClean && pathClean !== 'admin' && pathClean !== 'inicio') {
          const segments = pathClean.split('/').filter(Boolean);
          cleaned = segments[segments.length - 1] || segments[0] || '';
        } else {
          // Case C: Root or no path: extract from subdomain/hostname (e.g. mi-negocio.vercel.app -> mi-negocio)
          const hostParts = url.hostname.split('.');
          if (hostParts.length > 2 && hostParts[0] !== 'www') {
            cleaned = hostParts[0];
          } else if (hostParts.length >= 2) {
            cleaned = hostParts[0] === 'www' ? hostParts[1] : hostParts[0];
          } else {
            cleaned = url.hostname;
          }
        }
      }
    } catch {
      cleaned = cleaned.replace(/^(?:https?:)?\/\//i, '');
    }
  }

  // Handle generic hash or query string if remaining
  if (cleaned.includes('#')) {
    cleaned = cleaned.split('#')[1] || '';
  }
  if (cleaned.includes('?')) {
    cleaned = cleaned.split('?')[0] || '';
  }
  cleaned = cleaned.replace(/^\/?(?:negocio|tienda)\//i, '');
  cleaned = cleaned.replace(/^\/+|\/+$/g, '');

  return cleaned
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
};

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [activeView, setActiveView] = useState<'landing' | 'admin' | 'public_store'>('landing');
  const [currentPublicSlug, setCurrentPublicSlug] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastFirestoreSyncTime, setLastFirestoreSyncTime] = useState<string | null>(null);
  const [syncNotification, setSyncNotification] = useState<string | null>(null);
  const [defaultHomePage, setDefaultHomePageState] = useState<'landing' | 'store'>(() => {
    return (localStorage.getItem('deknovacore_default_home_page') as 'landing' | 'store') || 'landing';
  });

  const setDefaultHomePage = (mode: 'landing' | 'store') => {
    setDefaultHomePageState(mode);
    localStorage.setItem('deknovacore_default_home_page', mode);
    showSyncToast(`Página de inicio configurada a: ${mode === 'store' ? 'Catálogo del Negocio' : 'Landing Page'}`);
  };

  const showSyncToast = (msg: string) => {
    setSyncNotification(msg);
    setTimeout(() => setSyncNotification(null), 3500);
  };

  // Purga forzada inicial para garantizar que la plataforma quede 100% en 0
  useEffect(() => {
    if (!localStorage.getItem('deknovacore_zero_purged_final')) {
      localStorage.setItem('deknovacore_zero_purged_final', 'true');
      DataService.purgeAllFirestoreData().then((res) => {
        setBusinesses([]);
        setCategories([]);
        setProducts([]);
        setOrders([]);
        setSelectedBusinessId('');
        if (res.deletedCount > 0) {
          showSyncToast(`Se purgaron ${res.deletedCount} registros antiguos. Plataforma en 0.`);
        }
      });
    }
  }, []);

  // Real-time Firestore synchronization listeners
  useEffect(() => {
    setIsLoading(true);

    const safetyTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    const unsubBiz = DataService.subscribeBusinesses((bizList) => {
      setBusinesses(bizList);
      setSelectedBusinessId((prev) => {
        if (currentPublicSlug) {
          const match = bizList.find((b) => b.slug.toLowerCase() === currentPublicSlug.toLowerCase());
          if (match) return match.id;
        }
        if (prev && bizList.some((b) => b.id === prev)) {
          return prev;
        }
        return bizList.length > 0 ? bizList[0].id : '';
      });
      setIsLoading(false);
    });

    const unsubCat = DataService.subscribeCategories((catList) => {
      setCategories(catList);
    });

    const unsubProd = DataService.subscribeProducts((prodList) => {
      setProducts(prodList);
    });

    const unsubOrd = DataService.subscribeOrders((ordList) => {
      setOrders(ordList);
    });

    return () => {
      clearTimeout(safetyTimer);
      unsubBiz();
      unsubCat();
      unsubProd();
      unsubOrd();
    };
  }, []);

  const cleanCurrentSlug = currentPublicSlug ? extractCleanSlug(currentPublicSlug) : null;
  const activeBusiness =
    (cleanCurrentSlug
      ? businesses.find(
          (b) =>
            extractCleanSlug(b.slug) === cleanCurrentSlug ||
            b.slug.toLowerCase() === cleanCurrentSlug ||
            b.id === cleanCurrentSlug
        )
      : null) ||
    businesses.find((b) => b.id === selectedBusinessId) ||
    (businesses.length > 0 ? businesses[0] : null);

  // View navigation helpers
  const goToLanding = () => {
    setActiveView('landing');
    setCurrentPublicSlug(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToAdmin = () => {
    setActiveView('admin');
    setCurrentPublicSlug(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToPublicStore = (slugOrUrl: string) => {
    const cleanSlug = extractCleanSlug(slugOrUrl);
    setCurrentPublicSlug(cleanSlug);
    const found = businesses.find(
      (b) =>
        extractCleanSlug(b.slug) === cleanSlug ||
        b.slug.toLowerCase() === cleanSlug ||
        b.id === cleanSlug
    );
    if (found) {
      setSelectedBusinessId(found.id);
      setCurrentPublicSlug(found.slug);
    }
    setActiveView('public_store');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getBusinessBySlug = (slugOrUrl: string) => {
    const clean = extractCleanSlug(slugOrUrl);
    return businesses.find(
      (b) => extractCleanSlug(b.slug) === clean || b.slug.toLowerCase() === clean || b.id === clean
    );
  };

  // Business CRUD
  const createBusiness = async (bizData: Partial<Business>): Promise<Business> => {
    const rawSlug = (bizData.name || 'negocio')
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const finalSlug = extractCleanSlug(bizData.slug || rawSlug || 'mi-negocio');

    const newBiz: Business = {
      id: 'biz-' + Date.now(),
      slug: finalSlug,
      name: bizData.name || 'Nuevo Negocio',
      businessType: bizData.businessType || 'General',
      tagline: bizData.tagline || 'Calidad y servicio garantizado',
      description: bizData.description || 'Bienvenido a nuestro catálogo digital.',
      logoUrl: bizData.logoUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&auto=format&fit=crop&q=80',
      coverUrl: bizData.coverUrl || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80',
      phone: bizData.phone || '+507 6024-4779',
      whatsapp: bizData.whatsapp || '50760244779',
      address: bizData.address || 'Ciudad de Panamá',
      schedule: bizData.schedule || 'Lunes a Sábado: 9:00 AM - 6:00 PM',
      websiteUrl: bizData.websiteUrl || '',
      instagram: bizData.instagram || '',
      facebook: bizData.facebook || '',
      tiktok: bizData.tiktok || '',
      primaryColor: bizData.primaryColor || '#253745',
      secondaryColor: bizData.secondaryColor || '#F8FAFC',
      template: (bizData.template as TemplateType) || 'general',
      isActive: bizData.isActive ?? true,
      currency: bizData.currency || '$',
      deliveryAvailable: bizData.deliveryAvailable ?? true,
      deliveryCost: bizData.deliveryCost ?? 3.0,
      featuredNotice: bizData.featuredNotice || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await DataService.saveBusiness(newBiz);
    setBusinesses((prev) => [newBiz, ...prev]);
    setSelectedBusinessId(newBiz.id);

    // Create default category
    const defaultCat: Category = {
      id: 'cat-' + Date.now(),
      businessId: newBiz.id,
      name: 'Destacados',
      description: 'Productos principales del catálogo',
      icon: 'Star',
      sortOrder: 1,
      isActive: true,
    };
    await DataService.saveCategory(defaultCat);
    setCategories((prev) => [...prev, defaultCat]);

    return newBiz;
  };

  const updateBusiness = async (biz: Business) => {
    const updatedBiz = {
      ...biz,
      slug: extractCleanSlug(biz.slug) || biz.slug,
      updatedAt: new Date().toISOString(),
    };
    await DataService.saveBusiness(updatedBiz);
    setBusinesses((prev) => prev.map((b) => (b.id === biz.id ? updatedBiz : b)));
  };

  const deleteBusiness = async (id: string) => {
    await DataService.deleteBusiness(id);
    const updated = businesses.filter((b) => b.id !== id);
    setBusinesses(updated);
    setCategories((prev) => prev.filter((c) => c.businessId !== id));
    setProducts((prev) => prev.filter((p) => p.businessId !== id));
    setOrders((prev) => prev.filter((o) => o.businessId !== id));
    if (selectedBusinessId === id) {
      setSelectedBusinessId(updated.length > 0 ? updated[0].id : '');
    }
    showSyncToast('Negocio eliminado exitosamente de Firestore');
  };

  const toggleBusinessActive = async (id: string) => {
    const biz = businesses.find((b) => b.id === id);
    if (!biz) return;
    const updated = { ...biz, isActive: !biz.isActive, updatedAt: new Date().toISOString() };
    await updateBusiness(updated);
  };

  // Product CRUD
  const createProduct = async (prodData: Partial<Product>): Promise<Product> => {
    const targetBusinessId = prodData.businessId || selectedBusinessId;
    const newProd: Product = {
      id: 'prod-' + Date.now(),
      businessId: targetBusinessId,
      categoryId: prodData.categoryId || (categories.find(c => c.businessId === targetBusinessId)?.id || 'general'),
      name: prodData.name || 'Nuevo Producto',
      description: prodData.description || '',
      price: Number(prodData.price) || 0,
      comparePrice: prodData.comparePrice ? Number(prodData.comparePrice) : undefined,
      imageUrl: prodData.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
      tags: prodData.tags || [],
      isFeatured: prodData.isFeatured ?? false,
      isAvailable: prodData.isAvailable ?? true,
      sku: prodData.sku || '',
      unit: prodData.unit || '',
      createdAt: new Date().toISOString(),
    };

    await DataService.saveProduct(newProd);
    setProducts((prev) => [newProd, ...prev]);
    return newProd;
  };

  const updateProduct = async (prod: Product) => {
    await DataService.saveProduct(prod);
    setProducts((prev) => prev.map((p) => (p.id === prod.id ? prod : p)));
  };

  const deleteProduct = async (id: string, businessId: string) => {
    await DataService.deleteProduct(id, businessId);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const toggleProductAvailable = async (id: string) => {
    const p = products.find((prod) => prod.id === id);
    if (!p) return;
    const updated = { ...p, isAvailable: !p.isAvailable };
    await updateProduct(updated);
  };

  // Category CRUD
  const createCategory = async (catData: Partial<Category>): Promise<Category> => {
    const targetBusinessId = catData.businessId || selectedBusinessId;
    const newCat: Category = {
      id: 'cat-' + Date.now(),
      businessId: targetBusinessId,
      name: catData.name || 'Nueva Categoría',
      description: catData.description || '',
      icon: catData.icon || 'Tag',
      sortOrder: catData.sortOrder || categories.filter(c => c.businessId === targetBusinessId).length + 1,
      isActive: catData.isActive ?? true,
    };

    await DataService.saveCategory(newCat);
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  };

  const updateCategory = async (cat: Category) => {
    await DataService.saveCategory(cat);
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? cat : c)));
  };

  const deleteCategory = async (id: string, businessId: string) => {
    await DataService.deleteCategory(id, businessId);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // Order creation and status update
  const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt'>): Promise<Order> => {
    const newOrder: Order = {
      ...orderData,
      id: 'ord-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    const res = await DataService.saveOrder(newOrder);
    setOrders((prev) => [newOrder, ...prev]);
    if (res.firestore) {
      setLastFirestoreSyncTime(new Date().toLocaleTimeString());
      showSyncToast(`Pedido #${newOrder.id.slice(-6).toUpperCase()} guardado en Cloud Firestore.`);
    }
    return newOrder;
  };

  const updateOrderStatus = async (
    orderId: string,
    businessId: string,
    status: Order['status']
  ): Promise<void> => {
    const res = await DataService.updateOrderStatus(orderId, businessId, status);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    if (res.firestore) {
      setLastFirestoreSyncTime(new Date().toLocaleTimeString());
      showSyncToast(`Estado del pedido actualizado a "${status}" en Firestore.`);
    }
  };

  const deleteOrder = async (orderId: string, businessId: string): Promise<void> => {
    const res = await DataService.deleteOrder(orderId, businessId);
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    if (res.firestore) {
      setLastFirestoreSyncTime(new Date().toLocaleTimeString());
      showSyncToast(`Pedido #${orderId.slice(-6).toUpperCase()} eliminado de Firestore.`);
    }
  };

  // Mass synchronization to Firestore
  const syncAllToFirestore = async (): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    try {
      const res = await DataService.syncAllToFirestore(
        businesses,
        categories,
        products,
        orders
      );
      if (res.success) {
        const time = new Date().toLocaleTimeString();
        setLastFirestoreSyncTime(time);
        showSyncToast(res.message);
        return { success: true, message: res.message };
      } else {
        const errMsg = res.message || 'Error desconocido al sincronizar.';
        showSyncToast(`Error al sincronizar: ${errMsg}`);
        return { success: false, message: errMsg };
      }
    } finally {
      setIsLoading(false);
    }
  };

  const purgeAllData = async (): Promise<{ success: boolean; deletedCount: number; message: string }> => {
    setIsLoading(true);
    try {
      const res = await DataService.purgeAllFirestoreData();
      setBusinesses([]);
      setCategories([]);
      setProducts([]);
      setOrders([]);
      setSelectedBusinessId('');
      showSyncToast(res.message);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const resetData = async () => {
    await purgeAllData();
  };

  return (
    <BusinessContext.Provider
      value={{
        businesses,
        categories,
        products,
        orders,
        selectedBusinessId,
        activeBusiness,
        isLoading,
        activeView,
        currentPublicSlug,
        lastFirestoreSyncTime,
        syncNotification,
        goToLanding,
        goToAdmin,
        goToPublicStore,
        setSelectedBusinessId,
        createBusiness,
        updateBusiness,
        deleteBusiness,
        toggleBusinessActive,
        getBusinessBySlug,
        createProduct,
        updateProduct,
        deleteProduct,
        toggleProductAvailable,
        createCategory,
        updateCategory,
        deleteCategory,
        createOrder,
        updateOrderStatus,
        deleteOrder,
        syncAllToFirestore,
        defaultHomePage,
        setDefaultHomePage,
        purgeAllData,
        resetData,
      }}
    >
      {syncNotification && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#253745] text-white px-4 py-3 rounded-xl shadow-2xl border border-blue-400/30 flex items-center gap-2.5 text-xs font-semibold animate-fade-in">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{syncNotification}</span>
        </div>
      )}
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};
