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
          <span key={star} className={isFilled ? 'text-yellow-400' : 'text-gray-300'}>
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
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Reviews</h3>
          <div className="flex items-center gap-3 mt-1">
            <Stars rating={average ?? 0} />
            <div className="text-gray-900 font-medium">
              {average != null ? average.toFixed(2) : '0.00'} / 5.0
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1">{total} total review{total === 1 ? '' : 's'}</p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-gray-600">No reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <Stars rating={r.rating} />
                  <div className="text-sm font-medium text-gray-900">{r.citizenName ?? 'Anonymous'}</div>
                </div>
                <div className="text-xs text-gray-500 whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString()}</div>
              </div>
              {r.comment && r.comment.trim() !== '' ? (
                <p className="text-sm text-gray-700 mt-3 whitespace-pre-wrap">{r.comment}</p>
              ) : (
                <p className="text-sm text-gray-500 mt-3">No comment provided.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

