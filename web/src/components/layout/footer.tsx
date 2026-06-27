import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-zinc-100 bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">F&B Shop</h3>
            <p className="mt-2 text-sm text-zinc-500">
              Nước uống & đồ ăn vặt giao tận nơi. Đặt online, nhận hàng nhanh.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-zinc-900">Liên kết</h4>
            <ul className="mt-3 space-y-2 text-sm text-zinc-500">
              <li>
                <Link href="/menu" className="hover:text-orange-500">
                  Menu
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-orange-500">
                  Đơn hàng
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-zinc-900">Liên hệ</h4>
            <ul className="mt-3 space-y-2 text-sm text-zinc-500">
              <li>Hotline: 1900 xxxx</li>
              <li>8:00 - 22:00 hàng ngày</li>
            </ul>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-zinc-400">
          © {new Date().getFullYear()} F&B Shop. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
