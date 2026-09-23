import React from 'react';
import {
  Layers,
  UtensilsCrossed,
  Globe,
  MessageSquare,
  Sliders,
  CheckCircle2,
  QrCode,
  Smartphone,
  Sparkles,
} from 'lucide-react';

export const Services: React.FC = () => {
  const services = [
    {
      icon: Layers,
      title: '1. Catálogos Digitales',
      subtitle: 'Para todo tipo de comercios y productos',
      description:
        'Permite mostrar productos con fotos en alta definición, precios vigentes, precios con descuento, descripciones detalladas, etiquetas y categorías dinámicas.',
      highlights: ['Buscador instantáneo', 'Filtros por categoría', 'Etiquetas de oferta y destacados'],
      color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
    },
    {
      icon: UtensilsCrossed,
      title: '2. Menús Digitales QR',
      subtitle: 'Restaurantes, cafeterías y gastronomía',
      description:
        'Ideal para restaurantes, cafeterías, pizzerías y negocios de comida. Permite a los comensales escanear el QR en la mesa, elegir sus platos y ordenar a cocina.',
      highlights: ['Generador de código QR', 'Notas especiales de cocina', 'Sección de bebidas y postres'],
      color: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
    },
    {
      icon: Globe,
      title: '3. Sitios Web Profesionales',
      subtitle: 'Presencia digital completa y personalizada',
      description:
        'Sitios web profesionales adaptados a la identidad visual de tu marca: paleta de colores, logotipo, portada, tipografía y dominio amigable.',
      highlights: ['100% Responsive en iPhone y Android', 'Optimizado para SEO y Google', 'Carga ultra rápida'],
      color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
    },
    {
      icon: MessageSquare,
      title: '4. Contacto & WhatsApp Directo',
      subtitle: 'Conexión inmediata con tus clientes',
      description:
        'Botones de contacto estratégicos: WhatsApp oficial, llamadas directas, enlaces a Instagram, Facebook, TikTok, mapa de ubicación física y horarios de atención.',
      highlights: ['Mensaje de pedido pre-formateado', 'Sin intermediarios ni comisiones', 'Geolocalización'],
      color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
    },
    {
      icon: Sliders,
      title: '5. Gestión Sencilla e Intuitiva',
      subtitle: 'Tú tienes el control total de tu catálogo',
      description:
        'Panel administrativo intuitivo para actualizar precios, activar o pausar productos agotados, subir fotos desde tu teléfono y gestionar categorías en segundos sin saber programar.',
      highlights: ['Editor sin código', 'Subida de fotos con 1 clic', 'Reporte de pedidos recibidos'],
      color: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
    },
  ];

  return (
    <section id="servicios" className="py-16 lg:py-24 bg-[#111a24] border-y border-slate-700/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-400">
            Nuestros Servicios Principales
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Todo lo que tu negocio necesita para triunfar en la era digital
          </h2>
          <p className="text-sm sm:text-base text-sky-200">
            Diseñamos soluciones directas, rápidas y efectivas que convierten visitantes en clientes recurrentes.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <div
                key={idx}
                className={`p-6 sm:p-7 bg-[#16222f] dark:bg-[#111a24] rounded-2xl border border-slate-700/80 shadow-lg shadow-slate-950/20 hover:border-sky-500/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between ${
                  idx === 4 ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div className="space-y-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${srv.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {srv.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-sky-300 font-semibold mt-0.5">
                      {srv.subtitle}
                    </p>
                  </div>

                  <p className="text-sm text-sky-100 leading-relaxed font-normal">
                    {srv.description}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-700/70 space-y-2.5">
                  {srv.highlights.map((h, hIdx) => (
                    <div key={hIdx} className="flex items-center gap-2 text-xs sm:text-sm font-medium text-sky-200">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
