import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Bed, Bath, Maximize, IndianRupee, Calendar, Home, Phone, Mail, Share2, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { propertyService, Property } from '../services/propertyService';
import { socialService } from '../services/socialService';
import { showToast } from '../utils/toast';
import { useAuth } from '../contexts/AuthContext';
import { ShareButton } from '../components/ShareButton';
import { generateWhatsAppLink } from '../utils/whatsapp';
import { updateMetaTags, resetMetaTags } from '../utils/metaTags';

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showFullImage, setShowFullImage] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProperty();
    }

    // Reset meta tags when component unmounts
    return () => {
      resetMetaTags();
    };
  }, [id]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const data = await propertyService.getPropertyById(id!);
      setProperty(data);

      // Update meta tags for social media sharing
      if (data) {
        updateMetaTags({
          title: data.title,
          description: data.description,
          image: data.images[0] || 'https://neighbourfriendly.in/og-image.png',
          url: `https://neighbourfriendly.in/properties/${data.id}`,
          type: 'product',
          price: data.rent_amount,
          currency: 'INR'
        });
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      showToast.error('Failed to load property details');
      navigate('/properties');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const shareUrl = property ? socialService.generateShareLink('property', property.id) : window.location.href;
    if (navigator.share) {
      navigator.share({
        title: property?.title,
        text: property?.description,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      showToast.success('Link copied to clipboard!');
    }
  };

  const nextImage = () => {
    if (property) {
      setSelectedImage((prev) => (prev + 1) % property.images.length);
    }
  };

  const prevImage = () => {
    if (property) {
      setSelectedImage((prev) => (prev - 1 + property.images.length) % property.images.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h2>
          <Link to="/properties" className="text-amber-600 hover:underline">
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleShare}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="relative aspect-video bg-gray-200">
                <img
                  src={property.images[selectedImage] || '/placeholder.jpg'}
                  alt={property.title}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setShowFullImage(true)}
                />
                {property.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white px-3 py-1 rounded-lg text-sm font-semibold capitalize">
                    {property.type}
                  </span>
                  {property.featured && (
                    <span className="bg-yellow-500 text-white px-3 py-1 rounded-lg text-sm font-semibold">
                      Featured
                    </span>
                  )}
                  {property.verified && (
                    <span className="bg-amber-500 text-white px-3 py-1 rounded-lg text-sm font-semibold">
                      ✓ Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnails */}
              {property.images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {property.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${selectedImage === index ? 'border-primary' : 'border-gray-200'
                        }`}
                    >
                      <img src={image} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
                <ShareButton
                  url={property ? socialService.generateShareLink('property', property.id) : window.location.href}
                  title={property.title}
                  description={property.description}
                  className="flex-shrink-0"
                />
              </div>

              <div className="flex items-center gap-2 text-gray-600 mb-6">
                <MapPin className="w-5 h-5" />
                <span>
                  {property.address}, {property.locality && `${property.locality}, `}
                  {property.city}, {property.state} - {property.pincode}
                </span>
              </div>

              {/* Key Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {property.bedrooms && (
                  <div className="flex items-center gap-2">
                    <Bed className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Bedrooms</div>
                      <div className="font-semibold">{property.bedrooms} BHK</div>
                    </div>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center gap-2">
                    <Bath className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Bathrooms</div>
                      <div className="font-semibold">{property.bathrooms}</div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Maximize className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Area</div>
                    <div className="font-semibold">{property.area_sqft} sqft</div>
                  </div>
                </div>
                {property.furnishing && (
                  <div className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Furnishing</div>
                      <div className="font-semibold capitalize">{property.furnishing}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-600 leading-relaxed">{property.description}</p>
              </div>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-700">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Additional Details</h2>
              <div className="grid grid-cols-2 gap-4">
                {property.floor_number && (
                  <div>
                    <div className="text-sm text-gray-500">Floor</div>
                    <div className="font-semibold">
                      {property.floor_number} of {property.total_floors || 'N/A'}
                    </div>
                  </div>
                )}
                {property.age_years !== undefined && (
                  <div>
                    <div className="text-sm text-gray-500">Property Age</div>
                    <div className="font-semibold">{property.age_years} years</div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-gray-500">Available From</div>
                  <div className="font-semibold">
                    {new Date(property.available_from).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Lease Duration</div>
                  <div className="font-semibold capitalize">{property.lease_duration.replace('-', ' ')}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Pets Allowed</div>
                  <div className="font-semibold">{property.pets_allowed ? 'Yes' : 'No'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Non-Veg Allowed</div>
                  <div className="font-semibold">{property.non_veg_allowed ? 'Yes' : 'No'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Pricing Card */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-3xl font-bold text-amber-600 mb-2">
                    <IndianRupee className="w-7 h-7" />
                    {property.rent_amount.toLocaleString('en-IN')}
                    <span className="text-lg text-gray-500 font-normal">
                      {property.pricing_model === 'sale' ? '' :
                        property.pricing_model === 'per_day' ? '/day' :
                          property.pricing_model === 'per_week' ? '/week' :
                            property.pricing_model === 'per_year' ? '/year' : '/month'}
                    </span>
                  </div>
                  {property.negotiable && (
                    <span className="text-sm text-amber-600 font-semibold">Negotiable</span>
                  )}
                </div>

                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Security Deposit</span>
                    <span className="font-semibold">₹{property.deposit_amount.toLocaleString('en-IN')}</span>
                  </div>
                  {property.maintenance_charges > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Maintenance</span>
                      <span className="font-semibold">₹{property.maintenance_charges.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => window.open(generateWhatsAppLink(property.owner_phone, 'property', property.title), '_blank')}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 rounded-lg font-semibold hover:shadow-xl hover:scale-105 transition-colors flex items-center justify-center gap-2"
                  >
                    <Phone className="w-5 h-5" />
                    Contact on WhatsApp
                  </button>
                  <button
                    onClick={() => setShowContactForm(true)}
                    className="w-full border-2 border-amber-500 text-amber-600 py-3 rounded-lg font-semibold hover:bg-amber-600/5 transition-colors"
                  >
                    Show Contact Details
                  </button>
                </div>
              </div>

              {/* Owner Info */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Posted By</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Home className="w-5 h-5 text-gray-400" />
                    <span>{property.owner_name}</span>
                  </div>
                  {showContactForm && (
                    <>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <a href={`tel:${property.owner_phone}`} className="hover:text-amber-600">
                          {property.owner_phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <a href={`mailto:${property.owner_email}`} className="hover:text-amber-600">
                          {property.owner_email}
                        </a>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
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
            className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-2"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <img
            src={property.images[selectedImage]}
            alt={property.title}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;
