import React from 'react';
import {
  Palette,
  UploadCloud,
  FolderPlus,
  PackagePlus,
  Share2,
  CheckCircle,
  Smartphone,
  Sparkles,
} from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      icon: Palette,
      title: 'Elige tu Plantilla y Colores',
      desc: 'Selecciona entre gastronomía, pastelería, moda, ferretería o comercio general y ajusta tu paleta de marca.',
    },
    {
      step: '02',
      icon: UploadCloud,
      title: 'Sube tu Logo y Portada',
      desc: 'Coloca tu imagen corporativa, horarios de atención, dirección física y tu número de WhatsApp para pedidos.',
    },
    {
      step: '03',
      icon: FolderPlus,
      title: 'Crea tus Categorías',
      desc: 'Organiza tu catálogo o menú en secciones claras como Entradas, Platos Fuertes, Bebidas, Calzado o Herramientas.',
    },
    {
      step: '04',
      icon: PackagePlus,
      title: 'Agrega tus Productos',
      desc: 'Carga fotos atractivas, descripciones, precios reales, precios de oferta y marca los productos más destacados.',
    },
    {
      step: '05',
      icon: Share2,
      title: '¡Publica y Vende!',
      desc: 'Obtén tu enlace personalizado (webcatalogpro.com/negocio/tu-marca) y código QR para compartir en redes y vitrinas.',
    },
  ];

  return (
    <section id="como-funciona" className="py-16 lg:py-24 bg-[#0d1520]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-400">
            Fácil, Rápido y Sin Programación
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            ¿Cómo funciona D. E. K NovaCore?
          </h2>
          <p className="text-sm sm:text-base text-sky-200">
            En menos de 10 minutos tu negocio tendrá un catálogo o menú digital listo para recibir pedidos directos.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 relative">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="relative bg-[#16222f] dark:bg-[#111a24] p-6 rounded-2xl border border-slate-700/80 shadow-lg shadow-slate-950/20 flex flex-col justify-between group hover:border-sky-500/50 hover:shadow-xl transition-all duration-300"
              >
                {/* Step badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-sky-950/80 text-sky-400 border border-sky-800/60 flex items-center justify-center font-black text-sm group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-black text-sky-500/30">
                    {s.step}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white mb-2">
                    {s.title}
                  </h3>
                  <p className="text-sm text-sky-100 leading-relaxed font-normal">
                    {s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
