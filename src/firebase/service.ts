import { db, storage, auth, firebaseStatus } from './config';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Business, Category, Product, Order } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
    },
    operationType,
    path,
  };
  console.error('Firestore Error Log:', JSON.stringify(errInfo));
  return errInfo;
}

const LOCAL_STORAGE_KEYS = {
  BUSINESSES: 'deknovacore_businesses',
  CATEGORIES: 'deknovacore_categories',
  PRODUCTS: 'deknovacore_products',
  ORDERS: 'deknovacore_orders',
};

// Purge any old demo data so the app starts cleanly at 0
export function cleanStorageToZero(): void {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.BUSINESSES);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.ORDERS);
    localStorage.removeItem('deknovacore_selected_business');
    localStorage.removeItem('deknovacore_cart');
    localStorage.setItem('deknovacore_zero_initialized', 'true');
  } catch (e) {
    console.error('Error cleaning storage:', e);
  }
}

// Local storage helper
function getLocalData<T>(key: string, defaultData: T[] = []): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return defaultData;
    }
    return JSON.parse(raw);
  } catch {
    return defaultData;
  }
}

function setLocalData<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export const DataService = {
  // ==================================================
  // 1. MIS NEGOCIOS (Businesses) & REALTIME LISTENERS
  // ==================================================
  async getBusinesses(): Promise<Business[]> {
    if (firebaseStatus.isConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'businesses'));
        const list = snap.docs.map((d) => d.data() as Business);
        setLocalData(LOCAL_STORAGE_KEYS.BUSINESSES, list);
        return list;
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, 'businesses');
      }
    }
    return getLocalData<Business>(LOCAL_STORAGE_KEYS.BUSINESSES, []);
  },

  subscribeBusinesses(callback: (businesses: Business[]) => void): Unsubscribe {
    if (firebaseStatus.isConfigured && db) {
      try {
        return onSnapshot(
          collection(db, 'businesses'),
          (snap) => {
            const list = snap.docs.map((d) => d.data() as Business);
            setLocalData(LOCAL_STORAGE_KEYS.BUSINESSES, list);
            callback(list);
          },
          (err) => {
            console.warn('[Firestore Live] Error en listener businesses:', err);
            callback(getLocalData<Business>(LOCAL_STORAGE_KEYS.BUSINESSES, []));
          }
        );
      } catch (e) {
        console.warn('Error starting onSnapshot businesses', e);
      }
    }
    callback(getLocalData<Business>(LOCAL_STORAGE_KEYS.BUSINESSES, []));
    return () => {};
  },

  async saveBusiness(business: Business): Promise<{ success: boolean; firestore: boolean; error?: string }> {
    const list = await this.getBusinesses();
    const idx = list.findIndex((b) => b.id === business.id);
    let updated: Business[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = business;
    } else {
      updated = [business, ...list];
    }
    setLocalData(LOCAL_STORAGE_KEYS.BUSINESSES, updated);

    let firestoreSuccess = false;
    let firestoreError: string | undefined;

    if (firebaseStatus.isConfigured && db) {
      try {
        await setDoc(doc(db, 'businesses', business.id), business);
        firestoreSuccess = true;
        console.log(`[Firestore] Negocio "${business.name}" (${business.id}) guardado exitosamente en Firestore.`);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `businesses/${business.id}`);
        firestoreError = err instanceof Error ? err.message : String(err);
      }
    }

    return { success: true, firestore: firestoreSuccess, error: firestoreError };
  },

  async deleteBusiness(businessId: string): Promise<{ success: boolean; firestore: boolean }> {
    const list = await this.getBusinesses();
    const updated = list.filter((b) => b.id !== businessId);
    setLocalData(LOCAL_STORAGE_KEYS.BUSINESSES, updated);

    // Clean up associated categories, products, and orders in local storage
    const cats = getLocalData<Category>(LOCAL_STORAGE_KEYS.CATEGORIES, []).filter((c) => c.businessId !== businessId);
    setLocalData(LOCAL_STORAGE_KEYS.CATEGORIES, cats);

    const prods = getLocalData<Product>(LOCAL_STORAGE_KEYS.PRODUCTS, []).filter((p) => p.businessId !== businessId);
    setLocalData(LOCAL_STORAGE_KEYS.PRODUCTS, prods);

    const ords = getLocalData<Order>(LOCAL_STORAGE_KEYS.ORDERS, []).filter((o) => o.businessId !== businessId);
    setLocalData(LOCAL_STORAGE_KEYS.ORDERS, ords);

    let firestoreSuccess = false;
    if (firebaseStatus.isConfigured && db) {
      try {
        // Eliminar el negocio
        await deleteDoc(doc(db, 'businesses', businessId));
        firestoreSuccess = true;

        // Eliminar también categorías y productos vinculados a este negocio en Firestore
        const [catSnap, prodSnap, ordSnap] = await Promise.all([
          getDocs(query(collection(db, 'categories'), where('businessId', '==', businessId))),
          getDocs(query(collection(db, 'products'), where('businessId', '==', businessId))),
          getDocs(query(collection(db, 'orders'), where('businessId', '==', businessId))),
        ]);

        const batch = writeBatch(db);
        catSnap.docs.forEach((d) => batch.delete(d.ref));
        prodSnap.docs.forEach((d) => batch.delete(d.ref));
        ordSnap.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();

        console.log(`[Firestore] Negocio ${businessId} y sus colecciones eliminados de Firestore.`);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `businesses/${businessId}`);
      }
    }
    return { success: true, firestore: firestoreSuccess };
  },

  // ==================================================
  // 2. CATEGORÍAS (Categories) & REALTIME LISTENERS
  // ==================================================
  async getCategories(businessId?: string): Promise<Category[]> {
    if (firebaseStatus.isConfigured && db) {
      try {
        if (businessId) {
          const subSnap = await getDocs(collection(db, `businesses/${businessId}/categories`));
          if (!subSnap.empty) {
            return subSnap.docs.map((d) => d.data() as Category);
          }
          const rootSnap = await getDocs(query(collection(db, 'categories'), where('businessId', '==', businessId)));
          return rootSnap.docs.map((d) => d.data() as Category);
        } else {
          const rootSnap = await getDocs(collection(db, 'categories'));
          const list = rootSnap.docs.map((d) => d.data() as Category);
          setLocalData(LOCAL_STORAGE_KEYS.CATEGORIES, list);
          return list;
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, businessId ? `businesses/${businessId}/categories` : 'categories');
      }
    }

    const all = getLocalData<Category>(LOCAL_STORAGE_KEYS.CATEGORIES, []);
    return businessId ? all.filter((c) => c.businessId === businessId) : all;
  },

  subscribeCategories(callback: (categories: Category[]) => void): Unsubscribe {
    if (firebaseStatus.isConfigured && db) {
      try {
        return onSnapshot(
          collection(db, 'categories'),
          (snap) => {
            const list = snap.docs.map((d) => d.data() as Category);
            setLocalData(LOCAL_STORAGE_KEYS.CATEGORIES, list);
            callback(list);
          },
          (err) => {
            console.warn('[Firestore Live] Error en listener categories:', err);
            callback(getLocalData<Category>(LOCAL_STORAGE_KEYS.CATEGORIES, []));
          }
        );
      } catch (e) {
        console.warn('Error starting onSnapshot categories', e);
      }
    }
    callback(getLocalData<Category>(LOCAL_STORAGE_KEYS.CATEGORIES, []));
    return () => {};
  },

  async saveCategory(category: Category): Promise<{ success: boolean; firestore: boolean; error?: string }> {
    const list = getLocalData<Category>(LOCAL_STORAGE_KEYS.CATEGORIES, []);
    const idx = list.findIndex((c) => c.id === category.id);
    let updated: Category[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = category;
    } else {
      updated = [...list, category];
    }
    setLocalData(LOCAL_STORAGE_KEYS.CATEGORIES, updated);

    let firestoreSuccess = false;
    let firestoreError: string | undefined;

    if (firebaseStatus.isConfigured && db) {
      try {
        await Promise.all([
          setDoc(doc(db, `businesses/${category.businessId}/categories`, category.id), category),
          setDoc(doc(db, 'categories', category.id), category),
        ]);
        firestoreSuccess = true;
        console.log(`[Firestore] Categoría "${category.name}" (${category.id}) guardada en Firestore.`);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `businesses/${category.businessId}/categories/${category.id}`);
        firestoreError = err instanceof Error ? err.message : String(err);
      }
    }

    return { success: true, firestore: firestoreSuccess, error: firestoreError };
  },

  async deleteCategory(categoryId: string, businessId: string): Promise<{ success: boolean; firestore: boolean }> {
    const list = getLocalData<Category>(LOCAL_STORAGE_KEYS.CATEGORIES, []);
    const updated = list.filter((c) => c.id !== categoryId);
    setLocalData(LOCAL_STORAGE_KEYS.CATEGORIES, updated);

    let firestoreSuccess = false;
    if (firebaseStatus.isConfigured && db) {
      try {
        await Promise.all([
          deleteDoc(doc(db, `businesses/${businessId}/categories`, categoryId)),
          deleteDoc(doc(db, 'categories', categoryId)),
        ]);
        firestoreSuccess = true;
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `businesses/${businessId}/categories/${categoryId}`);
      }
    }
    return { success: true, firestore: firestoreSuccess };
  },

  // ==================================================
  // 3. PRODUCTOS & CATÁLOGO (Products) & REALTIME LISTENERS
  // ==================================================
  async getProducts(businessId?: string): Promise<Product[]> {
    if (firebaseStatus.isConfigured && db) {
      try {
        if (businessId) {
          const subSnap = await getDocs(collection(db, `businesses/${businessId}/products`));
          if (!subSnap.empty) {
            return subSnap.docs.map((d) => d.data() as Product);
          }
          const rootSnap = await getDocs(query(collection(db, 'products'), where('businessId', '==', businessId)));
          return rootSnap.docs.map((d) => d.data() as Product);
        } else {
          const rootSnap = await getDocs(collection(db, 'products'));
          const list = rootSnap.docs.map((d) => d.data() as Product);
          setLocalData(LOCAL_STORAGE_KEYS.PRODUCTS, list);
          return list;
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, businessId ? `businesses/${businessId}/products` : 'products');
      }
    }

    const all = getLocalData<Product>(LOCAL_STORAGE_KEYS.PRODUCTS, []);
    return businessId ? all.filter((p) => p.businessId === businessId) : all;
  },

  subscribeProducts(callback: (products: Product[]) => void): Unsubscribe {
    if (firebaseStatus.isConfigured && db) {
      try {
        return onSnapshot(
          collection(db, 'products'),
          (snap) => {
            const list = snap.docs.map((d) => d.data() as Product);
            setLocalData(LOCAL_STORAGE_KEYS.PRODUCTS, list);
            callback(list);
          },
          (err) => {
            console.warn('[Firestore Live] Error en listener products:', err);
            callback(getLocalData<Product>(LOCAL_STORAGE_KEYS.PRODUCTS, []));
          }
        );
      } catch (e) {
        console.warn('Error starting onSnapshot products', e);
      }
    }
    callback(getLocalData<Product>(LOCAL_STORAGE_KEYS.PRODUCTS, []));
    return () => {};
  },

  async saveProduct(product: Product): Promise<{ success: boolean; firestore: boolean; error?: string }> {
    const list = getLocalData<Product>(LOCAL_STORAGE_KEYS.PRODUCTS, []);
    const idx = list.findIndex((p) => p.id === product.id);
    let updated: Product[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = product;
    } else {
      updated = [product, ...list];
    }
    setLocalData(LOCAL_STORAGE_KEYS.PRODUCTS, updated);

    let firestoreSuccess = false;
    let firestoreError: string | undefined;

    if (firebaseStatus.isConfigured && db) {
      try {
        await Promise.all([
          setDoc(doc(db, `businesses/${product.businessId}/products`, product.id), product),
          setDoc(doc(db, 'products', product.id), product),
        ]);
        firestoreSuccess = true;
        console.log(`[Firestore] Producto "${product.name}" (${product.id}) guardado en Firestore.`);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `businesses/${product.businessId}/products/${product.id}`);
        firestoreError = err instanceof Error ? err.message : String(err);
      }
    }

    return { success: true, firestore: firestoreSuccess, error: firestoreError };
  },

  async deleteProduct(productId: string, businessId: string): Promise<{ success: boolean; firestore: boolean }> {
    const list = getLocalData<Product>(LOCAL_STORAGE_KEYS.PRODUCTS, []);
    const updated = list.filter((p) => p.id !== productId);
    setLocalData(LOCAL_STORAGE_KEYS.PRODUCTS, updated);

    let firestoreSuccess = false;
    if (firebaseStatus.isConfigured && db) {
      try {
        await Promise.all([
          deleteDoc(doc(db, `businesses/${businessId}/products`, productId)),
          deleteDoc(doc(db, 'products', productId)),
        ]);
        firestoreSuccess = true;
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `businesses/${businessId}/products/${productId}`);
      }
    }
    return { success: true, firestore: firestoreSuccess };
  },

  // ==================================================
  // 4. PEDIDOS RECIBIDOS (Orders) & REALTIME LISTENERS
  // ==================================================
  async getOrders(businessId?: string): Promise<Order[]> {
    if (firebaseStatus.isConfigured && db) {
      try {
        if (businessId) {
          const subSnap = await getDocs(collection(db, `businesses/${businessId}/orders`));
          if (!subSnap.empty) {
            return subSnap.docs.map((d) => d.data() as Order);
          }
          const rootSnap = await getDocs(query(collection(db, 'orders'), where('businessId', '==', businessId)));
          return rootSnap.docs.map((d) => d.data() as Order);
        } else {
          const rootSnap = await getDocs(collection(db, 'orders'));
          const list = rootSnap.docs.map((d) => d.data() as Order);
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setLocalData(LOCAL_STORAGE_KEYS.ORDERS, list);
          return list;
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, businessId ? `businesses/${businessId}/orders` : 'orders');
      }
    }

    const all = getLocalData<Order>(LOCAL_STORAGE_KEYS.ORDERS, []);
    return businessId ? all.filter((o) => o.businessId === businessId) : all;
  },

  subscribeOrders(callback: (orders: Order[]) => void): Unsubscribe {
    if (firebaseStatus.isConfigured && db) {
      try {
        return onSnapshot(
          collection(db, 'orders'),
          (snap) => {
            const list = snap.docs.map((d) => d.data() as Order);
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setLocalData(LOCAL_STORAGE_KEYS.ORDERS, list);
            callback(list);
          },
          (err) => {
            console.warn('[Firestore Live] Error en listener orders:', err);
            callback(getLocalData<Order>(LOCAL_STORAGE_KEYS.ORDERS, []));
          }
        );
      } catch (e) {
        console.warn('Error starting onSnapshot orders', e);
      }
    }
    callback(getLocalData<Order>(LOCAL_STORAGE_KEYS.ORDERS, []));
    return () => {};
  },

  async saveOrder(order: Order): Promise<{ success: boolean; firestore: boolean; error?: string }> {
    const list = await this.getOrders();
    const updated = [order, ...list];
    setLocalData(LOCAL_STORAGE_KEYS.ORDERS, updated);

    let firestoreSuccess = false;
    let firestoreError: string | undefined;

    if (firebaseStatus.isConfigured && db) {
      try {
        await Promise.all([
          setDoc(doc(db, `businesses/${order.businessId}/orders`, order.id), order),
          setDoc(doc(db, 'orders', order.id), order),
        ]);
        firestoreSuccess = true;
        console.log(`[Firestore] Pedido #${order.id} guardado en Firestore.`);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `businesses/${order.businessId}/orders/${order.id}`);
        firestoreError = err instanceof Error ? err.message : String(err);
      }
    }

    return { success: true, firestore: firestoreSuccess, error: firestoreError };
  },

  async updateOrderStatus(
    orderId: string,
    businessId: string,
    status: Order['status']
  ): Promise<{ success: boolean; firestore: boolean }> {
    const list = await this.getOrders();
    const idx = list.findIndex((o) => o.id === orderId);
    if (idx >= 0) {
      list[idx] = { ...list[idx], status };
      setLocalData(LOCAL_STORAGE_KEYS.ORDERS, list);
    }

    let firestoreSuccess = false;
    if (firebaseStatus.isConfigured && db) {
      try {
        await Promise.all([
          setDoc(doc(db, `businesses/${businessId}/orders`, orderId), { status }, { merge: true }),
          setDoc(doc(db, 'orders', orderId), { status }, { merge: true }),
        ]);
        firestoreSuccess = true;
        console.log(`[Firestore] Estado de pedido #${orderId} actualizado a "${status}" en Firestore.`);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `businesses/${businessId}/orders/${orderId}`);
      }
    }
    return { success: true, firestore: firestoreSuccess };
  },

  async deleteOrder(orderId: string, businessId: string): Promise<{ success: boolean; firestore: boolean }> {
    const list = await this.getOrders();
    const updated = list.filter((o) => o.id !== orderId);
    setLocalData(LOCAL_STORAGE_KEYS.ORDERS, updated);

    let firestoreSuccess = false;
    if (firebaseStatus.isConfigured && db) {
      try {
        await Promise.all([
          deleteDoc(doc(db, `businesses/${businessId}/orders`, orderId)),
          deleteDoc(doc(db, 'orders', orderId)),
        ]);
        firestoreSuccess = true;
        console.log(`[Firestore] Pedido #${orderId} eliminado de Firestore.`);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `businesses/${businessId}/orders/${orderId}`);
      }
    }
    return { success: true, firestore: firestoreSuccess };
  },

  // ==================================================
  // 5. SINCRONIZACIÓN COMPLETA A FIRESTORE
  // ==================================================
  async syncAllToFirestore(
    businesses: Business[],
    categories: Category[],
    products: Product[],
    orders: Order[]
  ): Promise<{ success: boolean; message: string }> {
    if (!firebaseStatus.isConfigured || !db) {
      return {
        success: false,
        message: 'Firebase no está configurado en las variables de entorno.',
      };
    }

    const firestore = db;
    try {
      const batch = writeBatch(firestore);

      // Negocios
      for (const biz of businesses) {
        const ref = doc(firestore, 'businesses', biz.id);
        batch.set(ref, biz, { merge: true });
      }

      // Categorías
      for (const cat of categories) {
        const refRoot = doc(firestore, 'categories', cat.id);
        const refSub = doc(firestore, `businesses/${cat.businessId}/categories`, cat.id);
        batch.set(refRoot, cat, { merge: true });
        batch.set(refSub, cat, { merge: true });
      }

      // Productos
      for (const prod of products) {
        const refRoot = doc(firestore, 'products', prod.id);
        const refSub = doc(firestore, `businesses/${prod.businessId}/products`, prod.id);
        batch.set(refRoot, prod, { merge: true });
        batch.set(refSub, prod, { merge: true });
      }

      // Pedidos
      for (const ord of orders) {
        const refRoot = doc(firestore, 'orders', ord.id);
        const refSub = doc(firestore, `businesses/${ord.businessId}/orders`, ord.id);
        batch.set(refRoot, ord, { merge: true });
        batch.set(refSub, ord, { merge: true });
      }

      await batch.commit();
      return {
        success: true,
        message: `Sincronización masiva exitosa: ${businesses.length} negocios, ${categories.length} categorías, ${products.length} productos y ${orders.length} pedidos.`,
      };
    } catch (err) {
      const errInfo = handleFirestoreError(err, OperationType.WRITE, 'batch_sync');
      return {
        success: false,
        message: `Error al sincronizar con Firestore: ${errInfo.error}`,
      };
    }
  },

  // ==================================================
  // 6. STORAGE & LIMPIEZA
  // ==================================================
  async uploadImage(file: File, path: string): Promise<string> {
    if (firebaseStatus.isConfigured && storage) {
      try {
        const fileRef = ref(storage, path);
        const snapshot = await uploadBytes(fileRef, file);
        return await getDownloadURL(snapshot.ref);
      } catch (err) {
        console.warn('Firebase Storage upload failed, fallback to local URL:', err);
      }
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  resetDemoData(): void {
    cleanStorageToZero();
  },

  /**
   * Pone la plataforma en 0: elimina todos los documentos de Firestore
   * (negocios, categorías, productos y pedidos) y limpia localStorage.
   */
  async purgeAllFirestoreData(): Promise<{ success: boolean; deletedCount: number; message: string }> {
    cleanStorageToZero();

    if (!firebaseStatus.isConfigured || !db) {
      return {
        success: true,
        deletedCount: 0,
        message: 'Almacenamiento local limpiado en 0.',
      };
    }

    const firestore = db;
    let totalDeleted = 0;

    try {
      const [bizSnap, catSnap, prodSnap, ordSnap] = await Promise.all([
        getDocs(collection(firestore, 'businesses')),
        getDocs(collection(firestore, 'categories')),
        getDocs(collection(firestore, 'products')),
        getDocs(collection(firestore, 'orders')),
      ]);

      // Subcolecciones bajo negocios (categorías, productos y pedidos)
      const businessIdsToPurge = new Set<string>(bizSnap.docs.map((d) => d.id));
      ['biz-1', 'biz-2', 'biz-3', 'biz-4'].forEach((id) => businessIdsToPurge.add(id));

      const subDocsArrays: any[] = [];
      for (const bizId of businessIdsToPurge) {
        try {
          const [catSub, prodSub, ordSub] = await Promise.all([
            getDocs(collection(firestore, `businesses/${bizId}/categories`)),
            getDocs(collection(firestore, `businesses/${bizId}/products`)),
            getDocs(collection(firestore, `businesses/${bizId}/orders`)),
          ]);
          subDocsArrays.push(...catSub.docs, ...prodSub.docs, ...ordSub.docs);
        } catch {
          // ignore
        }
      }

      const batch = writeBatch(firestore);

      for (const d of bizSnap.docs) {
        batch.delete(d.ref);
        totalDeleted++;
      }
      for (const d of catSnap.docs) {
        batch.delete(d.ref);
        totalDeleted++;
      }
      for (const d of prodSnap.docs) {
        batch.delete(d.ref);
        totalDeleted++;
      }
      for (const d of ordSnap.docs) {
        batch.delete(d.ref);
        totalDeleted++;
      }
      for (const d of subDocsArrays) {
        batch.delete(d.ref);
        totalDeleted++;
      }

      if (totalDeleted > 0) {
        await batch.commit();
      }

      console.log(`[Firestore Purge] Se eliminaron ${totalDeleted} documentos de Firestore.`);
      return {
        success: true,
        deletedCount: totalDeleted,
        message: `Se eliminaron exitosamente ${totalDeleted} registros de Firestore. La plataforma está totalmente en 0.`,
      };
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'bulk_purge');
      return {
        success: false,
        deletedCount: totalDeleted,
        message: 'Error al purgar documentos en Firestore: ' + (err instanceof Error ? err.message : String(err)),
      };
    }
  },
};

