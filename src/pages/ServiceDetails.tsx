import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, Star, Clock, Users, CheckCircle, Instagram, Facebook, Youtube, Linkedin, Twitter, Globe, X } from 'lucide-react';
import { serviceProviderService, ServiceProvider } from '../services/serviceProviderService';
import { showToast } from '../utils/toast';
import { AnimatePresence, motion } from 'framer-motion';
import { ShareButton } from '../components/ShareButton';
import { generateWhatsAppLink } from '../utils/whatsapp';
import { updateMetaTags, resetMetaTags } from '../utils/metaTags';
import { reviewService } from '../services/reviewService';
import { useAuth } from '../contexts/AuthContext';
import { Database } from '../lib/database.types';
import { supabase } from '../lib/supabase';

type Review = Database['public']['Tables']['reviews']['Row'];

const ServiceDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [service, setService] = useState<ServiceProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    if (id) {
      // Force fresh fetch by clearing any cached data
      setService(null);
      setLoading(true);
      fetchService();
      fetchReviews();
      fetchAverageRating();
    }
    
    // Reset meta tags when component unmounts
    return () => {
      resetMetaTags();
    };
  }, [id]);

  const fetchService = async () => {
    try {
      setLoading(true);
      const data = await serviceProviderService.getProviderById(id!);
      console.log('Service data loaded:', data);
      console.log('Service Areas:', data?.service_areas);
      console.log('Contact Person:', data?.contact_person);
      console.log('Phone:', data?.phone);
      console.log('Email:', data?.email);
      console.log('Images:', data?.images);
      console.log('Portfolio images:', data?.portfolio_images);
      setService(data);
      
      // Update meta tags for social media sharing
      if (data) {
        const serviceImage = data.portfolio_images?.[0] || data.images?.[0] || 'https://neighbourfriendly.in/og-image.png';
        updateMetaTags({
          title: data.business_name,
          description: data.description,
          image: serviceImage,
          url: `https://neighbourfriendly.in/services/${data.id}`,
          type: 'product',
          price: data.base_price,
          currency: 'INR'
        });
      }
    } catch (error) {
      console.error('Error fetching service:', error);
      showToast.error('Failed to load service details');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          user:profiles(id, full_name, avatar_url)
        `)
        .eq('service_id', id!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    }
  };

  const fetchAverageRating = async () => {
    try {
      const { average, count } = await reviewService.getAverageRating('service', id!);
      setAverageRating(average);
      setReviewCount(count);
    } catch (error) {
      console.error('Error fetching average rating:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!user || !profile) {
      showToast.error('Please login to submit a review');
      navigate('/login');
      return;
    }

    if (!newReview.comment.trim()) {
      showToast.error('Please write a comment');
      return;
    }

    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          service_id: id!,
          user_id: user.id,
          user_name: profile.full_name || 'Anonymous',
          rating: newReview.rating,
          comment: newReview.comment,
        });

      if (error) throw error;

      showToast.success('Review submitted successfully!');
      setNewReview({ rating: 5, comment: '' });
      setShowReviewForm(false);
      fetchReviews();
      fetchAverageRating();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      showToast.error(error.message || 'Failed to submit review');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Service not found</h2>
          <button
            onClick={() => navigate('/services')}
            className="text-amber-600 hover:underline"
          >
            Back to Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            {((service.portfolio_images && service.portfolio_images.length > 0) || 
              (service.images && service.images.length > 0)) && (
              <div className="bg-gradient-to-br from-white to-amber-50 rounded-xl shadow-lg border border-yellow-100 overflow-hidden">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2">
                  {(service.portfolio_images || service.images || []).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${service.business_name} ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setSelectedImage(image)}
                      onError={(e) => {
                        console.error('Image failed to load:', image);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Image Modal */}
            <AnimatePresence>
              {selectedImage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedImage(null)}
                  className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                >
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                  <motion.img
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    src={selectedImage}
                    alt="Full size"
                    className="max-w-full max-h-full object-contain"
                    onClick={(e) => e.stopPropagation()}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Business Info */}
            <div className="bg-gradient-to-br from-white to-amber-50 rounded-xl shadow-lg border border-yellow-100 p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {service.business_name}
                  </h1>
                  <p className="text-lg text-gray-600">{service.tagline}</p>
                </div>
                <div className="flex items-center gap-2">
                  {service.verified && (
                    <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-semibold">Verified</span>
                    </div>
                  )}
                  <ShareButton
                    url={window.location.href}
                    title={service.business_name}
                    description={service.description}
                    className="flex-shrink-0"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-semibold">{service.rating || 5.0}</span>
                  <span className="text-gray-600">({reviews.length} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span>{service.city}, {service.state}</span>
                </div>
              </div>

              <div className="border-t pt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
                <p className="text-gray-700 leading-relaxed">{service.description}</p>
              </div>

              {/* Services Offered */}
              {service.services && service.services.length > 0 && (
                <div className="border-t pt-6 mt-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Services Offered</h2>
                  <div className="flex flex-wrap gap-2">
                    {service.services.map((svc, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-primary/10 text-amber-600 rounded-lg font-medium"
                      >
                        {svc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              <div className="border-t pt-6 mt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Experience</h2>
                <div className="grid grid-cols-2 gap-4">
                  {service.years_experience && (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Clock className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{service.years_experience}+</p>
                        <p className="text-sm text-gray-600">Years Experience</p>
                      </div>
                    </div>
                  )}
                  {service.team_size && (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{service.team_size}</p>
                        <p className="text-sm text-gray-600">Team Members</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Social Media */}
              {(service.instagram_url || service.facebook_url || service.youtube_url || service.linkedin_url || service.twitter_url || service.website_url) && (
                <div className="border-t pt-6 mt-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Connect With Us</h2>
                  <div className="flex flex-wrap gap-3">
                    {service.instagram_url && (
                      <a
                        href={service.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition-colors"
                      >
                        <Instagram className="w-5 h-5" />
                        Instagram
                      </a>
                    )}
                    {service.facebook_url && (
                      <a
                        href={service.facebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Facebook className="w-5 h-5" />
                        Facebook
                      </a>
                    )}
                    {service.youtube_url && (
                      <a
                        href={service.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <Youtube className="w-5 h-5" />
                        YouTube
                      </a>
                    )}
                    {service.linkedin_url && (
                      <a
                        href={service.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Linkedin className="w-5 h-5" />
                        LinkedIn
                      </a>
                    )}
                    {service.twitter_url && (
                      <a
                        href={service.twitter_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-sky-100 text-sky-600 rounded-lg hover:bg-sky-200 transition-colors"
                      >
                        <Twitter className="w-5 h-5" />
                        Twitter
                      </a>
                    )}
                    {service.website_url && (
                      <a
                        href={service.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Globe className="w-5 h-5" />
                        Website
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-gradient-to-br from-white to-amber-50 rounded-xl shadow-lg border border-yellow-100 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-amber-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <a href={`tel:${service.phone}`} className="text-gray-900 font-semibold hover:text-amber-600">
                      {service.phone}
                    </a>
                  </div>
                </div>

                {service.whatsapp && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-green-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">WhatsApp</p>
                      <a 
                        href={generateWhatsAppLink(service.whatsapp, 'service', service.business_name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-900 font-semibold hover:text-green-600"
                      >
                        {service.whatsapp}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-amber-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <a href={`mailto:${service.email}`} className="text-gray-900 font-semibold hover:text-amber-600 break-all">
                      {service.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-amber-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Service Areas</p>
                    <p className="text-gray-900 font-semibold">
                      {service.service_areas && service.service_areas.length > 0 
                        ? `${service.service_areas.join(', ')}, ${service.state}`
                        : `${service.city}, ${service.state}`}
                    </p>
                  </div>
                </div>
              </div>

              {service.base_price && (
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-gray-600 mb-2">Starting from</p>
                  <p className="text-3xl font-bold text-amber-600">₹{service.base_price}</p>
                  <p className="text-sm text-gray-600">{service.pricing_model}</p>
                </div>
              )}

              <button
                onClick={() => window.open(generateWhatsAppLink(service.whatsapp || service.phone, 'service', service.business_name), '_blank')}
                className="w-full mt-6 bg-gradient-to-r from-primary to-accent text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Contact on WhatsApp
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8 bg-gradient-to-br from-white to-amber-50 rounded-xl shadow-lg border border-yellow-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
            {user && (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Write a Review
              </button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Share your experience</h3>
              
              {/* Star Rating */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-600">Rating:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= newReview.rating
                            ? 'text-yellow-500 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-900">{newReview.rating}/5</span>
              </div>

              {/* Comment */}
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                placeholder="Tell us about your experience..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                rows={4}
              />

              {/* Buttons */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleSubmitReview}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Submit Review
                </button>
                <button
                  onClick={() => {
                    setShowReviewForm(false);
                    setNewReview({ rating: 5, comment: '' });
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No reviews yet</p>
              <p className="text-gray-400 text-sm">Be the first to review this service!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {review.user?.avatar_url ? (
                        <img
                          src={review.user.avatar_url}
                          alt={review.user.full_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-semibold">
                            {(review.user?.full_name || review.user_name || 'A')[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">
                          {review.user?.full_name || review.user_name || 'Anonymous'}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating
                                    ? 'text-yellow-500 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-gray-700 mt-2 leading-relaxed">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
