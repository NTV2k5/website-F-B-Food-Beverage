'use client';

import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export default function CheckoutSuccessPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-500">
        <CheckCircle2 className="h-12 w-12" />
      </div>
      <h1 className="mt-6 font-heading text-3xl font-bold text-zinc-900">
        Đặt hàng thành công!
      </h1>
      <p className="mt-2 text-zinc-500">
        Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xử lý đơn hàng của bạn ngay lập tức.
      </p>
      
      <div className="mt-8 w-full space-y-3">
        <Link href="/menu" className="block w-full">
          <Button className="w-full py-6 text-lg">
            Tiếp tục mua sắm
          </Button>
        </Link>
        <Link href="/" className="block w-full">
          <Button variant="ghost" className="w-full">
            Quay về trang chủ
          </Button>
        </Link>
      </div>
    </div>
  );
}
