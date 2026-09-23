import React, { useState, useMemo } from 'react';
import {
  Search,
  MessageCircle,
  Phone,
  MapPin,
  Clock,
  Instagram,
  Facebook,
  QrCode,
  ShoppingBag,
  ArrowLeft,
  Share2,
  Tag,
  Plus,
  Check,
  Sparkles,
  Info,
  Truck,
  ExternalLink,
  Globe,
} from 'lucide-react';
import { Business, Product, Category } from '../../types';
import { useBusiness } from '../../contexts/BusinessContext';
import { useCart } from '../../contexts/CartContext';
import { ProductDetailModal } from './ProductDetailModal';
import { QRCodeModal } from '../common/QRCodeModal';
import { CartDrawer } from '../common/CartDrawer';

interface PublicBusinessViewProps {
  business: Business;
}

export const PublicBusinessView: React.FC<PublicBusinessViewProps> = ({ business }) => {
  const { categories, products, goToLanding, goToAdmin } = useBusiness();
  const { addToCart, totalItems, subtotal, openCart } = useCart();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  // Filter categories for this business
  const bizCategories = useMemo(() => {
    return categories
      .filter((c) => c.businessId === business.id && c.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [categories, business.id]);

  // Filter products for this business
  const bizProducts = useMemo(() => {
    return products.filter((p) => p.businessId === business.id);
  }, [products, business.id]);

  // Filter by category & search query
  const filteredProducts = useMemo(() => {
    return bizProducts.filter((p) => {
      const matchesCategory =
        selectedCategoryId === 'all' ||
        (selectedCategoryId === 'featured' ? p.isFeatured : p.categoryId === selectedCategoryId);

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query)) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(query)));

      return matchesCategory && matchesSearch;
    });
  }, [bizProducts, selectedCategoryId, searchQuery]);

  const currency = business.currency || '$';

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1200);
  };

  const handleOpenDetail = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: business.name,
        text: business.tagline || `Catálogo y menú de ${business.name}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('¡Enlace del negocio copiado al portapapeles!');
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1520] text-slate-100 flex flex-col transition-colors">
      {/* Top utility bar */}
      <div className="bg-[#111a24] text-sky-200 text-xs py-2 px-4 flex items-center justify-between border-b border-slate-700/80">
        <button
          onClick={goToLanding}
          className="flex items-center gap-1.5 text-sky-300 hover:text-white transition-colors text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver a D. E. K NovaCore</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsQRModalOpen(true)}
            className="flex items-center gap-1 text-sky-300 hover:text-white transition-colors cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Código QR</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1 text-sky-300 hover:text-white transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Compartir</span>
          </button>
        </div>
      </div>

      {/* Featured Notice Announcement (if set) */}
      {business.featuredNotice && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>{business.featuredNotice}</span>
        </div>
      )}

      {/* Hero Cover Header */}
      <div className="relative h-60 sm:h-72 lg:h-80 w-full overflow-hidden bg-slate-800">
        <img
          src={business.coverUrl}
          alt={business.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

        {/* Business Branding Details */}
        <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <div className="relative">
              <img
                src={business.logoUrl}
                alt={business.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-white dark:border-slate-800 shadow-xl bg-white"
              />
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" title="Negocio Abierto" />
            </div>

            <div className="text-white space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md text-white"
                  style={{ backgroundColor: business.primaryColor }}
                >
                  {business.businessType}
                </span>
                {business.deliveryAvailable && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-600 text-white rounded-md flex items-center gap-1">
                    <Truck className="w-3 h-3" /> Delivery Disponible
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow">
                {business.name}
              </h1>
              {business.tagline && (
                <p className="text-xs sm:text-sm text-slate-200 font-medium drop-shadow line-clamp-1">
                  {business.tagline}
                </p>
              )}
            </div>
          </div>

          {/* Quick contact buttons on Cover */}
          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/${(business.whatsapp && business.whatsapp.replace(/\D/g, '').length >= 7 && !business.whatsapp.includes('60000000')) ? business.whatsapp.replace(/\D/g, '') : '50760244779'}?text=Hola%20${encodeURIComponent(business.name)},%20deseo%20hacer%20una%20consulta`}
              target="_blank"
              rel="noreferrer"
              className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition-all hover:scale-105"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>WhatsApp</span>
            </a>

            <a
              href={`tel:${business.phone || '+507 6024-4779'}`}
              className="py-2 px-3.5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
              title="Llamar"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">Llamar</span>
            </a>

            <button
              onClick={() => setIsQRModalOpen(true)}
              className="py-2 px-3 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-semibold rounded-xl flex items-center transition-all"
              title="Ver QR"
            >
              <QrCode className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Business Info Bar */}
      <div className="bg-[#16222f] border-b border-slate-700/80 shadow-sm py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs text-sky-200 font-medium">
          <div className="flex flex-wrap items-center gap-4">
            {business.address && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="text-white">{business.address}</span>
              </span>
            )}
            {business.schedule && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="text-white">{business.schedule}</span>
              </span>
            )}
          </div>

          {/* Social & Web Links */}
          <div className="flex items-center gap-3">
            {business.websiteUrl && (
              <a
                href={business.websiteUrl.startsWith('http') ? business.websiteUrl : `https://${business.websiteUrl}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-950/80 border border-sky-800/60 text-sky-400 hover:text-white text-xs font-semibold transition-colors"
                title={`Sitio web oficial: ${business.websiteUrl}`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Sitio Web</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-70" />
              </a>
            )}
            {business.instagram && (
              <a
                href={`https://instagram.com/${business.instagram.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-pink-400 transition-colors"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {business.facebook && (
              <a
                href={business.facebook}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-blue-400 transition-colors"
                title="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Catalog Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Search and Category Filter Toolbar */}
        <div className="space-y-4">
          {/* Search Box */}
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Buscar en ${business.name}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#16222f] dark:bg-[#111a24] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-sm"
            />
          </div>

          {/* Categories Pill Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategoryId('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                selectedCategoryId === 'all'
                  ? 'bg-sky-500 text-slate-950 shadow-md font-extrabold'
                  : 'bg-[#16222f] dark:bg-[#111a24] text-sky-200 border border-slate-700/80 hover:bg-sky-950/60 hover:text-white'
              }`}
            >
              Todos ({bizProducts.length})
            </button>

            {bizProducts.some((p) => p.isFeatured) && (
              <button
                onClick={() => setSelectedCategoryId('featured')}
                className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedCategoryId === 'featured'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'bg-[#16222f] dark:bg-[#111a24] text-sky-200 border border-slate-700/80 hover:bg-sky-950/60 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Destacados
              </button>
            )}

            {bizCategories.map((cat) => {
              const count = bizProducts.filter((p) => p.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                    selectedCategoryId === cat.id
                      ? 'bg-sky-500 text-slate-950 shadow-md font-extrabold'
                      : 'bg-[#16222f] dark:bg-[#111a24] text-sky-200 border border-slate-700/80 hover:bg-sky-950/60 hover:text-white'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-[#16222f] dark:bg-[#111a24] rounded-2xl border border-slate-700/80 p-8 shadow-lg">
            <div className="w-14 h-14 rounded-full bg-sky-950/80 border border-sky-800/60 flex items-center justify-center text-sky-400 mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">
              No se encontraron productos
            </h3>
            <p className="text-xs text-sky-200 max-w-sm mx-auto">
              Intenta con otra palabra clave o selecciona otra categoría de {business.name}.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategoryId('all');
              }}
              className="text-xs font-bold text-sky-300 hover:text-sky-200 hover:underline cursor-pointer"
            >
              Ver todos los productos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProducts.map((prod) => {
              const isAdded = !!addedIds[prod.id];
              return (
                <div
                  key={prod.id}
                  onClick={() => handleOpenDetail(prod)}
                  className="group cursor-pointer bg-[#16222f] dark:bg-[#111a24] rounded-2xl border border-slate-700/80 overflow-hidden shadow-lg shadow-slate-950/20 hover:border-sky-500/50 hover:shadow-2xl transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div>
                    {/* Image Box */}
                    <div className="relative h-44 sm:h-48 overflow-hidden bg-slate-900">
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {prod.isFeatured && (
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[10px] font-extrabold bg-amber-500 text-slate-950 rounded-full shadow">
                          Destacado
                        </span>
                      )}
                      {prod.comparePrice && (
                        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 text-[10px] font-extrabold bg-rose-600 text-white rounded-full shadow">
                          Oferta
                        </span>
                      )}
                    </div>

                    {/* Body */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="font-bold text-xs sm:text-sm text-white line-clamp-1 group-hover:text-sky-300 transition-colors">
                          {prod.name}
                        </h3>
                      </div>

                      <p className="text-xs sm:text-[13px] text-sky-100 line-clamp-2 leading-relaxed font-normal">
                        {prod.description}
                      </p>

                      {prod.tags && prod.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {prod.tags.slice(0, 2).map((t, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-sky-950/80 text-sky-200 border border-sky-800/60"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price & Add to Cart Button */}
                  <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-700/70 mt-2">
                    <div>
                      <div className="text-base font-black text-white">
                        {currency}{prod.price.toFixed(2)}
                      </div>
                      {prod.comparePrice && (
                        <div className="text-[11px] text-sky-400/80 font-semibold line-through">
                          {currency}{prod.comparePrice.toFixed(2)}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={(e) => handleQuickAdd(e, prod)}
                      className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isAdded
                          ? 'bg-emerald-600 text-white scale-105'
                          : 'bg-sky-950/70 hover:bg-sky-500 hover:text-slate-950 text-sky-200 border border-sky-700/60'
                      }`}
                      title="Agregar al pedido"
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Listo</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Agregar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Sticky Bottom Cart Bar for Mobile when cart has items */}
      {totalItems > 0 && (
        <div className="sticky bottom-0 z-30 bg-[#16222f]/95 backdrop-blur-md border-t border-slate-700/80 p-3.5 px-4 shadow-xl">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative p-2.5 rounded-xl bg-sky-500 text-slate-950 shadow-md font-bold">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-1.5 bg-[#0f1722] text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-sky-400">
                  {totalItems}
                </span>
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  Subtotal: {currency}{subtotal.toFixed(2)}
                </div>
                <div className="text-[10px] text-sky-200">
                  {totalItems} {totalItems === 1 ? 'producto' : 'productos'} seleccionados
                </div>
              </div>
            </div>

            <button
              onClick={openCart}
              className="py-2.5 px-5 bg-sky-500 hover:bg-sky-400 active:scale-95 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Ver Pedido</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating WhatsApp Quick Action Button */}
      <a
        href={`https://wa.me/${(business.whatsapp && business.whatsapp.replace(/\D/g, '').length >= 7 && !business.whatsapp.includes('60000000')) ? business.whatsapp.replace(/\D/g, '') : '50760244779'}?text=Hola%20${encodeURIComponent(business.name)},%20tengo%20una%20pregunta%20sobre%20su%20cat%C3%A1logo`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-20 sm:bottom-6 right-6 z-30 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 shine-effect"
        title="Contactar por WhatsApp"
      >
        <MessageCircle className="w-7 h-7 fill-current" />
      </a>

      {/* Footer Powered By watermark */}
      <footer className="py-6 border-t border-slate-700/80 text-center text-xs text-sky-200 bg-[#111a24] mt-auto">
        <p>
          © {new Date().getFullYear()} {business.name} • Impulsado por{' '}
          <button
            onClick={goToLanding}
            className="font-bold text-sky-400 hover:text-sky-300 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            D. E. K NovaCore
          </button>
        </p>
      </footer>

      {/* Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        business={business}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />

      {/* QR Modal */}
      <QRCodeModal
        business={business}
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
      />

      {/* Cart Drawer */}
      <CartDrawer business={business} />
    </div>
  );
};
