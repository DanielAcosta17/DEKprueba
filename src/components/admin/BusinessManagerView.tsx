import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  QrCode,
  Check,
  X,
  Palette,
  Image as ImageIcon,
  MessageCircle,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  Layers,
  Globe,
  Home,
  Link2,
  Copy,
  ClipboardPaste,
  AlertTriangle,
  ArrowRight,
  Search,
} from 'lucide-react';
import { Business, TemplateType } from '../../types';
import { useBusiness, extractCleanSlug } from '../../contexts/BusinessContext';
import { AVAILABLE_TEMPLATES } from '../../data/initialData';
import { QRCodeModal } from '../common/QRCodeModal';

interface BusinessManagerViewProps {
  isCreateOpenInitially?: boolean;
}

export const BusinessManagerView: React.FC<BusinessManagerViewProps> = ({
  isCreateOpenInitially = false,
}) => {
  const {
    businesses,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    toggleBusinessActive,
    goToPublicStore,
    setSelectedBusinessId,
    selectedBusinessId,
    defaultHomePage,
    setDefaultHomePage,
    purgeAllData,
  } = useBusiness();

  const [isModalOpen, setIsModalOpen] = useState(isCreateOpenInitially);
  const [editingBiz, setEditingBiz] = useState<Business | null>(null);
  const [qrBiz, setQrBiz] = useState<Business | null>(null);

  // Duplication guard & destination selector
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [linkDestinationType, setLinkDestinationType] = useState<'external' | 'internal'>('external');

  // Deletion Modal States (replaces window.confirm)
  const [businessToDelete, setBusinessToDelete] = useState<Business | null>(null);
  const [isDeletingBiz, setIsDeletingBiz] = useState(false);
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [isPurgingAll, setIsPurgingAll] = useState(false);

  // Quick navigation / search by link or slug state
  const [directUrlQuery, setDirectUrlQuery] = useState('');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Business>>({
    name: '',
    slug: '',
    businessType: 'Restaurante / Cafetería',
    tagline: '',
    description: '',
    websiteUrl: '',
    logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
    phone: '+507 6024-4779',
    whatsapp: '50760244779',
    address: 'Ciudad de Panamá',
    schedule: 'Lunes a Sábado: 11:00 AM - 10:00 PM',
    instagram: '',
    facebook: '',
    primaryColor: '#253745',
    template: 'restaurant',
    currency: '$',
    deliveryAvailable: true,
    deliveryCost: 3.0,
    featuredNotice: '',
    isActive: true,
  });

  const openCreateModal = () => {
    setEditingBiz(null);
    setLinkDestinationType('external');
    setFormData({
      name: '',
      slug: '',
      businessType: 'Restaurante / Cafetería',
      tagline: 'Lo mejor en calidad y atención',
      description: 'Bienvenido a nuestro sitio web oficial.',
      websiteUrl: '',
      logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&auto=format&fit=crop&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
      phone: '+507 6024-4779',
      whatsapp: '50760244779',
      address: 'Ciudad de Panamá',
      schedule: 'Lunes a Sábado: 10:00 AM - 9:00 PM',
      instagram: '@minegocio',
      facebook: '',
      primaryColor: '#253745',
      template: 'restaurant',
      currency: '$',
      deliveryAvailable: true,
      deliveryCost: 2.5,
      featuredNotice: '¡Envío gratis en compras mayores a $25!',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (biz: Business) => {
    setEditingBiz(biz);
    setLinkDestinationType(biz.websiteUrl && biz.websiteUrl.trim() ? 'external' : 'internal');
    setFormData({
      ...biz,
      websiteUrl: biz.websiteUrl || '',
      slug: extractCleanSlug(biz.slug),
    });
    setIsModalOpen(true);
  };

  const handleNameChange = (nameVal: string) => {
    const rawSlug = nameVal
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setFormData((prev) => ({
      ...prev,
      name: nameVal,
      slug: editingBiz ? prev.slug : rawSlug,
    }));
  };

  // Handles external URL input without mangling
  const handleExternalUrlChange = (val: string) => {
    const cleanSlug = extractCleanSlug(val);
    setFormData((prev) => ({
      ...prev,
      websiteUrl: val,
      slug: cleanSlug || prev.slug || (prev.name ? extractCleanSlug(prev.name) : 'negocio'),
    }));
  };

  // Extracts and sanitizes input when user types or pastes a slug or full URL
  const handleSlugInputChange = (inputVal: string) => {
    // If input is a full URL, switch to external mode
    if (/^(?:https?:)?\/\//i.test(inputVal) || inputVal.includes('.vercel.app') || inputVal.includes('.com')) {
      setLinkDestinationType('external');
      handleExternalUrlChange(inputVal);
      return;
    }

    if (
      inputVal.includes('/') ||
      inputVal.includes('#') ||
      inputVal.includes('?') ||
      inputVal.includes(':') ||
      inputVal.includes(' ')
    ) {
      const cleaned = extractCleanSlug(inputVal);
      setFormData((prev) => ({
        ...prev,
        slug: cleaned,
      }));
    } else {
      const sanitized = inputVal.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
      setFormData((prev) => ({
        ...prev,
        slug: sanitized,
      }));
    }
  };

  // Helper to paste text from system clipboard directly into any field
  const handlePasteClipboard = async (
    e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement> | null,
    setter: (val: string) => void,
    isSlug = false
  ) => {
    let text = '';
    if (e && e.clipboardData) {
      text = e.clipboardData.getData('text');
    } else {
      try {
        text = await navigator.clipboard.readText();
      } catch (err) {
        console.warn('Clipboard read error or not permitted:', err);
      }
    }
    if (text) {
      if (isSlug) {
        handleSlugInputChange(text);
      } else {
        setter(text.trim());
      }
    }
  };

  const copyToClipboard = (text: string, identifier: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopyFeedback(identifier);
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  const handleSubmit = async (e: React.FormEvent, andNavigate = false) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!formData.name?.trim()) return;

    setIsSubmitting(true);
    try {
      let finalSlug = extractCleanSlug(formData.slug || formData.name || 'negocio');
      if (!finalSlug && formData.websiteUrl) {
        finalSlug = extractCleanSlug(formData.websiteUrl);
      }
      if (!finalSlug) finalSlug = 'negocio-' + Date.now();

      let normalizedWebsiteUrl = formData.websiteUrl?.trim() || '';
      if (normalizedWebsiteUrl && !/^https?:\/\//i.test(normalizedWebsiteUrl)) {
        normalizedWebsiteUrl = `https://${normalizedWebsiteUrl}`;
      }

      const preparedData: Partial<Business> = {
        ...formData,
        slug: finalSlug,
        websiteUrl: linkDestinationType === 'external' ? normalizedWebsiteUrl : (formData.websiteUrl || ''),
      };

      let savedBiz: Business;

      if (editingBiz) {
        const updated = {
          ...editingBiz,
          ...(preparedData as Business),
        };
        await updateBusiness(updated);
        savedBiz = updated;
      } else {
        savedBiz = await createBusiness(preparedData);
      }

      setIsModalOpen(false);

      if (andNavigate) {
        if (savedBiz.websiteUrl && savedBiz.websiteUrl.trim()) {
          const targetUrl = savedBiz.websiteUrl.startsWith('http')
            ? savedBiz.websiteUrl
            : `https://${savedBiz.websiteUrl}`;
          window.open(targetUrl, '_blank', 'noopener,noreferrer');
        } else {
          goToPublicStore(savedBiz.slug);
        }
      }
    } catch (err) {
      console.error('Error saving business:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Safe deletion handler via in-app modal
  const handleConfirmDelete = async () => {
    if (!businessToDelete) return;
    setIsDeletingBiz(true);
    try {
      await deleteBusiness(businessToDelete.id);
      setBusinessToDelete(null);
    } finally {
      setIsDeletingBiz(false);
    }
  };

  // Safe purge handler via in-app modal
  const handleConfirmPurge = async () => {
    setIsPurgingAll(true);
    try {
      await purgeAllData();
      setIsPurgeModalOpen(false);
    } finally {
      setIsPurgingAll(false);
    }
  };

  // Direct URL navigation submit
  const handleDirectNavigation = (e: React.FormEvent) => {
    e.preventDefault();
    const query = directUrlQuery.trim();
    if (!query) return;

    // If query is an external web URL (e.g. https://ejemplo-3-sage.vercel.app/)
    if (/^(?:https?:)?\/\//i.test(query)) {
      const fullUrl = query.startsWith('//') ? `https:${query}` : query;
      window.open(fullUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    // Otherwise find matching business by slug or open internal store
    const clean = extractCleanSlug(query);
    const matched = businesses.find(
      (b) => extractCleanSlug(b.slug) === clean || b.slug.toLowerCase() === clean.toLowerCase() || b.id === clean
    );

    if (matched && matched.websiteUrl && matched.websiteUrl.trim()) {
      const fullUrl = matched.websiteUrl.startsWith('http') ? matched.websiteUrl : `https://${matched.websiteUrl}`;
      window.open(fullUrl, '_blank', 'noopener,noreferrer');
    } else if (clean) {
      goToPublicStore(clean);
    }
  };

  const getFullPublicUrl = (slug?: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/#negocio/${slug || 'mi-negocio'}`;
  };

  return (
    <div className="space-y-6">
      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">
            Gestor de Negocios y Clientes
          </h2>
          <p className="text-xs text-sky-200">
            Crea y administra sitios web independientes para cada uno de tus clientes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {businesses.length > 0 && (
            <button
              onClick={() => setIsPurgeModalOpen(true)}
              className="py-2.5 px-3 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title="Eliminar todo de Firestore y dejar la web en 0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpiar Todo (0)</span>
            </button>
          )}

          <button
            onClick={openCreateModal}
            className="py-2.5 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Nuevo Negocio</span>
          </button>
        </div>
      </div>

      {/* Direct URL / Link Navigator Bar */}
      <div className="p-4 rounded-2xl bg-[#16222f] border border-slate-700/80 shadow-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-950/80 border border-sky-800/60 text-sky-400 shrink-0">
            <Link2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Ir a la página del negocio por Enlace / URL</h4>
            <p className="text-[11px] text-sky-300">
              Pega cualquier enlace completo (ej: <code>/#negocio/mi-negocio</code> o <code>https://...</code>) y te redirigirá directamente
            </p>
          </div>
        </div>

        <form onSubmit={handleDirectNavigation} className="flex items-center gap-2 flex-1 md:max-w-md">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sky-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              placeholder="Pega el enlace o slug del negocio..."
              value={directUrlQuery}
              onChange={(e) => setDirectUrlQuery(e.target.value)}
              onPaste={(e) => {
                const text = e.clipboardData.getData('text');
                if (text) {
                  e.preventDefault();
                  setDirectUrlQuery(text.trim());
                }
              }}
              className="w-full pl-8.5 pr-14 py-2 bg-[#0f1722] border border-slate-700 rounded-xl text-xs text-white font-mono placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-400"
            />
            <button
              type="button"
              onClick={() => handlePasteClipboard(null, (val) => setDirectUrlQuery(val))}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-sky-300 font-bold border border-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
              title="Pegar enlace del portapapeles"
            >
              <ClipboardPaste className="w-2.5 h-2.5 text-sky-400" />
              <span>Pegar</span>
            </button>
          </div>
          <button
            type="submit"
            disabled={!directUrlQuery.trim()}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition-all cursor-pointer shrink-0"
          >
            <span>Ir a Página</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Home Mode Configuration Banner */}
      {businesses.length > 0 && (
        <div className="p-4 rounded-xl bg-[#16222f] border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-950/80 border border-sky-800/60 text-sky-400 shrink-0">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white">¿Qué pantalla debe abrirse al entrar a la web principal?</span>
              <p className="text-[11px] text-sky-300">
                {defaultHomePage === 'store'
                  ? 'Abriendo directamente el Catálogo / Menú digital en vivo del negocio activo.'
                  : 'Abriendo la Landing Page corporativa de D. E. K NovaCore.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto bg-[#0f1722] p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setDefaultHomePage('landing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                defaultHomePage === 'landing'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-sky-300 hover:text-white'
              }`}
            >
              Landing General
            </button>
            <button
              onClick={() => setDefaultHomePage('store')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                defaultHomePage === 'store'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'text-sky-300 hover:text-white'
              }`}
            >
              Abrir Catálogo Directo
            </button>
          </div>
        </div>
      )}

      {/* Businesses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {businesses.length === 0 ? (
          <div className="col-span-full p-10 text-center bg-[#16222f] dark:bg-[#111a24] rounded-2xl border border-dashed border-slate-700 shadow-md space-y-3">
            <Building2 className="w-12 h-12 text-sky-400 mx-auto" />
            <h4 className="text-base font-bold text-white">Aún no hay negocios creados</h4>
            <p className="text-xs text-sky-200 max-w-sm mx-auto">
              La plataforma está en 0. Haz clic en "Crear Nuevo Negocio" para registrar tu primer catálogo o menú digital con enlace a WhatsApp y código QR.
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 py-2.5 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Crear mi primer negocio</span>
            </button>
          </div>
        ) : (
          businesses.map((biz) => {
            const isSelected = selectedBusinessId === biz.id;
            const publicUrl = getFullPublicUrl(biz.slug);
            const isCopied = copyFeedback === biz.id;

            return (
              <div
                key={biz.id}
                className={`bg-[#16222f] dark:bg-[#111a24] rounded-2xl border transition-all overflow-hidden flex flex-col justify-between shadow-md ${
                  isSelected
                    ? 'border-sky-400 ring-2 ring-sky-400/30'
                    : 'border-slate-700/80 hover:border-sky-500/50'
                }`}
              >
                <div>
                  {/* Cover and header */}
                  <div className="relative h-32 w-full overflow-hidden bg-slate-800">
                    <img
                      src={biz.coverUrl}
                      alt={biz.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          biz.isActive
                            ? 'bg-emerald-500 text-white'
                            : 'bg-rose-500 text-white'
                        }`}
                      >
                        {biz.isActive ? 'Activo' : 'Pausado'}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-3 flex items-center gap-2.5">
                      <img
                        src={biz.logoUrl}
                        alt={biz.name}
                        className="w-10 h-10 rounded-xl object-cover border-2 border-white bg-white shadow-sm"
                      />
                      <div className="text-white">
                        <h3 className="text-xs font-bold leading-tight drop-shadow truncate max-w-[180px]">
                          {biz.name}
                        </h3>
                        <span className="text-[10px] text-sky-200 capitalize">
                          Plantilla: {biz.template}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Details & URL Link Box */}
                  <div className="p-4 space-y-3 text-xs">
                    {/* Interactive Public URL Badge */}
                    <div className="p-2.5 rounded-xl bg-[#0b121b] border border-sky-900/40 flex items-center justify-between gap-2">
                      {biz.websiteUrl ? (
                        <a
                          href={biz.websiteUrl.startsWith('http') ? biz.websiteUrl : `https://${biz.websiteUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-left text-emerald-300 hover:text-emerald-100 group truncate cursor-pointer transition-colors"
                          title={`Abrir página web de ${biz.name}`}
                        >
                          <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
                          <span className="text-[11px] font-mono font-bold truncate">
                            {biz.websiteUrl}
                          </span>
                          <ExternalLink className="w-3 h-3 text-emerald-400 opacity-70 group-hover:opacity-100 shrink-0" />
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => goToPublicStore(biz.slug)}
                          className="flex items-center gap-1.5 text-left text-sky-300 hover:text-white group truncate cursor-pointer transition-colors"
                          title="Hacer clic para ir directamente a la página del negocio"
                        >
                          <Link2 className="w-3.5 h-3.5 text-sky-400 shrink-0 group-hover:scale-110 transition-transform" />
                          <span className="text-[11px] font-mono font-bold truncate">
                            /#negocio/{biz.slug}
                          </span>
                          <ExternalLink className="w-3 h-3 text-sky-400 opacity-70 group-hover:opacity-100 shrink-0" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            biz.websiteUrl
                              ? (biz.websiteUrl.startsWith('http') ? biz.websiteUrl : `https://${biz.websiteUrl}`)
                              : publicUrl,
                            biz.id
                          )
                        }
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-sky-300 hover:text-white shrink-0 transition-colors cursor-pointer"
                        title="Copiar enlace del negocio"
                      >
                        {isCopied ? (
                          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                          </span>
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <p className="text-sky-100 text-xs line-clamp-2 leading-relaxed">
                      {biz.description}
                    </p>

                    <div className="pt-1 flex flex-wrap gap-2 text-[10px] text-sky-200 font-semibold">
                      <span className="flex items-center gap-1 bg-[#0f1722] px-2 py-0.5 rounded border border-slate-700">
                        <MessageCircle className="w-3 h-3 text-emerald-400" /> WhatsApp
                      </span>
                      <span className="flex items-center gap-1 bg-[#0f1722] px-2 py-0.5 rounded border border-slate-700">
                        <Palette className="w-3 h-3" style={{ color: biz.primaryColor }} /> {biz.primaryColor}
                      </span>
                      {biz.websiteUrl && (
                        <a
                          href={biz.websiteUrl.startsWith('http') ? biz.websiteUrl : `https://${biz.websiteUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-[10px] font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60"
                        >
                          <Globe className="w-3 h-3" /> Web Propia
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-3 bg-[#0f1722] border-t border-slate-700/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedBusinessId(biz.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-sky-500 text-slate-950 font-bold'
                          : 'text-sky-200 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {isSelected ? 'Seleccionado' : 'Seleccionar'}
                    </button>
                    <button
                      onClick={() => setQrBiz(biz)}
                      className="p-1.5 text-sky-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Ver Código QR"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    {biz.websiteUrl ? (
                      <a
                        href={biz.websiteUrl.startsWith('http') ? biz.websiteUrl : `https://${biz.websiteUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 hover:text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                        title="Abrir Sitio Web Oficial"
                      >
                        <span>Ver Web</span>
                        <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                      </a>
                    ) : (
                      <button
                        onClick={() => goToPublicStore(biz.slug)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-950/80 hover:bg-sky-900 border border-sky-800/60 text-sky-300 hover:text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                        title="Abrir Catálogo Digital"
                      >
                        <span>Ver Sitio</span>
                        <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(biz)}
                      className="p-1.5 text-sky-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Editar Negocio"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setBusinessToDelete(biz)}
                      className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                      title="Eliminar Negocio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Business Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#16222f] dark:bg-[#111a24] rounded-2xl shadow-2xl border border-slate-700/80 my-8 overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-700/80 flex items-center justify-between bg-[#0f1722]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500 text-slate-950 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {editingBiz ? `Editar Negocio: ${editingBiz.name}` : 'Crear Nuevo Negocio / Cliente'}
                  </h3>
                  <p className="text-[11px] text-sky-300">
                    Configura la identidad, plantilla y enlace URL directo a la página web
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-sky-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={(e) => handleSubmit(e, false)} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* Row 1: Name */}
              <div>
                <label className="block font-semibold text-sky-200 mb-1">
                  Nombre del Negocio o Cliente *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Dulce Encanto Pastelería, Mi Tienda Vercel, etc."
                  value={formData.name || ''}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-[#0f1722] text-white focus:outline-none focus:ring-1 focus:ring-sky-400 text-xs"
                />
              </div>

              {/* Destination Type & URL / Link Selector */}
              <div className="p-3.5 rounded-2xl bg-[#0b131d] border border-sky-800/40 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      ¿Dónde está la página web de este negocio?
                    </span>
                    <span className="text-[11px] text-sky-300">
                      Elige si enlazas a una página externa (Vercel, dominio) o al menú digital integrado
                    </span>
                  </div>

                  <div className="flex items-center gap-1 p-1 rounded-xl bg-[#16222f] border border-slate-700 self-start sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => setLinkDestinationType('external')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        linkDestinationType === 'external'
                          ? 'bg-emerald-500 text-slate-950 shadow'
                          : 'text-sky-300 hover:text-white'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Web Externa (Vercel / URL)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLinkDestinationType('internal')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        linkDestinationType === 'internal'
                          ? 'bg-sky-500 text-slate-950 shadow'
                          : 'text-sky-300 hover:text-white'
                      }`}
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      <span>Menú NovaCore</span>
                    </button>
                  </div>
                </div>

                {/* Input depending on destination type */}
                {linkDestinationType === 'external' ? (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-semibold text-emerald-300 text-xs">
                        Enlace / URL de la Página Web Externa *
                      </label>
                      <button
                        type="button"
                        onClick={() => handlePasteClipboard(null, (val) => handleExternalUrlChange(val))}
                        className="text-[10px] text-emerald-300 hover:text-white font-bold flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-950 border border-emerald-800 hover:bg-emerald-900 transition-colors cursor-pointer"
                        title="Pegar URL completa copiada"
                      >
                        <ClipboardPaste className="w-3 h-3 text-emerald-400" />
                        <span>Pegar URL</span>
                      </button>
                    </div>
                    <div className="flex items-center bg-[#0f1722] border border-emerald-700/60 rounded-xl px-3 focus-within:ring-1 focus-within:ring-emerald-400 focus-within:border-emerald-500 transition-all">
                      <Globe className="w-4 h-4 text-emerald-400 shrink-0 mr-2" />
                      <input
                        type="url"
                        placeholder="https://ejemplo-3-sage.vercel.app/"
                        value={formData.websiteUrl || ''}
                        onChange={(e) => handleExternalUrlChange(e.target.value)}
                        onPaste={(e) => {
                          const text = e.clipboardData.getData('text');
                          if (text) {
                            e.preventDefault();
                            handleExternalUrlChange(text);
                          }
                        }}
                        className="w-full py-2 bg-transparent text-white font-mono text-xs focus:outline-none placeholder:text-slate-600"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Pega aquí enlaces como: <code className="text-emerald-300">https://ejemplo-3-sage.vercel.app/</code>
                    </span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-semibold text-sky-200 text-xs">
                        Enlace / Slug del Menú Digital en NovaCore *
                      </label>
                      <button
                        type="button"
                        onClick={() => handlePasteClipboard(null, (val) => handleSlugInputChange(val), true)}
                        className="text-[10px] text-sky-300 hover:text-white font-bold flex items-center gap-1 px-2 py-0.5 rounded-lg bg-sky-950 border border-sky-800/80 hover:bg-sky-900 transition-colors cursor-pointer"
                        title="Pegar enlace del portapapeles"
                      >
                        <ClipboardPaste className="w-3 h-3 text-sky-400" />
                        <span>Pegar Link</span>
                      </button>
                    </div>
                    <div className="flex items-center bg-[#0f1722] border border-slate-700 rounded-xl px-2.5 focus-within:ring-1 focus-within:ring-sky-400 focus-within:border-sky-500 transition-all">
                      <span className="text-sky-400 text-[11px] font-mono shrink-0 select-none">/negocio/</span>
                      <input
                        type="text"
                        placeholder="dulce-encanto"
                        value={formData.slug || ''}
                        onChange={(e) => handleSlugInputChange(e.target.value)}
                        onPaste={(e) => {
                          const text = e.clipboardData.getData('text');
                          if (text) {
                            e.preventDefault();
                            handleSlugInputChange(text);
                          }
                        }}
                        className="w-full px-1.5 py-2 bg-transparent text-white font-mono text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Direct Link Preview & Redirection Box */}
                <div className="p-3 rounded-xl bg-[#0f1722] border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="p-1.5 rounded-lg bg-slate-800 text-emerald-400 shrink-0">
                      {linkDestinationType === 'external' ? (
                        <Globe className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Link2 className="w-4 h-4 text-sky-400" />
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-[10px] font-bold block uppercase tracking-wider text-emerald-400">
                        {linkDestinationType === 'external'
                          ? 'Destino de Redirección Web:'
                          : 'Enlace del Catálogo Integrado:'}
                      </span>
                      <span className="text-[11px] font-mono text-white truncate block">
                        {linkDestinationType === 'external'
                          ? (formData.websiteUrl || 'https://ejemplo-3-sage.vercel.app/')
                          : getFullPublicUrl(formData.slug)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          linkDestinationType === 'external'
                            ? (formData.websiteUrl || '')
                            : getFullPublicUrl(formData.slug),
                          'form-preview'
                        )
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copyFeedback === 'form-preview' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (linkDestinationType === 'external' && formData.websiteUrl) {
                          const target = formData.websiteUrl.startsWith('http')
                            ? formData.websiteUrl
                            : `https://${formData.websiteUrl}`;
                          window.open(target, '_blank', 'noopener,noreferrer');
                        } else if (formData.slug) {
                          goToPublicStore(formData.slug);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-black flex items-center gap-1 shadow transition-all cursor-pointer"
                      title="Probar y abrir página web"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Abrir Página Web</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 2: Business Type & Template */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-sky-200 mb-1">
                    Rubro / Tipo de Negocio *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Pastelería Artesanal, Restaurante, Boutique"
                    value={formData.businessType || ''}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-[#0f1722] text-white focus:outline-none focus:ring-1 focus:ring-sky-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-sky-200 mb-1">
                    Plantilla Visual de Diseño *
                  </label>
                  <select
                    value={formData.template || 'general'}
                    onChange={(e) => setFormData({ ...formData, template: e.target.value as TemplateType })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-[#0f1722] text-white focus:outline-none focus:ring-1 focus:ring-sky-400"
                  >
                    {AVAILABLE_TEMPLATES.map((tmpl) => (
                      <option key={tmpl.id} value={tmpl.id} className="bg-[#16222f] text-white">
                        {tmpl.name} ({tmpl.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tagline and Description */}
              <div>
                <label className="block font-semibold text-sky-200 mb-1">
                  Eslogan / Frase Destacada
                </label>
                <input
                  type="text"
                  placeholder="Ej: Postres hechos a mano con amor"
                  value={formData.tagline || ''}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-[#0f1722] text-white focus:outline-none focus:ring-1 focus:ring-sky-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-sky-200 mb-1">
                  Descripción General del Negocio
                </label>
                <textarea
                  rows={2}
                  placeholder="Explica qué ofreces, especialidades, historia breve..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-[#0f1722] text-white focus:outline-none focus:ring-1 focus:ring-sky-400"
                />
              </div>

              {/* Logo URL and Cover URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-sky-200">
                      URL del Logotipo
                    </label>
                    <button
                      type="button"
                      onClick={() => handlePasteClipboard(null, (val) => setFormData((prev) => ({ ...prev, logoUrl: val })))}
                      className="text-[10px] text-sky-300 hover:text-white font-bold flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-950 border border-sky-800/80 hover:bg-sky-900 transition-colors cursor-pointer"
                      title="Pegar URL del logotipo"
                    >
                      <ClipboardPaste className="w-2.5 h-2.5 text-sky-400" />
                      <span>Pegar</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    inputMode="url"
                    placeholder="https://ejemplo.com/logo.png"
                    value={formData.logoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    onPaste={(e) => {
                      const text = e.clipboardData.getData('text');
                      if (text) {
                        e.preventDefault();
                        setFormData((prev) => ({ ...prev, logoUrl: text.trim() }));
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-[#0f1722] text-white focus:outline-none focus:ring-1 focus:ring-sky-400"
                  />
                  {formData.logoUrl && (
                    <img
                      src={formData.logoUrl}
                      alt="Logo preview"
                      className="w-10 h-10 rounded-lg object-cover mt-2 border border-slate-700"
                    />
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-sky-200">
                      URL Imagen de Portada (Banner)
                    </label>
                    <button
                      type="button"
                      onClick={() => handlePasteClipboard(null, (val) => setFormData((prev) => ({ ...prev, coverUrl: val })))}
                      className="text-[10px] text-sky-300 hover:text-white font-bold flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-950 border border-sky-800/80 hover:bg-sky-900 transition-colors cursor-pointer"
                      title="Pegar URL de portada"
                    >
                      <ClipboardPaste className="w-2.5 h-2.5 text-sky-400" />
                      <span>Pegar</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    inputMode="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.coverUrl || ''}
                    onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                    onPaste={(e) => {
                      const text = e.clipboardData.getData('text');
                      if (text) {
                        e.preventDefault();
                        setFormData((prev) => ({ ...prev, coverUrl: text.trim() }));
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-[#0f1722] text-white focus:outline-none focus:ring-1 focus:ring-sky-400"
                  />
                </div>
              </div>

              {/* Contact Information: WhatsApp & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-sky-200 mb-1">
                    WhatsApp para Pedidos (Sin signos +, ej: 50760000000) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="50760000000"
                    value={formData.whatsapp || ''}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-[#0f1722] text-white focus:outline-none focus:ring-1 focus:ring-sky-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-sky-200 mb-1">
                    Teléfono Fijo / Móvil de Llamadas
                  </label>
                  <input
                    type="text"
                    placeholder="+507 6000-0000"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-[#0f1722] text-white focus:outline-none focus:ring-1 focus:ring-sky-400"
                  />
                </div>
              </div>

              {/* Address and Schedule */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-sky-200 mb-1">
                    Dirección Física
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Calle 50, San Francisco, Panamá"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-[#0f1722] text-white focus:outline-none focus:ring-1 focus:ring-sky-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-sky-200 mb-1">
                    Horario de Atención
                  </label>
                  <input
                    type="text"
                    placeholder="Lunes a Domingo: 8:00 AM - 8:00 PM"
                    value={formData.schedule || ''}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-[#0f1722] text-white focus:outline-none focus:ring-1 focus:ring-sky-400"
                  />
                </div>
              </div>

              {/* Color picker & Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-sky-200 mb-1">
                    Color Primario de Marca
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.primaryColor || '#253745'}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                    />
                    <input
                      type="text"
                      value={formData.primaryColor || '#253745'}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-[#0f1722] text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-sky-200 mb-1">
                    Símbolo de Moneda
                  </label>
                  <select
                    value={formData.currency || '$'}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-[#0f1722] text-white"
                  >
                    <option value="$" className="bg-[#16222f] text-white">Dólares ($ USD / B/.)</option>
                    <option value="€" className="bg-[#16222f] text-white">Euros (€ EUR)</option>
                    <option value="MXN $" className="bg-[#16222f] text-white">Pesos Mexicanos (MXN $)</option>
                    <option value="COL $" className="bg-[#16222f] text-white">Pesos Colombianos (COL $)</option>
                    <option value="S/" className="bg-[#16222f] text-white">Soles Peruanos (S/)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-sky-200 mb-1">
                    Costo de Entrega / Delivery
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.deliveryCost ?? 3}
                    onChange={(e) => setFormData({ ...formData, deliveryCost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-[#0f1722] text-white"
                  />
                </div>
              </div>

              {/* Announcement Bar */}
              <div>
                <label className="block font-semibold text-sky-200 mb-1">
                  Anuncio Destacado (Opcional en la parte superior)
                </label>
                <input
                  type="text"
                  placeholder="Ej: ¡2x1 en cafés todos los jueves! o Envío gratis este fin de semana"
                  value={formData.featuredNotice || ''}
                  onChange={(e) => setFormData({ ...formData, featuredNotice: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-[#0f1722] text-white focus:outline-none focus:ring-1 focus:ring-sky-400"
                />
              </div>

              {/* Footer Modal Actions */}
              <div className="pt-4 border-t border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-sky-300 hover:text-white hover:bg-slate-800 font-semibold cursor-pointer text-center disabled:opacity-50"
                >
                  Cancelar
                </button>
                <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    disabled={isSubmitting || !formData.name?.trim()}
                    onClick={(e) => handleSubmit(e, true)}
                    className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white font-bold rounded-xl border border-sky-800/60 shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    <span>{isSubmitting ? 'Guardando...' : 'Guardar y Visitar Sitio'}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.name?.trim()}
                    className="w-full sm:w-auto px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-40"
                  >
                    {isSubmitting
                      ? 'Guardando...'
                      : editingBiz
                      ? 'Guardar Cambios'
                      : 'Crear Negocio Ahora'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Modal for selected business */}
      {qrBiz && (
        <QRCodeModal
          business={qrBiz}
          isOpen={!!qrBiz}
          onClose={() => setQrBiz(null)}
        />
      )}

      {/* In-App Deletion Confirmation Modal (fixes blocked iframe confirm()) */}
      {businessToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#16222f] border border-rose-500/40 rounded-2xl shadow-2xl p-6 text-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">¿Eliminar este negocio?</h3>
                <p className="text-xs text-rose-300 font-semibold">{businessToDelete.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Esta acción eliminará el negocio, su catálogo de productos, categorías y pedidos asociados. Esta acción no se puede deshacer.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBusinessToDelete(null)}
                disabled={isDeletingBiz}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeletingBiz}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-900/40 transition-all"
              >
                {isDeletingBiz ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Sí, Eliminar Negocio</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Purge Confirmation Modal */}
      {isPurgeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#16222f] border border-rose-500/40 rounded-2xl shadow-2xl p-6 text-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">¿Limpiar toda la plataforma?</h3>
                <p className="text-xs text-rose-300 font-semibold">Dejar datos en Cero (0)</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Esta acción eliminará TODOS los negocios, categorías, productos y pedidos de Firestore y almacenamiento local para comenzar desde cero.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsPurgeModalOpen(false)}
                disabled={isPurgingAll}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmPurge}
                disabled={isPurgingAll}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-900/40 transition-all"
              >
                {isPurgingAll ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Limpiando...</span>
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
