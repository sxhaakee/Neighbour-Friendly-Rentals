import { useState, useEffect } from 'react';
import { Star, ThumbsUp, Flag, MessageSquare } from 'lucide-react';
import { reviewService, Review } from '../services/reviewService';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../utils/toast';
import { motion, AnimatePresence } from 'framer-motion';

interface ReviewSectionProps {
  type: 'item' | 'property' | 'service';
  id: string;
  ownerId: string;
}

export const ReviewSection = ({ type, id, ownerId }: ReviewSectionProps) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddReview, setShowAddReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [type, id]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      let data: Review[] = [];
      if (type === 'item') {
        data = await reviewService.getListingReviews(id);
      } else if (type === 'property') {
        data = await reviewService.getListingReviews(id);
      } else {
        data = await reviewService.getListingReviews(id);
      }
      setReviews(data || []);
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      // Silently fail - reviews are optional
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      showToast.error('Please sign in to leave a review');
      return;
    }

    if (!comment.trim()) {
      showToast.error('Please write a comment');
      return;
    }

    try {
      setSubmitting(true);
      const reviewData: any = {
        user_id: user.id,
        rating,
        comment: comment.trim(),
      };

      if (type === 'item') reviewData.listing_id = id;
      else if (type === 'property') reviewData.property_id = id;
      else reviewData.service_id = id;

      await reviewService.createReview(reviewData);
      showToast.success('Review submitted successfully!');
      setComment('');
      setRating(5);
      setShowAddReview(false);
      fetchReviews();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      showToast.error(error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    if (!user) {
      showToast.error('Please sign in to vote');
      return;
    }

    try {
      await reviewService.markHelpful(reviewId, user.id);
      showToast.success('Marked as helpful');
      fetchReviews();
    } catch (error) {
      console.error('Error marking helpful:', error);
      showToast.error('Failed to mark as helpful');
    }
  };

  const handleReport = async (reviewId: string) => {
    if (!user) {
      showToast.error('Please sign in to report');
      return;
    }

    if (confirm('Are you sure you want to report this review?')) {
      try {
        await reviewService.reportReview(reviewId);
        showToast.success('Review reported');
      } catch (error) {
        console.error('Error reporting review:', error);
        showToast.error('Failed to report review');
      }
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= averageRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-lg font-semibold text-gray-700">
              {averageRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </div>

        {user && user.id !== ownerId && (
          <button
            onClick={() => setShowAddReview(!showAddReview)}
            className="px-4 py-2 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Add Review Form */}
      <AnimatePresence>
        {showAddReview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-gray-50 rounded-lg"
          >
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 cursor-pointer transition-colors ${
                        star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmitReview}
                disabled={submitting}
                className="px-6 py-2 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                onClick={() => setShowAddReview(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No reviews yet</p>
            <p className="text-gray-400 text-sm">Be the first to leave a review!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-amber-600 font-bold">
                      {review.user?.full_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {review.user?.full_name || 'Anonymous'}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                      {review.verified_rental && (
                        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-semibold">
                          Verified Rental
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleMarkHelpful(review.id)}
                    className="flex items-center gap-1 text-gray-500 hover:text-amber-600 transition-colors"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-sm">{review.helpful_count}</span>
                  </button>
                  <button
                    onClick={() => handleReport(review.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-gray-700 mb-2">{review.comment}</p>

              {review.owner_response && (
                <div className="mt-3 ml-8 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900 mb-1">Owner Response:</p>
                  <p className="text-sm text-blue-800">{review.owner_response}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    {new Date(review.owner_response_date!).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
