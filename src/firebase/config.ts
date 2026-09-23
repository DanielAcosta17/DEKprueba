import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

export interface FirebaseEnvStatus {
  isConfigured: boolean;
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
  missingKeys: string[];
}

// Configuración de credenciales de Firebase leídas desde variables de entorno VITE_FIREBASE_*
const env = import.meta.env;

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: env.VITE_FIREBASE_APP_ID || '',
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

/**
 * Comprueba el estado de configuración de las variables de Firebase
 */
export function checkFirebaseConfig(): FirebaseEnvStatus {
  const missingKeys: string[] = [];
  if (!firebaseConfig.apiKey) missingKeys.push('VITE_FIREBASE_API_KEY');
  if (!firebaseConfig.authDomain) missingKeys.push('VITE_FIREBASE_AUTH_DOMAIN');
  if (!firebaseConfig.projectId) missingKeys.push('VITE_FIREBASE_PROJECT_ID');
  if (!firebaseConfig.storageBucket) missingKeys.push('VITE_FIREBASE_STORAGE_BUCKET');
  if (!firebaseConfig.appId) missingKeys.push('VITE_FIREBASE_APP_ID');

  const isConfigured = Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey.trim().length > 5
  );

  return {
    isConfigured,
    ...firebaseConfig,
    missingKeys,
  };
}

export const firebaseStatus = checkFirebaseConfig();
export const isFirebaseConfigured = firebaseStatus.isConfigured;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

// Inicialización controlada de servicios de Firebase
if (firebaseStatus.isConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.info(
      `[D. E. K NovaCore] Firebase inicializado con éxito. Proyecto: ${firebaseConfig.projectId}`
    );
  } catch (error) {
    console.warn('[D. E. K NovaCore] Advertencia al inicializar Firebase SDK:', error);
  }
} else {
  console.info(
    '[D. E. K NovaCore] Ejecutando en Modo Local-First interactivo. Para sincronización en la nube con Google Firestore y Storage, configura las variables VITE_FIREBASE_*.'
  );
}

/**
 * Instancias exportadas de Firebase para su consumo en toda la aplicación
 */
export { app, auth, db, storage };
export default app;
