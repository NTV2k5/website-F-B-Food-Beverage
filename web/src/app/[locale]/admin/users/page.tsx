'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { API_URL } from '@/lib/utils';
import { Users, ArrowLeft, ShieldAlert, Award, Star, Loader2 } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface UserItem {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: 'ADMIN' | 'SHIPPER' | 'CUSTOMER';
  loyaltyPoints: number;
  loyaltyTier: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, accessToken } = useAuthStore();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/users`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/sign-in');
      return;
    }
    fetchUsers();
  }, [user]);

  const changeRole = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    try {
      const res = await fetch(`${API_URL}/auth/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole as any } : u)),
        );
      } else {
        const err = await res.json();
        alert(err.message || 'Lỗi phân quyền');
      }
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi kết nối');
    } finally {
      setUpdatingId(null);
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
        <div className="border-b border-zinc-150 pb-5 mb-6">
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-extrabold text-zinc-900 flex items-center gap-2">
            <Users className="h-7 w-7 text-orange-500" />
            Phân quyền tài khoản (User Management)
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Cấu hình vai trò truy cập hệ thống F&B</p>
        </div>

        {/* Users Table */}
        <div className="rounded-3xl border border-white/40 bg-white/70 p-5 shadow-lg backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-150/50">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-zinc-800">Tên người dùng</th>
                  <th className="px-4 py-3 text-left font-bold text-zinc-800">Thông tin liên lạc</th>
                  <th className="px-4 py-3 text-left font-bold text-zinc-800">Loyalty Points</th>
                  <th className="px-4 py-3 text-left font-bold text-zinc-800">Phân hạng</th>
                  <th className="px-4 py-3 text-center font-bold text-zinc-800">Quyền hạn (Role)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {users.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/50">
                    <td className="px-4 py-3 min-w-[150px]">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-zinc-700 font-extrabold text-xs">
                          {item.fullName.slice(0, 1).toUpperCase()}
                        </div>
                        <p className="font-bold text-zinc-900">{item.fullName}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-zinc-700">{item.email}</p>
                      <p className="text-[10px] text-zinc-400 font-mono">{item.phone || 'Chưa có SĐT'}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {item.role === 'CUSTOMER' ? (
                        <span className="flex items-center gap-1 text-orange-500 font-bold text-xs">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          {item.loyaltyPoints} điểm
                        </span>
                      ) : (
                        <span className="text-zinc-300 italic text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {item.role === 'CUSTOMER' ? (
                        <span className="inline-flex items-center rounded-full bg-orange-50 px-2.5 py-0.5 text-[10px] font-bold text-orange-600 uppercase border border-orange-100">
                          {item.loyaltyTier || 'BRONZE'}
                        </span>
                      ) : (
                        <span className="text-zinc-300 italic text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {updatingId === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                        ) : (
                          <select
                            value={item.role}
                            onChange={(e) => changeRole(item.id, e.target.value)}
                            disabled={user?.id === item.id} // prevent self-demoting
                            className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold outline-none focus:border-orange-500 cursor-pointer disabled:opacity-50"
                          >
                            <option value="CUSTOMER">Khách hàng (Customer)</option>
                            <option value="SHIPPER">Vận chuyển (Shipper)</option>
                            <option value="ADMIN">Quản trị viên (Admin)</option>
                          </select>
                        )}
                      </div>
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
