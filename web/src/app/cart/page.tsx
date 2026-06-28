'use client';

import { useCartStore } from '@/store/cart-store';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CartPage() {
  const { items, removeItem, updateItem, subtotal, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-gradient-to-br from-amber-500/5 via-transparent to-transparent px-4">
        <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-orange-400/10 blur-3xl" />
        <div className="z-10 flex flex-col items-center max-w-md rounded-3xl border border-white/30 bg-white/70 p-12 text-center shadow-2xl backdrop-blur-xl">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-100 text-orange-500 shadow-inner">
            <ShoppingBag className="h-10 w-10 animate-pulse" />
          </div>
          <h2 className="mt-6 text-2xl font-extrabold text-zinc-900">Giỏ hàng trống</h2>
          <p className="mt-2 text-zinc-500 text-sm">
            Hiện chưa có món nào trong giỏ của bạn. Hãy quay lại menu để lựa chọn nhé!
          </p>
          <Link href="/menu" className="mt-6 w-full">
            <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 font-bold text-white rounded-2xl py-6 shadow-lg shadow-orange-500/20">
              Đi đến Menu
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-amber-500/5 via-transparent to-transparent py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-3xl font-extrabold text-zinc-900">
              Giỏ hàng của bạn
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Bạn có {items.reduce((sum, i) => sum + i.quantity, 0)} sản phẩm trong giỏ
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-sm font-semibold text-zinc-400 hover:text-red-500 transition cursor-pointer"
          >
            Xóa tất cả
          </button>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Cart items list */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const optionsPrice = item.selectedOptions.reduce(
                (sum, opt) => sum + opt.extraPrice,
                0,
              );
              const itemTotal = (item.basePrice + optionsPrice) * item.quantity;

              return (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-3xl border border-white/40 bg-white/70 p-4 shadow-lg backdrop-blur-md transition-all hover:border-orange-200"
                >
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-white bg-zinc-150 shadow-sm">
                    {item.productImage ? (
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-zinc-300 text-xs">
                        No img
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-zinc-900 leading-tight">
                          {item.productName}
                        </h3>
                        {item.selectedOptions.length > 0 && (
                          <p className="mt-1 text-xs text-zinc-500 font-medium">
                            {item.selectedOptions
                              .map((opt) => opt.optionName)
                              .join(' · ')}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-zinc-400 hover:text-red-500 transition cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3 bg-zinc-100/80 p-0.5 rounded-full border border-zinc-200">
                        <button
                          onClick={() =>
                            updateItem(item.id, {
                              quantity: Math.max(1, item.quantity - 1),
                            })
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-zinc-600 shadow-sm hover:bg-zinc-50 cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-4 text-center font-bold text-sm text-zinc-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateItem(item.id, { quantity: item.quantity + 1 })
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-zinc-600 shadow-sm hover:bg-zinc-50 cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="font-extrabold text-orange-500 text-lg">
                        {formatPrice(itemTotal)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-3xl border border-white/30 bg-white/70 p-6 shadow-xl backdrop-blur-xl">
              <h3 className="text-lg font-extrabold text-zinc-900">
                Tóm tắt đơn hàng
              </h3>

              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm text-zinc-500 font-medium">
                  <span>Tạm tính</span>
                  <span className="text-zinc-900 font-semibold">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-zinc-500 font-medium">
                  <span>Phí vận chuyển</span>
                  <span className="text-zinc-900 font-semibold">
                    {formatPrice(15000)}
                  </span>
                </div>
                <div className="border-t border-zinc-150 pt-3 flex justify-between text-base font-extrabold text-zinc-900">
                  <span>Tổng thanh toán</span>
                  <span className="text-orange-500 text-xl font-black">
                    {formatPrice(subtotal + 15000)}
                  </span>
                </div>
              </div>

              <Link href="/checkout" className="mt-6 block">
                <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 font-bold text-white rounded-2xl py-6 shadow-lg shadow-orange-500/20 cursor-pointer">
                  Tiến hành thanh toán
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
