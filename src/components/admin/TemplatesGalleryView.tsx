import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Cake,
  Shirt,
  Wrench,
  Store,
  Check,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { AVAILABLE_TEMPLATES } from '../../data/initialData';
import { useBusiness } from '../../contexts/BusinessContext';
import { TemplateType } from '../../types';

export const TemplatesGalleryView: React.FC = () => {
  const { activeBusiness, updateBusiness, goToPublicStore } = useBusiness();
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const iconMap: Record<string, any> = {
    UtensilsCrossed,
    Cake,
    Sparkles: Shirt,
    Wrench,
    Store,
  };

  const handleApplyTemplate = async (templateId: TemplateType, templateName: string) => {
    if (!activeBusiness) return;
    await updateBusiness({
      ...activeBusiness,
      template: templateId,
    });
    setSuccessNotice(`¡Plantilla "${templateName}" aplicada y guardada en Cloud Firestore para ${activeBusiness.name}!`);
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">
          Galería de Plantillas Visuales
        </h2>
        <p className="text-xs text-sky-200">
          Aplica un diseño especializado según el rubro de {activeBusiness?.name}.
        </p>
      </div>

      {successNotice && (
        <div className="p-4 bg-emerald-950/70 text-emerald-200 border border-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between animate-fade-in shadow-md">
          <span>{successNotice}</span>
          <button
            onClick={() => activeBusiness && goToPublicStore(activeBusiness.slug)}
            className="underline flex items-center gap-1 hover:text-white cursor-pointer"
          >
            Ver Sitio Ahora <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {AVAILABLE_TEMPLATES.map((tmpl) => {
          const Icon = iconMap[tmpl.icon] || Store;
          const isCurrent = activeBusiness?.template === tmpl.id;

          return (
            <div
              key={tmpl.id}
              className={`bg-[#16222f] dark:bg-[#111a24] rounded-2xl border p-6 flex flex-col justify-between transition-all shadow-md ${
                isCurrent
                  ? 'border-sky-400 ring-2 ring-sky-400/20'
                  : 'border-slate-700/80 hover:border-slate-600'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: tmpl.previewColor }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  {isCurrent && (
                    <span className="px-2.5 py-1 bg-sky-500 text-slate-950 text-[10px] font-black uppercase rounded-full tracking-wide">
                      En Uso Actual
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">
                    {tmpl.name}
                  </h3>
                  <p className="text-xs text-sky-300 mt-0.5">{tmpl.bestFor}</p>
                </div>

                <p className="text-xs text-sky-100 leading-relaxed font-normal">
                  {tmpl.description}
                </p>

                <div className="space-y-1.5 pt-1">
                  {tmpl.features.map((f, i) => (
                    <div key={i} className="text-[11px] text-sky-200 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-700/80">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2.5 bg-slate-800 text-sky-400 font-bold text-xs rounded-xl cursor-default flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    Plantilla Activa
                  </button>
                ) : (
                  <button
                    onClick={() => handleApplyTemplate(tmpl.id, tmpl.name)}
                    className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                    Aplicar a {activeBusiness?.name}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
