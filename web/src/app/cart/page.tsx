'use client';

import { useCartStore } from '@/store/cart-store';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CartPage() {
  const { items, removeItem, updateItem, subtotal, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-16">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-orange-100 text-orange-500">
          <span className="text-4xl">🛒</span>
        </div>
        <h2 className="mt-6 text-xl font-bold text-zinc-900">Giỏ hàng trống</h2>
        <p className="mt-2 text-zinc-500">Thêm món ăn vào giỏ để đặt hàng nhé!</p>
        <Link href="/menu" className="mt-6">
          <Button>
            Đi đến Menu
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-zinc-900">
          Giỏ hàng
        </h1>
        <button
          onClick={clearCart}
          className="text-sm text-zinc-500 hover:text-red-500 transition"
        >
          Xóa tất cả
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const optionsPrice = item.selectedOptions.reduce((sum, opt) => sum + opt.extraPrice, 0);
            const itemTotal = (item.basePrice + optionsPrice) * item.quantity;

            return (
              <div
                key={item.id}
                className="flex gap-4 rounded-2xl border border-zinc-100 bg-white p-4"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                  {item.productImage ? (
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-300">
                      No img
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-zinc-900">{item.productName}</h3>
                      {item.selectedOptions.length > 0 && (
                        <p className="mt-1 text-sm text-zinc-500">
                          {item.selectedOptions.map((opt) => opt.optionName).join(' · ')}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-zinc-400 hover:text-red-500 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateItem(item.id, { quantity: Math.max(1, item.quantity - 1) })}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-4 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateItem(item.id, { quantity: item.quantity + 1 })}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="font-bold text-orange-500">{formatPrice(itemTotal)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-zinc-100 bg-white p-6">
            <h3 className="text-lg font-bold text-zinc-900">Tóm tắt đơn hàng</h3>
            
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-zinc-600">
                <span>Tạm tính</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Phí vận chuyển</span>
                <span>15.000đ</span>
              </div>
              <div className="border-t border-zinc-100 pt-3 flex justify-between text-lg font-bold text-zinc-900">
                <span>Tổng cộng</span>
                <span>{formatPrice(subtotal + 15000)}</span>
              </div>
            </div>

            <Link href="/checkout" className="mt-6 block">
              <Button className="w-full py-6 text-lg">
                Tiến hành đặt hàng
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
