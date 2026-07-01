import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "../globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Chatbot } from "@/components/layout/chatbot";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

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
  description: "Đặt trà sữa, nước ép, snack online. Giao hàng nhanh, thanh toán VietQR.",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${jakarta.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-zinc-50 font-[family-name:var(--font-body)] text-zinc-900 antialiased">
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="pb-20 md:pb-0">{children}</main>
          <Footer />
          <BottomNav />
          <Chatbot />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
