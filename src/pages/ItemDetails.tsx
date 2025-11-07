import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, User, MessageCircle, AlertCircle, ArrowLeft, Star, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { listingService } from '../services/listingService';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../utils/toast';
import { ShareButton } from '../components/ShareButton';
import { reviewService } from '../services/reviewService';
import { formatPricingModel } from '../utils/pricing';
import { updateMetaTags, resetMetaTags } from '../utils/metaTags';
import { Database } from '../lib/database.types';
import { supabase } from '../lib/supabase';

type Listing = Database['public']['Tables']['listings']['Row'];
type Review = Database['public']['Tables']['reviews']['Row'];

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile, isAdmin } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showFullImage, setShowFullImage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    if (id) {
      fetchListing();
      fetchReviews();
      fetchAverageRating();
    }
    
    // Reset meta tags when component unmounts
    return () => {
      resetMetaTags();
    };
  }, [id, user]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const data = await listingService.getListingById(id!);
      setListing(data);
      
      // Update meta tags for social media sharing
      if (data) {
        updateMetaTags({
          title: data.title,
          description: data.description,
          image: data.images[0] || 'https://neighbourfriendly.in/og-image.png',
          url: `https://neighbourfriendly.in/item/${data.id}`,
          type: 'product',
          price: data.price,
          currency: 'INR'
        });
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const data = await reviewService.getListingReviews(id!);
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchAverageRating = async () => {
    try {
      const { average, count } = await reviewService.getAverageRating('item', id!);
      setAverageRating(average);
      setReviewCount(count);
    } catch (error) {
      console.error('Error fetching average rating:', error);
    }
  };


  const handleBookNow = () => {
    if (!user) {
      showToast.error('Please login to book this item');
      navigate('/login');
      return;
    }
    navigate(`/book/${id}`);
  };

  const handleSubmitReview = async () => {
    if (!user || !profile) {
      showToast.error('Please login to leave a review');
      navigate('/login');
      return;
    }

    if (!newReview.comment.trim()) {
      showToast.error('Please write a comment');
      return;
    }

    try {
      // Check if user has actually rented this item
      const { data: bookings, error: bookingError } = await supabase
        .from('bookings')
        .select('id, status')
        .eq('listing_id', id!)
        .eq('renter_id', user.id)
        .in('status', ['confirmed', 'completed']);

      if (bookingError) throw bookingError;

      if (!bookings || bookings.length === 0) {
        showToast.error('You can only review items you have rented');
        setShowReviewForm(false);
        return;
      }

      await reviewService.createReview({
        listing_id: id!,
        user_id: user.id,
        user_name: profile.full_name || profile.email,
        rating: newReview.rating,
        comment: newReview.comment,
      });

      showToast.success('Review submitted successfully!');
      setShowReviewForm(false);
      setNewReview({ rating: 5, comment: '' });
      fetchReviews();
      fetchAverageRating();
    } catch (error) {
      console.error('Error submitting review:', error);
      showToast.error('Failed to submit review. Please try again.');
    }
  };

  const handleContactOwner = () => {
    if (!user) {
      showToast.error('Please login to contact the owner');
      navigate('/login');
      return;
    }
    // Navigate to chat with this listing
    navigate(`/chat?listing=${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If item not found, show error message
  if (!listing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Item Not Found</h1>
          <p className="text-gray-600 mb-6">The item you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/listings')}
            className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white px-6 py-3 rounded-lg hover:shadow-xl hover:scale-105 transition-colors"
          >
            Back to Listings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Listings
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Section - Compact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* Main Image - Smaller */}
            <div className="relative aspect-square max-w-md rounded-lg overflow-hidden bg-white shadow-md cursor-pointer"
                 onClick={() => setShowFullImage(true)}>
              <img
                src={listing.images[selectedImage] || '/placeholder.jpg'}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                Click to enlarge
              </div>
            </div>

            {/* Thumbnail Images */}
            {listing.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {listing.images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-primary' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${listing.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Description</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{listing.description}</p>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Reviews & Ratings</h2>
                {reviewCount > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.round(averageRating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-semibold">{averageRating}</span>
                    <span className="text-gray-500">({reviewCount} reviews)</span>
                  </div>
                )}
              </div>

              {/* Add Review Button */}
              {user && user.id !== listing.owner_id && (
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="mb-4 text-amber-600 hover:text-amber-600/80 font-medium flex items-center gap-2"
                >
                  <Star className="w-4 h-4" />
                  Write a Review
                </button>
              )}

              {/* Review Form */}
              {showReviewForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 p-4 border border-gray-200 rounded-lg"
                >
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setNewReview({ ...newReview, rating })}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              rating <= newReview.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comment
                    </label>
                    <textarea
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Share your experience with this item..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSubmitReview}
                      className="px-4 py-2 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white rounded-lg hover:shadow-xl hover:scale-105 transition-colors"
                    >
                      Submit Review
                    </button>
                    <button
                      onClick={() => setShowReviewForm(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{review.user_name}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-gray-600 mt-2">{review.comment}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>

          {/* Details Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="mb-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{listing.title}</h1>
                  <ShareButton
                    url={window.location.href}
                    title={listing.title}
                    description={listing.description}
                    className="flex-shrink-0"
                  />
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                    {listing.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{listing.location}</span>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="border-t border-gray-200 pt-4">
                <div className="text-4xl font-bold text-amber-600 mb-2">
                  ₹{listing.price}
                  <span className="text-lg text-gray-600 font-normal">{formatPricingModel(listing.pricing_model)}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    listing.availability === 'Available' 
                      ? 'bg-amber-100 text-amber-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {listing.availability}
                  </span>
                  <span>Condition: {listing.condition}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {user && user.id === listing.owner_id ? (
                // Owner sees Edit/Delete buttons
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/edit-item/${listing.id}`)}
                    className="w-full bg-gradient-to-r from-primary to-accent text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-5 h-5" />
                    Edit Listing
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to delete this listing?')) {
                        try {
                          await listingService.deleteListing(listing.id);
                          showToast.success('Listing deleted successfully');
                          navigate('/dashboard');
                        } catch {
                          showToast.error('Failed to delete listing');
                        }
                      }
                    }}
                    className="w-full bg-red-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                  >
                    Delete Listing
                  </motion.button>
                </>
              ) : (
                // Non-owners see Book Now and Contact buttons
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBookNow}
                    className="w-full bg-gradient-to-r from-primary to-accent text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-5 h-5" />
                    Book Now
                  </motion.button>
                  
                  {user && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleContactOwner}
                      className="w-full bg-white border-2 border-amber-500 text-amber-600 py-4 rounded-xl font-semibold text-lg hover:bg-amber-600/5 transition-all flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Contact Owner
                    </motion.button>
                  )}
                </>
              )}
            </div>

            {/* Owner Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Owner Information
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Name:</span>
                  <span className="text-gray-600">{listing.owner_name}</span>
                </div>
                
                {/* Show contact info only to admins */}
                {isAdmin ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">Contact:</span>
                      <span className="text-gray-600">{listing.contact_info}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">{listing.location}</span>
                    </div>
                  </>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                    <p className="text-sm text-blue-800">
                      🔒 Contact details are private. Admin will coordinate the handover.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Safety Info */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Safety Tips</p>
                  <ul className="space-y-1 text-blue-700">
                    <li>• Meet in a safe, public location</li>
                    <li>• Inspect the item before renting</li>
                    <li>• Keep all communication on platform</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {showFullImage && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFullImage(false)}
        >
          <button
            onClick={() => setShowFullImage(false)}
            className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={listing.images[selectedImage] || '/placeholder.jpg'}
            alt={listing.title}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {listing.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {listing.images.map((_, index: number) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    selectedImage === index ? 'bg-white w-8' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ItemDetails;
