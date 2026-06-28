'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { formatPrice } from '@/lib/utils';
import { API_URL } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Truck, MapPin, CheckCircle, Navigation, Phone, ShieldAlert, ShoppingBag, Loader2 } from 'lucide-react';

export default function ShipperDashboardPage() {
  const router = useRouter();
  const { user, accessToken } = useAuthStore();

  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      // 1. Fetch available orders for shippers
      const availableRes = await fetch(`${API_URL}/orders/shipper/available`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const availableData = await availableRes.json();

      // 2. Fetch active claimed orders
      const activeRes = await fetch(`${API_URL}/orders/shipper/active`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const activeData = await activeRes.json();

      if (availableRes.ok) {
        setAvailableOrders(availableData);
      }
      if (activeRes.ok) {
        setActiveOrders(activeData);
      }
    } catch (err) {
      console.error('Error fetching shipper orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'SHIPPER') {
      router.push('/sign-in');
      return;
    }
    fetchOrders();
  }, [user]);

  const claimOrder = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/claim`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (res.ok) {
        await fetchOrders();
      } else {
        const errData = await res.json();
        alert(errData.message || 'Không thể nhận đơn hàng này');
      }
    } catch (err) {
      console.error('Error claiming order:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const completeOrder = async (orderId: string, status: string) => {
    setActionLoading(orderId);
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          status,
          note: status === 'DELIVERED' ? 'Đã giao hàng thành công' : 'Không thể liên lạc, hủy đơn',
        }),
      });

      if (res.ok) {
        await fetchOrders();
      } else {
        const errData = await res.json();
        alert(errData.message || 'Lỗi cập nhật trạng thái');
      }
    } catch (err) {
      console.error('Error completing order:', err);
    } finally {
      setActionLoading(null);
    }
  };

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
        <div className="flex items-center gap-3 border-b border-zinc-150 pb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/25">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-3xl font-extrabold text-zinc-900 leading-tight">
              Khu vực Shipper
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Shipper: <span className="font-bold text-zinc-800">{user?.fullName}</span> (SĐT: {user?.phone})
            </p>
          </div>
        </div>

        {/* Section 1: Active claimed orders */}
        <div className="mt-8">
          <h2 className="text-xl font-extrabold text-zinc-900 flex items-center gap-2">
            <Navigation className="h-5 w-5 text-orange-500 animate-pulse" />
            Đơn hàng đang giao ({activeOrders.length})
          </h2>

          <div className="mt-4 space-y-4">
            {activeOrders.length > 0 ? (
              activeOrders.map((order) => {
                const address = typeof order.deliveryAddress === 'string' ? JSON.parse(order.deliveryAddress) : order.deliveryAddress;
                return (
                  <div
                    key={order.id}
                    className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-lg backdrop-blur-md"
                  >
                    <div className="flex justify-between items-start border-b border-zinc-100 pb-3">
                      <div>
                        <span className="text-xs text-zinc-400 font-semibold">ĐƠN HÀNG {order.orderNumber}</span>
                        <p className="font-bold text-zinc-900 text-sm mt-0.5">Khách: {order.user.fullName}</p>
                      </div>
                      <span className="font-extrabold text-orange-600 text-lg">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-zinc-600">
                      <p className="flex items-start gap-2">
                        <MapPin className="h-4.5 w-4.5 text-zinc-400 shrink-0 mt-0.5" />
                        <span>{address?.fullAddress || order.deliveryAddress}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="h-4.5 w-4.5 text-zinc-400 shrink-0" />
                        <a href={`tel:${order.user.phone}`} className="text-orange-500 font-semibold hover:underline">
                          {order.user.phone}
                        </a>
                      </p>
                      {order.note && (
                        <p className="bg-orange-50/50 border border-orange-100 rounded-xl p-2 text-xs text-orange-600">
                          Ghi chú: {order.note}
                        </p>
                      )}
                    </div>

                    {/* Order items listing */}
                    <div className="mt-4 border-t border-zinc-100 pt-3">
                      <p className="text-xs font-bold text-zinc-400">CHI TIẾT MÓN:</p>
                      <div className="mt-2 space-y-1">
                        {order.items.map((item: any) => (
                          <p key={item.id} className="text-xs text-zinc-600 font-medium">
                            • {item.productName} <span className="text-zinc-400 font-bold">x{item.quantity}</span>
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <Button
                        onClick={() => completeOrder(order.id, 'DELIVERED')}
                        disabled={actionLoading === order.id}
                        className="flex-1 py-5 bg-green-500 hover:bg-green-600 font-bold text-white rounded-xl shadow-md cursor-pointer"
                      >
                        {actionLoading === order.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="mr-1.5 h-4 w-4" />
                            Giao thành công
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => completeOrder(order.id, 'CANCELLED')}
                        disabled={actionLoading === order.id}
                        className="py-5 border-red-200 text-red-500 hover:bg-red-50 font-bold rounded-xl cursor-pointer"
                      >
                        Hủy giao
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-zinc-400 italic text-sm mt-2">Bạn không có đơn hàng nào đang giao.</p>
            )}
          </div>
        </div>

        {/* Section 2: Available orders */}
        <div className="mt-8 pt-8 border-t border-zinc-150">
          <h2 className="text-xl font-extrabold text-zinc-900 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-orange-500" />
            Đơn hàng sẵn sàng nhận ({availableOrders.length})
          </h2>

          <div className="mt-4 space-y-4">
            {availableOrders.length > 0 ? (
              availableOrders.map((order) => {
                const address = typeof order.deliveryAddress === 'string' ? JSON.parse(order.deliveryAddress) : order.deliveryAddress;
                return (
                  <div
                    key={order.id}
                    className="rounded-3xl border border-zinc-100 bg-white/60 p-5 shadow-md hover:border-orange-200 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-zinc-400 font-bold">ĐƠN HÀNG {order.orderNumber}</span>
                        <p className="font-bold text-zinc-800 text-sm mt-0.5">Khách hàng: {order.user.fullName}</p>
                      </div>
                      <span className="font-extrabold text-orange-500 text-base">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>

                    <div className="mt-3 text-xs text-zinc-500 space-y-1.5">
                      <p className="flex items-start gap-1">
                        <MapPin className="h-4 w-4 shrink-0 text-zinc-400" />
                        <span>{address?.fullAddress || order.deliveryAddress}</span>
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[10px] text-zinc-400">
                        {order.items.length} món · Ship {formatPrice(order.shippingFee)}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => claimOrder(order.id)}
                        disabled={actionLoading === order.id}
                        className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold cursor-pointer"
                      >
                        {actionLoading === order.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          'Nhận giao đơn này'
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-zinc-450 italic text-sm mt-2">Hiện tại không có đơn hàng nào chờ giao.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
