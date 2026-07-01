'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { formatPrice } from '@/lib/utils';
import { API_URL } from '@/lib/utils';
import { Plus, Edit2, Trash2, ArrowLeft, Package, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number | string;
  image: string;
  categoryId: string;
  isAvailable: boolean;
  isFeatured: boolean;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const { user, accessToken } = useAuthStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState(0);
  const [image, setImage] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  const fetchData = async () => {
    try {
      const prodRes = await fetch(`${API_URL}/products?limit=100`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const prodData = await prodRes.json();

      const catRes = await fetch(`${API_URL}/categories`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const catData = await catRes.json();

      if (prodRes.ok && catRes.ok) {
        setProducts(prodData.items);
        setCategories(catData);
      }
    } catch (err) {
      console.error('Error loading products CRUD data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/sign-in');
      return;
    }
    fetchData();
  }, [user]);

  const generateSlug = (val: string) => {
    return val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingId) {
      setSlug(generateSlug(val));
    }
  };

  const openAddForm = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setBasePrice(30000);
    setImage('https://images.unsplash.com/photo-1576092768241-dec2318790d1?w=600');
    setCategoryId(categories[0]?.id || '');
    setIsAvailable(true);
    setIsFeatured(false);
    setShowForm(true);
  };

  const openEditForm = (prod: Product) => {
    setEditingId(prod.id);
    setName(prod.name);
    setSlug(prod.slug);
    setDescription(prod.description || '');
    setBasePrice(typeof prod.basePrice === 'string' ? parseFloat(prod.basePrice) : prod.basePrice);
    setImage(prod.image || '');
    setCategoryId(prod.categoryId || '');
    setIsAvailable(prod.isAvailable);
    setIsFeatured(prod.isFeatured);
    setShowForm(true);
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    const payload = {
      name,
      slug,
      description,
      basePrice: Number(basePrice),
      image,
      categoryId,
      isAvailable,
      isFeatured,
    };

    try {
      const url = editingId ? `${API_URL}/products/${editingId}` : `${API_URL}/products`;
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowForm(false);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.message || 'Lỗi lưu thông tin sản phẩm');
      }
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi kết nối');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa món này không?')) return;
    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (res.ok) {
        fetchData();
      } else {
        alert('Không thể xóa món này. Món có thể đã nằm trong một số đơn hàng đã đặt.');
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
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* Navigation back */}
        <Link href="/admin" className="mb-6 inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-950 transition font-medium">
          <ArrowLeft className="h-4 w-4" />
          Quay lại Dashboard
        </Link>

        {/* Heading */}
        <div className="flex justify-between items-center border-b border-zinc-150 pb-5 mb-6">
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-3xl font-extrabold text-zinc-900 flex items-center gap-2">
              <Package className="h-7 w-7 text-orange-500" />
              Quản lý sản phẩm (CRUD Menu)
            </h1>
            <p className="text-xs text-zinc-400 mt-1">Tổng số món ăn/nước uống: {products.length}</p>
          </div>
          <Button
            onClick={openAddForm}
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold px-4"
          >
            <Plus className="mr-1 h-4 w-4" />
            Thêm món mới
          </Button>
        </div>

        {/* POPUP / ACCORDION ADD-EDIT FORM */}
        {showForm && (
          <div className="mb-8 rounded-3xl border border-orange-200 bg-orange-50/20 p-6 shadow-xl backdrop-blur-md">
            <h3 className="text-base font-bold text-zinc-900 mb-4 flex items-center gap-1.5 border-b border-orange-100 pb-2">
              <Package className="h-4.5 w-4.5 text-orange-500" />
              {editingId ? 'Chỉnh sửa món ăn' : 'Thêm món ăn mới'}
            </h3>
            
            <form onSubmit={saveProduct} className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1">Tên món</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs outline-none focus:border-orange-500"
                  placeholder="Ví dụ: Trà sữa thái xanh"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1">Slug (Đường dẫn tĩnh)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs outline-none focus:border-orange-500"
                  placeholder="Ví dụ: tra-sua-thai-xanh"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-zinc-600 mb-1">Mô tả sản phẩm</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none focus:border-orange-500 resize-none"
                  placeholder="Mô tả hương vị, nguyên liệu..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1">Giá bán cơ bản (VND)</label>
                <input
                  type="number"
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  required
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1">Link ảnh sản phẩm</label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  required
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1">Danh mục món ăn</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs outline-none focus:border-orange-500"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-6 items-center pt-5">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-zinc-650">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-orange-500 focus:ring-orange-400 cursor-pointer"
                  />
                  Còn hàng (Available)
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-zinc-650">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-orange-500 focus:ring-orange-400 cursor-pointer"
                  />
                  Món bán chạy (Featured)
                </label>
              </div>

              <div className="md:col-span-2 flex justify-end gap-2.5 border-t border-orange-100 pt-4 mt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl text-xs"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Hủy'}
                </Button>
                <Button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold px-6"
                >
                  Lưu thay đổi
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* PRODUCTS TABLE VIEW */}
        <div className="rounded-3xl border border-white/40 bg-white/70 p-5 shadow-lg backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-150/50">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-zinc-800">Hình ảnh</th>
                  <th className="px-4 py-3 text-left font-bold text-zinc-800">Tên món</th>
                  <th className="px-4 py-3 text-left font-bold text-zinc-800">Giá cơ bản</th>
                  <th className="px-4 py-3 text-left font-bold text-zinc-800">Trạng thái</th>
                  <th className="px-4 py-3 text-left font-bold text-zinc-800">Bán chạy</th>
                  <th className="px-4 py-3 text-center font-bold text-zinc-800">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {products.map((prod) => {
                  const basePrice = typeof prod.basePrice === 'string' ? parseFloat(prod.basePrice) : prod.basePrice;
                  return (
                    <tr key={prod.id} className="hover:bg-zinc-50/50">
                      <td className="px-4 py-3">
                        <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50 shadow-sm">
                          {prod.image ? (
                            <img src={prod.image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-zinc-300 text-[10px]">No img</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 min-w-[150px]">
                        <p className="font-bold text-zinc-900">{prod.name}</p>
                        <p className="text-[10px] text-zinc-400 font-mono">{prod.slug}</p>
                      </td>
                      <td className="px-4 py-3 font-bold text-orange-600">{formatPrice(basePrice)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold
                            ${
                              prod.isAvailable
                                ? 'bg-green-50 border-green-200 text-green-700'
                                : 'bg-red-50 border-red-200 text-red-700'
                            }
                          `}
                        >
                          {prod.isAvailable ? 'Còn hàng' : 'Hết hàng'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {prod.isFeatured ? (
                          <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-extrabold text-orange-700">
                            ★ HOT
                          </span>
                        ) : (
                          <span className="text-zinc-300 italic text-[10px]">Thường</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center items-center gap-1.5">
                          <button
                            onClick={() => openEditForm(prod)}
                            className="rounded-lg border border-zinc-200 bg-white p-1.5 text-zinc-600 hover:border-orange-200 hover:text-orange-500 transition cursor-pointer"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => deleteProduct(prod.id)}
                            className="rounded-lg border border-red-100 bg-white p-1.5 text-red-500 hover:bg-red-50 transition cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
