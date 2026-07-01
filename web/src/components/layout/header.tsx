'use client';

import { ShoppingBag, Search, User, MapPin, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useTranslations, useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { API_URL } from '@/lib/utils';

const languages = [
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
];

export function Header() {
  const t = useTranslations('header');
  const tc = useTranslations('common');
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const totalItems = useCartStore((state) => state.totalItems);
  const { user, accessToken, refreshToken, setAuth, logout } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/menu?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };


  useEffect(() => {
    if (!accessToken) return;

    const verifySession = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (res.status === 401) {
          logout();
          router.push('/sign-in');
          return;
        }

        if (res.ok) {
          const updatedUser = await res.json();
          setAuth(updatedUser, accessToken, refreshToken!);
        }
      } catch (err) {
        console.error('Failed to verify session:', err);
      }
    };

    verifySession();
  }, [accessToken, refreshToken, setAuth, logout, router]);

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  const isAuthPage = pathname === '/sign-in' || pathname === '/sign-up';
  if (isAuthPage) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white font-black">
            <span>F</span>
          </div>
          <span className="hidden text-lg font-bold text-zinc-900 sm:block">
            {tc('appName')}
          </span>
        </Link>

        <form onSubmit={handleSearchSubmit} className="hidden flex-1 max-w-md md:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="h-10 w-full rounded-full border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
            />
          </div>
        </form>

        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white/50 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition cursor-pointer">
              <Globe className="h-3.5 w-3.5 text-zinc-500" />
              <span>{languages.find((l) => l.code === currentLocale)?.name}</span>
            </button>
            <div className="absolute right-0 mt-1.5 w-36 origin-top-right rounded-2xl border border-white/40 bg-white/85 p-1.5 shadow-xl backdrop-blur-xl scale-0 group-hover:scale-100 transition-all duration-200 transform origin-top">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full text-left rounded-xl px-3 py-2 text-xs font-medium cursor-pointer transition
                    ${
                      currentLocale === lang.code
                        ? 'bg-orange-50 text-orange-600 font-bold'
                        : 'text-zinc-650 hover:bg-zinc-50'
                    }
                  `}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>

          <Button variant="ghost" size="icon" className="hidden sm:flex" title={t('addressTooltip')}>
            <MapPin className="h-5 w-5" />
          </Button>

          {user ? (
            <div className="relative group flex items-center gap-2">
              <div className="hidden flex-col items-end sm:flex text-xs">
                <span className="font-semibold text-zinc-900 leading-tight">{user.fullName}</span>
                <span className="text-orange-500 font-bold mt-0.5">⭐ {user.loyaltyPoints}{t('points')} ({user.loyaltyTier})</span>
              </div>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 font-bold text-white shadow-sm transition hover:scale-105 cursor-pointer"
              >
                {user.fullName.slice(0, 1).toUpperCase()}
              </button>

              <div className="absolute right-0 mt-1 top-full w-48 origin-top-right rounded-2xl border border-white/40 bg-white/95 p-1.5 shadow-xl backdrop-blur-xl scale-0 group-hover:scale-100 transition-all duration-200 transform origin-top z-50">
                <div className="px-3 py-2 border-b border-zinc-100 text-xs text-zinc-500">
                  <p className="font-bold text-zinc-900 truncate">{user.fullName}</p>
                  <p className="truncate mt-0.5">{user.email || user.phone}</p>
                </div>
                
                <button
                  onClick={() => router.push('/profile')}
                  className="w-full text-left rounded-xl px-3 py-2 text-xs font-medium cursor-pointer transition text-zinc-750 hover:bg-zinc-50 hover:text-orange-600 flex items-center gap-2"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Trang cá nhân (Profile)</span>
                </button>

                {user.role === 'ADMIN' && (
                  <button
                    onClick={() => router.push('/admin')}
                    className="w-full text-left rounded-xl px-3 py-2 text-xs font-medium cursor-pointer transition text-zinc-750 hover:bg-zinc-50 hover:text-orange-600 flex items-center gap-2"
                  >
                    <span>🛠️ Admin Dashboard</span>
                  </button>
                )}

                {user.role === 'SHIPPER' && (
                  <button
                    onClick={() => router.push('/shipper')}
                    className="w-full text-left rounded-xl px-3 py-2 text-xs font-medium cursor-pointer transition text-zinc-750 hover:bg-zinc-50 hover:text-orange-600 flex items-center gap-2"
                  >
                    <span>🛵 Shipper Dashboard</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    logout();
                    router.push('/sign-in');
                  }}
                  className="w-full text-left rounded-xl px-3 py-2 text-xs font-bold cursor-pointer transition text-red-500 hover:bg-red-50 flex items-center gap-2 border-t border-zinc-100 mt-1"
                >
                  <span>🚪 {t('logoutBtn')}</span>
                </button>
              </div>
            </div>
          ) : (
            <Link href="/sign-in" className="flex items-center">
              <Button variant="ghost" size="icon" title={tc('login')} className="hover:text-orange-500 hover:bg-orange-50 rounded-full">
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
            <span className="hidden sm:inline font-semibold">{tc('cart')}</span>
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
