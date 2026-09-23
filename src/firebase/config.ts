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
// con valores por defecto del proyecto dek-novacore proporcionados por el usuario
const env = import.meta.env;

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBuT1NzljHU53CqkFImuOYEDihpFA9wC20',
  authDomain: 'dek-novacore.firebaseapp.com',
  projectId: 'dek-novacore',
  storageBucket: 'dek-novacore.firebasestorage.app',
  messagingSenderId: '497303288327',
  appId: '1:497303288327:web:9a8f3cf6a3b43c969348a2',
  measurementId: '',
};

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain,
  projectId: env.VITE_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
  appId: env.VITE_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || DEFAULT_FIREBASE_CONFIG.measurementId,
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
