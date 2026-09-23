import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  Check,
  X,
  Sparkles,
  Tag,
  CheckCircle2,
  AlertCircle,
  Eye,
  ClipboardPaste,
} from 'lucide-react';
import { Product } from '../../types';
import { useBusiness } from '../../contexts/BusinessContext';

interface ProductManagerViewProps {
  isCreateOpenInitially?: boolean;
}

export const ProductManagerView: React.FC<ProductManagerViewProps> = ({
  isCreateOpenInitially = false,
}) => {
  const {
    products,
    categories,
    activeBusiness,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductAvailable,
  } = useBusiness();

  const [isModalOpen, setIsModalOpen] = useState(isCreateOpenInitially);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    comparePrice: undefined,
    categoryId: '',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    tags: [],
    isFeatured: false,
    isAvailable: true,
    sku: '',
    unit: '',
  });

  const [tagsInput, setTagsInput] = useState('');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeletingProd, setIsDeletingProd] = useState(false);

  // Categories of active business
  const bizCategories = useMemo(() => {
    return categories.filter((c) => c.businessId === activeBusiness?.id);
  }, [categories, activeBusiness?.id]);

  // Products of active business
  const bizProducts = useMemo(() => {
    return products.filter((p) => p.businessId === activeBusiness?.id);
  }, [products, activeBusiness?.id]);

  // Filtered by search and category
  const filteredProducts = useMemo(() => {
    return bizProducts.filter((p) => {
      const matchesCat = filterCategory === 'all' || p.categoryId === filterCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [bizProducts, filterCategory, searchQuery]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      comparePrice: undefined,
      categoryId: bizCategories[0]?.id || '',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      tags: [],
      isFeatured: false,
      isAvailable: true,
      sku: '',
      unit: '',
    });
    setTagsInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({ ...p });
    setTagsInput((p.tags || []).join(', '));
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !activeBusiness) return;

    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      ...formData,
      tags: tagsArray,
      businessId: activeBusiness.id,
      price: Number(formData.price) || 0,
      comparePrice: formData.comparePrice ? Number(formData.comparePrice) : undefined,
    };

    if (editingProduct) {
      await updateProduct({
        ...editingProduct,
        ...(payload as Product),
      });
    } else {
      await createProduct(payload);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (p: Product) => {
    setProductToDelete(p);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeletingProd(true);
    try {
      await deleteProduct(productToDelete.id, productToDelete.businessId);
      setProductToDelete(null);
    } finally {
      setIsDeletingProd(false);
    }
  };

  const currency = activeBusiness?.currency || '$';

  if (!activeBusiness) {
    return (
      <div className="p-12 text-center bg-[#16222f] dark:bg-[#111a24] rounded-2xl border border-dashed border-slate-700 space-y-4">
        <div className="w-12 h-12 mx-auto rounded-xl bg-sky-950/80 border border-sky-800/60 text-sky-400 flex items-center justify-center">
          <Package className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">
            Aún no tienes ningún negocio seleccionado
          </h3>
          <p className="text-xs text-sky-200 max-w-sm mx-auto">
            Para agregar productos y platillos, primero debes registrar o seleccionar un negocio en la sección "Mis Negocios".
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">
            Productos de {activeBusiness?.name}
          </h2>
          <p className="text-xs text-sky-200">
            Gestiona fotos, descripciones, precios, descuentos y disponibilidad.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="py-2.5 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Producto</span>
        </button>
      </div>

      {/* Toolbar: Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#16222f] dark:bg-[#111a24] p-4 rounded-2xl border border-slate-700/80 shadow-md">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-sky-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#0f1722] border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-sky-200 font-medium whitespace-nowrap">
            Categoría:
          </span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-[#0f1722] border border-slate-700 rounded-xl text-xs text-white focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#16222f] text-white">Todas las categorías</option>
            {bizCategories.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#16222f] text-white">
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#16222f] dark:bg-[#111a24] rounded-2xl border border-slate-700/80 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0f1722] text-sky-300 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Producto</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Precio</th>
                <th className="py-3 px-4">Oferta</th>
                <th className="py-3 px-4">Destacado</th>
                <th className="py-3 px-4">Disponibilidad</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/70">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sky-300 font-medium">
                    No hay productos registrados con estos filtros.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const cat = bizCategories.find((c) => c.id === p.categoryId);
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-700 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-white">
                            {p.name}
                          </div>
                          {p.sku && (
                            <div className="text-[11px] font-mono font-semibold text-sky-300">
                              SKU: {p.sku}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-medium text-sky-200">
                        {cat?.name || 'General'}
                      </td>

                      <td className="py-3 px-4 font-black text-white">
                        {currency}{p.price.toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-slate-400">
                        {p.comparePrice ? (
                          <span className="line-through text-rose-400 font-medium">
                            {currency}{p.comparePrice.toFixed(2)}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {p.isFeatured ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-950/70 border border-amber-800/60 px-2 py-0.5 rounded-md">
                            <Sparkles className="w-3 h-3" /> Sí
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">No</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleProductAvailable(p.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                            p.isAvailable
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900'
                              : 'bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900'
                          }`}
                        >
                          {p.isAvailable ? 'Disponible' : 'Agotado'}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-sky-300 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p)}
                            className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-950/40 cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-[#16222f] dark:bg-[#111a24] rounded-2xl shadow-2xl border border-slate-700/80 my-8 overflow-hidden">
            <div className="p-5 border-b border-slate-700/80 flex items-center justify-between bg-[#0f1722]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500 text-slate-950 flex items-center justify-center font-bold">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {editingProduct ? 'Editar Producto' : 'Nuevo Producto para Catálogo'}
                  </h3>
                  <p className="text-[11px] text-sky-300">
                    Negocio: {activeBusiness?.name}
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

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div>
                <label className="block font-semibold text-sky-200 mb-1">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Hamburguesa Angus Premium o Vestido Floral"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-[#0f1722] text-white focus:outline-none focus:ring-1 focus:ring-sky-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-sky-200 mb-1">
                    Categoría *
                  </label>
                  <select
                    required
                    value={formData.categoryId || ''}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-[#0f1722] text-white focus:outline-none cursor-pointer"
                  >
                    <option value="" disabled className="bg-[#16222f] text-slate-400">Selecciona una categoría</option>
                    {bizCategories.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#16222f] text-white">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-sky-200 mb-1">
                    Código SKU / Referencia
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: PROD-001"
                    value={formData.sku || ''}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-[#0f1722] text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-sky-200 mb-1">
                    Precio Vigente ({currency}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price ?? 0}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-[#0f1722] text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-sky-200 mb-1">
                    Precio Original / Antes de Oferta (Opcional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ej: 15.00"
                    value={formData.comparePrice ?? ''}
                    onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-[#0f1722] text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-sky-200 mb-1">
                  Descripción Detallada o Ingredientes
                </label>
                <textarea
                  rows={2}
                  placeholder="Explica qué incluye, materiales, porciones, etc."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-[#0f1722] text-white focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-sky-200">
                    URL de la Imagen del Producto *
                  </label>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText();
                        if (text) setFormData((prev) => ({ ...prev, imageUrl: text.trim() }));
                      } catch (err) {
                        console.warn('Clipboard read unavailable:', err);
                      }
                    }}
                    className="text-[10px] text-sky-300 hover:text-white font-bold flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-950 border border-sky-800/80 hover:bg-sky-900 transition-colors cursor-pointer"
                    title="Pegar enlace de imagen"
                  >
                    <ClipboardPaste className="w-2.5 h-2.5 text-sky-400" />
                    <span>Pegar URL</span>
                  </button>
                </div>
                <input
                  type="text"
                  inputMode="url"
                  required
                  placeholder="https://images.unsplash.com/... o https://..."
                  value={formData.imageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  onPaste={(e) => {
                    const text = e.clipboardData.getData('text');
                    if (text) {
                      e.preventDefault();
                      setFormData((prev) => ({ ...prev, imageUrl: text.trim() }));
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-[#0f1722] text-white focus:outline-none focus:ring-1 focus:ring-sky-400"
                />
                {formData.imageUrl && (
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-16 h-16 rounded-xl object-cover mt-2 border border-slate-700"
                  />
                )}
              </div>

              <div>
                <label className="block font-semibold text-sky-200 mb-1">
                  Etiquetas (Separadas por comas)
                </label>
                <input
                  type="text"
                  placeholder="Ej: nuevo, recomendado, vegano, oferta"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-[#0f1722] text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured ?? false}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded text-sky-500"
                  />
                  <span className="font-semibold text-sky-200">
                    Producto Destacado en Inicio
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable ?? true}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="w-4 h-4 rounded text-sky-500"
                  />
                  <span className="font-semibold text-sky-200">
                    Disponible para Venta
                  </span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-700/80 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sky-300 hover:text-white hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {editingProduct ? 'Guardar Cambios' : 'Guardar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* In-App Product Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#16222f] border border-rose-500/40 rounded-2xl shadow-2xl p-6 text-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">¿Eliminar producto?</h3>
                <p className="text-xs text-rose-300 font-semibold">{productToDelete.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              ¿Estás seguro de que deseas eliminar este producto del catálogo? Esta acción no se puede deshacer.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                disabled={isDeletingProd}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeletingProd}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-900/40 transition-all"
              >
                {isDeletingProd ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Sí, Eliminar Producto</span>
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
