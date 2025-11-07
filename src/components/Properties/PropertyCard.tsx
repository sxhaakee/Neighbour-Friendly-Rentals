import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Bed, Bath, Maximize, IndianRupee, Home, Building2, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Property } from '../../services/propertyService';

interface PropertyCardProps {
  property: Property;
  index?: number;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, index = 0 }) => {
  const navigate = useNavigate();

  const getPropertyIcon = (type: string) => {
    switch (type) {
      case 'flat':
      case 'house':
      case 'villa':
        return Home;
      case 'pg':
      case 'hostel':
        return Building2;
      case 'commercial':
      case 'office':
      case 'shop':
      case 'warehouse':
        return Building2;
      default:
        return Home;
    }
  };

  const Icon = getPropertyIcon(property.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      onClick={() => navigate(`/properties/${property.id}`)}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
    >
      {/* Image */}
      <div className="relative h-36 sm:h-48 overflow-hidden">
        <img
          src={property.images[0] || '/placeholder-property.jpg'}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-2">
          <span className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white px-2 py-1 rounded text-xs font-semibold capitalize">
            {property.type}
          </span>
          {property.featured && (
            <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
              <Star className="w-3 h-3" /> Featured
            </span>
          )}
          {property.verified && (
            <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
              ✓ Verified
            </span>
          )}
        </div>

        {/* Furnishing Badge */}
        {property.furnishing && (
          <div className="absolute top-2 right-2">
            <span className="bg-black/60 text-white px-2 py-1 rounded text-xs capitalize">
              {property.furnishing}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
          {property.title}
        </h3>

        {/* Location */}
        <div className="flex items-start gap-1 text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="text-sm line-clamp-1">
            {property.locality ? `${property.locality}, ` : ''}{property.city}
          </span>
        </div>

        {/* Property Details */}
        <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
          {property.bedrooms && (
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span>{property.bedrooms} BHK</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              <span>{property.bathrooms}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Maximize className="w-4 h-4" />
            <span>{property.area_sqft} sqft</span>
          </div>
        </div>

        {/* Amenities Preview */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {property.amenities.slice(0, 3).map((amenity, idx) => (
              <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                {amenity}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span className="text-gray-500 text-xs">+{property.amenities.length - 3} more</span>
            )}
          </div>
        )}

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <div className="flex items-center gap-1 text-2xl font-bold text-amber-600">
              <IndianRupee className="w-5 h-5" />
              <span>{property.rent_amount.toLocaleString('en-IN')}</span>
            </div>
            <span className="text-xs text-gray-500">per month</span>
          </div>
          <button className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
            View Details
          </button>
        </div>

        {/* Deposit Info */}
        <div className="mt-2 text-xs text-gray-500">
          Deposit: ₹{property.deposit_amount.toLocaleString('en-IN')}
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;
