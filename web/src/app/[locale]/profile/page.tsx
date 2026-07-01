'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/store/auth-store';
import { useTranslations } from 'next-intl';
import { User, Phone, Mail, Award, MapPin, Plus, Trash, Check, ArrowLeft, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Address {
  id: string;
  name: string;
  phone: string;
  fullAddress: string;
  isDefault: boolean;
}

export default function ProfilePage() {
  const t = useTranslations('profile');
  const tc = useTranslations('common');
  const router = useRouter();
  const { user, accessToken } = useAuthStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/sign-in');
      return;
    }
    // Load addresses from local storage
    const saved = localStorage.getItem(`addresses_${user.id}`);
    if (saved) {
      setAddresses(JSON.parse(saved));
    } else {
      const defaultAddr = [
        {
          id: '1',
          name: user.fullName,
          phone: user.phone || '0901234567',
          fullAddress: '123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
          isDefault: true,
        },
      ];
      setAddresses(defaultAddr);
      localStorage.setItem(`addresses_${user.id}`, JSON.stringify(defaultAddr));
    }
  }, [user]);

  const saveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone || !newAddress) return;

    const newAddr: Address = {
      id: Date.now().toString(),
      name: newName,
      phone: newPhone,
      fullAddress: newAddress,
      isDefault: addresses.length === 0, // default if first
    };

    const updated = [...addresses, newAddr];
    setAddresses(updated);
    if (user) {
      localStorage.setItem(`addresses_${user.id}`, JSON.stringify(updated));
    }

    setNewName('');
    setNewPhone('');
    setNewAddress('');
    setShowForm(false);
  };

  const deleteAddress = (id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    // If deleted default, make the first remaining default
    if (addresses.find((a) => a.id === id)?.isDefault && updated.length > 0) {
      updated[0].isDefault = true;
    }
    setAddresses(updated);
    if (user) {
      localStorage.setItem(`addresses_${user.id}`, JSON.stringify(updated));
    }
  };

  const setDefaultAddress = (id: string) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    setAddresses(updated);
    if (user) {
      localStorage.setItem(`addresses_${user.id}`, JSON.stringify(updated));
    }
  };

  if (!user) return null;

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-amber-500/5 via-transparent to-transparent py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        
        {/* Navigation Buttons */}
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => router.push('/menu')}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-950 transition font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            {tc('menu')}
          </button>
          
          <button
            onClick={() => router.push('/orders')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-orange-200 bg-orange-50 text-orange-600 font-bold text-xs hover:bg-orange-100 transition cursor-pointer"
          >
            <ClipboardList className="h-4 w-4" />
            Lịch sử đơn hàng
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          
          {/* Left panel: user info card */}
          <div className="md:col-span-1 space-y-6">
            <div className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-xl backdrop-blur-xl text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 font-black text-3xl text-white shadow-md">
                {user.fullName.slice(0, 1).toUpperCase()}
              </div>
              <h2 className="mt-4 font-[family-name:var(--font-heading)] text-xl font-extrabold text-zinc-900 leading-tight">
                {user.fullName}
              </h2>
              <span className="inline-block mt-1.5 rounded-full bg-zinc-900 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                {user.role}
              </span>

              <div className="mt-6 space-y-4 text-left border-t border-zinc-150 pt-5 text-xs text-zinc-650">
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-zinc-400 shrink-0" />
                  <span className="truncate">{user.email || 'Chưa cung cấp email'}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-zinc-400 shrink-0" />
                  <span>{user.phone || 'Chưa cung cấp SĐT'}</span>
                </div>
              </div>
            </div>

            {/* Loyalty tier card */}
            <div className="rounded-3xl border border-white/40 bg-gradient-to-br from-amber-500 to-orange-500 p-6 shadow-xl text-white">
              <div className="flex items-center gap-2.5">
                <Award className="h-6 w-6 text-amber-200 fill-current" />
                <h3 className="font-extrabold font-[family-name:var(--font-heading)] text-lg">
                  {t('tier')}
                </h3>
              </div>
              
              <div className="mt-4">
                <p className="text-3xl font-black tracking-tight">{user.loyaltyTier || 'BRONZE'}</p>
                <p className="text-xs text-orange-100 mt-1">⭐ {user.loyaltyPoints} {t('points')}</p>
              </div>

              {/* Progress to next tier */}
              <div className="mt-5">
                <div className="flex justify-between text-[10px] text-orange-100 font-semibold mb-1">
                  <span>Mức hiện tại</span>
                  <span>TIẾP THEO</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/20 overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-55"
                    style={{ width: `${Math.min((user.loyaltyPoints / 300) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-orange-100 mt-2 text-right">
                  {user.loyaltyPoints < 100 
                    ? `Cần ${100 - user.loyaltyPoints} điểm để lên SILVER` 
                    : user.loyaltyPoints < 300 
                    ? `Cần ${300 - user.loyaltyPoints} điểm để lên GOLD` 
                    : 'Chúc mừng! Bạn đã đạt thứ hạng cao nhất.'}
                </p>
              </div>
            </div>
          </div>

          {/* Right panel: Address Book */}
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-xl backdrop-blur-xl">
              <div className="flex justify-between items-center border-b border-zinc-150 pb-4">
                <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-orange-500" />
                  {t('addressBook')}
                </h3>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 transition cursor-pointer"
                >
                  <Plus className="h-4.5 w-4.5" />
                  <span>{t('addAddress')}</span>
                </button>
              </div>

              {showForm && (
                <form onSubmit={saveAddress} className="mt-4 rounded-2xl border border-orange-100 bg-orange-50/50 p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 mb-1">{tc('fullName')}</label>
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        required
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none focus:border-orange-500"
                        placeholder="Họ và tên"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 mb-1">{t('phone')}</label>
                      <input
                        type="tel"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        required
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none focus:border-orange-500"
                        placeholder="Số điện thoại"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1">{t('title')}</label>
                    <textarea
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      required
                      rows={2}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none focus:border-orange-500 resize-none"
                      placeholder="Số nhà, ngõ/ngách, tên đường, phường/xã, quận/huyện..."
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowForm(false)}
                      className="rounded-xl text-xs"
                    >
                      {tc('cancel')}
                    </Button>
                    <Button
                      type="submit"
                      className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold px-4"
                    >
                      {tc('save')}
                    </Button>
                  </div>
                </form>
              )}

              <div className="mt-4 space-y-4">
                {addresses.length > 0 ? (
                  addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`relative rounded-2xl border p-4 shadow-sm transition-all
                        ${
                          addr.isDefault
                            ? 'border-orange-200 bg-orange-50/20 shadow-orange-500/5'
                            : 'border-zinc-150 bg-white hover:border-zinc-200'
                        }
                      `}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-800 text-sm">{addr.name}</span>
                            <span className="text-zinc-400 text-xs">|</span>
                            <span className="text-zinc-500 text-xs">{addr.phone}</span>
                            {addr.isDefault && (
                              <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[8px] font-bold text-orange-600 uppercase">
                                {t('default')}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-500 mt-2 leading-relaxed">{addr.fullAddress}</p>
                        </div>

                        <div className="flex items-center gap-1 ml-4 shrink-0">
                          {!addr.isDefault && (
                            <button
                              onClick={() => setDefaultAddress(addr.id)}
                              className="rounded-xl border border-zinc-200 bg-white p-1.5 text-zinc-500 hover:border-orange-200 hover:text-orange-500 transition cursor-pointer"
                              title={t('setAsDefault')}
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteAddress(addr.id)}
                            className="rounded-xl border border-red-100 bg-white p-1.5 text-red-500 hover:bg-red-50 transition cursor-pointer"
                            title="Xóa địa chỉ"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-zinc-400 italic text-xs text-center py-6">Sổ địa chỉ đang trống.</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
