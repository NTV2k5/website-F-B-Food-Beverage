import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Truck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryPills } from "@/components/products/category-pills";
import { ProductCard } from "@/components/products/product-card";
import { getBestsellers, getCategories, getProducts } from "@/lib/api";

export default async function HomePage() {
  const [categories, bestsellers, featured] = await Promise.all([
    getCategories(),
    getBestsellers(),
    getProducts({ featured: true, limit: 4 }),
  ]);

  const displayProducts =
    bestsellers.length > 0 ? bestsellers : featured.items;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZoLTJWMjRoMnY0em0tNiA2aC00di00aDR2NHptMC02aC00di00aDR2NHptLTYgNmgtNHYtNGg0djR6bTAtNmgtNHYtNGg0djR6bTYgMTJoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0tNiA2aC00di00aDR2NHptMC02aC00di00aDR2NHptLTYgNmgtNHYtNGg0djR6bTAtNmgtNHYtNGg0djR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-16 sm:flex-row sm:px-6 sm:py-24">
          <div className="flex-1 text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Giảm 20% đơn đầu tiên
            </span>
            <h1 className="mt-4 font-[family-name:var(--font-heading)] text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              Trà sữa & Snack
              <br />
              <span className="text-orange-100">Giao tận nơi</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg text-orange-50">
              Đặt online, thanh toán VietQR, theo dõi đơn hàng realtime. Giao
              trong 30 phút.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/menu">
                <Button
                  size="lg"
                  className="w-full bg-white text-orange-600 hover:bg-orange-50 sm:w-auto"
                >
                  Xem Menu
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/menu?category=combo">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-white/30 bg-white/10 text-white hover:bg-white/20 sm:w-auto"
                >
                  Combo tiết kiệm
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-6 sm:justify-start">
              <div className="flex items-center gap-2 text-white/90">
                <Clock className="h-5 w-5" />
                <span className="text-sm">8:00 - 22:00</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <Truck className="h-5 w-5" />
                <span className="text-sm">Giao 30 phút</span>
              </div>
            </div>
          </div>
          <div className="relative h-64 w-64 shrink-0 sm:h-80 sm:w-80">
            <div className="absolute inset-0 rounded-full bg-white/10 blur-3xl" />
            <Image
              src="https://images.unsplash.com/photo-1576092768241-dec2318790d1?w=600"
              alt="Trà sữa trân châu"
              fill
              className="rounded-3xl object-cover shadow-2xl ring-4 ring-white/20"
              priority
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-zinc-900">
          Danh mục
        </h2>
        <div className="mt-4">
          <CategoryPills categories={categories} />
        </div>
      </section>

      {/* Bestsellers */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-zinc-900">
            Món bán chạy
          </h2>
          <Link
            href="/menu"
            className="flex items-center gap-1 text-sm font-medium text-orange-500 hover:text-orange-600"
          >
            Xem tất cả
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {displayProducts.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-zinc-200 bg-white p-12 text-center">
            <p className="text-zinc-500">
              Chưa có sản phẩm. Hãy chạy backend và seed database.
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              <code className="rounded bg-zinc-100 px-2 py-1">
                npm run prisma:seed
              </code>
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
