import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { propertyService } from '../services/propertyService';
import { showToast } from '../utils/toast';
import { PremiumUpgradeModal } from '../components/PremiumUpgradeModal';
import { supabase } from '../lib/supabase';
import { compressImages } from '../utils/imageCompression';

const AddProperty = () => {
  const navigate = useNavigate();
  const { user, profile, canAddListing, listingCounts } = useAuth();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Require login
  useEffect(() => {
    if (!user) {
      showToast.error('Please login to list a property');
      navigate('/login');
    }
  }, [user, navigate]);

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

  const propertyTypes = [
    { value: 'flat', label: 'Flat' },
    { value: 'house', label: 'House' },
    { value: 'pg', label: 'PG' },
    { value: 'villa', label: 'Villa' },
    { value: 'office', label: 'Office' },
    { value: 'shop', label: 'Shop' },
  ];

  // Smart amenities based on property type
  const getAmenitiesForType = (type: string) => {
    const residential = ['Parking', 'Lift', 'Power Backup', 'Security', 'Gym', 'Swimming Pool', 'Garden', 'Play Area', 'WiFi', 'Water Supply', 'Gas Pipeline'];
    const commercial = ['Parking', 'Lift', 'Power Backup', 'Security', 'WiFi', 'Conference Room', 'Cafeteria', 'Reception'];
    const pg = ['WiFi', 'Power Backup', 'Security', 'Laundry', 'Meals Included', 'AC Rooms', 'Cleaning Service'];
    
    if (type === 'office' || type === 'shop' || type === 'commercial') return commercial;
    if (type === 'pg' || type === 'hostel') return pg;
    return residential;
  };

  const amenitiesList = getAmenitiesForType(formData.type);

  // Smart tenant preferences based on property type
  const getTenantPreferencesForType = (type: string) => {
    if (type === 'office' || type === 'shop' || type === 'commercial') return ['Any Business', 'Startup', 'Established Company', 'Retail', 'Service Industry'];
    if (type === 'pg' || type === 'hostel') return ['Students', 'Working Professionals', 'Male Only', 'Female Only', 'Co-ed'];
    return ['Family', 'Bachelor', 'Students', 'Company', 'Anyone'];
  };

  const tenantPreferences = getTenantPreferencesForType(formData.type);

  // Check if property type needs bedrooms/bathrooms
  const needsBedroomInfo = !['office', 'shop', 'commercial'].includes(formData.type);
  const needsTenantPreferences = formData.type !== 'office' && formData.type !== 'shop' && formData.type !== 'commercial';
  const isPG = formData.type === 'pg' || formData.type === 'hostel';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    const amenities = formData.amenities.includes(amenity)
      ? formData.amenities.filter(a => a !== amenity)
      : [...formData.amenities, amenity];
    setFormData({ ...formData, amenities });
  };

  const handleTenantToggle = (tenant: string) => {
    const preferred_tenants = formData.preferred_tenants.includes(tenant)
      ? formData.preferred_tenants.filter(t => t !== tenant)
      : [...formData.preferred_tenants, tenant];
    setFormData({ ...formData, preferred_tenants });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 10) {
      showToast.error('Maximum 10 images allowed');
      return;
    }

    setUploading(true);
    try {
      // COMPRESS IMAGES FIRST
      const loadingToast = showToast.loading('Compressing images...');
      const compressedFiles = await compressImages(Array.from(files));
      showToast.dismiss(loadingToast);
      
      const uploadPromises = compressedFiles.map(async (file) => {
        const fileExt = 'jpg'; // Always use jpg after compression
        const fileName = `${user!.id}-${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `properties/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('listings')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          if (uploadError.message?.includes('Bucket not found')) {
            throw new Error('Storage bucket not configured. Please create "listings" bucket in Supabase Storage.');
          }
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('listings')
          .getPublicUrl(filePath);

        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImages([...images, ...uploadedUrls]);
      showToast.success(`${uploadedUrls.length} image(s) uploaded & compressed`);
    } catch (error: any) {
      console.error('Error uploading images:', error);
      showToast.error(error.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canAddListing('property')) {
      setShowPremiumModal(true);
      return;
    }

    if (!user || !profile) {
      showToast.error('Please login to add a property');
      navigate('/login');
      return;
    }

    if (images.length === 0) {
      showToast.error('Please upload at least one image');
      return;
    }

    setLoading(true);
    try {
      await propertyService.createProperty({
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
        images,
        owner_id: user.id,
        owner_name: profile.full_name || profile.email,
        owner_phone: profile.phone || '',
        owner_email: profile.email,
        available_from: formData.available_from,
        lease_duration: formData.lease_duration as any,
        minimum_stay_months: parseInt(formData.minimum_stay_months),
        status: 'pending',
        verified: false,
        featured: false,
      });

      showToast.success('Property listed successfully! Awaiting admin approval.');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error adding property:', error);
      showToast.error(error.message || 'Failed to add property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 md:py-8">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">List Your Property</h1>
          <p className="text-sm md:text-base text-gray-600">Fill in the details to list your property for rent</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {/* Property Type */}
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Property Type</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
              {propertyTypes.map((type) => (
                <label key={type.value} className={`flex items-center justify-center p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.type === type.value ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}`}>
                  <input type="radio" name="type" value={type.value} checked={formData.type === type.value} onChange={handleInputChange} className="sr-only" />
                  <span className="text-sm font-medium">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Basic Details */}
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Basic Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Property Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g., 2 BHK Flat in Koramangala" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Describe your property..." required rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address *</label>
                <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Building name, street" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Locality</label>
                <input type="text" name="locality" value={formData.locality} onChange={handleInputChange} placeholder="e.g., Koramangala" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="e.g., Bangalore" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">State *</label>
                <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="e.g., Karnataka" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pincode *</label>
                <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="e.g., 560034" required maxLength={6} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Monthly Rent (₹) *</label>
                <input type="number" name="rent_amount" value={formData.rent_amount} onChange={handleInputChange} placeholder="25000" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Deposit (₹) *</label>
                <input type="number" name="deposit_amount" value={formData.deposit_amount} onChange={handleInputChange} placeholder="50000" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Maintenance (₹)</label>
                <input type="number" name="maintenance_charges" value={formData.maintenance_charges} onChange={handleInputChange} placeholder="2000" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
              </div>
            </div>
            <label className="flex items-center gap-2 mt-4">
              <input type="checkbox" name="negotiable" checked={formData.negotiable} onChange={handleInputChange} className="w-4 h-4 text-primary rounded focus:ring-primary" />
              <span className="text-sm text-gray-700">Price is negotiable</span>
            </label>
          </div>

          {/* Property Details */}
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Property Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {needsBedroomInfo && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {isPG ? 'Rooms Available' : 'Bedrooms'}
                    </label>
                    <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleInputChange} placeholder="2" min="0" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bathrooms</label>
                    <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleInputChange} placeholder="2" min="0" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Area (sqft) *</label>
                <input type="number" name="area_sqft" value={formData.area_sqft} onChange={handleInputChange} placeholder="1200" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Furnishing *</label>
                <select name="furnishing" value={formData.furnishing} onChange={handleInputChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                  <option value="furnished">Furnished</option>
                  <option value="semi-furnished">Semi-Furnished</option>
                  <option value="unfurnished">Unfurnished</option>
                </select>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
              {amenitiesList.map((amenity) => (
                <label key={amenity} className="flex items-center gap-2 p-2 md:p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <input type="checkbox" checked={formData.amenities.includes(amenity)} onChange={() => handleAmenityToggle(amenity)} className="w-4 h-4 text-primary rounded focus:ring-primary" />
                  <span className="text-xs md:text-sm">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tenant/Business Preferences */}
          {needsTenantPreferences && (
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
                {formData.type === 'pg' || formData.type === 'hostel' ? 'Occupant Preferences' : 'Tenant Preferences'}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mb-4">
                {tenantPreferences.map((tenant) => (
                  <label key={tenant} className="flex items-center gap-2 p-2 md:p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <input type="checkbox" checked={formData.preferred_tenants.includes(tenant)} onChange={() => handleTenantToggle(tenant)} className="w-4 h-4 text-primary rounded focus:ring-primary" />
                    <span className="text-xs md:text-sm">{tenant}</span>
                  </label>
                ))}
              </div>
              {!isPG && (
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="pets_allowed" checked={formData.pets_allowed} onChange={handleInputChange} className="w-4 h-4 text-primary rounded focus:ring-primary" />
                    <span className="text-sm text-gray-700">Pets Allowed</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="non_veg_allowed" checked={formData.non_veg_allowed} onChange={handleInputChange} className="w-4 h-4 text-primary rounded focus:ring-primary" />
                    <span className="text-sm text-gray-700">Non-Veg Allowed</span>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Availability */}
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Availability</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Available From *</label>
                <input type="date" name="available_from" value={formData.available_from} onChange={handleInputChange} required min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Lease Duration *</label>
                <select name="lease_duration" value={formData.lease_duration} onChange={handleInputChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                  <option value="11-months">11 Months</option>
                  <option value="1-year">1 Year</option>
                  <option value="2-years">2 Years</option>
                  <option value="3-years">3 Years</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Property Images *
            </h2>
            <p className="text-sm text-gray-600 mb-4">Upload up to 10 images (first image will be the cover photo)</p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4 mb-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img src={image} alt={`Property ${index + 1}`} className="w-full h-24 md:h-32 object-cover rounded-lg" />
                  <button type="button" onClick={() => handleRemoveImage(index)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3 md:w-4 md:h-4" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 bg-primary text-white text-xs px-2 py-0.5 rounded">Cover</span>
                  )}
                </div>
              ))}
            </div>

            {images.length < 10 && (
              <label className="flex flex-col items-center justify-center w-full h-24 md:h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors">
                <Upload className="w-6 h-6 md:w-8 md:h-8 text-gray-400 mb-2" />
                <span className="text-xs md:text-sm text-gray-600">{uploading ? 'Uploading...' : 'Click to upload'}</span>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} className="hidden" />
              </label>
            )}
          </div>

          {/* Submit */}
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 sticky bottom-0 bg-white p-4 md:p-0 md:bg-transparent -mx-4 md:mx-0 border-t md:border-0">
            <button type="button" onClick={() => navigate(-1)} className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading || uploading} className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Submitting...' : 'List Property'}
            </button>
          </div>
        </form>
      </div>

      <PremiumUpgradeModal
        isOpen={showPremiumModal}
        onClose={() => {
          setShowPremiumModal(false);
          navigate('/dashboard');
        }}
        listingType="property"
        currentCount={listingCounts.properties}
        limit={2}
      />
    </div>
  );
};

export default AddProperty;
