import React from 'react';
import {
  ShoppingBag,
  MessageCircle,
  Clock,
  User,
  Phone,
  MapPin,
  CheckCircle,
  CheckCircle2,
  ExternalLink,
  Flame,
  XCircle,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { useBusiness } from '../../contexts/BusinessContext';
import { Order } from '../../types';

export const OrdersManagerView: React.FC = () => {
  const { orders, activeBusiness, updateOrderStatus, deleteOrder } = useBusiness();
  const [orderToDelete, setOrderToDelete] = React.useState<string | null>(null);
  const [isDeletingOrder, setIsDeletingOrder] = React.useState(false);

  const bizOrders = orders.filter((o) => o.businessId === activeBusiness?.id);
  const currency = activeBusiness?.currency || '$';

  const handleStatusChange = async (orderId: string, status: Order['status']) => {
    if (!activeBusiness) return;
    await updateOrderStatus(orderId, activeBusiness.id, status);
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrderToDelete(orderId);
  };

  const handleConfirmDeleteOrder = async () => {
    if (!activeBusiness || !orderToDelete) return;
    setIsDeletingOrder(true);
    try {
      await deleteOrder(orderToDelete, activeBusiness.id);
      setOrderToDelete(null);
    } finally {
      setIsDeletingOrder(false);
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Completado
          </span>
        );
      case 'contacted':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center gap-1">
            <MessageCircle className="w-3 h-3" /> Contactado
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Cancelado
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pendiente
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">
            Historial de Pedidos de {activeBusiness?.name}
          </h2>
          <p className="text-xs text-sky-200">
            Registro y gestión de pedidos recibidos por WhatsApp y web (sincronizados directamente en Firestore).
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs font-semibold">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Sincronización Firestore Activa</span>
        </div>
      </div>

      {bizOrders.length === 0 ? (
        <div className="p-12 bg-[#16222f] dark:bg-[#111a24] rounded-2xl border border-slate-700/80 text-center space-y-3 shadow-md">
          <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-sky-400 mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base">
            No hay pedidos registrados aún
          </h3>
          <p className="text-xs text-sky-200 max-w-sm mx-auto">
            Cuando los clientes hagan clic en &quot;Realizar pedido por WhatsApp&quot; desde la página pública, se registrarán automáticamente aquí y en Firestore.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bizOrders.map((order) => {
            const cleanPhone = order.customerPhone.replace(/\D/g, '');
            const customerChatUrl = `https://wa.me/${cleanPhone}?text=Hola%20${encodeURIComponent(
              order.customerName
            )},%20te%20contactamos%20de%20${encodeURIComponent(
              activeBusiness?.name || 'la tienda'
            )}%20sobre%20tu%20pedido%20reciente%20(${currency}${order.totalAmount.toFixed(2)}).`;

            return (
              <div
                key={order.id}
                className="bg-[#16222f] dark:bg-[#111a24] rounded-2xl border border-slate-700/80 p-5 shadow-md space-y-4 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white">
                      #{order.id.slice(-6).toUpperCase()}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="flex items-center gap-3 text-sky-300 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      title="Eliminar pedido de Firestore"
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Customer Info */}
                  <div className="space-y-1.5 bg-[#0f1722] p-3.5 rounded-xl border border-slate-700/80">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-sky-400" />
                      <span>{order.customerName}</span>
                    </div>
                    <div className="text-sky-200 font-medium flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-sky-400" />
                      <span>{order.customerPhone}</span>
                    </div>
                    {order.deliveryAddress && (
                      <div className="text-sky-200 font-medium flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span>{order.deliveryAddress}</span>
                      </div>
                    )}
                    {order.notes && (
                      <div className="text-amber-300 font-medium italic pt-1">
                        &quot;{order.notes}&quot;
                      </div>
                    )}
                  </div>

                  {/* Items List */}
                  <div className="space-y-1.5">
                    <div className="font-bold text-white mb-1">
                      Artículos Ordenados:
                    </div>
                    {order.items.map((it, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between text-sky-200 font-medium py-0.5 border-b border-dashed border-slate-700"
                      >
                        <span>
                          {it.quantity}x {it.productName}
                        </span>
                        <span className="font-bold text-white">
                          {currency}{it.subtotal.toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <div className="pt-2 flex justify-between font-extrabold text-sm text-white">
                      <span>Total:</span>
                      <span className="text-emerald-400">
                        {currency}{order.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status action buttons & WhatsApp */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-700/80">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-sky-300 font-bold mr-1">Cambiar Estado:</span>
                    <button
                      onClick={() => handleStatusChange(order.id, 'pending')}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                        order.status === 'pending'
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-sky-200'
                      }`}
                    >
                      Pendiente
                    </button>
                    <button
                      onClick={() => handleStatusChange(order.id, 'contacted')}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                        order.status === 'contacted'
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-sky-200'
                      }`}
                    >
                      Contactado
                    </button>
                    <button
                      onClick={() => handleStatusChange(order.id, 'completed')}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                        order.status === 'completed'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-sky-200'
                      }`}
                    >
                      Completado
                    </button>
                    <button
                      onClick={() => handleStatusChange(order.id, 'cancelled')}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                        order.status === 'cancelled'
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-sky-200'
                      }`}
                    >
                      Cancelado
                    </button>
                  </div>

                  <a
                    href={customerChatUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-sm text-xs cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* In-App Order Delete Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#16222f] border border-rose-500/40 rounded-2xl shadow-2xl p-6 text-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">¿Eliminar pedido?</h3>
                <p className="text-xs text-rose-300 font-mono font-semibold">#{orderToDelete.slice(-6).toUpperCase()}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              ¿Estás seguro de eliminar este pedido? Esta acción lo borrará permanentemente de Firestore y del historial.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                disabled={isDeletingOrder}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteOrder}
                disabled={isDeletingOrder}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-900/40 transition-all"
              >
                {isDeletingOrder ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Sí, Eliminar Pedido</span>
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

