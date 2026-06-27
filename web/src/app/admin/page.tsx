'use client';

import { useEffect, useState } from 'react';
import { formatPrice } from '@/lib/utils';
import { Bell, Package, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Mock data for admin dashboard
const mockOrders = [
  {
    id: '1',
    orderNumber: 'DH12345',
    customer: 'Nguyễn Văn A',
    total: 45000,
    status: 'PENDING_PAYMENT',
    date: new Date().toISOString(),
  },
  {
    id: '2',
    orderNumber: 'DH12344',
    customer: 'Trần Thị B',
    total: 80000,
    status: 'CONFIRMED',
    date: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '3',
    orderNumber: 'DH12343',
    customer: 'Lê Văn C',
    total: 120000,
    status: 'DELIVERING',
    date: new Date(Date.now() - 7200000).toISOString(),
  },
];

const statusColors: Record<string, string> = {
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PREPARING: 'bg-purple-100 text-purple-700',
  READY: 'bg-green-100 text-green-700',
  DELIVERING: 'bg-orange-100 text-orange-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  PENDING_PAYMENT: 'Chờ thanh toán',
  CONFIRMED: 'Đã xác nhận',
  PREPARING: 'Đang chuẩn bị',
  READY: 'Đã sẵn sàng',
  DELIVERING: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
};

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState(mockOrders);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-zinc-900">
            Admin Dashboard
          </h1>
          <p className="text-zinc-500 mt-1">Quản lý cửa hàng F&B</p>
        </div>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-100 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-500">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-500">Đơn hàng hôm nay</p>
              <p className="text-2xl font-bold text-zinc-900">12</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-100 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-500">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-500">Doanh thu hôm nay</p>
              <p className="text-2xl font-bold text-zinc-900">5.2M</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-100 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-500">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-500">Khách hàng mới</p>
              <p className="text-2xl font-bold text-zinc-900">28</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-100 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-500">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-500">Sản phẩm</p>
              <p className="text-2xl font-bold text-zinc-900">45</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-900">Đơn hàng gần đây</h2>
          <Link href="/admin/orders">
            <Button variant="ghost">Xem tất cả</Button>
          </Link>
        </div>

        <div className="mt-4 rounded-2xl border border-zinc-100 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">Mã đơn</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">Khách hàng</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">Tổng tiền</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-50">
                    <td className="px-6 py-4 font-medium text-zinc-900">{order.orderNumber}</td>
                    <td className="px-6 py-4 text-zinc-600">{order.customer}</td>
                    <td className="px-6 py-4 font-semibold text-zinc-900">{formatPrice(order.total)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="ghost" size="sm">
                        Chi tiết
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/admin/products" className="block">
          <div className="rounded-2xl border border-zinc-100 bg-white p-6 hover:border-orange-200 hover:bg-orange-50 transition-all cursor-pointer">
            <h3 className="font-semibold text-zinc-900">Quản lý sản phẩm</h3>
            <p className="text-sm text-zinc-500 mt-1">Thêm, sửa, xóa sản phẩm</p>
          </div>
        </Link>
        <Link href="/admin/orders" className="block">
          <div className="rounded-2xl border border-zinc-100 bg-white p-6 hover:border-orange-200 hover:bg-orange-50 transition-all cursor-pointer">
            <h3 className="font-semibold text-zinc-900">Quản lý đơn hàng</h3>
            <p className="text-sm text-zinc-500 mt-1">Xem và cập nhật đơn hàng</p>
          </div>
        </Link>
        <Link href="/" className="block">
          <div className="rounded-2xl border border-zinc-100 bg-white p-6 hover:border-orange-200 hover:bg-orange-50 transition-all cursor-pointer">
            <h3 className="font-semibold text-zinc-900">Xem cửa hàng</h3>
            <p className="text-sm text-zinc-500 mt-1">Về trang chủ</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
