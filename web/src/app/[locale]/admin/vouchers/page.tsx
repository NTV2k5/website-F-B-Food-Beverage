'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { formatPrice } from '@/lib/utils';
import { API_URL } from '@/lib/utils';
import { Plus, Trash2, ArrowLeft, Award, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';

interface Coupon {
  id: string;
  code: string;
  type: 'PERCENT' | 'FIXED';
  value: number;
  minOrderAmount: number;
  maxUsage: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
}

export default function AdminVouchersPage() {
  const router = useRouter();
  const { user, accessToken } = useAuthStore();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState('');
  const [type, setType] = useState<'PERCENT' | 'FIXED'>('PERCENT');
  const [value, setValue] = useState(10);
  const [minOrderAmount, setMinOrderAmount] = useState(0);
  const [maxUsage, setMaxUsage] = useState<number | ''>('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isActive, setIsActive] = useState(true);

  const fetchCoupons = async () => {
    try {
      const res = await fetch(`${API_URL}/orders/coupons/admin`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        setCoupons(data);
      }
    } catch (err) {
      console.error('Error loading coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/sign-in');
      return;
    }
    fetchCoupons();
  }, [user]);

  const saveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    setActionLoading(true);

    const payload = {
      code: code.toUpperCase().trim(),
      type,
      value: Number(value),
      minOrderAmount: Number(minOrderAmount),
      maxUsage: maxUsage === '' ? null : Number(maxUsage),
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      isActive,
    };

    try {
      const res = await fetch(`${API_URL}/orders/coupons/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowForm(false);
        setCode('');
        setType('PERCENT');
        setValue(10);
        setMinOrderAmount(0);
        setMaxUsage('');
        setExpiresAt('');
        fetchCoupons();
      } else {
        const data = await res.json();
        alert(data.message || 'Lỗi tạo mã giảm giá');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối server');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa mã giảm giá này không?')) return;
    try {
      const res = await fetch(`${API_URL}/orders/coupons/admin/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        fetchCoupons();
      } else {
        alert('Không thể xóa mã giảm giá này.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-amber-500/5 via-transparent to-transparent py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        
        {/* Navigation back */}
        <Link href="/admin" className="mb-6 inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-950 transition font-medium">
          <ArrowLeft className="h-4 w-4" />
          Quay lại Dashboard
        </Link>

        {/* Heading */}
        <div className="flex justify-between items-center border-b border-zinc-150 pb-5 mb-6">
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-3xl font-extrabold text-zinc-900 flex items-center gap-2">
              <Award className="h-7 w-7 text-orange-500 animate-pulse" />
              Quản lý mã giảm giá (Vouchers CRUD)
            </h1>
            <p className="text-xs text-zinc-400 mt-1">Đang hoạt động: {coupons.filter(c => c.isActive).length} mã</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold px-4"
          >
            <Plus className="mr-1 h-4 w-4" />
            Tạo Voucher mới
          </Button>
        </div>

        {/* Voucher Form */}
        {showForm && (
          <div className="mb-8 rounded-3xl border border-orange-200 bg-orange-50/20 p-6 shadow-xl backdrop-blur-md">
            <h3 className="text-base font-bold text-zinc-900 mb-4 flex items-center gap-1.5 border-b border-orange-100 pb-2">
              <Award className="h-4.5 w-4.5 text-orange-500" />
              Tạo mã giảm giá mới
            </h3>
            
            <form onSubmit={saveCoupon} className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1">Mã giảm giá (Code)</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs outline-none focus:border-orange-500 font-mono font-bold"
                  placeholder="Ví dụ: GIAM30K"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1">Loại giảm giá</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  required
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs outline-none focus:border-orange-500 font-bold"
                >
                  <option value="PERCENT">Theo phần trăm (%)</option>
                  <option value="FIXED">Giảm tiền mặt trực tiếp (VND)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1">Mức giảm</label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  required
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs outline-none focus:border-orange-500 font-bold"
                  placeholder={type === 'PERCENT' ? 'Ví dụ: 20 (%)' : 'Ví dụ: 30000 (VND)'}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1">Đơn tối thiểu (VND)</label>
                <input
                  type="number"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                  required
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs outline-none focus:border-orange-500"
                  placeholder="Ví dụ: 50000"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1">Lượt dùng tối đa (Để trống nếu vô hạn)</label>
                <input
                  type="number"
                  value={maxUsage}
                  onChange={(e) => setMaxUsage(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs outline-none focus:border-orange-500"
                  placeholder="Ví dụ: 100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1">Ngày hết hạn (Hạn dùng)</label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs outline-none focus:border-orange-500 font-bold"
                />
              </div>

              <div className="flex items-center gap-1.5 pt-5">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-zinc-650">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-orange-500 focus:ring-orange-400 cursor-pointer"
                  />
                  Kích hoạt mã ngay
                </label>
              </div>

              <div className="md:col-span-2 flex justify-end gap-2.5 border-t border-orange-100 pt-4 mt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl text-xs"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold px-6"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Tạo Voucher'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Vouchers Table */}
        <div className="rounded-3xl border border-white/40 bg-white/70 p-5 shadow-lg backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-150/50">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-zinc-800">Mã (Code)</th>
                  <th className="px-4 py-3 text-left font-bold text-zinc-800">Loại giảm</th>
                  <th className="px-4 py-3 text-left font-bold text-zinc-800">Mức giảm</th>
                  <th className="px-4 py-3 text-left font-bold text-zinc-800">Đơn tối thiểu</th>
                  <th className="px-4 py-3 text-left font-bold text-zinc-800">Đã dùng</th>
                  <th className="px-4 py-3 text-left font-bold text-zinc-800">Hạn dùng</th>
                  <th className="px-4 py-3 text-center font-bold text-zinc-800">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {coupons.map((cp) => (
                  <tr key={cp.id} className="hover:bg-zinc-50/50">
                    <td className="px-4 py-3 font-mono font-bold text-orange-600">{cp.code}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-zinc-600">
                      {cp.type === 'PERCENT' ? 'Phần trăm (%)' : 'Tiền mặt (VND)'}
                    </td>
                    <td className="px-4 py-3 font-bold">
                      {cp.type === 'PERCENT' ? `${cp.value}%` : formatPrice(cp.value)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-zinc-700">{formatPrice(cp.minOrderAmount)}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-zinc-500">
                      {cp.usedCount} / {cp.maxUsage || 'Vô hạn'}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500 font-semibold">
                      {cp.expiresAt ? new Date(cp.expiresAt).toLocaleDateString('vi-VN') : 'Vô hạn'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => deleteCoupon(cp.id)}
                        className="rounded-lg border border-red-100 bg-white p-1.5 text-red-500 hover:bg-red-50 transition cursor-pointer"
                        title="Xóa"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
