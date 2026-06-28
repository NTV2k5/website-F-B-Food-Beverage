'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart-store';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import { ArrowLeft, Plus, Minus, Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getProductBySlug } from '@/lib/api';
import { useEffect, useState } from 'react';
import type { Product } from '@/types';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!params.slug) return;
      setLoading(true);
      try {
        const found = await getProductBySlug(params.slug as string);
        if (found) {
          setProduct(found);

          // Initialize default option values
          const defaults: Record<string, string[]> = {};
          found.optionGroups?.forEach((group) => {
            if (group.required && group.options && group.options.length > 0) {
              defaults[group.id] = [group.options[0].id];
            } else {
              defaults[group.id] = [];
            }
          });
          setSelectedOptions(defaults);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-zinc-900">Sản phẩm không tồn tại</h2>
        <Button className="mt-4" onClick={() => router.push('/menu')}>
          Quay về Menu
        </Button>
      </div>
    );
  }

  const basePrice =
    typeof product.basePrice === 'string'
      ? parseFloat(product.basePrice)
      : product.basePrice;

  const calculateTotal = () => {
    let total = basePrice;

    if (product.optionGroups) {
      product.optionGroups.forEach((group) => {
        const selectedOptionIds = selectedOptions[group.id] || [];
        group.options.forEach((opt) => {
          if (selectedOptionIds.includes(opt.id)) {
            const extra =
              typeof opt.extraPrice === 'string'
                ? parseFloat(opt.extraPrice)
                : opt.extraPrice;
            total += extra;
          }
        });
      });
    }

    return total * quantity;
  };

  const handleAddToCart = () => {
    const optionsArray: any[] = [];

    if (product.optionGroups) {
      product.optionGroups.forEach((group) => {
        const selectedOptionIds = selectedOptions[group.id] || [];
        group.options.forEach((opt) => {
          if (selectedOptionIds.includes(opt.id)) {
            optionsArray.push({
              groupId: group.id,
              optionId: opt.id,
              optionName: opt.name,
              extraPrice:
                typeof opt.extraPrice === 'string'
                  ? parseFloat(opt.extraPrice)
                  : opt.extraPrice,
            });
          }
        });
      });
    }

    addItem({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      basePrice: basePrice,
      quantity: quantity,
      selectedOptions: optionsArray,
    });

    router.push('/cart');
  };

  const toggleOption = (groupId: string, optionId: string, maxSelect = 1) => {
    setSelectedOptions((prev) => {
      const current = prev[groupId] || [];
      if (maxSelect === 1) {
        return { ...prev, [groupId]: [optionId] };
      } else {
        if (current.includes(optionId)) {
          return { ...prev, [groupId]: current.filter((id) => id !== optionId) };
        }
        if (current.length >= maxSelect) {
          return { ...prev, [groupId]: [...current.slice(1), optionId] };
        }
        return { ...prev, [groupId]: [...current, optionId] };
      }
    });
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-amber-500/5 via-transparent to-transparent py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-zinc-500 hover:text-zinc-950 transition font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </button>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/40 shadow-xl shadow-orange-500/5">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-zinc-100 text-zinc-300">
                No image
              </div>
            )}
          </div>

          {/* Configuration Form in Glass card */}
          <div className="flex flex-col rounded-3xl border border-white/30 bg-white/70 p-6 shadow-xl backdrop-blur-xl md:p-8">
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              {product.category && (
                <span className="rounded-full bg-orange-100 px-3 py-1 font-semibold text-orange-600">
                  {product.category.name}
                </span>
              )}
              {product.isFeatured && (
                <span className="flex items-center gap-1 font-semibold text-amber-500">
                  <Star className="h-4 w-4 fill-current" /> Hot
                </span>
              )}
            </div>

            <h1 className="mt-4 font-[family-name:var(--font-heading)] text-3xl font-extrabold text-zinc-900 leading-tight">
              {product.name}
            </h1>

            {product.description && (
              <p className="mt-3 text-zinc-600 text-sm leading-relaxed">
                {product.description}
              </p>
            )}

            <div className="mt-4 border-t border-zinc-100 pt-4">
              <span className="text-sm text-zinc-400">Đơn giá</span>
              <p className="text-3xl font-extrabold text-orange-500 mt-1">
                {formatPrice(calculateTotal())}
              </p>
            </div>

            {/* Customization Options */}
            <div className="mt-6 flex-1 space-y-6 overflow-y-auto max-h-[350px] pr-2">
              {product.optionGroups && product.optionGroups.length > 0 ? (
                product.optionGroups.map((group) => (
                  <div key={group.id} className="border-b border-zinc-100/50 pb-5 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-zinc-900">
                        {group.name}
                        {group.required && <span className="text-red-500 ml-1">*</span>}
                      </h3>
                      {group.maxSelect > 1 && (
                        <span className="text-xs text-zinc-400">
                          (Chọn tối đa {group.maxSelect})
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {group.options.map((option) => {
                        const isSelected = (selectedOptions[group.id] || []).includes(option.id);
                        const optPrice =
                          typeof option.extraPrice === 'string'
                            ? parseFloat(option.extraPrice)
                            : option.extraPrice;

                        return (
                          <button
                            key={option.id}
                            onClick={() =>
                              toggleOption(group.id, option.id, group.maxSelect)
                            }
                            className={`
                              flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border-2 transition-all cursor-pointer text-sm
                              ${
                                isSelected
                                  ? 'border-orange-500 bg-orange-50/50 text-orange-600 font-semibold'
                                  : 'border-zinc-200 bg-white/50 text-zinc-600 hover:border-zinc-300'
                              }
                            `}
                          >
                            {isSelected && <Check className="h-4 w-4 stroke-[3px]" />}
                            <span>{option.name}</span>
                            {optPrice > 0 && (
                              <span className="text-xs text-orange-500 font-medium ml-0.5">
                                (+{formatPrice(optPrice)})
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-400 italic">Món ăn này không có lựa chọn tùy biến.</p>
              )}
            </div>

            {/* Add to Cart Footer */}
            <div className="mt-8 border-t border-zinc-150 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-700 text-sm">Số lượng đặt:</span>
                <div className="flex items-center gap-3 bg-zinc-100 p-1 rounded-full border border-zinc-200">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-zinc-600 shadow-sm transition hover:bg-zinc-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-bold text-base text-zinc-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-zinc-600 shadow-sm transition hover:bg-zinc-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <Button
                className="w-full py-6 text-base font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl shadow-lg shadow-orange-500/20 transition-all hover:opacity-95 cursor-pointer"
                onClick={handleAddToCart}
              >
                Thêm vào giỏ hàng
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
