import { Business, Category, Product, TemplateInfo } from '../types';

export const INITIAL_BUSINESSES: Business[] = [];

export const INITIAL_CATEGORIES: Category[] = [];

export const INITIAL_PRODUCTS: Product[] = [];

export const AVAILABLE_TEMPLATES: TemplateInfo[] = [
  {
    id: 'restaurant',
    name: 'Menú Digital Gourmet',
    category: 'Gastronomía',
    description: 'Diseño enfocado en alta apetencia, etiquetas de ingredientes, platos del chef, alérgenos y pedidos inmediatos a cocina por WhatsApp.',
    bestFor: 'Restaurantes, Pizzerías, Bares, Hamburgueserías, Cafeterías y Dark Kitchens',
    previewColor: '#DC2626',
    features: ['Tarjetas gastronómicas con insignias', 'Botón de pedido con notas de cocina', 'Filtro por tiempos (entradas, fuertes, bebidas)', 'Cálculo de propina y delivery'],
    icon: 'UtensilsCrossed',
  },
  {
    id: 'bakery',
    name: 'Catálogo Dulce & Pastelería',
    category: 'Repostería',
    description: 'Estética cálida y artesanal con tonos pastel, opciones de tamaño de pasteles, porciones y anticipación de pedidos.',
    bestFor: 'Pastelerías, Reposterías, Panaderías artesanales, Heladerías y Tiendas de postres',
    previewColor: '#D97706',
    features: ['Insignia de porciones y tamaños', 'Aviso de anticipación de pedido', 'Galería de coberturas y sabores', 'Presentación en cajas de regalo'],
    icon: 'Cake',
  },
  {
    id: 'fashion',
    name: 'Boutique & Lookbook Urbano',
    category: 'Moda y Calzado',
    description: 'Diseño minimalista estilo revista con gran énfasis en fotografía, selección de tallas, colores y visualización de lookbook.',
    bestFor: 'Tiendas de ropa, Boutiques, Calzado, Joyería, Accesorios y Ópticas',
    previewColor: '#253745',
    features: ['Selector de tallas visual', 'Insignia de temporada y novedades', 'Fotografía en proporción 3:4', 'Etiquetas de materiales y cuidados'],
    icon: 'Sparkles',
  },
  {
    id: 'hardware',
    name: 'Catálogo Industrial & Ferretero',
    category: 'Técnico y Materiales',
    description: 'Estructura técnica de alta densidad con códigos SKU, especificaciones técnicas, unidades de empaque e indicador de stock.',
    bestFor: 'Ferreterías, Materiales de construcción, Repuestos, Tiendas de tecnología y Suministros',
    previewColor: '#0F766E',
    features: ['Fichas técnicas y código SKU', 'Indicador de disponibilidad inmediata', 'Selector de volumen y mayoreo', 'Filtro por especificación'],
    icon: 'Wrench',
  },
  {
    id: 'general',
    name: 'Sitio Web Comercial Multifuncional',
    category: 'Comercio General',
    description: 'Plantilla versátil y moderna que se adapta a cualquier tipo de negocio, servicio profesional o catálogo corporativo.',
    bestFor: 'Supermercados, Salones de belleza, Barberías, Veterinarias y Servicios profesionales',
    previewColor: '#253745',
    features: ['Banner de bienvenida modular', 'Sección de servicios y tarifas', 'Galería de fotos y testimonios', 'Geolocalización y horarios'],
    icon: 'Store',
  },
];
