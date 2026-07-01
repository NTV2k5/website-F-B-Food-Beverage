import Image from "next/image";
import { ArrowRight, Clock, Truck, Sparkles, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryPills } from "@/components/products/category-pills";
import { ProductCard } from "@/components/products/product-card";
import { getBestsellers, getCategories, getProducts } from "@/lib/api";
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  const tc = await getTranslations({ locale, namespace: 'common' });

  const [categories, bestsellers, featured] = await Promise.all([
    getCategories(),
    getBestsellers(),
    getProducts({ featured: true, limit: 8 }),
  ]);

  // Use bestsellers first, fallback to featured items
  const displayProducts = bestsellers.length > 0 ? bestsellers : featured.items;

  return (
    <div className="relative min-h-screen bg-zinc-50">
      
      {/* Hero Header with Dynamic Background */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-500 to-amber-400">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZoLTJWMjRoMnY0em0tNiA2aC00di00aDR2NHptMC02aC00di00aDR2NHptLTYgNmgtNHYtNGg0djR6bTAtNmgtNHYtNGg0djR6bTYgMTJoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0tNiA2aC00di00aDR2NHptMC02aC00di00aDR2NHptLTYgNmgtNHYtNGg0djR6bTAtNmgtNHYtNGg0djR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
        
        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-12 px-4 py-16 sm:flex-row sm:px-6 sm:py-24">
          <div className="flex-1 text-center sm:text-left space-y-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md border border-white/10 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Giảm 20% đơn đầu tiên với code GIAM20
            </span>
            <h1 className="font-[family-name:var(--font-heading)] text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl tracking-tight">
              Trà Sữa & Snack
              <br />
              <span className="text-orange-100 drop-shadow-sm">Giao Hàng Siêu Tốc</span>
            </h1>
            <p className="max-w-lg text-sm text-orange-50/90 leading-relaxed">
              Đặt món nhanh chóng, thanh toán VietQR tự động không lo sai nội dung, theo dõi shipper di chuyển thời gian thực.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/menu">
                <Button
                  size="lg"
                  className="w-full bg-white text-orange-600 hover:bg-orange-50 font-bold rounded-2xl shadow-lg sm:w-auto px-8"
                >
                  {t('viewMenu')}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link href="/menu?category=combo">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-white/30 bg-white/15 text-white hover:bg-white/25 font-bold rounded-2xl sm:w-auto px-6 backdrop-blur-sm"
                >
                  Combo tiết kiệm
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-6 sm:justify-start text-xs pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 text-white/90 font-semibold">
                <Clock className="h-4.5 w-4.5" />
                <span>Hoạt động: 8:00 - 22:00</span>
              </div>
              <div className="flex items-center gap-2 text-white/90 font-semibold">
                <Truck className="h-4.5 w-4.5 animate-bounce" />
                <span>Đồng giá giao: 15.000đ</span>
              </div>
            </div>
          </div>
          
          <div className="relative h-72 w-72 shrink-0 sm:h-96 sm:w-96 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-white/15 blur-3xl animate-pulse" />
            <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/35 shadow-2xl backdrop-blur-md">
              <img
                src="https://images.unsplash.com/photo-1576092768241-dec2318790d1?w=600"
                alt="F&B Milk Tea"
                className="h-full w-full object-cover scale-105 hover:scale-100 transition duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Horizontal bar */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h2 className="font-[family-name:var(--font-heading)] text-lg font-black text-zinc-900 flex items-center gap-2">
          <Award className="h-5 w-5 text-orange-500" />
          {t('categories')}
        </h2>
        <div className="mt-4">
          <CategoryPills categories={categories} />
        </div>
      </section>

      {/* Best Sellers Grid Section */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="flex items-center justify-between border-b border-zinc-150 pb-4">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl font-black text-zinc-900 flex items-center gap-2">
            <Award className="h-6 w-6 text-amber-500 fill-current" />
            {t('bestsellers')}
          </h2>
          <Link
            href="/menu"
            className="flex items-center gap-1 text-xs font-bold text-orange-500 hover:text-orange-600 transition"
          >
            {tc('menu')}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {displayProducts.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-zinc-200 bg-white p-12 text-center shadow-inner">
            <p className="text-zinc-500 italic text-sm">
              Chưa có sản phẩm nào.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
