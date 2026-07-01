'use client';

import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/store/auth-store';
import { formatPrice } from '@/lib/utils';
import { API_URL } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { ArrowLeft, Clock, MapPin, ShieldAlert, Star, CheckCircle, Package, Truck, Compass, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { io } from 'socket.io-client';

const statusLabels: Record<string, string> = {
  PENDING_PAYMENT: 'Chờ thanh toán',
  CONFIRMED: 'Đã xác nhận',
  PREPARING: 'Đang chuẩn bị',
  READY: 'Đã sẵn sàng',
  DELIVERING: 'Đang giao hàng',
  DELIVERED: 'Đã giao thành công',
  CANCELLED: 'Đã hủy',
};

const steps = [
  { key: 'PENDING_PAYMENT', label: 'Chờ thanh toán', icon: Clock },
  { key: 'CONFIRMED', label: 'Đã nhận', icon: CheckCircle },
  { key: 'PREPARING', label: 'Chuẩn bị', icon: Package },
  { key: 'READY', label: 'Sẵn sàng', icon: Check },
  { key: 'DELIVERING', label: 'Đang giao', icon: Truck },
  { key: 'DELIVERED', label: 'Đã nhận đồ', icon: Compass },
];

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const { user, accessToken } = useAuthStore();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Review states
  const [reviewedProduct, setReviewedProduct] = useState<string>('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  // Mock map coordinate for shipper tracking
  const [shipperProgress, setShipperProgress] = useState(0);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`${API_URL}/orders/${params.id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi tải đơn hàng');
      setOrder(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/sign-in');
      return;
    }
    fetchOrder();
  }, [user, params.id]);

  // Real-time tracking with WebSockets
  useEffect(() => {
    if (!params.id) return;
    
    // Connect to WebSocket gateway
    const socket = io(API_URL.replace('/api/v1', ''), {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('🔌 Connected to WebSockets Gateway');
      socket.emit('joinOrderRoom', params.id);
    });

    socket.on('orderStatusChanged', (data: any) => {
      console.log('🔔 Order Status Changed:', data);
      if (data.orderId === params.id) {
        setOrder((prev: any) => prev ? { ...prev, status: data.status } : null);
        fetchOrder(); // Reload full data
      }
    });

    socket.on('paymentReceived', (data: any) => {
      console.log('💵 Payment Received:', data);
      if (data.orderId === params.id) {
        setOrder((prev: any) => prev ? { ...prev, paymentStatus: 'PAID', status: 'CONFIRMED' } : null);
        fetchOrder();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [params.id]);

  // Mock shipper moving on map when status is DELIVERING
  useEffect(() => {
    if (order?.status !== 'DELIVERING') return;

    const interval = setInterval(() => {
      setShipperProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 10;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [order?.status]);

  const printInvoice = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    const itemsHtml = order.items.map((item: any) => {
      const optionsStr = item.selectedOptions && item.selectedOptions.length > 0
        ? `(${item.selectedOptions.map((o: any) => o.optionName).join(', ')})`
        : '';
      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">
            <strong>${item.productName}</strong><br/>
            <small style="color: #666;">${optionsStr}</small>
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatPrice(item.unitPrice)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${formatPrice(item.subtotal || (item.unitPrice * item.quantity))}</td>
        </tr>
      `;
    }).join('');

    const qrCodeHtml = order.paymentMethod === 'SEPAY'
      ? `<div style="text-align: center; margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
          <h4 style="margin: 0 0 10px 0;">MÃ QR THANH TOÁN</h4>
          <img src="${order.paymentInfo?.qrUrl || `https://img.vietqr.io/image/MB-0123456789-compact2.png?amount=${order.totalAmount}&addInfo=${order.orderNumber}`}" style="width: 150px; height: 150px; border: 1px solid #eee; padding: 5px; border-radius: 8px;" />
          <p style="font-size: 11px; color: #666; margin: 5px 0 0 0;">Nội dung CK: <strong>${order.orderNumber}</strong></p>
         </div>`
      : '';

    const htmlContent = `
      <html>
        <head>
          <title>Hoa don #${order.orderNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 30px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h2 { margin: 0; color: #f97316; }
            .header p { margin: 5px 0; font-size: 12px; color: #666; }
            .info-table { width: 100%; margin-bottom: 20px; font-size: 13px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
            .items-table th { background: #f8f9fa; padding: 8px; text-align: left; border-bottom: 2px solid #dee2e6; }
            .totals { float: right; width: 250px; font-size: 13px; margin-top: 10px; }
            .totals table { width: 100%; }
            .totals td { padding: 4px 0; }
            .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 15px; }
            @media print {
              body { margin: 10px; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>F&B SHOP</h2>
            <p>Nước uống & Đồ ăn vặt thơm ngon</p>
            <p>Hotline: 1900 1234 - Địa chỉ: 123 Nguyễn Huệ, Quận 1, TP.HCM</p>
            <h3 style="margin-top: 20px; border-bottom: 2px solid #333; padding-bottom: 5px;">HÓA ĐƠN BÁN HÀNG</h3>
          </div>

          <table class="info-table">
            <tr>
              <td><strong>Mã đơn hàng:</strong> ${order.orderNumber}</td>
              <td style="text-align: right;"><strong>Ngày đặt:</strong> ${new Date(order.createdAt).toLocaleString('vi-VN')}</td>
            </tr>
            <tr>
              <td><strong>Khách hàng:</strong> ${order.user?.fullName || order.fullName || ''}</td>
              <td style="text-align: right;"><strong>Số điện thoại:</strong> ${order.user?.phone || order.phone || ''}</td>
            </tr>
            <tr>
              <td colspan="2"><strong>Địa chỉ:</strong> ${order.deliveryAddress?.fullAddress || order.deliveryAddress || ''}</td>
            </tr>
            <tr>
              <td colspan="2"><strong>Phương thức thanh toán:</strong> ${order.paymentMethod === 'COD' ? 'Thanh toán tiền mặt khi nhận hàng (COD)' : 'Chuyển khoản VietQR'}</td>
            </tr>
            ${order.requestInvoice ? `<tr><td colspan="2" style="color: #f97316; font-weight: bold;">* Khách hàng yêu cầu hóa đơn giấy đi kèm</td></tr>` : ''}
          </table>

          <table class="items-table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th style="text-align: center; width: 60px;">SL</th>
                <th style="text-align: right; width: 100px;">Đơn giá</th>
                <th style="text-align: right; width: 100px;">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="totals">
            <table>
              <tr>
                <td>Tạm tính:</td>
                <td style="text-align: right;">${formatPrice(order.subtotal)}</td>
              </tr>
              <tr>
                <td>Phí giao hàng:</td>
                <td style="text-align: right;">+${formatPrice(order.shippingFee)}</td>
              </tr>
              ${parseFloat(order.discountAmount || 0) > 0 ? `
                <tr style="color: green;">
                  <td>Giảm giá:</td>
                  <td style="text-align: right;">-${formatPrice(order.discountAmount)}</td>
                </tr>
              ` : ''}
              ${parseFloat(order.pointsDiscount || 0) > 0 ? `
                <tr style="color: green;">
                  <td>Dùng điểm tích lũy:</td>
                  <td style="text-align: right;">-${formatPrice(order.pointsDiscount)}</td>
                </tr>
              ` : ''}
              <tr style="font-weight: bold; font-size: 15px; border-top: 1px solid #333;">
                <td style="padding-top: 8px;">Tổng cộng:</td>
                <td style="padding-top: 8px; text-align: right; color: #f97316;">${formatPrice(order.totalAmount)}</td>
              </tr>
            </table>
          </div>

          <div style="clear: both;"></div>

          ${qrCodeHtml}

          <div class="footer">
            <p>Cảm ơn quý khách đã tin tưởng và đặt hàng tại F&B Shop!</p>
            <p>Hẹn gặp lại quý khách!</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };


  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewedProduct) return;
    setReviewLoading(true);
    setReviewSuccess('');

    try {
      const res = await fetch(`${API_URL}/orders/${order.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          productId: reviewedProduct,
          rating,
          comment,
          images: [],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi gửi đánh giá');

      setReviewSuccess('Đã gửi đánh giá của bạn thành công! Cảm ơn bạn.');
      setComment('');
      setReviewedProduct('');
    } catch (err: any) {
      alert(err.message || 'Không thể gửi đánh giá');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="mt-4 text-xl font-bold text-zinc-900">Không tìm thấy đơn hàng</h2>
        <p className="text-zinc-500 mt-2">{error || 'Vui lòng kiểm tra lại đường dẫn'}</p>
        <Button className="mt-6" onClick={() => router.push('/')}>Về trang chủ</Button>
      </div>
    );
  }

  const currentStepIndex = steps.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-amber-500/5 via-transparent to-transparent py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <button
          onClick={() => router.push('/menu')}
          className="mb-6 flex items-center gap-2 text-zinc-500 hover:text-zinc-950 transition font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Tiếp tục đặt món
        </button>

        {/* Main Status Card */}
        <div className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-xl backdrop-blur-xl md:p-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <span className="text-xs text-zinc-400 font-semibold">ĐƠN HÀNG {order.orderNumber}</span>
              <h1 className="mt-1 font-[family-name:var(--font-heading)] text-2xl font-extrabold text-zinc-900">
                Trạng thái: <span className="text-orange-500">{statusLabels[order.status]}</span>
              </h1>
              <p className="text-xs text-zinc-400 mt-1">Đặt lúc: {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <div className="rounded-2xl bg-orange-100/60 px-4 py-2 text-right">
                <span className="block text-xs text-zinc-400 font-semibold">TỔNG THANH TOÁN</span>
                <span className="text-xl font-black text-orange-600">{formatPrice(order.totalAmount)}</span>
              </div>
              <button
                onClick={printInvoice}
                className="mt-1 flex items-center gap-1 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-700 transition cursor-pointer shadow-sm"
              >
                🖨️ In hóa đơn
              </button>
            </div>
          </div>

          {/* Stepper progress */}
          {!isCancelled ? (
            <div className="mt-8 border-t border-zinc-150 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-2">
                {steps.map((step, idx) => {
                  const Icon = step.icon;
                  const isDone = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;

                  return (
                    <div key={step.key} className="flex md:flex-col items-center gap-3 md:gap-2 md:flex-1 text-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500
                          ${
                            isDone
                              ? 'border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                              : 'border-zinc-200 bg-white text-zinc-350'
                          }
                          ${isCurrent ? 'ring-4 ring-orange-500/20' : ''}
                        `}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-left md:text-center">
                        <p className={`text-sm font-semibold ${isDone ? 'text-zinc-900 font-bold' : 'text-zinc-400'}`}>
                          {step.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl bg-red-50 border border-red-100 p-4 flex items-center gap-3">
              <ShieldAlert className="h-6 w-6 text-red-500 shrink-0" />
              <div>
                <p className="font-bold text-red-700">Đơn hàng đã bị hủy</p>
                {order.cancelReason && <p className="text-sm text-red-600 mt-0.5">Lý do: {order.cancelReason}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Real-time map mockup */}
        {order.status === 'DELIVERING' && (
          <div className="mt-6 rounded-3xl border border-white/40 bg-white/70 p-6 shadow-xl backdrop-blur-xl">
            <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-1.5">
              <Truck className="h-5 w-5 text-orange-500 animate-bounce" />
              Bản đồ hành trình giao hàng (Real Map Tracking)
            </h3>
            <div className="relative h-72 w-full overflow-hidden rounded-2xl border border-zinc-200 shadow-inner bg-zinc-50">
              <iframe
                src={`https://maps.google.com/maps?q=${order.deliveryLat || 10.762622},${order.deliveryLng || 106.660172}&z=16&output=embed`}
                className="w-full h-full border-0 rounded-2xl"
                allowFullScreen
                loading="lazy"
              />
            </div>
            {order.shipper && (
              <div className="mt-4 flex items-center justify-between rounded-xl bg-zinc-50 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 text-zinc-600 font-bold">
                    {order.shipper.fullName.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-800 text-sm">{order.shipper.fullName}</p>
                    <p className="text-xs text-zinc-400">Đang giao hàng cho bạn</p>
                  </div>
                </div>
                <a 
                  href={`tel:${order.shipper.phone}`}
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50"
                >
                  Gọi shipper: {order.shipper.phone}
                </a>
              </div>
            )}
          </div>
        )}

        {/* VietQR Code Payment Box if pending payment */}
        {order.status === 'PENDING_PAYMENT' && order.paymentMethod === 'SEPAY' && (
          <div className="mt-6 rounded-3xl border border-white/40 bg-white/70 p-6 shadow-xl backdrop-blur-xl text-center">
            <h3 className="font-bold text-zinc-900">Vui lòng quét mã để thanh toán</h3>
            <div className="relative mx-auto mt-4 h-48 w-48 overflow-hidden rounded-2xl border-2 border-zinc-100 bg-white p-2 flex items-center justify-center">
              <img
                src={order.paymentInfo?.qrUrl || `https://img.vietqr.io/image/MB-0123456789-compact2.png?amount=${order.totalAmount}&addInfo=${order.orderNumber}`}
                alt="VietQR Code"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="mt-4 text-xs text-zinc-500 space-y-1">
              <p>Chủ tài khoản: <span className="font-bold text-zinc-800">FB SHOP</span></p>
              <p>Nội dung chuyển khoản: <span className="font-mono font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">{order.orderNumber}</span></p>
            </div>
          </div>
        )}

        {/* Review Form when Delivered */}
        {order.status === 'DELIVERED' && (
          <div className="mt-6 rounded-3xl border border-white/40 bg-white/70 p-6 shadow-xl backdrop-blur-xl">
            <h3 className="font-bold text-zinc-900 mb-2 flex items-center gap-1.5">
              <Star className="h-5 w-5 text-amber-500 fill-current" />
              Đánh giá món ăn của bạn
            </h3>
            <p className="text-xs text-zinc-500">Món ăn của bạn đã được giao thành công. Hãy chia sẻ cảm nhận nhé!</p>

            {reviewSuccess ? (
              <div className="mt-4 rounded-2xl bg-green-50 border border-green-100 p-4 text-center text-sm font-semibold text-green-600">
                {reviewSuccess}
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1">Chọn món ăn đánh giá</label>
                  <select
                    value={reviewedProduct}
                    onChange={(e) => setReviewedProduct(e.target.value)}
                    required
                    className="w-full rounded-xl border border-zinc-200 bg-white/50 px-3 py-2 text-sm outline-none focus:border-orange-500"
                  >
                    <option value="">-- Chọn món ăn --</option>
                    {order.items.map((item: any) => (
                      <option key={item.id} value={item.productId}>
                        {item.productName} (x{item.quantity})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1">Số sao</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="cursor-pointer"
                      >
                        <Star 
                          className={`h-7 w-7 ${
                            star <= rating ? 'text-amber-500 fill-current' : 'text-zinc-200'
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1">Nhận xét</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    placeholder="Món ăn/nước uống thế nào? Bạn có vừa lòng không?"
                    className="w-full rounded-xl border border-zinc-200 bg-white/50 px-4 py-3 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 outline-none text-sm resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={reviewLoading || !reviewedProduct}
                  className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold px-6"
                >
                  Gửi đánh giá
                </Button>
              </form>
            )}
          </div>
        )}

        {/* Order Details & Summary List */}
        <div className="mt-6 rounded-3xl border border-white/40 bg-white/70 p-6 shadow-xl backdrop-blur-xl">
          <h3 className="font-bold text-zinc-900 border-b border-zinc-150 pb-3">Chi tiết sản phẩm đã đặt</h3>
          <div className="mt-4 space-y-4">
            {order.items.map((item: any) => {
              const options = typeof item.selectedOptions === 'string' ? JSON.parse(item.selectedOptions) : item.selectedOptions;
              return (
                <div key={item.id} className="flex gap-4">
                  <div className="relative h-16 w-16 shrink-0 rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-100 shadow-sm">
                    {item.product?.image ? (
                      <img src={item.product.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-zinc-300 text-xs">No image</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-zinc-900 text-sm">{item.productName}</p>
                    {options && options.length > 0 && (
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {options.map((o: any) => o.optionName).join(' · ')}
                      </p>
                    )}
                    <p className="text-xs text-zinc-400 mt-0.5">Số lượng: x{item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-zinc-900 text-sm">{formatPrice(item.subtotal)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 border-t border-zinc-150 pt-4 space-y-2.5 text-xs text-zinc-500">
            <div className="flex justify-between">
              <span>Tạm tính:</span>
              <span className="font-bold text-zinc-900">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Phí giao hàng:</span>
              <span className="font-bold text-zinc-900">{formatPrice(order.shippingFee)}</span>
            </div>
            {parseFloat(order.discountAmount) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Voucher giảm giá:</span>
                <span className="font-bold">-{formatPrice(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-extrabold text-zinc-900 border-t border-zinc-150 pt-2.5">
              <span>Tổng thanh toán:</span>
              <span className="text-orange-500 text-base font-black">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
