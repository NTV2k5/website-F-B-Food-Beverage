'use client';

import { useEffect, useState } from 'react';
import { formatPrice } from '@/lib/utils';
import { Bell, Package, TrendingUp, Users, CheckCircle, Truck, ClipboardList, ShoppingCart, Volume2, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/utils';
import { io } from 'socket.io-client';

const statusColors: Record<string, string> = {
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
  PREPARING: 'bg-purple-100 text-purple-800 border-purple-200',
  READY: 'bg-teal-100 text-teal-800 border-teal-200',
  DELIVERING: 'bg-orange-100 text-orange-800 border-orange-200',
  DELIVERED: 'bg-green-100 text-green-800 border-green-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
};

const statusLabels: Record<string, string> = {
  PENDING_PAYMENT: 'Chờ thanh toán',
  CONFIRMED: 'Đã nhận',
  PREPARING: 'Chuẩn bị',
  READY: 'Sẵn sàng giao',
  DELIVERING: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, accessToken } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    todayOrdersCount: 0,
    todayRevenue: 0,
    totalProducts: 0,
    activeShippers: 0,
  });

  const fetchData = async () => {
    try {
      // 1. Fetch Orders
      const ordersRes = await fetch(`${API_URL}/orders/admin`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const ordersData = await ordersRes.json();

      // 2. Fetch Products
      const productsRes = await fetch(`${API_URL}/products?limit=100`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const productsData = await productsRes.json();

      if (ordersRes.ok && productsRes.ok) {
        setOrders(ordersData);
        setProducts(productsData.items);

        // Calculate Stats
        const today = new Date().toDateString();
        const todayOrders = ordersData.filter(
          (o: any) => new Date(o.createdAt).toDateString() === today,
        );
        const todayRevenue = todayOrders
          .filter((o: any) => o.paymentStatus === 'PAID')
          .reduce((sum: number, o: any) => sum + parseFloat(o.totalAmount), 0);

        setStats({
          todayOrdersCount: todayOrders.length,
          todayRevenue,
          totalProducts: productsData.meta.total,
          activeShippers: 1, // sample
        });
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/sign-in');
      return;
    }
    fetchData();
  }, [user]);

  // Play synthesized notification sound
  const playNotificationSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Beep 1
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      gain1.gain.setValueAtTime(0.3, audioCtx.currentTime);
      osc1.start();
      osc1.stop(audioCtx.currentTime + 0.15);

      // Beep 2 (higher pitch)
      setTimeout(() => {
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        gain2.gain.setValueAtTime(0.3, audioCtx.currentTime);
        osc2.start();
        osc2.stop(audioCtx.currentTime + 0.25);
      }, 150);
    } catch (err) {
      console.error('Failed to generate sound:', err);
    }
  };

  // WebSockets Real-time connection
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return;

    const socket = io(API_URL.replace('/api/v1', ''), {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('⚡ Admin connected to Websocket Gateway');
    });

    socket.on('newOrder', (newOrder: any) => {
      console.log('🔔 Admin received new order:', newOrder);
      playNotificationSound();
      setOrders((prev) => [newOrder, ...prev]);
      
      // Update stats counts
      setStats((prev) => ({
        ...prev,
        todayOrdersCount: prev.todayOrdersCount + 1,
      }));
    });

    socket.on('orderStatusChanged', (data: any) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === data.orderId ? { ...o, status: data.status } : o)),
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [user, soundEnabled]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status, note: `Trạng thái cập nhật bởi Admin` }),
      });

      if (res.ok) {
        const updatedOrder = await res.json();
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: updatedOrder.status } : o)),
        );
        fetchData(); // refresh stats
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const toggleProductAvailability = async (productId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`${API_URL}/products/${productId}/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ isAvailable: !currentStatus }),
      });

      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, isAvailable: !currentStatus } : p)),
        );
      }
    } catch (err) {
      console.error('Failed to toggle product availability:', err);
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-3xl font-extrabold text-zinc-900 leading-tight">
              Quản trị cửa hàng
            </h1>
            <p className="text-sm text-zinc-500 mt-1">Hệ thống xử lý đơn hàng và menu thời gian thực</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                playNotificationSound();
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl border text-sm font-semibold transition cursor-pointer
                ${
                  soundEnabled
                    ? 'border-orange-200 bg-orange-50 text-orange-600'
                    : 'border-zinc-200 bg-white text-zinc-400'
                }
              `}
            >
              <Volume2 className="h-4 w-4" />
              <span>Chuông báo: {soundEnabled ? 'Bật' : 'Tắt'}</span>
            </button>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchData}
              className="bg-white/80 border border-zinc-200 shadow-sm rounded-xl hover:bg-zinc-50"
              title="Tải lại dữ liệu"
            >
              <Bell className="h-5 w-5 text-zinc-600 animate-pulse" />
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 shadow-sm">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-zinc-400 font-semibold">ĐƠN HÀNG HÔM NAY</p>
                <p className="text-2xl font-black text-zinc-900 mt-0.5">{stats.todayOrdersCount}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-600 shadow-sm">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-zinc-400 font-semibold">DOANH THU HÔM NAY</p>
                <p className="text-2xl font-black text-green-600 mt-0.5">{formatPrice(stats.todayRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 shadow-sm">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-zinc-400 font-semibold">TỔNG SẢN PHẨM</p>
                <p className="text-2xl font-black text-zinc-900 mt-0.5">{stats.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-600 shadow-sm">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-zinc-400 font-semibold">SHIPPERS HOẠT ĐỘNG</p>
                <p className="text-2xl font-black text-zinc-900 mt-0.5">{stats.activeShippers}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Real-time Order Monitor */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-lg backdrop-blur-md">
              <h2 className="text-lg font-bold text-zinc-900 border-b border-zinc-150 pb-3 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-orange-500" />
                Giám sát đơn hàng thời gian thực
              </h2>

              <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-100 bg-white/50">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-zinc-100/50">
                      <tr>
                        <th className="px-4 py-3 text-left font-bold text-zinc-800">Mã đơn</th>
                        <th className="px-4 py-3 text-left font-bold text-zinc-800">Khách hàng</th>
                        <th className="px-4 py-3 text-left font-bold text-zinc-800">Tổng cộng</th>
                        <th className="px-4 py-3 text-left font-bold text-zinc-800">Trạng thái</th>
                        <th className="px-4 py-3 text-center font-bold text-zinc-800">Thao tác xử lý</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {orders.length > 0 ? (
                        orders.map((order) => (
                          <tr key={order.id} className="hover:bg-zinc-50/50">
                            <td className="px-4 py-3 font-semibold text-zinc-900">{order.orderNumber}</td>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-zinc-800">{order.user.fullName}</p>
                              <p className="text-xs text-zinc-400">{order.user.phone}</p>
                            </td>
                            <td className="px-4 py-3 font-bold text-orange-600">
                              {formatPrice(order.totalAmount)}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColors[order.status]}`}>
                                {statusLabels[order.status]}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                {order.status === 'PENDING_PAYMENT' && (
                                  <span className="text-xs text-zinc-400 italic">Chờ chuyển khoản</span>
                                )}
                                {order.status === 'CONFIRMED' && (
                                  <Button
                                    size="sm"
                                    onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs"
                                  >
                                    Chuẩn bị nước
                                  </Button>
                                )}
                                {order.status === 'PREPARING' && (
                                  <Button
                                    size="sm"
                                    onClick={() => updateOrderStatus(order.id, 'READY')}
                                    className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs"
                                  >
                                    Xong & Gọi Ship
                                  </Button>
                                )}
                                {order.status === 'READY' && (
                                  <span className="text-xs text-teal-600 font-bold">Chờ shipper lấy đơn</span>
                                )}
                                {order.status === 'DELIVERING' && (
                                  <span className="text-xs text-orange-500 font-bold">Đang đi giao...</span>
                                )}
                                {order.status === 'DELIVERED' && (
                                  <span className="text-xs text-green-600 font-bold">Đã giao thành công</span>
                                )}
                                {order.status === 'CANCELLED' && (
                                  <span className="text-xs text-red-500 italic">Đã hủy</span>
                                )}
                                {['CONFIRMED', 'PREPARING', 'READY'].includes(order.status) && (
                                  <button
                                    onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                                    className="text-xs text-zinc-400 hover:text-red-500 ml-1 cursor-pointer"
                                  >
                                    Hủy
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-12 text-center text-zinc-400 italic">
                            Chưa có đơn hàng nào hôm nay.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Menu Stock Management */}
          <div className="lg:col-span-1">
            <div className="rounded-3xl border border-white/30 bg-white/70 p-6 shadow-lg backdrop-blur-xl">
              <h2 className="text-lg font-bold text-zinc-900 border-b border-zinc-150 pb-3 flex items-center gap-2">
                <Package className="h-5 w-5 text-orange-500" />
                Trạng thái kho món ăn
              </h2>
              <div className="mt-4 space-y-3 max-h-[450px] overflow-y-auto pr-1">
                {products.map((product) => {
                  const basePrice = typeof product.basePrice === 'string' ? parseFloat(product.basePrice) : product.basePrice;
                  return (
                    <div key={product.id} className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-100 bg-white p-3 shadow-sm">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-zinc-100 border border-zinc-150 shadow-sm">
                          {product.image ? (
                            <img src={product.image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-zinc-300 text-[10px]">No img</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-zinc-800 text-xs truncate">{product.name}</p>
                          <p className="text-[10px] text-zinc-400 font-semibold">{formatPrice(basePrice)}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleProductAvailability(product.id, product.isAvailable)}
                        className={`flex h-7 px-3 items-center gap-1 rounded-xl text-[10px] font-bold transition cursor-pointer border
                          ${
                            product.isAvailable
                              ? 'bg-green-50 text-green-600 border-green-200'
                              : 'bg-red-50 text-red-600 border-red-200'
                          }
                        `}
                      >
                        <Power className="h-3 w-3" />
                        <span>{product.isAvailable ? 'Còn hàng' : 'Hết hàng'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
