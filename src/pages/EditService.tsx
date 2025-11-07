import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { serviceProviderService } from '../services/serviceProviderService';
import { showToast } from '../utils/toast';
import { supabase } from '../lib/supabase';
import { compressImages } from '../utils/imageCompression';

const EditService = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    business_name: '',
    category: 'event-management',
    description: '',
    tagline: '',
    services: [] as string[],
    pricing_model: 'per-event',
    base_price: '',
    city: '',
    state: '',
    service_areas: [] as string[],
    contact_person: '',
    phone: '',
    email: '',
    whatsapp: '',
    years_experience: '',
    team_size: '',
    instagram_url: '',
    facebook_url: '',
    youtube_url: '',
    linkedin_url: '',
    twitter_url: '',
    website_url: '',
  });

  const categories = [
    { value: 'event-management', label: 'Event Management' },
    { value: 'catering', label: 'Catering' },
    { value: 'dj', label: 'DJ' },
    { value: 'decoration', label: 'Decoration' },
    { value: 'photography', label: 'Photography' },
    { value: 'videography', label: 'Videography' },
    { value: 'makeup', label: 'Makeup Artist' },
    { value: 'mehendi', label: 'Mehendi Artist' },
    { value: 'venue', label: 'Venue' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    fetchService();
  }, [id, user, authLoading, navigate]);

  const fetchService = async () => {
    try {
      const service = await serviceProviderService.getProviderById(id!);
      
      if (service.owner_id !== user?.id) {
        showToast.error('You do not have permission to edit this service');
        navigate('/dashboard');
        return;
      }

      setFormData({
        business_name: service.business_name,
        category: service.category,
        description: service.description,
        tagline: service.tagline || '',
        services: service.services || [],
        pricing_model: service.pricing_model,
        base_price: service.base_price?.toString() || '',
        city: service.city,
        state: service.state,
        service_areas: service.service_areas || [],
        contact_person: service.contact_person,
        phone: service.phone,
        email: service.email,
        whatsapp: service.whatsapp || '',
        years_experience: service.years_experience?.toString() || '',
        team_size: service.team_size?.toString() || '',
        instagram_url: service.instagram_url || '',
        facebook_url: service.facebook_url || '',
        youtube_url: service.youtube_url || '',
        linkedin_url: service.linkedin_url || '',
        twitter_url: service.twitter_url || '',
        website_url: service.website_url || '',
      });
      setExistingImages(service.images || []);
    } catch (error) {
      console.error('Error fetching service:', error);
      showToast.error('Failed to load service');
      navigate('/dashboard');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const totalImages = existingImages.length + newImages.length + files.length;
    if (totalImages > 10) {
      showToast.error('Maximum 10 images allowed');
      return;
    }

    setUploading(true);
    const toastId = showToast.loading('Uploading images...');

    try {
      const compressedFiles = await compressImages(files, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.85,
        maxSizeMB: 0.5,
      });

      const uploadedUrls: string[] = [];
      for (const file of compressedFiles) {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const { data, error } = await supabase.storage
          .from('services')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('services')
          .getPublicUrl(data.path);

        uploadedUrls.push(publicUrl);
      }

      setNewImages([...newImages, ...uploadedUrls]);
      showToast.dismiss(toastId);
      showToast.success('Images uploaded successfully');
    } catch (error) {
      console.error('Error uploading images:', error);
      showToast.dismiss(toastId);
      showToast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages(newImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.business_name || !formData.description || !formData.city) {
      showToast.error('Please fill in all required fields');
      return;
    }

    const allImages = [...existingImages, ...newImages];
    if (allImages.length === 0) {
      showToast.error('Please upload at least one image');
      return;
    }

    setLoading(true);
    try {
      await serviceProviderService.updateProvider(id!, {
        business_name: formData.business_name,
        category: formData.category as any,
        description: formData.description,
        tagline: formData.tagline || undefined,
        services: formData.services,
        pricing_model: formData.pricing_model as any,
        base_price: formData.base_price ? parseInt(formData.base_price) : undefined,
        city: formData.city,
        state: formData.state,
        service_areas: formData.service_areas.length > 0 ? formData.service_areas : [formData.city],
        contact_person: formData.contact_person,
        phone: formData.phone,
        email: formData.email,
        whatsapp: formData.whatsapp || undefined,
        images: allImages,
        portfolio_images: allImages,
        years_experience: formData.years_experience ? parseInt(formData.years_experience) : undefined,
        team_size: formData.team_size ? parseInt(formData.team_size) : undefined,
        instagram_url: formData.instagram_url || undefined,
        facebook_url: formData.facebook_url || undefined,
        youtube_url: formData.youtube_url || undefined,
        linkedin_url: formData.linkedin_url || undefined,
        twitter_url: formData.twitter_url || undefined,
        website_url: formData.website_url || undefined,
      });

      showToast.success('Service updated successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error updating service:', error);
      
      // Handle specific database constraint errors
      if (error.message && error.message.includes('category_check')) {
        showToast.error('Category validation error. Please contact support or try a different category.');
      } else if (error.message && error.message.includes('violates check constraint')) {
        showToast.error('Invalid data format. Please check all fields and try again.');
      } else {
        showToast.error(error.message || 'Failed to update service. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit Service</h1>
          <p className="text-gray-600 mb-6">Update your service details</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Details */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Business Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    name="business_name"
                    value={formData.business_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tagline
                  </label>
                  <input
                    type="text"
                    name="tagline"
                    value={formData.tagline}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Pricing</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pricing Model *
                  </label>
                  <select
                    name="pricing_model"
                    value={formData.pricing_model}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="per-event">Per Event</option>
                    <option value="per-hour">Per Hour</option>
                    <option value="per-day">Per Day</option>
                    <option value="package">Package</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Price (₹)
                  </label>
                  <input
                    type="number"
                    name="base_price"
                    value={formData.base_price}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Location</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    name="contact_person"
                    value={formData.contact_person}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Images</h2>
              
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Current Images</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {existingImages.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Existing ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images */}
              {newImages.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">New Images</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {newImages.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`New ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors">
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    {uploading ? 'Uploading...' : 'Upload Images'}
                  </span>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white rounded-lg hover:shadow-xl hover:scale-105 transition-colors disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Service'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditService;
