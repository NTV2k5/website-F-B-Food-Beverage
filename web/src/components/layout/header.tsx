import Link from "next/link";
import { ShoppingBag, Search, User, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white">
            <span className="text-lg font-bold">F</span>
          </div>
          <span className="hidden text-lg font-bold text-zinc-900 sm:block">
            F&B Shop
          </span>
        </Link>

        <div className="hidden flex-1 max-w-md md:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              placeholder="Tìm trà sữa, snack..."
              className="h-10 w-full rounded-full border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <MapPin className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
          <Button variant="default" size="sm" className="relative">
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Giỏ hàng</span>
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white">
              0
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
