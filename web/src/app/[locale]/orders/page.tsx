'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/store/auth-store';
import { useTranslations } from 'next-intl';
import { formatPrice } from '@/lib/utils';
import { API_URL } from '@/lib/utils';
import { ArrowLeft, Clock, CheckCircle, Package, Truck, Compass, ShieldAlert, ChevronRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

const statusColors: Record<string, string> = {
  PENDING_PAYMENT: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  CONFIRMED: 'bg-blue-50 border-blue-200 text-blue-800',
  PREPARING: 'bg-purple-50 border-purple-200 text-purple-800',
  READY: 'bg-teal-50 border-teal-200 text-teal-800',
  DELIVERING: 'bg-orange-50 border-orange-200 text-orange-850',
  DELIVERED: 'bg-green-50 border-green-200 text-green-800',
  CANCELLED: 'bg-red-50 border-red-200 text-red-800',
};

const statusLabels: Record<string, string> = {
  PENDING_PAYMENT: 'Chờ thanh toán',
  CONFIRMED: 'Đã xác nhận',
  PREPARING: 'Đang chuẩn bị',
  READY: 'Sẵn sàng giao',
  DELIVERING: 'Đang giao hàng',
  DELIVERED: 'Đã giao thành công',
  CANCELLED: 'Đã hủy',
};

export default function CustomerOrdersPage() {
  const t = useTranslations('orders');
  const tc = useTranslations('common');
  const router = useRouter();
  const { user, accessToken } = useAuthStore();
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        // Sort orders by newest first
        setOrders(data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
    } catch (err) {
      console.error('Error fetching customer orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/sign-in');
      return;
    }
    fetchOrders();
  }, [user]);

  const filteredOrders = filter === 'ALL' 
    ? orders 
    : orders.filter((o) => o.status === filter);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-amber-500/5 via-transparent to-transparent py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        
        {/* Navigation back */}
        <button
          onClick={() => router.push('/profile')}
          className="mb-6 flex items-center gap-2 text-zinc-500 hover:text-zinc-950 transition font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại Hồ sơ
        </button>

        {/* Heading */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-3xl font-extrabold text-zinc-900 leading-tight">
              {t('title')}
            </h1>
            <p className="text-xs text-zinc-400 mt-1">Xem và theo dõi tất cả đơn hàng F&B của bạn</p>
          </div>

          {/* Quick status filter tabs */}
          <div className="flex flex-wrap gap-1.5 bg-zinc-100 p-1 rounded-2xl border border-zinc-200">
            {[
              { key: 'ALL', label: 'Tất cả' },
              { key: 'PENDING_PAYMENT', label: 'Chờ thanh toán' },
              { key: 'DELIVERING', label: 'Đang giao' },
              { key: 'DELIVERED', label: 'Đã nhận' },
              { key: 'CANCELLED', label: 'Đã hủy' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer
                  ${filter === tab.key 
                    ? 'bg-white text-zinc-900 shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-900'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Listing */}
        <div className="space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => {
              const formattedDate = new Date(order.createdAt).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={order.id}
                  className="rounded-3xl border border-white/40 bg-white/70 p-5 shadow-lg backdrop-blur-xl hover:shadow-xl transition"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-orange-500">{order.orderNumber}</span>
                        <span className="text-zinc-300">•</span>
                        <span className="text-xs text-zinc-400 font-medium">{formattedDate}</span>
                      </div>
                      
                      {/* Products preview */}
                      <p className="mt-2 text-xs font-bold text-zinc-800">
                        {order.items.map((i: any) => `${i.productName} (x${i.quantity})`).join(', ')}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                      <div className="text-right">
                        <span className="block text-[10px] text-zinc-400 font-semibold">TỔNG TIỀN</span>
                        <span className="text-sm font-black text-zinc-900">{formatPrice(order.totalAmount)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 text-xs">
                    <span className="text-zinc-450">
                      Giao đến: <span className="font-semibold text-zinc-700 truncate max-w-[200px] inline-block align-bottom">
                        {typeof order.deliveryAddress === 'string' 
                          ? JSON.parse(order.deliveryAddress).fullAddress 
                          : (order.deliveryAddress?.fullAddress || order.deliveryAddress?.label || '')}
                      </span>
                    </span>
                    <Button
                      size="sm"
                      onClick={() => router.push(`/orders/${order.id}`)}
                      className="bg-zinc-900 hover:bg-orange-600 text-white rounded-xl font-bold py-4 text-[10px] cursor-pointer"
                    >
                      {t('tracking')}
                      <ChevronRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center rounded-3xl border border-white/40 bg-white/70 p-12 shadow-xl backdrop-blur-xl">
              <ShoppingBag className="mx-auto h-12 w-12 text-zinc-300" />
              <p className="text-zinc-450 italic mt-4">{t('noOrders')}</p>
              <Button
                onClick={() => router.push('/menu')}
                className="mt-6 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold px-6"
              >
                Đặt đồ ngay
              </Button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
