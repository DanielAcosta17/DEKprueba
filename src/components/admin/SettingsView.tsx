import React, { useState } from 'react';
import {
  Database,
  ShieldCheck,
  HardDrive,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  Lock,
  CloudUpload,
  Store,
  DollarSign,
  Phone,
  Truck,
  Clock,
  Megaphone,
  Trash2,
} from 'lucide-react';
import { firebaseStatus } from '../../firebase/config';
import { FIRESTORE_RULES_TEMPLATE, STORAGE_RULES_TEMPLATE } from '../../firebase/rules';
import { useBusiness } from '../../contexts/BusinessContext';

export const SettingsView: React.FC = () => {
  const {
    activeBusiness,
    updateBusiness,
    purgeAllData,
    resetData,
    syncAllToFirestore,
    lastFirestoreSyncTime,
  } = useBusiness();

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [resetDone, setResetDone] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Business settings state
  const [currency, setCurrency] = useState(activeBusiness?.currency || '$');
  const [whatsapp, setWhatsapp] = useState(activeBusiness?.whatsapp || '');
  const [deliveryCost, setDeliveryCost] = useState(activeBusiness?.deliveryCost?.toString() || '0');
  const [deliveryAvailable, setDeliveryAvailable] = useState(activeBusiness?.deliveryAvailable ?? true);
  const [schedule, setSchedule] = useState(activeBusiness?.schedule || '');
  const [featuredNotice, setFeaturedNotice] = useState(activeBusiness?.featuredNotice || '');
  const [isSavingBiz, setIsSavingBiz] = useState(false);
  const [saveBizFeedback, setSaveBizFeedback] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await syncAllToFirestore();
      setSyncFeedback(res.message);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncFeedback(null), 6000);
    }
  };

  const handleSaveBizSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBusiness) return;
    setIsSavingBiz(true);
    try {
      await updateBusiness({
        ...activeBusiness,
        currency,
        whatsapp,
        deliveryCost: parseFloat(deliveryCost) || 0,
        deliveryAvailable,
        schedule,
        featuredNotice,
      });
      setSaveBizFeedback('Configuración guardada exitosamente en Cloud Firestore.');
      setTimeout(() => setSaveBizFeedback(null), 4000);
    } finally {
      setIsSavingBiz(false);
    }
  };

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleConfirmReset = async () => {
    setIsPurging(true);
    try {
      await purgeAllData();
      setIsResetModalOpen(false);
      setResetDone(true);
      setTimeout(() => setResetDone(false), 4000);
    } finally {
      setIsPurging(false);
    }
  };

  const handleReset = () => {
    setIsResetModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-4xl text-xs">
      <div>
        <h2 className="text-xl font-bold text-white">
          Configuración & Firebase
        </h2>
        <p className="text-sky-200 mt-0.5">
          Conexión con Google Cloud Firestore, sincronización directa de datos y reglas de seguridad.
        </p>
      </div>

      {/* Sync to Firestore Hero Card */}
      <div className="bg-[#16222f] dark:bg-[#111a24] border border-slate-700/80 rounded-2xl p-6 text-white shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300">
              <CloudUpload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Sincronización Directa a Firestore
              </h3>
              <p className="text-xs text-sky-200 mt-0.5">
                Guarda todos los Negocios, Productos, Categorías y Pedidos directamente en las colecciones de Firestore.
              </p>
            </div>
          </div>

          <button
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Todo a Firestore'}</span>
          </button>
        </div>

        {lastFirestoreSyncTime && (
          <div className="text-[11px] text-sky-300 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Última sincronización a Firestore: {lastFirestoreSyncTime}</span>
          </div>
        )}

        {syncFeedback && (
          <div className="p-3 bg-emerald-950/70 border border-emerald-800 rounded-xl text-emerald-200 text-xs font-semibold animate-fade-in flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncFeedback}</span>
          </div>
        )}
      </div>

      {/* Active Business Settings Form */}
      {activeBusiness && (
        <form
          onSubmit={handleSaveBizSettings}
          className="bg-[#16222f] dark:bg-[#111a24] rounded-2xl border border-slate-700/80 p-6 shadow-md space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
            <div className="flex items-center gap-2.5">
              <Store className="w-5 h-5 text-sky-400" />
              <div>
                <h3 className="font-bold text-white text-sm">
                  Ajustes Comerciales de &quot;{activeBusiness.name}&quot;
                </h3>
                <span className="text-[11px] text-sky-300">
                  Se guardan directamente en el documento de Firestore: <code>businesses/{activeBusiness.id}</code>
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingBiz}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isSavingBiz ? 'Guardando...' : 'Guardar en Firestore'}</span>
            </button>
          </div>

          {saveBizFeedback && (
            <div className="p-3 bg-emerald-950/70 border border-emerald-800 text-emerald-200 rounded-xl font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{saveBizFeedback}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-sky-200 font-bold mb-1 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-sky-400" />
                Símbolo de Moneda
              </label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="$ o € o S/ o MXN"
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-[#0f1722] text-white font-bold focus:outline-none focus:ring-1 focus:ring-sky-400"
              />
            </div>

            <div>
              <label className="block text-sky-200 font-bold mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-sky-400" />
                Teléfono / WhatsApp para Pedidos
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+52 55 1234 5678"
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-[#0f1722] text-white focus:outline-none focus:ring-1 focus:ring-sky-400"
              />
            </div>

            <div>
              <label className="block text-sky-200 font-bold mb-1 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-sky-400" />
                Costo de Envío a Domicilio ({currency})
              </label>
              <input
                type="number"
                step="0.5"
                value={deliveryCost}
                onChange={(e) => setDeliveryCost(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-[#0f1722] text-white focus:outline-none focus:ring-1 focus:ring-sky-400"
              />
            </div>

            <div>
              <label className="block text-sky-200 font-bold mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                Horario de Atención
              </label>
              <input
                type="text"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                placeholder="Lun-Sáb 9:00 AM - 8:00 PM"
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-[#0f1722] text-white focus:outline-none focus:ring-1 focus:ring-sky-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sky-200 font-bold mb-1 flex items-center gap-1.5">
                <Megaphone className="w-3.5 h-3.5 text-sky-400" />
                Aviso Destacado o Promo en la Tienda Pública
              </label>
              <input
                type="text"
                value={featuredNotice}
                onChange={(e) => setFeaturedNotice(e.target.value)}
                placeholder="¡Envío gratis en compras mayores a $25! Usa el código..."
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-[#0f1722] text-white focus:outline-none focus:ring-1 focus:ring-sky-400"
              />
            </div>
          </div>
        </form>
      )}

      {/* Firebase Status Card */}
      <div className="bg-[#16222f] dark:bg-[#111a24] rounded-2xl border border-slate-700/80 p-6 shadow-md space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500 text-slate-950 flex items-center justify-center shadow-md font-bold">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">
              Estado de Google Firebase (Firestore & Auth)
            </h3>
            <span className="text-[11px] text-sky-300">
              Conectado a proyecto: <strong>dek-novacore</strong>
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-emerald-950/70 border-emerald-800 text-emerald-200 flex items-start gap-3.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-sm">
              Conectado a Firebase Project: {firebaseStatus.projectId}
            </div>
            <p className="mt-1 leading-relaxed opacity-90 text-[11px] text-emerald-300">
              Todos los cambios en negocios, productos, categorías y pedidos se guardan directamente en Cloud Firestore.
            </p>
          </div>
        </div>

        {/* Variables details */}
        <div className="space-y-2 pt-2">
          <span className="font-bold text-sky-300 uppercase tracking-wider text-[10px]">
            Variables de Entorno Detectadas:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
            <div className="p-2.5 rounded-lg bg-[#0f1722] border border-slate-700 flex justify-between">
              <span className="text-slate-400">PROJECT_ID:</span>
              <span className="font-bold text-sky-200">
                {firebaseStatus.projectId}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#0f1722] border border-slate-700 flex justify-between">
              <span className="text-slate-400">AUTH_DOMAIN:</span>
              <span className="font-bold text-sky-200">
                {firebaseStatus.authDomain}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Rules full preview and copy */}
      <div className="space-y-4">
        <div className="bg-[#16222f] dark:bg-[#111a24] rounded-2xl border border-slate-700/80 p-5 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/80 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="font-bold text-white text-sm">
                  Reglas de Seguridad Cloud Firestore
                </span>
                <p className="text-[11px] text-sky-300">
                  Copia estas reglas y pégalas en Firebase Console &gt; Firestore Database &gt; pestaña &quot;Reglas&quot; (Rules).
                </p>
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(FIRESTORE_RULES_TEMPLATE, 'fs')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-200 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 shadow-sm transition-all cursor-pointer"
            >
              {copiedKey === 'fs' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'fs' ? '¡Copiado con Éxito!' : 'Copiar Reglas Firestore'}</span>
            </button>
          </div>

          <pre className="p-4 bg-[#0a0f18] text-emerald-400 rounded-xl text-[11px] font-mono overflow-x-auto border border-slate-800 leading-relaxed max-h-56">
            {FIRESTORE_RULES_TEMPLATE}
          </pre>
        </div>

        <div className="bg-[#16222f] dark:bg-[#111a24] rounded-2xl border border-slate-700/80 p-5 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/80 pb-3">
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-sky-400" />
              <div>
                <span className="font-bold text-white text-sm">
                  Reglas de Seguridad Firebase Storage
                </span>
                <p className="text-[11px] text-sky-300">
                  Pega estas reglas en Firebase Console &gt; Storage &gt; pestaña &quot;Reglas&quot; (Rules).
                </p>
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(STORAGE_RULES_TEMPLATE, 'st')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-200 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 shadow-sm transition-all cursor-pointer"
            >
              {copiedKey === 'st' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'st' ? '¡Copiado con Éxito!' : 'Copiar Reglas Storage'}</span>
            </button>
          </div>

          <pre className="p-4 bg-[#0a0f18] text-sky-400 rounded-xl text-[11px] font-mono overflow-x-auto border border-slate-800 leading-relaxed max-h-48">
            {STORAGE_RULES_TEMPLATE}
          </pre>
        </div>
      </div>

      {/* Reset Data Section / Dejar en 0 */}
      <div className="bg-[#16222f] dark:bg-[#111a24] rounded-2xl border border-rose-900/60 p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-400" />
            <h4 className="font-bold text-white text-sm">
              Poner Plataforma en Cero (0)
            </h4>
          </div>
          <p className="text-sky-200 text-[11px] leading-relaxed max-w-xl">
            Elimina por completo todos los negocios, productos, categorías y pedidos tanto de Firestore como del almacenamiento local, para que la web quede 100% limpia y comiences a llenarla con tu propia información.
          </p>
        </div>

        <button
          onClick={handleReset}
          disabled={isPurging}
          className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shrink-0 transition-colors shadow-sm cursor-pointer"
        >
          <Trash2 className={`w-3.5 h-3.5 ${isPurging ? 'animate-spin' : ''}`} />
          <span>{isPurging ? 'Eliminando...' : resetDone ? '¡Limpieza en 0 Exitosa!' : 'Eliminar Todo y Dejar en 0'}</span>
        </button>
      </div>

      {/* In-App Purge Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#16222f] border border-rose-500/40 rounded-2xl shadow-2xl p-6 text-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">¿Poner plataforma en Cero (0)?</h3>
                <p className="text-xs text-rose-300 font-semibold">Eliminar todos los datos</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Esta acción eliminará todos los negocios, categorías, productos y pedidos tanto de Firestore como de la memoria local para que puedas comenzar con tu propia información limpia.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                disabled={isPurging}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                disabled={isPurging}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-900/40 transition-all"
              >
                {isPurging ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Eliminando datos...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Sí, Limpiar Todo (0)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

