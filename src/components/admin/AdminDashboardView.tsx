import React from 'react';
import {
  Building2,
  Package,
  FolderTree,
  ShoppingBag,
  ExternalLink,
  Plus,
  QrCode,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  CheckCircle2,
  Share2,
  Globe,
} from 'lucide-react';
import { useBusiness } from '../../contexts/BusinessContext';

interface AdminDashboardViewProps {
  onNavigate: (tab: string) => void;
  onOpenCreateBusiness: () => void;
  onOpenCreateProduct: () => void;
  onOpenQR: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  onNavigate,
  onOpenCreateBusiness,
  onOpenCreateProduct,
  onOpenQR,
}) => {
  const { businesses, products, categories, orders, activeBusiness, goToPublicStore } = useBusiness();

  const bizProducts = products.filter((p) => p.businessId === activeBusiness?.id);
  const bizCategories = categories.filter((c) => c.businessId === activeBusiness?.id);
  const bizOrders = orders.filter((o) => o.businessId === activeBusiness?.id);

  const stats = [
    {
      label: 'Negocios Creados',
      value: businesses.length,
      icon: Building2,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40',
      action: () => onNavigate('businesses'),
    },
    {
      label: `Productos (${activeBusiness?.name || 'Activo'})`,
      value: bizProducts.length,
      icon: Package,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40',
      action: () => onNavigate('products'),
    },
    {
      label: 'Categorías Activas',
      value: bizCategories.length,
      icon: FolderTree,
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40',
      action: () => onNavigate('categories'),
    },
    {
      label: 'Pedidos Recibidos',
      value: bizOrders.length,
      icon: ShoppingBag,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40',
      action: () => onNavigate('orders'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-[#16222f] via-[#1a2938] to-[#111a24] border border-slate-700/80 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="space-y-2 relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-800/60 text-sky-300 text-[11px] font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Panel de Administración Centralizado</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Gestionando: {activeBusiness?.name || 'Sin negocio'}
          </h2>
          <p className="text-xs sm:text-sm text-sky-200 leading-relaxed font-normal">
            Personaliza tus productos, actualiza precios en tiempo real y comparte tu catálogo con clientes a través de WhatsApp o código QR.
          </p>
        </div>

        {activeBusiness && (
          <div className="flex flex-wrap items-center gap-2.5 relative z-10">
            {activeBusiness.websiteUrl && (
              <a
                href={activeBusiness.websiteUrl.startsWith('http') ? activeBusiness.websiteUrl : `https://${activeBusiness.websiteUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                title={`Visitar sitio web oficial: ${activeBusiness.websiteUrl}`}
              >
                <Globe className="w-4 h-4" />
                <span>Sitio Web Oficial</span>
              </a>
            )}
            <button
              onClick={() => goToPublicStore(activeBusiness.slug)}
              className="py-2.5 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Ver Catálogo en Vivo</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenQR}
              className="py-2.5 px-3.5 bg-[#0f1722] hover:bg-slate-800 text-sky-200 border border-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-sky-400" />
              <span>QR</span>
            </button>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((st, i) => {
          const Icon = st.icon;
          return (
            <div
              key={i}
              onClick={st.action}
              className="p-5 bg-[#16222f] dark:bg-[#111a24] rounded-2xl border border-slate-700/80 shadow-md hover:border-sky-500/50 cursor-pointer transition-all flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-xs text-sky-200 font-bold truncate block max-w-[150px]">
                  {st.label}
                </span>
                <span className="text-2xl font-black text-white">
                  {st.value}
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-sky-950/80 border border-sky-800/60 text-sky-400">
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-[#16222f] dark:bg-[#111a24] rounded-2xl border border-slate-700/80 p-5 shadow-md space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400">
          Acciones Rápidas
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={onOpenCreateProduct}
            className="p-3.5 rounded-xl border border-slate-700 bg-[#0f1722] hover:bg-slate-800 hover:border-sky-500/50 transition-colors flex items-center gap-3 text-left cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                Agregar Producto
              </div>
              <div className="text-[11px] text-sky-200 font-medium">Nuevo ítem al catálogo</div>
            </div>
          </button>

          <button
            onClick={onOpenCreateBusiness}
            className="p-3.5 rounded-xl border border-slate-700 bg-[#0f1722] hover:bg-slate-800 hover:border-sky-500/50 transition-colors flex items-center gap-3 text-left cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-sky-950/80 border border-sky-800/60 text-sky-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                Nuevo Negocio / Cliente
              </div>
              <div className="text-[11px] text-sky-200 font-medium">Crear sitio individual</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('templates')}
            className="p-3.5 rounded-xl border border-slate-700 bg-[#0f1722] hover:bg-slate-800 hover:border-sky-500/50 transition-colors flex items-center gap-3 text-left cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-950/80 border border-purple-800/60 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                Cambiar Plantilla
              </div>
              <div className="text-[11px] text-sky-200 font-medium">Restaurante, moda, etc.</div>
            </div>
          </button>
        </div>
      </div>

      {/* Featured Products Table Preview */}
      <div className="bg-[#16222f] dark:bg-[#111a24] rounded-2xl border border-slate-700/80 p-5 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">
              Productos Destacados de {activeBusiness?.name}
            </h3>
            <p className="text-xs text-sky-200 font-medium">Artículos principales visibles en la portada</p>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="text-xs text-sky-400 font-bold hover:underline cursor-pointer"
          >
            Ver todos ({bizProducts.length})
          </button>
        </div>

        {bizProducts.length === 0 ? (
          <div className="py-10 text-center text-xs text-sky-300/80 bg-[#0f1722] rounded-xl border border-dashed border-slate-700 space-y-2">
            <Package className="w-8 h-8 text-sky-400 mx-auto" />
            <p className="font-semibold text-white">
              No hay productos registrados todavía
            </p>
            <p className="text-[11px] text-sky-300">
              Agrega tu primer artículo para que aparezca aquí y en la tienda pública.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0f1722] text-sky-300 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Producto</th>
                  <th className="py-2.5 px-3">Precio</th>
                  <th className="py-2.5 px-3">Estado</th>
                  <th className="py-2.5 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/70">
                {bizProducts.slice(0, 5).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 flex items-center gap-2.5">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-9 h-9 rounded-lg object-cover border border-slate-700"
                      />
                      <div>
                        <div className="font-bold text-white truncate max-w-[200px]">
                          {p.name}
                        </div>
                        <div className="text-[11px] text-sky-200 truncate max-w-[200px] font-medium">
                          {p.description || 'Sin descripción'}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-black text-white">
                      {activeBusiness?.currency || '$'}{p.price.toFixed(2)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.isAvailable
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {p.isAvailable ? 'Disponible' : 'Agotado'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onNavigate('products')}
                        className="text-xs font-semibold text-sky-400 hover:underline cursor-pointer"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
