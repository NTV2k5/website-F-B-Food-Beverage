'use client';

import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { formatPrice } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard, MapPin, Phone, User, Tag, Loader2, Info, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { API_URL } from '@/lib/utils';
import Image from 'next/image';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  phone: z.string().min(10, 'Số điện thoại không hợp lệ').max(15, 'Số điện thoại không hợp lệ'),
  address: z.string().min(10, 'Địa chỉ phải có ít nhất 10 ký tự'),
  note: z.string().optional(),
  paymentMethod: z.enum(['SEPAY', 'COD']),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const { user, accessToken } = useAuthStore();

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [activeCoupon, setActiveCoupon] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Payment QR Modal
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrInfo, setQrInfo] = useState<any>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: 'SEPAY',
    },
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/sign-in?redirect=/checkout');
    } else {
      setValue('fullName', user.fullName);
      if (user.phone) {
        setValue('phone', user.phone);
      }
    }
  }, [user, router, setValue]);

  const shippingFee = 15000;
  
  // Calculate discount
  let discountAmount = 0;
  if (activeCoupon) {
    if (activeCoupon.type === 'PERCENT') {
      discountAmount = subtotal * (parseFloat(activeCoupon.value) / 100);
    } else {
      discountAmount = parseFloat(activeCoupon.value);
    }
  }
  const total = Math.max(0, subtotal + shippingFee - discountAmount);

  if (items.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-zinc-50">
        <div className="text-center">
          <p className="text-zinc-500">Giỏ hàng của bạn đang trống.</p>
          <Button className="mt-4" onClick={() => router.push('/menu')}>
            Đi đến Menu
          </Button>
        </div>
      </div>
    );
  }

  const applyCoupon = async () => {
    if (!couponCode) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await fetch(`${API_URL}/orders/coupon/${couponCode.toUpperCase()}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Mã giảm giá không hợp lệ');
      }

      if (subtotal < parseFloat(data.minOrderAmount)) {
        throw new Error(`Đơn hàng tối thiểu phải từ ${formatPrice(data.minOrderAmount)} để áp dụng mã`);
      }

      setActiveCoupon(data);
    } catch (err: any) {
      setCouponError(err.message || 'Lỗi khi áp dụng mã giảm giá');
      setActiveCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setActiveCoupon(null);
    setCouponCode('');
  };

  const onSubmit = async (data: CheckoutFormData) => {
    setLoading(true);
    setError('');

    try {
      const orderPayload = {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          selectedOptions: item.selectedOptions.map((opt) => ({
            groupId: opt.groupId,
            optionId: opt.optionId,
          })),
          note: item.note,
        })),
        paymentMethod: data.paymentMethod,
        deliveryAddress: {
          label: 'Giao tận nơi',
          fullAddress: data.address,
          lat: 10.762622, // Sample lat/lng of HCMC center
          lng: 106.660172,
        },
        shippingFee,
        couponCode: activeCoupon ? activeCoupon.code : undefined,
        note: data.note,
      };

      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(orderPayload),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Đặt hàng thất bại');
      }

      // Order created successfully
      const { order, paymentInfo } = result;
      setCreatedOrderId(order.id);

      if (data.paymentMethod === 'SEPAY' && paymentInfo) {
        setQrInfo(paymentInfo);
        setShowQRModal(true);
        clearCart();
      } else {
        clearCart();
        router.push(`/orders/${order.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tạo đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-amber-500/5 via-transparent to-transparent py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-zinc-500 hover:text-zinc-950 transition font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại giỏ hàng
        </button>

        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-extrabold text-zinc-900">
          Xác nhận thanh toán
        </h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <div className="rounded-2xl bg-red-50 border border-red-100 p-4 text-center text-sm font-semibold text-red-600">
                {error}
              </div>
            )}

            {/* Delivery Info */}
            <div className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-lg backdrop-blur-md">
              <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 border-b border-zinc-100 pb-3">
                <MapPin className="h-5 w-5 text-orange-500" />
                Thông tin giao hàng
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-1">
                      <User className="inline h-4 w-4 mr-1 text-zinc-400" />
                      Họ và tên
                    </label>
                    <input
                      {...register('fullName')}
                      className="w-full rounded-xl border border-zinc-200 bg-white/50 px-4 py-3 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 outline-none transition text-sm"
                      placeholder="Nguyễn Văn A"
                    />
                    {errors.fullName && (
                      <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-1">
                      <Phone className="inline h-4 w-4 mr-1 text-zinc-400" />
                      Số điện thoại
                    </label>
                    <input
                      {...register('phone')}
                      className="w-full rounded-xl border border-zinc-200 bg-white/50 px-4 py-3 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 outline-none transition text-sm"
                      placeholder="0901234567"
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1">
                    <MapPin className="inline h-4 w-4 mr-1 text-zinc-400" />
                    Địa chỉ giao hàng
                  </label>
                  <textarea
                    {...register('address')}
                    rows={3}
                    className="w-full rounded-xl border border-zinc-200 bg-white/50 px-4 py-3 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 outline-none transition text-sm resize-none"
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  />
                  {errors.address && (
                    <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1">
                    Ghi chú đơn hàng (tùy chọn)
                  </label>
                  <textarea
                    {...register('note')}
                    rows={2}
                    className="w-full rounded-xl border border-zinc-200 bg-white/50 px-4 py-3 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 outline-none transition text-sm resize-none"
                    placeholder="Ví dụ: Ít ngọt, shipper gọi trước khi giao,..."
                  />
                </div>

                {/* Payment Method */}
                <div className="mt-6 pt-4 border-t border-zinc-100">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-zinc-900 mb-4">
                    <CreditCard className="h-5 w-5 text-orange-500" />
                    Phương thức thanh toán
                  </h3>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 rounded-2xl border-2 border-zinc-200 bg-white/50 p-4 cursor-pointer hover:border-orange-200 transition-all">
                      <input
                        type="radio"
                        {...register('paymentMethod')}
                        value="SEPAY"
                        className="h-5 w-5 accent-orange-500"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-zinc-900 text-sm">Chuyển khoản VietQR (Tự động xác nhận)</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Quét mã QR qua ứng dụng ngân hàng, xác nhận tức thời sau 10s.</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 rounded-2xl border-2 border-zinc-200 bg-white/50 p-4 cursor-pointer hover:border-orange-200 transition-all">
                      <input
                        type="radio"
                        {...register('paymentMethod')}
                        value="COD"
                        className="h-5 w-5 accent-orange-500"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-zinc-900 text-sm">Thanh toán khi nhận hàng (COD)</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Trả tiền mặt trực tiếp cho shipper khi nhận đồ ăn nước uống.</p>
                      </div>
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 font-bold text-white rounded-2xl py-6 shadow-lg shadow-orange-500/20 cursor-pointer mt-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý đơn hàng...
                    </>
                  ) : (
                    'Đặt hàng ngay'
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* Order Summary & Voucher */}
          <div className="lg:col-span-1 space-y-6">
            {/* Voucher apply card */}
            <div className="rounded-3xl border border-white/30 bg-white/70 p-6 shadow-lg backdrop-blur-xl">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                <Tag className="h-4 w-4 text-orange-500" />
                Mã giảm giá / Voucher
              </h3>
              {activeCoupon ? (
                <div className="mt-3 flex items-center justify-between rounded-xl bg-orange-50 border border-orange-100 p-3">
                  <div className="text-sm">
                    <span className="font-bold text-orange-600">{activeCoupon.code}</span>
                    <span className="text-zinc-500 ml-1.5">
                      (Giảm {activeCoupon.type === 'PERCENT' ? `${activeCoupon.value}%` : formatPrice(activeCoupon.value)})
                    </span>
                  </div>
                  <button onClick={removeCoupon} className="text-zinc-400 hover:text-red-500 cursor-pointer">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="GIAM20, GIAM50K..."
                    className="h-10 flex-1 rounded-xl border border-zinc-200 bg-white/50 px-3 text-sm outline-none transition focus:border-orange-500"
                  />
                  <Button
                    type="button"
                    disabled={couponLoading}
                    onClick={applyCoupon}
                    className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-10 px-4 text-xs font-semibold"
                  >
                    {couponLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Áp dụng'}
                  </Button>
                </div>
              )}
              {couponError && (
                <p className="text-xs text-red-500 mt-2 font-medium">{couponError}</p>
              )}
              <div className="mt-3 text-xs text-zinc-400 flex items-center gap-1">
                <Info className="h-3 w-3 shrink-0" />
                <span>Thử nhập mã <code className="bg-zinc-100 px-1 py-0.5 rounded font-mono">GIAM20</code> hoặc <code className="bg-zinc-100 px-1 py-0.5 rounded font-mono">FBFREE</code></span>
              </div>
            </div>

            {/* Order total card */}
            <div className="rounded-3xl border border-white/30 bg-white/70 p-6 shadow-xl backdrop-blur-xl">
              <h3 className="text-lg font-extrabold text-zinc-900 border-b border-zinc-100 pb-3">
                Tóm tắt thanh toán
              </h3>
              <div className="mt-4 space-y-4 max-h-64 overflow-y-auto pr-1">
                {items.map((item) => {
                  const optionsPrice = item.selectedOptions.reduce((sum, opt) => sum + opt.extraPrice, 0);
                  const itemTotal = (item.basePrice + optionsPrice) * item.quantity;
                  
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative h-12 w-12 shrink-0 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-100">
                        {item.productImage ? (
                          <Image src={item.productImage} alt="" fill className="object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-zinc-300 text-[10px]">No img</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-zinc-900 text-sm truncate">{item.productName}</p>
                        <p className="text-xs text-zinc-500">x{item.quantity}</p>
                      </div>
                      <p className="font-bold text-zinc-900 text-sm">{formatPrice(itemTotal)}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 space-y-3 pt-4 border-t border-zinc-100">
                <div className="flex justify-between text-xs text-zinc-500 font-medium">
                  <span>Tạm tính</span>
                  <span className="text-zinc-900 font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-500 font-medium">
                  <span>Phí vận chuyển</span>
                  <span className="text-zinc-900 font-semibold">{formatPrice(shippingFee)}</span>
                </div>
                {activeCoupon && (
                  <div className="flex justify-between text-xs text-green-600 font-medium">
                    <span>Giảm giá ({activeCoupon.code})</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-extrabold text-zinc-900 pt-3 border-t border-zinc-150">
                  <span>Tổng cộng</span>
                  <span className="text-orange-500 text-xl font-black">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VietQR Payment Modal (Glassmorphism popup) */}
      {showQRModal && qrInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-white/40 bg-white/85 p-6 shadow-2xl backdrop-blur-xl text-center">
            <h3 className="font-[family-name:var(--font-heading)] text-xl font-extrabold text-zinc-900">
              Quét mã VietQR chuyển khoản
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Đơn hàng của bạn đã được khởi tạo. Vui lòng thanh toán để bắt đầu chuẩn bị.
            </p>

            <div className="relative mx-auto mt-6 h-56 w-56 overflow-hidden rounded-2xl border-4 border-white bg-white p-2 shadow-md">
              <Image
                src={qrInfo.qrUrl}
                alt="VietQR Code"
                fill
                className="object-contain"
                unoptimized
              />
            </div>

            <div className="mt-6 rounded-2xl bg-orange-50/60 border border-orange-100/50 p-4 text-left space-y-2.5 text-xs text-zinc-700">
              <div className="flex justify-between">
                <span className="text-zinc-400 font-medium">Ngân hàng:</span>
                <span className="font-bold text-zinc-900">MB Bank (Mã: {qrInfo.bankCode})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400 font-medium">Số tài khoản:</span>
                <span className="font-bold text-zinc-900 select-all">{qrInfo.accountNo || '0123456789'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400 font-medium">Chủ tài khoản:</span>
                <span className="font-bold text-zinc-900">FB SHOP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400 font-medium">Số tiền chuyển:</span>
                <span className="font-extrabold text-orange-600 text-sm select-all">{formatPrice(qrInfo.amount)}</span>
              </div>
              <div className="flex justify-between border-t border-orange-200/30 pt-2.5">
                <span className="text-zinc-400 font-medium">Nội dung chuyển khoản:</span>
                <span className="font-bold text-orange-600 bg-orange-100/60 px-2 py-0.5 rounded select-all font-mono">
                  {qrInfo.transactionCode}
                </span>
              </div>
            </div>

            <div className="mt-4 flex gap-3 text-xs text-zinc-400 items-center justify-center">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-orange-500 animate-ping" />
              <span>Chờ nhận tiền thời gian thực từ SePay Webhook...</span>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push(`/orders/${createdOrderId}`)}
                className="flex-1 py-5 rounded-xl text-zinc-500 font-bold border-zinc-200 hover:bg-zinc-50 cursor-pointer"
              >
                Theo dõi đơn
              </Button>
              <Button
                onClick={() => router.push(`/orders/${createdOrderId}`)}
                className="flex-1 py-5 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-white shadow-md cursor-pointer"
              >
                Tôi đã chuyển khoản
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
