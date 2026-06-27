import { CategoryPills } from "@/components/products/category-pills";
import { ProductCard } from "@/components/products/product-card";
import { getCategories, getProducts } from "@/lib/api";

interface MenuPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function MenuPage({ searchParams }: MenuPageProps) {
  const { category } = await searchParams;
  const [categories, productsData] = await Promise.all([
    getCategories(),
    getProducts({ category, limit: 24 }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-zinc-900">
        Menu
      </h1>
      <p className="mt-2 text-zinc-500">
        {productsData.meta.total} món · Chọn món yêu thích và thêm vào giỏ
      </p>

      <div className="mt-6">
        <CategoryPills categories={categories} activeSlug={category} />
      </div>

      {productsData.items.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {productsData.items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-12 rounded-2xl border border-dashed border-zinc-200 bg-white p-12 text-center">
          <p className="text-zinc-500">Không tìm thấy món trong danh mục này.</p>
        </div>
      )}
    </div>
  );
}
