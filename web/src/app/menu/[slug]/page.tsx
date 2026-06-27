'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart-store';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import { ArrowLeft, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getProducts } from '@/lib/api';
import { useEffect, useState } from 'react';
import type { Product } from '@/types';

// Mock product options for now
const mockProductOptions = {
  optionGroups: [
    {
      id: 'size',
      name: 'Size',
      required: true,
      options: [
        { id: 'size-m', name: 'Size M', extraPrice: 0 },
        { id: 'size-l', name: 'Size L', extraPrice: 5000 },
      ],
    },
    {
      id: 'ice',
      name: 'Mức đá',
      required: true,
      options: [
        { id: 'ice-full', name: '100% đá', extraPrice: 0 },
        { id: 'ice-half', name: '50% đá', extraPrice: 0 },
        { id: 'ice-none', name: 'Không đá', extraPrice: 0 },
      ],
    },
    {
      id: 'topping',
      name: 'Topping',
      required: false,
      options: [
        { id: 'top-pearl', name: 'Trân châu', extraPrice: 5000 },
        { id: 'top-jelly', name: 'Thạch dừa', extraPrice: 5000 },
        { id: 'top-pudding', name: 'Pudding', extraPrice: 8000 },
      ],
    },
  ],
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const addItem = useCartStore(state => state.addItem);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({
    size: ['size-m'],
    ice: ['ice-full'],
    topping: [],
  });
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    // In a real app, we'd fetch from API using the slug
    // For now, we'll get from our mock data
    const fetchProduct = async () => {
      const data = await getProducts();
      const found = data.items.find(p => p.slug === params.slug);
      setProduct(found || null);
    };
    fetchProduct();
  }, [params.slug]);

  if (!product) {
    return <div className="mx-auto max-w-7xl px-4 py-16 text-center">Sản phẩm không tìm thấy</div>;
  }

  const basePrice = typeof product.basePrice === 'string' ? parseFloat(product.basePrice) : product.basePrice;
  
  const calculateTotal = () => {
    let total = basePrice * quantity;
    
    // Add option prices
    mockProductOptions.optionGroups.forEach(group => {
      const selectedOptionIds = selectedOptions[group.id] || [];
      group.options.forEach(opt => {
        if (selectedOptionIds.includes(opt.id)) {
          total += opt.extraPrice * quantity;
        }
      });
    });
    
    return total;
  };

  const handleAddToCart = () => {
    const optionsArray = [];
    
    mockProductOptions.optionGroups.forEach(group => {
      const selectedOptionIds = selectedOptions[group.id] || [];
      group.options.forEach(opt => {
        if (selectedOptionIds.includes(opt.id)) {
          optionsArray.push({
            groupId: group.id,
            optionId: opt.id,
            optionName: opt.name,
            extraPrice: opt.extraPrice,
          });
        }
      });
    });

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

  const toggleOption = (groupId: string, optionId: string, isMulti: boolean = false) => {
    setSelectedOptions(prev => {
      if (isMulti) {
        const current = prev[groupId] || [];
        if (current.includes(optionId)) {
          return { ...prev, [groupId]: current.filter(id => id !== optionId) };
        }
        return { ...prev, [groupId]: [...current, optionId] };
      }
      return { ...prev, [groupId]: [optionId] };
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-zinc-500 hover:text-zinc-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại
      </button>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-zinc-100">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-300">
              No image
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            {product.category && <span>{product.category.name}</span>}
            {product.isFeatured && <span className="text-orange-500 font-semibold">★ Hot</span>}
          </div>
          
          <h1 className="mt-2 font-[family-name:var(--font-heading)] text-4xl font-bold text-zinc-900">
            {product.name}
          </h1>
          
          {product.description && (
            <p className="mt-4 text-lg text-zinc-600">{product.description}</p>
          )}

          <p className="mt-4 text-3xl font-bold text-orange-500">
            {formatPrice(calculateTotal())}
          </p>

          <div className="mt-8 flex-1 space-y-6">
            {mockProductOptions.optionGroups.map((group) => (
              <div key={group.id}>
                <h3 className="font-semibold text-zinc-900">
                  {group.name}
                  {group.required && <span className="text-red-500 ml-1">*</span>}
                </h3>
                
                <div className="mt-3 flex flex-wrap gap-2">
                  {group.options.map((option) => {
                    const isSelected = (selectedOptions[group.id] || []).includes(option.id);
                    const extraPrice = option.extraPrice > 0;
                    
                    return (
                      <button
                        key={option.id}
                        onClick={() => toggleOption(group.id, option.id, !group.required)}
                        className={`
                          px-4 py-2 rounded-xl border-2 transition-all
                          ${isSelected 
                            ? 'border-orange-500 bg-orange-50 text-orange-700 font-semibold' 
                            : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                          }
                        `}
                      >
                        {option.name}
                        {extraPrice && (
                          <span className="ml-1 text-sm text-orange-600">
                            +{formatPrice(option.extraPrice)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-4 border-t border-zinc-100 pt-6">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-zinc-700">Số lượng:</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <Button
              className="w-full py-6 text-lg"
              onClick={handleAddToCart}
            >
              Thêm vào giỏ hàng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
