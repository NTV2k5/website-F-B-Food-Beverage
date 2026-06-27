'use client';

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cart-store";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const price =
    typeof product.basePrice === "string"
      ? parseFloat(product.basePrice)
      : product.basePrice;
  
  const addItem = useCartStore(state => state.addItem);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      basePrice: price,
      quantity: 1,
      selectedOptions: [],
    });
  };

  return (
    <Link
      href={`/menu/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/10"
    >
      <div className="relative aspect-square overflow-hidden bg-zinc-100">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-300">
            No image
          </div>
        )}
        {product.isFeatured && (
          <Badge className="absolute left-3 top-3">Hot</Badge>
        )}
        <button
          type="button"
          className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-white opacity-0 shadow-lg transition group-hover:opacity-100 hover:bg-orange-600"
          onClick={handleQuickAdd}
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
      <div className="flex flex-1 flex-col p-4">
        {product.category && (
          <span className="text-xs text-zinc-400">{product.category.name}</span>
        )}
        <h3 className="mt-1 line-clamp-2 font-semibold text-zinc-900">
          {product.name}
        </h3>
        <p className="mt-auto pt-2 text-lg font-bold text-orange-500">
          {formatPrice(price)}
        </p>
      </div>
    </Link>
  );
}
