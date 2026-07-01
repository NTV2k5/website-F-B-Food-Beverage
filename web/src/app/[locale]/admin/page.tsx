'use client';

import { useEffect, useState } from 'react';
import { formatPrice } from '@/lib/utils';
import { Bell, Package, TrendingUp, Users, CheckCircle, Truck, ClipboardList, ShoppingCart, Volume2, Power, Award, BarChart3, Settings, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/utils';
import { io } from 'socket.io-client';
import { Link } from '@/i18n/routing';

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
  const [weeklyRevenue, setWeeklyRevenue] = useState<{ label: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  // Stats
  const [stats, setStats] = useState({
    todayOrdersCount: 0,
    todayRevenue: 0,
    totalProducts: 0,
    activeShippers: 0,
  });

  const fetchData = async () => {
    try {
      const ordersRes = await fetch(`${API_URL}/orders/admin`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const ordersData = await ordersRes.json();

      const productsRes = await fetch(`${API_URL}/products?limit=100`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const productsData = await productsRes.json();

      const revenueRes = await fetch(`${API_URL}/orders/admin/analytics/revenue`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const revenueData = await revenueRes.json();

      if (ordersRes.ok && productsRes.ok) {
        setOrders(ordersData);
        setProducts(productsData.items);
        if (revenueRes.ok) {
          setWeeklyRevenue(revenueData);
        }

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
          activeShippers: 2,
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

  const exportRevenueReport = () => {
    if (orders.length === 0) {
      alert('Không có dữ liệu đơn hàng để xuất báo cáo.');
      return;
    }

    let csvContent = '\uFEFF';
    csvContent += 'Mã đơn hàng,Khách hàng,Số điện thoại,Ngày đặt,Phương thức thanh toán,Trạng thái thanh toán,Trạng thái đơn hàng,Số lượng món,Tạm tính (đ),Giảm giá (đ),Phí ship (đ),Tổng cộng (đ)\n';

    orders.forEach((order) => {
      const orderNumber = order.orderNumber || '';
      const customerName = order.user?.fullName?.replace(/,/g, '') || '';
      const phone = order.user?.phone || '';
      const date = new Date(order.createdAt).toLocaleString('vi-VN');
      const payMethod = order.paymentMethod || '';
      const payStatus = order.paymentStatus || '';
      const orderStatus = statusLabels[order.status] || order.status || '';
      const itemsCount = order.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
      const subtotal = parseFloat(order.subtotal || 0);
      const discount = parseFloat(order.discountAmount || 0);
      const shipping = parseFloat(order.shippingFee || 0);
      const total = parseFloat(order.totalAmount || 0);

      csvContent += `${orderNumber},${customerName},${phone},${date},${payMethod},${payStatus},${orderStatus},${itemsCount},${subtotal},${discount},${shipping},${total}\n`;
    });

    const totalSubtotal = orders.reduce((sum, o) => sum + parseFloat(o.subtotal || 0), 0);
    const totalDiscount = orders.reduce((sum, o) => sum + parseFloat(o.discountAmount || 0), 0);
    const totalShipping = orders.reduce((sum, o) => sum + parseFloat(o.shippingFee || 0), 0);
    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0);
    csvContent += `TỔNG CỘNG,,,,,,,,${totalSubtotal},${totalDiscount},${totalShipping},${totalRevenue}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Bao_cao_doanh_thu_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  // Synthesized Web Audio API Beep
  const playNotificationSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      gain1.gain.setValueAtTime(0.3, audioCtx.currentTime);
      osc1.start();
      osc1.stop(audioCtx.currentTime + 0.15);

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
      console.error('Audio beep failed:', err);
    }
  };

  // Live WebSocket Orders Listener
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return;

    const socket = io(API_URL.replace('/api/v1', ''), {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('⚡ Admin WebSocket connection active');
    });

    socket.on('newOrder', (newOrder: any) => {
      playNotificationSound();
      setOrders((prev) => [newOrder, ...prev]);
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
        body: JSON.stringify({ status, note: `Cập nhật trạng thái bởi quản trị viên` }),
      });

      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: updated.status } : o)),
        );
        fetchData();
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
      console.error('Failed availability switch:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  // Draw SVG Chart settings
  const chartHeight = 150;
  const maxValue = Math.max(10000, ...weeklyRevenue.map((d) => d.value));


  return (
    <div className="relative min-h-screen bg-gradient-to-b from-amber-500/5 via-transparent to-transparent py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        
        {/* Header Title */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-3xl font-extrabold text-zinc-900 leading-tight">
              Khu Vực Quản Trị
            </h1>
            <p className="text-sm text-zinc-500 mt-1">Hệ thống phân tích, điều phối đơn hàng và catalog F&B</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportRevenueReport}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 text-sm font-semibold text-zinc-700 transition cursor-pointer shadow-sm"
            >
              📥 Xuất báo cáo
            </button>
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
            >
              <Bell className="h-5 w-5 text-zinc-650 animate-pulse" />
            </Button>
          </div>
        </div>


        {/* MODERN NAVIGATION TABS */}
        <div className="mt-6 flex flex-wrap gap-2 border-b border-zinc-150 pb-3">
          <Link href="/admin">
            <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-500/20">
              <BarChart3 className="h-4 w-4" />
              Tổng quan
            </span>
          </Link>
          <Link href="/admin/products">
            <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-zinc-250 bg-white/50 text-zinc-700 font-semibold text-xs hover:bg-zinc-50 transition">
              <Package className="h-4 w-4 text-zinc-400" />
              Quản lý món ăn (CRUD)
            </span>
          </Link>
          <Link href="/admin/vouchers">
            <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-zinc-250 bg-white/50 text-zinc-700 font-semibold text-xs hover:bg-zinc-50 transition">
              <Award className="h-4 w-4 text-zinc-400" />
              Quản lý Vouchers
            </span>
          </Link>
          <Link href="/admin/users">
            <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-zinc-250 bg-white/50 text-zinc-700 font-semibold text-xs hover:bg-zinc-50 transition">
              <Users className="h-4 w-4 text-zinc-400" />
              Phân quyền tài khoản
            </span>
          </Link>
          <Link href="/admin/reviews">
            <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-zinc-250 bg-white/50 text-zinc-700 font-semibold text-xs hover:bg-zinc-50 transition">
              <CheckCircle className="h-4 w-4 text-zinc-400" />
              Quản lý Đánh giá
            </span>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                <p className="text-xs text-zinc-400 font-semibold">SHIPPERS ONLINE</p>
                <p className="text-2xl font-black text-zinc-900 mt-0.5">{stats.activeShippers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN BODY GRID: Chart on top, Orders and quick stock below */}
        <div className="mt-6 space-y-6">
          
          {/* Advanced Revenue Chart (SVG-based) */}
          <div className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-lg backdrop-blur-md">
            <h2 className="text-lg font-bold text-zinc-900 border-b border-zinc-150 pb-3 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-500" />
              Xu hướng doanh thu tuần này (Advanced Analytics)
            </h2>
            <div className="mt-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
              {/* SVG Drawing */}
              <div className="flex-1 min-h-[180px] flex items-end justify-between px-4 relative">
                {/* Horizontal grid lines */}
                <div className="absolute inset-x-0 bottom-[50px] border-b border-dashed border-zinc-100" />
                <div className="absolute inset-x-0 bottom-[100px] border-b border-dashed border-zinc-100" />
                <div className="absolute inset-x-0 bottom-[150px] border-b border-dashed border-zinc-100" />

                {weeklyRevenue.map((d, index) => {
                  const barHeight = (d.value / maxValue) * chartHeight;
                  const isHovered = hoveredBar === index;
                  return (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center gap-2 relative group z-10"
                      onMouseEnter={() => setHoveredBar(index)}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      {/* Tooltip on Hover */}
                      {isHovered && (
                        <div className="absolute bottom-[calc(100%+10px)] bg-zinc-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap animate-bounce">
                          {formatPrice(d.value)}
                        </div>
                      )}
                      
                      {/* Bar Column */}
                      <div
                        className={`w-10 sm:w-12 rounded-t-xl transition-all duration-300
                          ${
                            isHovered
                              ? 'bg-gradient-to-t from-orange-600 to-amber-500 shadow-lg shadow-orange-500/25 scale-x-105'
                              : 'bg-gradient-to-t from-orange-400 to-amber-300'
                          }
                        `}
                        style={{ height: `${barHeight}px` }}
                      />
                      <span className="text-[10px] text-zinc-400 font-bold">{d.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Chart Info panel */}
              <div className="w-full md:w-64 bg-orange-50/60 border border-orange-100 rounded-2xl p-4 text-xs space-y-2.5">
                <p className="font-bold text-orange-850">Ghi chú doanh số:</p>
                <p className="text-zinc-600 leading-relaxed">
                  Doanh số cao nhất trong 7 ngày qua đạt mức **{formatPrice(Math.max(...weeklyRevenue.map(d => d.value), 0))}**.
                </p>
                <div className="flex justify-between items-center border-t border-orange-100 pt-2 font-bold text-orange-850">
                  <span>Trung bình ngày:</span>
                  <span>{formatPrice(Math.round(weeklyRevenue.reduce((sum, d) => sum + d.value, 0) / Math.max(1, weeklyRevenue.length)))}</span>
                </div>
              </div>

            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            
            {/* Real-time Order Monitor */}
            <div className="lg:col-span-2">
              <div className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-lg backdrop-blur-md">
                <h2 className="text-lg font-bold text-zinc-900 border-b border-zinc-150 pb-3 flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-orange-500" />
                  Đơn hàng hôm nay (Real-time monitor)
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
    </div>
  );
}
