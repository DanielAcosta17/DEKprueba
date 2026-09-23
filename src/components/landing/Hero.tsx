import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Store,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  QrCode,
  Zap,
} from 'lucide-react';
import { useBusiness } from '../../contexts/BusinessContext';

interface HeroProps {
  onOpenCreateBusiness: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenCreateBusiness }) => {
  const { businesses, goToPublicStore } = useBusiness();

  const handleScrollToExamples = () => {
    const el = document.getElementById('ejemplos-en-vivo');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="inicio" className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
      {/* Subtle background glow effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#253745]/5 dark:bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Eyebrow Tag */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#16222f] dark:bg-[#111a24] text-sky-200 text-xs font-semibold border border-slate-700/80 shadow-sm animate-float">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sky-300 font-bold">Plataforma SaaS Multi-Negocio</span>
            <span className="text-slate-500">•</span>
            <span>Catálogos, Menús QR & Sitios Web</span>
          </div>
        </div>

        {/* Main Headline and Subtitle */}
        <div className="text-center mt-6 max-w-4xl mx-auto space-y-5">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            Tu negocio merece{' '}
            <span className="text-sky-400 underline decoration-sky-600 decoration-wavy decoration-2">
              estar en Internet
            </span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-sky-200 max-w-2xl mx-auto font-normal leading-relaxed">
            Creamos catálogos, menús y sitios web profesionales para llevar tu negocio al mundo digital. Vende más rápido con pedidos automáticos directos a tu WhatsApp.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={onOpenCreateBusiness}
              className="w-full sm:w-auto px-7 py-3.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-sm font-bold rounded-xl shadow-lg shadow-sky-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2.5 shine-effect cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Crear mi sitio</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleScrollToExamples}
              className="w-full sm:w-auto px-7 py-3.5 bg-[#16222f] dark:bg-[#111a24] text-sky-200 hover:text-white hover:bg-sky-950/80 border border-slate-700/80 text-sm font-bold rounded-xl shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Store className="w-4 h-4 text-sky-400" />
              <span>Ver ejemplos en vivo</span>
            </button>
          </div>

          {/* Quick trust metrics */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-sky-300">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sin comisiones por ventas
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Pedidos directos a WhatsApp
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Código QR incluido
            </span>
          </div>
        </div>

        {/* Visual representation of 4 different business types requested:
            Pastelería, Restaurante, Tienda de ropa, Ferretería */}
        <div id="ejemplos-en-vivo" className="mt-16 lg:mt-20">
          <div className="text-center mb-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-sky-400">
              Casos Reales y Plantillas Pre-configuradas
            </h3>
            <p className="text-lg font-bold text-white mt-1">
              Explora cómo luce cada tipo de negocio con nuestra plataforma
            </p>
          </div>

          {businesses.length === 0 ? (
            <div className="max-w-xl mx-auto p-8 rounded-2xl bg-[#16222f] dark:bg-[#111a24] border border-slate-700/80 shadow-lg shadow-slate-950/20 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-950/80 border border-sky-800/60 text-sky-400 flex items-center justify-center shadow-inner">
                <Store className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">
                  Plataforma lista en blanco (0)
                </h4>
                <p className="text-xs sm:text-sm text-sky-100 leading-relaxed font-normal">
                  Todos los catálogos demo han sido limpiados. Crea tu propio negocio o restaurante desde el panel de control y míralo reflejado aquí y en Firestore de inmediato.
                </p>
              </div>
              <button
                onClick={onOpenCreateBusiness}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-900" />
                <span>Crear mi primer negocio</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {businesses.map((biz) => {
                return (
                  <div
                    key={biz.id}
                    onClick={() => goToPublicStore(biz.slug)}
                    className="group cursor-pointer bg-[#16222f] dark:bg-[#111a24] rounded-2xl border border-slate-700/80 overflow-hidden shadow-lg shadow-slate-950/20 hover:border-sky-500/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col"
                  >
                    {/* Cover image header */}
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={biz.coverUrl}
                        alt={biz.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Template Badge */}
                      <div className="absolute top-3 left-3">
                        <span
                          className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide rounded-full text-white shadow"
                          style={{ backgroundColor: biz.primaryColor }}
                        >
                          {biz.template === 'restaurant'
                            ? 'Restaurante'
                            : biz.template === 'bakery'
                            ? 'Pastelería'
                            : biz.template === 'fashion'
                            ? 'Tienda de Ropa'
                            : biz.template === 'hardware'
                            ? 'Ferretería'
                            : 'Comercio'}
                        </span>
                      </div>

                      {/* Logo Avatar Floating */}
                      <div className="absolute bottom-3 left-3 flex items-center gap-2.5">
                        <img
                          src={biz.logoUrl}
                          alt={biz.name}
                          className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-md bg-white"
                        />
                        <div className="text-white">
                          <div className="text-xs font-bold leading-tight drop-shadow truncate max-w-[170px]">
                            {biz.name}
                          </div>
                          <div className="text-[10px] opacity-80 truncate max-w-[170px]">
                            {biz.address}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Body description */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <p className="text-xs sm:text-[13px] text-sky-100 line-clamp-2 leading-relaxed font-normal">
                        {biz.description}
                      </p>

                      {/* Highlights & View Button */}
                      <div className="pt-2 border-t border-slate-700/70 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-400">
                          <MessageCircle className="w-3.5 h-3.5 fill-current" />
                          <span>Pedidos WhatsApp</span>
                        </div>

                        <span className="text-xs font-bold text-sky-300 group-hover:text-sky-200 group-hover:underline flex items-center gap-1">
                          Ver Sitio <ExternalLink className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
