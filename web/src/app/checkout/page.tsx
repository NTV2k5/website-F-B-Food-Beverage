'use client';

import { useCartStore } from '@/store/cart-store';
import { formatPrice } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, CreditCard, MapPin, Phone, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  phone: z.string().min(10, 'Số điện thoại không hợp lệ').max(15, 'Số điện thoại không hợp lệ'),
  address: z.string().min(10, 'Địa chỉ phải có ít nhất 10 ký tự'),
  note: z.string().optional(),
  paymentMethod: z.enum(['SEPAY', 'COD'], { required_error: 'Vui lòng chọn phương thức thanh toán' }),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: 'SEPAY',
    },
  });

  const shippingFee = 15000;
  const total = subtotal + shippingFee;

  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  const onSubmit = async (data: CheckoutFormData) => {
    console.log('Checkout data:', data);
    // In a real app, we'd call the API here
    clearCart();
    router.push('/checkout/success');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-zinc-500 hover:text-zinc-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại giỏ hàng
      </button>

      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-zinc-900">
        Thanh toán
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Info */}
          <div className="rounded-2xl border border-zinc-100 bg-white p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900">
              <MapPin className="h-5 w-5 text-orange-500" />
              Thông tin giao hàng
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  <User className="inline h-4 w-4 mr-1" />
                  Họ và tên
                </label>
                <input
                  {...register('fullName')}
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none"
                  placeholder="Nguyễn Văn A"
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500 mt-1">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Số điện thoại
                </label>
                <input
                  {...register('phone')}
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none"
                  placeholder="0901234567"
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Địa chỉ giao hàng
                </label>
                <textarea
                  {...register('address')}
                  rows={3}
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none resize-none"
                  placeholder="123 Đường ABC, Phường XYZ, Quận 1, TP.HCM"
                />
                {errors.address && (
                  <p className="text-sm text-red-500 mt-1">{errors.address.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Ghi chú cho cửa hàng (tùy chọn)
                </label>
                <textarea
                  {...register('note')}
                  rows={2}
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none resize-none"
                  placeholder="Ghi chú đặc biệt..."
                />
              </div>

              {/* Payment Method */}
              <div className="mt-6">
                <h3 className="flex items-center gap-2 text-lg font-bold text-zinc-900 mb-4">
                  <CreditCard className="h-5 w-5 text-orange-500" />
                  Phương thức thanh toán
                </h3>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 rounded-xl border-2 border-zinc-100 p-4 cursor-pointer hover:border-orange-200 transition-all">
                    <input
                      type="radio"
                      {...register('paymentMethod')}
                      value="SEPAY"
                      className="h-5 w-5 accent-orange-500"
                    />
                    <div>
                      <p className="font-semibold text-zinc-900">VietQR (SePay)</p>
                      <p className="text-sm text-zinc-500">Quét mã QR chuyển khoản nhanh chóng</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 rounded-xl border-2 border-zinc-100 p-4 cursor-pointer hover:border-orange-200 transition-all">
                    <input
                      type="radio"
                      {...register('paymentMethod')}
                      value="COD"
                      className="h-5 w-5 accent-orange-500"
                    />
                    <div>
                      <p className="font-semibold text-zinc-900">Thanh toán khi nhận hàng</p>
                      <p className="text-sm text-zinc-500">Trả tiền mặt cho shipper</p>
                    </div>
                  </label>
                </div>
                {errors.paymentMethod && (
                  <p className="text-sm text-red-500 mt-2">{errors.paymentMethod.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full py-6 text-lg mt-6">
                Đặt hàng
              </Button>
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-zinc-100 bg-white p-6">
            <h3 className="text-lg font-bold text-zinc-900">Tóm tắt đơn hàng</h3>
            <div className="mt-4 max-h-64 overflow-y-auto space-y-4">
              {items.map((item) => {
                const optionsPrice = item.selectedOptions.reduce((sum, opt) => sum + opt.extraPrice, 0);
                const itemTotal = (item.basePrice + optionsPrice) * item.quantity;
                
                return (
                  <div key={item.id} className="flex gap-3">
                    <div className="h-14 w-14 shrink-0 rounded-lg bg-zinc-100 overflow-hidden">
                      {item.productImage ? (
                        <img src={item.productImage} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-zinc-300">No img</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-zinc-900 truncate">{item.productName}</p>
                      <p className="text-sm text-zinc-500">x{item.quantity}</p>
                    </div>
                    <p className="font-semibold text-zinc-900">{formatPrice(itemTotal)}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 space-y-3 pt-4 border-t border-zinc-100">
              <div className="flex justify-between text-zinc-600">
                <span>Tạm tính</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Phí vận chuyển</span>
                <span>{formatPrice(shippingFee)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-zinc-900 pt-3 border-t border-zinc-100">
                <span>Tổng cộng</span>
                <span className="text-orange-500">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
