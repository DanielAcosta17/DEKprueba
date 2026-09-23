import React from 'react';
import { Check, Sparkles, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

interface PricingProps {
  onSelectPlan: () => void;
}

export const Pricing: React.FC<PricingProps> = ({ onSelectPlan }) => {
  const plans = [
    {
      name: 'Emprendedor',
      badge: 'Ideal para iniciar',
      price: '$19',
      period: '/mes',
      description: 'Perfecto para pequeños negocios que quieren mostrar su catálogo y recibir pedidos.',
      features: [
        '1 Negocio con catálogo digital o menú QR',
        'Hasta 50 productos con fotos HD',
        'Botón directo de pedidos por WhatsApp',
        'Código QR para imprimir y compartir',
        'Panel de administración móvil y web',
        'Soporte técnico por WhatsApp',
      ],
      cta: 'Elegir Emprendedor',
      popular: false,
    },
    {
      name: 'Profesional',
      badge: 'El Más Popular',
      price: '$39',
      period: '/mes',
      description: 'Para restaurantes, pastelerías y tiendas en crecimiento con alto volumen.',
      features: [
        'Hasta 3 Negocios o Sucursales',
        'Productos y categorías ilimitadas',
        'Gestión de promociones y descuentos',
        'Carrito de compras interactivo',
        'Sincronización Cloud con Firebase',
        'Generador de QR en alta resolución',
        'Dominio amigable y SEO optimizado',
      ],
      cta: 'Comenzar Ahora',
      popular: true,
    },
    {
      name: 'Agencia / Franquicia',
      badge: 'Empresarial',
      price: '$89',
      period: '/mes',
      description: 'Para agencias que administran múltiples clientes o franquicias comerciales.',
      features: [
        'Negocios ilimitados desde 1 solo panel',
        'Múltiples usuarios administradores',
        'Módulo de pedidos e historial exportable',
        'Asesoría de diseño y carga de menú inicial',
        'Integración con Firebase & Cloud dedicada',
        'Soporte prioritario VIP 24/7',
      ],
      cta: 'Contactar Asesor',
      popular: false,
    },
  ];

  return (
    <section id="precios" className="py-16 lg:py-24 bg-[#0d1520]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-400">
            Planes Transparentes y Accesibles
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Invierte en la digitalización de tu negocio
          </h2>
          <p className="text-sm sm:text-base text-sky-200">
            Sin comisiones ocultas sobre tus ventas. Todo lo que vendes por WhatsApp es 100% tuyo.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((p, idx) => (
            <div
              key={idx}
              className={`relative rounded-3xl p-7 flex flex-col justify-between transition-all duration-300 ${
                p.popular
                  ? 'bg-[#16222f] dark:bg-[#111a24] border-2 border-sky-400 shadow-2xl shadow-sky-950/40 md:-translate-y-2'
                  : 'bg-[#16222f] dark:bg-[#111a24] border border-slate-700/80 shadow-lg shadow-slate-950/20'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 bg-sky-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider rounded-full shadow-md">
                  {p.badge}
                </div>
              )}

              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {p.name}
                    </h3>
                    <p className="text-xs sm:text-[13px] text-sky-300 font-medium mt-1">
                      {p.description}
                    </p>
                  </div>
                </div>

                <div className="my-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">
                    {p.price}
                  </span>
                  <span className="text-xs text-sky-300 font-semibold">
                    {p.period}
                  </span>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-700/70 text-xs sm:text-[13px]">
                  {p.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 font-medium text-sky-100">
                      <div className="w-4 h-4 rounded-full bg-sky-950/80 border border-sky-800/60 text-cyan-400 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                <button
                  onClick={onSelectPlan}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                    p.popular
                      ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md font-extrabold'
                      : 'bg-sky-950/60 hover:bg-sky-900/80 text-sky-200 border border-sky-600/40'
                  }`}
                >
                  <span>{p.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
