'use client';

import { useState } from 'react';
import { Link, useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { API_URL } from '@/lib/utils';
import { Lock, Mail, User, Phone, Loader2, Sparkles } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Register user
      const registerRes = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, phone, password }),
      });

      if (!registerRes.ok) {
        const data = await registerRes.json();
        throw new Error(data.message || 'Đăng ký thất bại');
      }

      const { accessToken, refreshToken } = await registerRes.json();

      // 2. Fetch user profile
      const profileRes = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!profileRes.ok) {
        throw new Error('Không thể lấy thông tin đăng ký');
      }

      const user = await profileRes.json();

      // 3. Save auth state
      setAuth(user, accessToken, refreshToken);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-yellow-600/20 px-4">
      {/* Background blobs for Glassmorphism effect */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-orange-400/20 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-amber-400/25 blur-3xl" />

      <div className="z-10 w-full max-w-md rounded-3xl border border-white/30 bg-white/70 p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white shadow-lg shadow-orange-500/30">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-[family-name:var(--font-heading)] text-2xl font-extrabold text-zinc-900">
            Đăng ký tài khoản
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Tạo tài khoản để thưởng thức trà sữa & đồ ăn vặt cực ngon
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-center text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-zinc-700">Họ và tên</label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="h-11 w-full rounded-xl border border-zinc-200 bg-white/50 pl-10 pr-4 text-sm outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700">Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="h-11 w-full rounded-xl border border-zinc-200 bg-white/50 pl-10 pr-4 text-sm outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700">Số điện thoại</label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0901234567"
                className="h-11 w-full rounded-xl border border-zinc-200 bg-white/50 pl-10 pr-4 text-sm outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700">Mật khẩu</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="h-11 w-full rounded-xl border border-zinc-200 bg-white/50 pl-10 pr-4 text-sm outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 font-bold text-white shadow-lg shadow-orange-500/25 transition-all hover:opacity-95"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tạo tài khoản...
              </>
            ) : (
              'Đăng ký'
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Đã có tài khoản?{' '}
          <Link href="/sign-in" className="font-semibold text-orange-600 hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
