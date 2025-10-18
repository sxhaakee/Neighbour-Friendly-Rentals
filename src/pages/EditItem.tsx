import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { listingService } from '../services/listingService';
import { compressImages, getEstimatedSize } from '../utils/imageCompression';
import { showToast } from '../utils/toast';

const EditItem = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Tools',
    price: '',
    location: '',
    condition: 'Excellent',
    contactInfo: '',
    availability: 'Available',
  });
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    fetchListing();
  }, [id, user, authLoading, navigate]);

  const fetchListing = async () => {
    try {
      const listing = await listingService.getListingById(id!);
      
      // Check if user owns this listing
      if (listing.owner_id !== user?.id) {
        showToast.error('You do not have permission to edit this listing');
        navigate('/dashboard');
        return;
      }

      setFormData({
        title: listing.title,
        description: listing.description,
        category: listing.category,
        price: listing.price.toString(),
        location: listing.location,
        condition: listing.condition,
        contactInfo: listing.contact_info,
        availability: listing.availability,
      });
      setExistingImages(listing.images);
    } catch (error) {
      console.error('Error fetching listing:', error);
      showToast.error('Failed to load listing');
      navigate('/dashboard');
    }
  };

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
    
    const totalImages = existingImages.length + images.length + files.length;
    if (totalImages > 10) {
      showToast.error('Maximum 10 images allowed per listing');
      return;
    }
    
    setCompressing(true);
    const toastId = showToast.loading('Compressing images...');
    
    try {
      const compressedFiles = await compressImages(files, {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.7,
        maxSizeMB: 0.1,
      });
      
      const newImages = [...images, ...compressedFiles];
      setImages(newImages);
      
      const totalSize = getEstimatedSize(newImages);

      const newPreviews = compressedFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
      
      showToast.dismiss(toastId);
      showToast.success(`${compressedFiles.length} image(s) compressed successfully! Total: ${totalSize.toFixed(2)}MB`);
    } catch (error) {
      console.error('Error compressing images:', error);
      showToast.dismiss(toastId);
      showToast.error('Failed to compress images. Please try again.');
    } finally {
      setCompressing(false);
    }
  };

  const removeNewImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!user || !profile) {
        showToast.error('You must be logged in to edit an item');
        setLoading(false);
        return;
      }

      const totalImages = existingImages.length + images.length;
      if (totalImages === 0) {
        showToast.error('Please keep at least one image');
        setLoading(false);
        return;
      }

      const toastId = showToast.loading('Updating listing...');

      // Upload new images if any
      let newImageUrls: string[] = [];
      if (images.length > 0) {
        newImageUrls = await listingService.uploadImages(images, user.id);
      }

      // Combine existing and new images
      const allImages = [...existingImages, ...newImageUrls];

      // Update listing
      const listingData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: parseInt(formData.price),
        location: formData.location,
        condition: formData.condition,
        contact_info: formData.contactInfo,
        availability: formData.availability,
        images: allImages,
      };

      await listingService.updateListing(id!, listingData);

      showToast.dismiss(toastId);
      showToast.success('Listing updated successfully!');
      
      setTimeout(() => navigate(`/item/${id}`), 1500);
    } catch (err) {
      console.error('Error updating item:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update item. Please try again.';
      showToast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-4xl font-bold text-gray-900">Edit Listing</h1>
          <p className="text-gray-600 mt-2">Update your item details</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Images Section */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Item Images</h2>
            
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Current Images:</p>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                  {existingImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Existing ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            {imagePreviews.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">New Images:</p>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`New ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
              <input
                type="file"
                id="images"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={compressing}
              />
              <label
                htmlFor="images"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                <span className="text-gray-600 font-medium">
                  {compressing ? 'Compressing...' : 'Add More Images'}
                </span>
                <span className="text-sm text-gray-500 mt-1">
                  Max 10 images total • Automatically compressed to ~100KB each
                </span>
              </label>
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Item Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., Canon EOS 5D Mark IV"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Describe your item in detail..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Cameras & Photography">Cameras & Photography</option>
                  <option value="Tools & Equipment">Tools & Equipment</option>
                  <option value="Vehicles">Vehicles</option>
                  <option value="Sports & Fitness">Sports & Fitness</option>
                  <option value="Musical Instruments">Musical Instruments</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Appliances">Appliances</option>
                  <option value="Books & Media">Books & Media</option>
                  <option value="Clothing & Accessories">Clothing & Accessories</option>
                  <option value="Party & Events">Party & Events</option>
                  <option value="Gaming & Consoles">Gaming & Consoles</option>
                  <option value="Outdoor & Camping">Outdoor & Camping</option>
                  <option value="Baby & Kids">Baby & Kids</option>
                  <option value="Medical & Health">Medical & Health</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price per Day (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="500"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Condition *
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Availability *
                </label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option value="Available">Available</option>
                  <option value="Rented">Rented</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., Bangalore, Karnataka"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contact Information *
              </label>
              <input
                type="text"
                name="contactInfo"
                value={formData.contactInfo}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Phone number or email"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || compressing}
              className="flex-1 bg-primary text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Listing'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItem;
