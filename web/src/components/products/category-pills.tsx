import Link from "next/link";
import type { Category } from "@/types";
import { cn } from "@/lib/utils";

interface CategoryPillsProps {
  categories: Category[];
  activeSlug?: string;
}

export function CategoryPills({ categories, activeSlug }: CategoryPillsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <Link
        href="/menu"
        className={cn(
          "shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition",
          !activeSlug
            ? "bg-orange-500 text-white shadow-md shadow-orange-500/25"
            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200",
        )}
      >
        Tất cả
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/menu?category=${cat.slug}`}
          className={cn(
            "shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition",
            activeSlug === cat.slug
              ? "bg-orange-500 text-white shadow-md shadow-orange-500/25"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200",
          )}
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
