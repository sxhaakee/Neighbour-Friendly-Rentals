import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Plus, Tag, DollarSign, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { listingService } from '../services/listingService';
import { compressImages } from '../utils/imageCompression';
import { showToast } from '../utils/toast';
import { PremiumUpgradeModal } from '../components/PremiumUpgradeModal';
import { notificationService } from '../services/notificationService';

const AddItem = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, canAddListing, listingCounts } = useAuth();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Tools',
    price: '',
    pricing_model: 'per_day',
    location: '',
    latitude: null as number | null,
    longitude: null as number | null,
    condition: 'Good',
    contactInfo: '',
    availability: 'Available'
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect if not logged in
    if (authLoading) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    // Check if user can add more items
    if (!canAddListing('item')) {
      setShowPremiumModal(true);
    }

    // Get user location for tracking
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({ ...prev, latitude, longitude }));

          // Try to reverse geocode to fill the location field
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const city = data.address.city || data.address.town || data.address.village || data.address.state_district;
            const state = data.address.state;
            if (city && state) {
              setFormData(prev => ({ ...prev, location: `${city}, ${state}` }));
            }
          } catch (error) {
            console.error('Error auto-filling location:', error);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, [user, authLoading, navigate, canAddListing]);

  const categories = [
    'Electronics',
    'Cameras & Photography',
    'Tools & Equipment',
    'Vehicles',
    'Sports & Fitness',
    'Musical Instruments',
    'Furniture',
    'Appliances',
    'Books',
    'Media',
    'Clothing & Accessories',
    'Party & Events',
    'Gaming & Consoles',
    'Outdoor & Camping',
    'Baby & Kids',
    'Medical & Health',
    'Miscellaneous'
  ];
  const conditions = ['Excellent', 'Good', 'Fair', 'Poor'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    if (images.length + files.length > 4) {
      showToast.error('Maximum 4 images allowed per listing');
      return;
    }

    const toastId = showToast.loading('Compressing images...');

    try {
      // Compress images to save storage (100KB max per image)
      const compressedFiles = await compressImages(files, {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.7,
        maxSizeMB: 0.1, // 100KB max per image for better storage optimization
      });

      const newImages = [...images, ...compressedFiles];
      setImages(newImages);



      // Create previews
      const newPreviews = compressedFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);

      showToast.dismiss(toastId);
      showToast.success(`${compressedFiles.length} image(s) compressed successfully!`);
    } catch (error) {
      console.error('Error compressing images:', error);
      showToast.dismiss(toastId);
      showToast.error('Failed to compress images. Please try again.');
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check listing limit before proceeding
    if (!canAddListing('item')) {
      setShowPremiumModal(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!user || !profile) {
        showToast.error('You must be logged in to add an item');
        setLoading(false);
        return;
      }

      if (images.length === 0) {
        showToast.error('Please upload at least one image');
        setLoading(false);
        return;
      }

      const toastId = showToast.loading('Creating listing...');

      // Upload images to Supabase Storage
      const imageUrls = await listingService.uploadImages(images, user.id);

      // Create listing
      const listingData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: parseInt(formData.price),
        pricing_model: formData.pricing_model,
        location: formData.location,
        condition: formData.condition,
        contact_info: formData.contactInfo,
        availability: formData.availability,
        latitude: formData.latitude,
        longitude: formData.longitude,
        owner_id: user.id,
        owner_name: profile.full_name || user.email || 'Unknown',
        owner_email: user.email || profile.email || '',
        images: imageUrls,
        status: 'pending' as const,
      };

      console.log('Creating listing with data:', listingData);
      const newListing = await listingService.createListing(listingData);

      // Notify admin of new listing
      try {
        await notificationService.notifyAdminNewListing(
          formData.title,
          profile.full_name || user.email || 'User',
          newListing.id
        );
      } catch (notifError) {
        console.error('Error notifying admin:', notifError);
      }

      showToast.dismiss(toastId);
      showToast.success('Item added successfully! It will be visible after admin approval.');

      // Navigate after a short delay to show the success message
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      console.error('Error adding item:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add item. Please try again.';
      showToast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-secondary">Add New Rental Item</h1>
            <p className="text-gray-600">List your item for others to rent</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-amber-600 mb-6 flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-600" />
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., Professional Power Drill Set"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condition *
                  </label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {conditions.map(condition => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Describe your item in detail..."
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Location */}
            <div>
              <h2 className="text-xl font-semibold text-amber-600 mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-600" />
                Pricing & Location
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rental Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pricing Model *
                  </label>
                  <select
                    name="pricing_model"
                    value={formData.pricing_model}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="per_day">Per Day</option>
                    <option value="per_week">Per Week</option>
                    <option value="per_month">Per Month</option>
                    <option value="per_event">Per Event</option>
                    <option value="per_hour">Per Hour</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., Mumbai, Maharashtra"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Information *
                  </label>
                  <input
                    type="text"
                    name="contactInfo"
                    value={formData.contactInfo}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Phone number or email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability
                  </label>
                  <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="Available">Available</option>
                    <option value="Rented">Currently Rented</option>
                    <option value="Maintenance">Under Maintenance</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <h2 className="text-xl font-semibold text-amber-600 mb-6 flex items-center gap-2">
                <Upload className="w-5 h-5 text-amber-600" />
                Photos
              </h2>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-[2rem] p-8 text-center hover:border-amber-500 transition-all bg-gray-50/50">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer bg-white border border-gray-200 px-6 py-2 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-all shadow-sm"
                    >
                      Gallery
                    </label>
                    <label
                      htmlFor="camera-upload"
                      className="cursor-pointer bg-amber-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-amber-700 transition-all shadow-lg flex items-center gap-2"
                    >
                      <Smartphone className="w-4 h-4" />
                      Take Photo
                    </label>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="camera-upload"
                  />
                  <p className="text-sm text-gray-400 mt-6">
                    Professional photos help you rent 3x faster. Upload up to 4 photos.
                  </p>
                </div>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 text-white rounded-lg font-semibold hover:from-amber-500 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Adding Item...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Item
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal
        isOpen={showPremiumModal}
        onClose={() => {
          setShowPremiumModal(false);
          navigate('/dashboard');
        }}
        listingType="item"
        currentCount={listingCounts.items}
        limit={3}
      />
    </div>
  );
};

export default AddItem;
