'use client';

import Link from 'next/link';
import { ShoppingBag, Search, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';

export function Header() {
  const totalItems = useCartStore((state) => state.totalItems);
  const { user, logout } = useAuthStore();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white font-black">
            <span>F</span>
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

          {user ? (
            <div className="flex items-center gap-2 mr-2">
              <div className="hidden flex-col items-end sm:flex text-xs">
                <span className="font-semibold text-zinc-900">{user.fullName}</span>
                <span className="text-orange-500 font-medium">⭐ {user.loyaltyPoints}đ ({user.loyaltyTier})</span>
              </div>
              <button
                onClick={() => {
                  if (user.role === 'ADMIN') router.push('/admin');
                  else if (user.role === 'SHIPPER') router.push('/shipper');
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 font-bold text-white shadow-sm transition hover:scale-105"
                title={user.role === 'ADMIN' ? 'Admin Dashboard' : user.role === 'SHIPPER' ? 'Shipper Dashboard' : user.fullName}
              >
                {user.fullName.slice(0, 1).toUpperCase()}
              </button>
              <button
                onClick={() => {
                  logout();
                  router.push('/');
                }}
                className="text-xs text-zinc-400 hover:text-red-500 ml-1 cursor-pointer font-medium"
              >
                Thoát
              </button>
            </div>
          ) : (
            <Link href="/sign-in" className="flex items-center">
              <Button variant="ghost" size="icon" title="Đăng nhập" className="hover:text-orange-500 hover:bg-orange-50 rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          )}

          <Button
            variant="default"
            size="sm"
            className="relative bg-orange-500 text-white hover:bg-orange-600 rounded-xl"
            onClick={() => router.push('/cart')}
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline font-semibold">Giỏ hàng</span>
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-bounce">
                {totalItems}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
