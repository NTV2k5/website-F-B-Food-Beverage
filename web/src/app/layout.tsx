import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomNav } from "@/components/layout/bottom-nav";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "F&B Shop — Nước uống & Đồ ăn vặt",
  description:
    "Đặt trà sữa, nước ép, snack online. Giao hàng nhanh, thanh toán VietQR.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${jakarta.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-zinc-50 font-[family-name:var(--font-body)] text-zinc-900 antialiased">
        <Header />
        <main className="pb-20 md:pb-0">{children}</main>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
