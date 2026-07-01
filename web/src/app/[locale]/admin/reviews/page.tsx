'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { API_URL } from '@/lib/utils';
import { Star, MessageSquare, ArrowLeft, Heart, Sparkles } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    fullName: string;
    email: string;
  };
  product: {
    name: string;
    image: string;
  };
}

export default function AdminReviewsPage() {
  const router = useRouter();
  const { user, accessToken } = useAuthStore();

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState<number | 'ALL'>('ALL');

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_URL}/orders/reviews/admin`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        setReviews(data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/sign-in');
      return;
    }
    fetchReviews();
  }, [user]);

  const filteredReviews = ratingFilter === 'ALL'
    ? reviews
    : reviews.filter((r) => r.rating === ratingFilter);

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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-150 pb-5 mb-6">
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-3xl font-extrabold text-zinc-900 flex items-center gap-2">
              <MessageSquare className="h-7 w-7 text-orange-500 animate-pulse" />
              Quản lý đánh giá (Customer Reviews)
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Điểm đánh giá trung bình:{' '}
              <span className="font-bold text-orange-600 text-sm">
                {(reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1)).toFixed(1)} / 5 ★
              </span>{' '}
              ({reviews.length} đánh giá)
            </p>
          </div>

          {/* Rating filter select tabs */}
          <div className="flex flex-wrap gap-1 bg-zinc-100 p-1 rounded-2xl border border-zinc-200">
            <button
              onClick={() => setRatingFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                ratingFilter === 'ALL' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Tất cả
            </button>
            {[5, 4, 3, 2, 1].map((stars) => (
              <button
                key={stars}
                onClick={() => setRatingFilter(stars)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-0.5 ${
                  ratingFilter === stars ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                {stars} <Star className="h-3 w-3 fill-current text-amber-500" />
              </button>
            ))}
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => {
              const formattedDate = new Date(review.createdAt).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={review.id}
                  className="rounded-3xl border border-white/40 bg-white/70 p-5 shadow-lg backdrop-blur-md flex flex-col justify-between"
                >
                  <div>
                    {/* Header: customer info and star rating */}
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-zinc-800 text-sm">{review.user.fullName}</p>
                        <p className="text-[10px] text-zinc-400 font-medium">{review.user.email}</p>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4.5 w-4.5 ${
                              star <= review.rating
                                ? 'text-amber-500 fill-current'
                                : 'text-zinc-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Product targeted info */}
                    <div className="mt-3.5 flex items-center gap-2.5 rounded-xl bg-orange-50/50 border border-orange-100 p-2">
                      <div className="relative h-9 w-9 overflow-hidden rounded-lg bg-zinc-50 border border-zinc-100">
                        {review.product.image ? (
                          <img src={review.product.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-zinc-300 text-[8px]">No img</div>
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-450 font-bold block">SẢN PHẨM</span>
                        <span className="text-xs font-bold text-zinc-800">{review.product.name}</span>
                      </div>
                    </div>

                    {/* Comment feedback */}
                    <p className="mt-3.5 text-xs text-zinc-650 leading-relaxed italic">
                      "{review.comment || 'Khách hàng không để lại nhận xét bằng lời.'}"
                    </p>
                  </div>

                  {/* Date and verified icon */}
                  <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400">
                    <span>Gửi lúc: {formattedDate}</span>
                    <span className="flex items-center gap-1 font-bold text-green-600">
                      <Sparkles className="h-3 w-3" />
                      Đã xác thực mua hàng
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="md:col-span-2 text-center rounded-3xl border border-white/40 bg-white/70 p-12 shadow-xl backdrop-blur-xl">
              <MessageSquare className="mx-auto h-12 w-12 text-zinc-350" />
              <p className="text-zinc-400 italic text-xs mt-4">Chưa có đánh giá nào tương ứng với tiêu chí lọc.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
