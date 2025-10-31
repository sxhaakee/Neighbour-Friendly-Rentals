import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { propertyService } from '../services/propertyService';
import { showToast } from '../utils/toast';
import { supabase } from '../lib/supabase';
import { compressImages } from '../utils/imageCompression';

const EditProperty = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    type: 'flat',
    title: '',
    description: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    locality: '',
    rent_amount: '',
    deposit_amount: '',
    maintenance_charges: '0',
    negotiable: false,
    bedrooms: '',
    bathrooms: '',
    balconies: '0',
    area_sqft: '',
    floor_number: '',
    total_floors: '',
    age_years: '',
    furnishing: 'unfurnished',
    amenities: [] as string[],
    preferred_tenants: [] as string[],
    pets_allowed: false,
    non_veg_allowed: true,
    available_from: '',
    lease_duration: '11-months',
    minimum_stay_months: '11',
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    fetchProperty();
  }, [id, user, authLoading, navigate]);

  const fetchProperty = async () => {
    try {
      const property = await propertyService.getPropertyById(id!);
      
      if (!property) {
        showToast.error('Property not found');
        navigate('/dashboard');
        return;
      }

      if (property.owner_id !== user?.id) {
        showToast.error('You do not have permission to edit this property');
        navigate('/dashboard');
        return;
      }

      setFormData({
        type: property.type,
        title: property.title,
        description: property.description,
        address: property.address,
        city: property.city,
        state: property.state,
        pincode: property.pincode,
        locality: property.locality || '',
        rent_amount: property.rent_amount.toString(),
        deposit_amount: property.deposit_amount.toString(),
        maintenance_charges: property.maintenance_charges?.toString() || '0',
        negotiable: property.negotiable,
        bedrooms: property.bedrooms?.toString() || '',
        bathrooms: property.bathrooms?.toString() || '',
        balconies: property.balconies?.toString() || '0',
        area_sqft: property.area_sqft.toString(),
        floor_number: property.floor_number?.toString() || '',
        total_floors: property.total_floors?.toString() || '',
        age_years: property.age_years?.toString() || '',
        furnishing: property.furnishing || 'unfurnished',
        amenities: property.amenities || [],
        preferred_tenants: property.preferred_tenants || [],
        pets_allowed: property.pets_allowed,
        non_veg_allowed: property.non_veg_allowed,
        available_from: property.available_from,
        lease_duration: property.lease_duration,
        minimum_stay_months: property.minimum_stay_months.toString(),
      });
      setExistingImages(property.images || []);
    } catch (error) {
      console.error('Error fetching property:', error);
      showToast.error('Failed to load property');
      navigate('/dashboard');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.7,
        maxSizeMB: 0.1,
      });

      const uploadedUrls: string[] = [];
      for (const file of compressedFiles) {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const { data, error } = await supabase.storage
          .from('property-images')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
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

    if (!formData.title || !formData.description || !formData.city) {
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
      await propertyService.updateProperty(id!, {
        type: formData.type as any,
        title: formData.title,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        locality: formData.locality || undefined,
        rent_amount: parseInt(formData.rent_amount),
        deposit_amount: parseInt(formData.deposit_amount),
        maintenance_charges: parseInt(formData.maintenance_charges),
        negotiable: formData.negotiable,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
        balconies: parseInt(formData.balconies),
        area_sqft: parseInt(formData.area_sqft),
        floor_number: formData.floor_number ? parseInt(formData.floor_number) : undefined,
        total_floors: formData.total_floors ? parseInt(formData.total_floors) : undefined,
        age_years: formData.age_years ? parseInt(formData.age_years) : undefined,
        furnishing: formData.furnishing as any,
        amenities: formData.amenities,
        preferred_tenants: formData.preferred_tenants,
        pets_allowed: formData.pets_allowed,
        non_veg_allowed: formData.non_veg_allowed,
        images: allImages,
        available_from: formData.available_from,
        lease_duration: formData.lease_duration as any,
        minimum_stay_months: parseInt(formData.minimum_stay_months),
      });

      showToast.success('Property updated successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error updating property:', error);
      showToast.error(error.message || 'Failed to update property');
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit Property</h1>
          <p className="text-gray-600 mb-6">Update your property details</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Details */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rent Amount (₹) *
                    </label>
                    <input
                      type="number"
                      name="rent_amount"
                      value={formData.rent_amount}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deposit Amount (₹) *
                    </label>
                    <input
                      type="number"
                      name="deposit_amount"
                      value={formData.deposit_amount}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
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
                className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Property'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditProperty;
