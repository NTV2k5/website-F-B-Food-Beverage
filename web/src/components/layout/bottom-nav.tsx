import Link from "next/link";
import { Home, UtensilsCrossed, ClipboardList, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Trang chủ" },
  { href: "/menu", icon: UtensilsCrossed, label: "Menu" },
  { href: "/orders", icon: ClipboardList, label: "Đơn hàng" },
  { href: "/profile", icon: User, label: "Tài khoản" },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-100 bg-white/90 backdrop-blur-lg md:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400 transition hover:text-orange-500",
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
