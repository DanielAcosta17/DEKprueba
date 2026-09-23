import React, { useState } from 'react';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  X,
  Tag,
  Star,
  Coffee,
  Utensils,
  Shirt,
  Wrench,
  Cake,
  ShoppingBag,
} from 'lucide-react';
import { Category } from '../../types';
import { useBusiness } from '../../contexts/BusinessContext';

export const CategoryManagerView: React.FC = () => {
  const { categories, products, activeBusiness, createCategory, updateCategory, deleteCategory } =
    useBusiness();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Tag');
  const [sortOrder, setSortOrder] = useState(1);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeletingCat, setIsDeletingCat] = useState(false);

  const bizCategories = categories.filter((c) => c.businessId === activeBusiness?.id);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setIcon('Tag');
    setSortOrder(bizCategories.length + 1);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setIcon(cat.icon || 'Tag');
    setSortOrder(cat.sortOrder || 1);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !activeBusiness) return;

    if (editingCategory) {
      await updateCategory({
        ...editingCategory,
        name,
        description,
        icon,
        sortOrder: Number(sortOrder) || 1,
      });
    } else {
      await createCategory({
        businessId: activeBusiness.id,
        name,
        description,
        icon,
        sortOrder: Number(sortOrder) || 1,
        isActive: true,
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (cat: Category) => {
    setCategoryToDelete(cat);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeletingCat(true);
    try {
      await deleteCategory(categoryToDelete.id, categoryToDelete.businessId);
      setCategoryToDelete(null);
    } finally {
      setIsDeletingCat(false);
    }
  };

  if (!activeBusiness) {
    return (
      <div className="p-12 text-center bg-[#16222f] dark:bg-[#111a24] rounded-2xl border border-dashed border-slate-700 space-y-4">
        <div className="w-12 h-12 mx-auto rounded-xl bg-slate-800 text-sky-400 flex items-center justify-center">
          <FolderTree className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">
            Aún no tienes ningún negocio seleccionado
          </h3>
          <p className="text-xs text-sky-200 max-w-sm mx-auto">
            Para organizar categorías, primero debes registrar o seleccionar un negocio en la sección "Mis Negocios".
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">
            Categorías de {activeBusiness?.name}
          </h2>
          <p className="text-xs text-sky-200">
            Organiza los productos y platos en secciones para facilitar la búsqueda al cliente.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="py-2.5 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {bizCategories.map((cat) => {
          const prodCount = products.filter((p) => p.categoryId === cat.id).length;
          return (
            <div
              key={cat.id}
              className="p-5 bg-[#16222f] dark:bg-[#111a24] rounded-2xl border border-slate-700/80 shadow-md flex items-start justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-950/80 border border-sky-800/60 text-sky-400 flex items-center justify-center font-bold text-xs">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      {cat.name}
                    </h3>
                    <span className="text-[11px] font-semibold text-sky-300">
                      Orden: #{cat.sortOrder}
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-[13px] text-sky-100 line-clamp-2 leading-relaxed font-normal">
                  {cat.description || 'Sin descripción'}
                </p>

                <div className="text-[11px] font-bold text-emerald-400">
                  {prodCount} {prodCount === 1 ? 'producto' : 'productos'}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(cat)}
                  className="p-1.5 text-sky-300 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cat)}
                  className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-950/40 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-[#16222f] dark:bg-[#111a24] rounded-2xl shadow-2xl border border-slate-700/80 p-6 overflow-hidden text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/80 mb-4">
              <h3 className="font-bold text-white text-sm">
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-sky-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-sky-200 mb-1">
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Pasteles Temáticos, Entradas, Calzado..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-[#0f1722] text-white focus:outline-none focus:ring-1 focus:ring-sky-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-sky-200 mb-1">
                  Descripción breve (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Deliciosos postres hechos el mismo día"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-[#0f1722] text-white focus:outline-none focus:ring-1 focus:ring-sky-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-sky-200 mb-1">
                  Posición / Orden de aparición
                </label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-[#0f1722] text-white focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-700/80 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sky-300 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl shadow transition-all cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* In-App Category Delete Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#16222f] border border-rose-500/40 rounded-2xl shadow-2xl p-6 text-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">¿Eliminar categoría?</h3>
                <p className="text-xs text-rose-300 font-semibold">{categoryToDelete.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              ¿Estás seguro de que deseas eliminar esta categoría? Los productos asociados se mantendrán en el catálogo sin categoría asignada.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                disabled={isDeletingCat}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeletingCat}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-900/40 transition-all"
              >
                {isDeletingCat ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Sí, Eliminar Categoría</span>
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
