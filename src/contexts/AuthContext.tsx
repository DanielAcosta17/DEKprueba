import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, firebaseStatus } from '../firebase/config';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { AdminUser } from '../types';

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isFirebaseConnected: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, pass: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  loginAsDemoAdmin: () => void;
  logout: () => Promise<void>;
}

export const DEFAULT_DEMO_CREDENTIALS = {
  email: 'admin@deknovacore.com',
  password: '',
};

// Traductor de códigos de error de Firebase Authentication al español
export function translateFirebaseAuthError(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Contraseña o correo incorrectos. Por favor, verifica tus credenciales.';
    case 'auth/user-not-found':
      return 'No se encontró ningún usuario registrado con este correo electrónico.';
    case 'auth/email-already-in-use':
      return 'Este correo ya se encuentra registrado en Firebase. Inicia sesión en su lugar.';
    case 'auth/weak-password':
      return 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.';
    case 'auth/invalid-email':
      return 'El formato del correo electrónico ingresado no es válido.';
    case 'auth/user-disabled':
      return 'Esta cuenta de administrador ha sido deshabilitada.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos. Por seguridad, espera unos minutos o restablece tu contraseña.';
    case 'auth/operation-not-allowed':
      return 'El proveedor de Correo/Contraseña no está habilitado en Firebase Authentication. Ve a Firebase Console > Authentication > Sign-in method y habilítalo.';
    case 'auth/network-request-failed':
      return 'Error de conexión de red al comunicarse con los servidores de Firebase.';
    default:
      return 'Error al autenticar: ' + errorCode.replace('auth/', '');
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('deknovacore_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Escuchar cambios de estado en Firebase Auth
  useEffect(() => {
    if (firebaseStatus.isConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          const adminUser: AdminUser = {
            uid: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Administrador',
            role: 'superadmin',
            photoURL: fbUser.photoURL || undefined,
          };
          setUser(adminUser);
          localStorage.setItem('deknovacore_auth_user', JSON.stringify(adminUser));
        } else {
          setUser(null);
          localStorage.removeItem('deknovacore_auth_user');
        }
        setIsLoading(false);
      });
      return () => unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    if (firebaseStatus.isConfigured && auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
        const adminUser: AdminUser = {
          uid: cred.user.uid,
          email: cred.user.email || email.trim(),
          displayName: cred.user.displayName || email.trim().split('@')[0] || 'Administrador',
          role: 'superadmin',
          photoURL: cred.user.photoURL || undefined,
        };
        setUser(adminUser);
        localStorage.setItem('deknovacore_auth_user', JSON.stringify(adminUser));
        setIsLoading(false);
        return { success: true };
      } catch (err: any) {
        setIsLoading(false);
        const translatedMsg = translateFirebaseAuthError(err.code || err.message || '');
        return { success: false, error: translatedMsg };
      }
    } else {
      // Modo local / demostración
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail && pass.length >= 4) {
        const demoUser: AdminUser = {
          uid: 'admin-local-' + Date.now(),
          email: cleanEmail,
          displayName: cleanEmail.split('@')[0] || 'Administrador',
          role: 'superadmin',
          photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        };
        setUser(demoUser);
        localStorage.setItem('deknovacore_auth_user', JSON.stringify(demoUser));
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return {
          success: false,
          error: 'Credenciales inválidas. Ingresa un correo válido y una contraseña de al menos 4 caracteres.',
        };
      }
    }
  };

  const register = async (
    email: string,
    pass: string,
    name?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    if (firebaseStatus.isConfigured && auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
        if (name && cred.user) {
          try {
            await updateProfile(cred.user, { displayName: name.trim() });
          } catch (profileErr) {
            console.warn('Could not update display name:', profileErr);
          }
        }
        const adminUser: AdminUser = {
          uid: cred.user.uid,
          email: cred.user.email || email.trim(),
          displayName: name?.trim() || email.trim().split('@')[0] || 'Administrador',
          role: 'superadmin',
        };
        setUser(adminUser);
        localStorage.setItem('deknovacore_auth_user', JSON.stringify(adminUser));
        setIsLoading(false);
        return { success: true };
      } catch (err: any) {
        setIsLoading(false);
        const translatedMsg = translateFirebaseAuthError(err.code || err.message || '');
        return { success: false, error: translatedMsg };
      }
    } else {
      // Modo local
      if (email.trim() && pass.length >= 6) {
        const demoUser: AdminUser = {
          uid: 'admin-local-' + Date.now(),
          email: email.trim(),
          displayName: name?.trim() || email.trim().split('@')[0] || 'Administrador',
          role: 'superadmin',
        };
        setUser(demoUser);
        localStorage.setItem('deknovacore_auth_user', JSON.stringify(demoUser));
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return {
          success: false,
          error: 'Ingresa un correo válido y una contraseña de al menos 6 caracteres.',
        };
      }
    }
  };

  const resetPassword = async (
    email: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    if (firebaseStatus.isConfigured && auth) {
      try {
        await sendPasswordResetEmail(auth, email.trim());
        return {
          success: true,
          message: 'Se ha enviado un correo con el enlace para restablecer tu contraseña.',
        };
      } catch (err: any) {
        return {
          success: false,
          error: translateFirebaseAuthError(err.code || err.message || ''),
        };
      }
    } else {
      return {
        success: true,
        message:
          'En modo Local, puedes ingresar con cualquier contraseña mayor a 4 caracteres o configurar Firebase en .env.',
      };
    }
  };

  const loginAsDemoAdmin = () => {
    const demoUser: AdminUser = {
      uid: 'admin-dek-001',
      email: DEFAULT_DEMO_CREDENTIALS.email,
      displayName: 'Administrador NovaCore',
      role: 'superadmin',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };
    setUser(demoUser);
    localStorage.setItem('deknovacore_auth_user', JSON.stringify(demoUser));
  };

  const logout = async () => {
    if (firebaseStatus.isConfigured && auth) {
      try {
        await fbSignOut(auth);
      } catch (err) {
        console.warn('Logout error:', err);
      }
    }
    setUser(null);
    localStorage.removeItem('deknovacore_auth_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isFirebaseConnected: firebaseStatus.isConfigured,
        login,
        register,
        resetPassword,
        loginAsDemoAdmin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

