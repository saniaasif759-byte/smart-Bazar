import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Package, MapPin, Phone, CreditCard, RefreshCw, ShoppingBag } from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  emoji: string;
}

interface Order {
  id: string;
  customer_email: string;
  address: string;
  phone: string;
  items: OrderItem[] | string; // might be jsonb or stringified json
  total_amount: number;
  payment_method: string;
  status: string;
  created_at: string;
}

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  loading: boolean;
  onRefresh: () => void;
}

export default function OrderHistoryModal({
  isOpen,
  onClose,
  orders,
  loading,
  onRefresh
}: OrderHistoryModalProps) {
  
  const parseItems = (items: any): OrderItem[] => {
    if (!items) return [];
    if (typeof items === 'string') {
      try {
        return JSON.parse(items);
      } catch (e) {
        return [];
      }
    }
    if (Array.isArray(items)) {
      return items;
    }
    return [];
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2.5 rounded-2xl">
              <Package className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Your Order History</h2>
              <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                Fetched live from Supabase
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={loading}
              title="Refresh Orders"
              className="p-2 hover:bg-gray-100 text-gray-500 hover:text-emerald-600 rounded-full transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Orders List Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
          {loading && orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-sm font-bold text-gray-500">Fetching user data from Supabase...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[2rem] border border-dashed border-gray-200 p-8">
              <div className="text-4xl mb-3">🛒</div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No Orders Found</h3>
              <p className="text-gray-400 text-sm font-medium max-w-sm mx-auto">
                You haven't placed any orders yet. Put some items in your list and place an order to see it here!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const itemsList = parseItems(order.items);
                return (
                  <motion.div
                    key={order.id}
                    layout
                    className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all space-y-4"
                  >
                    {/* Top Row: Date, ID, Status */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-gray-50">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        <span>{formatDate(order.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-gray-400">ID: {order.id.slice(0, 8)}...</span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          order.status === 'completed' || order.status === 'delivered'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {order.status || 'pending'}
                        </span>
                      </div>
                    </div>

                    {/* Middle Row: Items Grid */}
                    <div className="space-y-2.5">
                      {itemsList.map((item, idx) => (
                        <div key={item.id || idx} className="flex items-center justify-between text-sm font-semibold text-gray-800">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{item.emoji || '📦'}</span>
                            <span className="text-gray-900">{item.name}</span>
                            <span className="text-xs text-gray-400 font-bold">x{item.quantity}</span>
                          </div>
                          <span className="text-gray-900 font-bold">Rs. {item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Bottom Row: Delivery details and Total */}
                    <div className="pt-3 border-t border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs font-semibold text-gray-500">
                      <div className="space-y-1 max-w-sm">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-gray-700 truncate">{order.address}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-gray-700">{order.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-gray-700 truncate">{order.payment_method}</span>
                        </div>
                      </div>

                      <div className="text-right self-end sm:self-auto bg-emerald-50/50 border border-emerald-100/30 px-4 py-2.5 rounded-2xl">
                        <span className="block text-[10px] text-emerald-800 uppercase font-extrabold tracking-wider mb-0.5">Total Amount</span>
                        <span className="text-lg font-black text-emerald-950">Rs. {order.total_amount || itemsList.reduce((sum, item) => sum + (item.price * item.quantity), 0)}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end gap-3 rounded-b-[2.5rem]">
          <button
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold text-xs transition-all shadow-lg shadow-emerald-200 active:scale-95"
          >
            Close History
          </button>
        </div>
      </motion.div>
    </div>
  );
}
