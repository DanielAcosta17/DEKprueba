import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Shield,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  KeyRound,
  UserPlus,
  LogIn,
  Layers,
  Database,
  ExternalLink,
} from 'lucide-react';
import { useAuth, DEFAULT_DEMO_CREDENTIALS } from '../../contexts/AuthContext';
import { useBusiness } from '../../contexts/BusinessContext';
import { firebaseStatus } from '../../firebase/config';
import { FirebaseSetupModal } from '../common/FirebaseSetupModal';

export const AdminLoginView: React.FC = () => {
  const { login, register, resetPassword, isFirebaseConnected } = useAuth();
  const { goToLanding } = useBusiness();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage('Por favor, ingresa tu correo electrónico.');
      return;
    }

    if (mode === 'forgot') {
      setLoading(true);
      const res = await resetPassword(email);
      setLoading(false);
      if (res.success) {
        setSuccessMessage(
          res.message || 'Se ha enviado un correo para restablecer tu contraseña.'
        );
      } else {
        setErrorMessage(res.error || 'No fue posible enviar el correo de recuperación.');
      }
      return;
    }

    if (!password) {
      setErrorMessage('Por favor, ingresa tu contraseña.');
      return;
    }

    if (mode === 'register' && password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);

    if (mode === 'register') {
      const res = await register(email, password, name);
      setLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Error al registrar el administrador en Firebase.');
      }
    } else {
      const res = await login(email, password);
      setLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Error al iniciar sesión con Firebase Authentication.');
      }
    }
  };

  const handleFillDemo = () => {
    setEmail(DEFAULT_DEMO_CREDENTIALS.email);
    setPassword(DEFAULT_DEMO_CREDENTIALS.password);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-[#253745] selection:text-white">
      {/* Background ambient decorative glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#253745]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top back button */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={goToLanding}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-semibold backdrop-blur transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Sitio</span>
        </button>
      </div>

      {/* Firebase status top right button */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={() => setIsFirebaseModalOpen(true)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all backdrop-blur ${
            isFirebaseConnected
              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300 hover:bg-emerald-900/50'
              : 'bg-amber-950/40 border-amber-800 text-amber-300 hover:bg-amber-900/50'
          }`}
          title="Ver estado de conexión y reglas de Firebase"
        >
          <div
            className={`w-2 h-2 rounded-full ${
              isFirebaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <Shield className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {isFirebaseConnected ? 'Firebase Auth Conectado' : 'Modo Local (Configurar)'}
          </span>
        </button>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-[#16222f] border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl relative z-10 my-8">
        {/* Brand header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1f3042] to-sky-600 border border-sky-500/30 shadow-xl mb-1 text-white">
            <Layers className="w-7 h-7" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span>D. E. K NovaCore</span>
          </h1>
          <p className="text-xs text-sky-200 max-w-xs mx-auto">
            Acceso seguro con <strong className="text-white">Firebase Authentication</strong> al panel de administración
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex p-1 bg-[#0f1722] rounded-2xl border border-slate-700 mb-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-sky-500 text-slate-950 font-bold shadow'
                : 'text-sky-300 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Iniciar Sesión</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-sky-500 text-slate-950 font-bold shadow'
                : 'text-sky-300 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Registrar Admin</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('forgot');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mode === 'forgot'
                ? 'bg-sky-500 text-slate-950 font-bold shadow'
                : 'text-sky-300 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Recuperar</span>
          </button>
        </div>

        {/* Status notice */}
        {isFirebaseConnected ? (
          <div className="mb-5 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <div className="truncate">
              Autenticación directa con <strong>Firebase Cloud</strong> ({firebaseStatus.projectId})
            </div>
          </div>
        ) : (
          <div className="mb-5 p-3 rounded-2xl bg-amber-950/40 border border-amber-800 flex items-start justify-between gap-2.5 text-xs text-amber-300">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <span>Variables de Firebase aún no configuradas en .env. Puedes iniciar en modo local o probar con las credenciales demo.</span>
              </div>
            </div>
            <button
              onClick={handleFillDemo}
              className="shrink-0 px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-[11px] font-bold text-amber-200 border border-amber-500/40 cursor-pointer"
            >
              Autollenar
            </button>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Success message */}
        {successMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-start gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name field (register only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-sky-200 mb-1.5">
                Nombre del Administrador
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Carlos Mendoza"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f1722] border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all"
              />
            </div>
          )}

          {/* Email field */}
          <div>
            <label className="block text-xs font-semibold text-sky-200 mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@deknovacore.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0f1722] border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all"
              />
            </div>
          </div>

          {/* Password field */}
          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-sky-200">
                  Contraseña
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0f1722] border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-black/30 border border-sky-400/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Ingresar al Panel Administrativo</span>
              </>
            ) : mode === 'register' ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Crear Cuenta de Administrador</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Enviar Enlace de Recuperación</span>
              </>
            )}
          </button>
        </form>

        {/* Footer actions inside card */}
        <div className="mt-6 pt-5 border-t border-slate-700/80 flex items-center justify-between text-xs text-sky-300">
          <button
            type="button"
            onClick={handleFillDemo}
            className="hover:text-white transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Llenar credenciales demo</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFirebaseModalOpen(true)}
            className="text-sky-400 hover:text-white font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Reglas Firebase</span>
          </button>
        </div>
      </div>

      {/* Bottom helper text */}
      <div className="text-center text-xs text-slate-500 max-w-sm relative z-10">
        <p>
          Protegido con Firebase Authentication y Firestore Security Rules.
        </p>
      </div>

      {/* Firebase Setup & Rules Modal */}
      <FirebaseSetupModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
      />
    </div>
  );
};
