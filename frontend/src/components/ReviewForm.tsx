'use client';

import { useState } from 'react';
import Button from './Button';
import { createReview, type CreateReviewInput } from '../lib/reviews';

interface ReviewFormProps {
  caseId: number;
  lawyerId: string;
  onSubmitSuccess: () => void;
  onCancel: () => void;
}

export default function ReviewForm({ caseId, lawyerId, onSubmitSuccess, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    try {
      setLoading(true);
      const reviewData: CreateReviewInput = {
        caseId,
        lawyerId,
        rating,
        comment: comment.trim()
      };

      await createReview(reviewData);
      onSubmitSuccess();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating *
        </label>
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingChange(star)}
              className={`p-1 rounded-full transition-colors ${
                star <= rating
                  ? 'text-yellow-400 hover:text-yellow-500'
                  : 'text-gray-300 hover:text-gray-400'
              }`}
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {rating === 0 && 'Click on a star to rate'}
          {rating === 1 && 'Poor'}
          {rating === 2 && 'Fair'}
          {rating === 3 && 'Good'}
          {rating === 4 && 'Very Good'}
          {rating === 5 && 'Excellent'}
        </p>
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
          Review Comment
        </label>
        <textarea
          id="comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this lawyer (optional)"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          {comment.length}/500 characters
        </p>
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading || rating === 0}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </Button>
      </div>
    </form>
  );
}
