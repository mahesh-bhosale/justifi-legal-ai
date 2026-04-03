'use client';

import Card from './Card';
import type { LawyerReviewStats, Review } from '@/lib/reviews';

interface ReviewListProps {
  stats: LawyerReviewStats | null;
  reviews: Review[];
}

function Stars({ rating }: { rating: number }) {
  const filled = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, idx) => {
        const star = idx + 1;
        const isFilled = star <= filled;
        return (
          <span key={star} className={isFilled ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}>
            ★
          </span>
        );
      })}
    </span>
  );
}

export default function ReviewList({ stats, reviews }: ReviewListProps) {
  const average = stats?.averageRating ?? null;
  const total = stats?.totalReviews ?? reviews.length;

  return (
    <Card className="p-8 dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-lg">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Testimonials</h3>
          <div className="flex items-center gap-4 mt-3">
            <div className="bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-lg border border-amber-100 dark:border-amber-900/30 flex items-center gap-2">
              <Stars rating={average ?? 0} />
              <div className="text-gray-900 dark:text-white font-black text-lg">
                {average != null ? average.toFixed(1) : '0.0'}
              </div>
            </div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{total} authenticated review{total === 1 ? '' : 's'}</p>
          </div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">No testimonials documented yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((r) => (
            <div key={r.id} className="border-b last:border-0 border-gray-100 dark:border-gray-800 pb-6 last:pb-0">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="space-y-2">
                  <Stars rating={r.rating} />
                  <div className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">{r.citizenName ?? 'Institutional Client'}</div>
                </div>
                <div className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{new Date(r.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</div>
              </div>
              {r.comment && r.comment.trim() !== '' ? (
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed italic border-l-2 border-amber-600 dark:border-amber-500 pl-4 py-1">
                  &ldquo;{r.comment}&rdquo;
                </p>
              ) : (
                <p className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest italic pt-2">No qualitative feedback provided.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

