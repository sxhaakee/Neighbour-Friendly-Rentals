import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Calendar, User, MessageCircle, Heart, Clock, Shield, Truck, Camera, Wifi, Battery } from 'lucide-react';
import { motion } from 'framer-motion';
import { getListingById } from '../data/listings';

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  // Get the item data based on the ID from URL parameters
  const item = getListingById(Number(id));

  // If item not found, show error message
  if (!item) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Item Not Found</h1>
          <p className="text-gray-600 mb-6">The item you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/listings')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Listings
          </button>
        </div>
      </div>
    );
  }

  const handleRent = () => {
    alert('Rental functionality coming soon! Contact the owner to arrange rental.');
  };

  const handleContact = () => {
    alert('Contact functionality coming soon! You can reach out to the owner via email.');
  };

  return (
    <div className="min-h-screen bg-neutral-50">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-4"
          >
            {/* Main Image */}
            <div className="aspect-square rounded-2xl overflow-hidden bg-white shadow-lg">
              <img
                src={item.images[selectedImage]}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            <div className="flex gap-2 overflow-x-auto">
              {item.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${item.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
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
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold text-neutral-900">{item.title}</h1>
                <button
                  onClick={() => setIsFavorited(!isFavorited)}
                  className={`p-2 rounded-full transition-colors ${
                    isFavorited ? 'text-red-500' : 'text-neutral-400 hover:text-red-500'
                  }`}
                >
                  <Heart size={24} fill={isFavorited ? 'currentColor' : 'none'} />
                </button>
              </div>
              <div className="flex items-center gap-4 text-sm text-neutral-600 mb-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  {item.category}
                </span>
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-yellow-500 fill-current" />
                  <span>{item.rating}</span>
                  <span>({item.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={16} />
                  <span>{item.distance}</span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-2">
                <div className="text-4xl font-bold text-green-600">
                  ₹{item.price}
                  <span className="text-lg text-neutral-600 font-normal">/day</span>
                </div>
                <div className="text-sm text-neutral-500 line-through">
                  ₹{item.originalPrice}
                </div>
              </div>
              <div className="text-sm text-neutral-600">
                {item.availability} • {item.condition} condition
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRent}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                Rent Now - ₹{item.price}/day
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleContact}
                className="w-full bg-white border-2 border-neutral-200 text-neutral-700 py-4 rounded-2xl font-semibold text-lg hover:border-neutral-300 transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle size={20} />
                Contact Owner
              </motion.button>
            </div>

            {/* Owner Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Owner</h3>
              <div className="flex items-center gap-4">
                <img
                  src={item.ownerAvatar}
                  alt={item.owner}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold">{item.owner}</div>
                  <div className="text-sm text-neutral-600 flex items-center gap-1">
                    <MapPin size={14} />
                    {item.location}
                  </div>
                  <div className="text-sm text-neutral-600 flex items-center gap-1">
                    <Calendar size={14} />
                    Posted {item.postedDate}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Additional Details */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm"
          >
            <h3 className="text-xl font-semibold mb-4">Description</h3>
            <p className="text-neutral-700 leading-relaxed">{item.description}</p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-sm"
          >
            <h3 className="text-xl font-semibold mb-4">Key Features</h3>
            <ul className="space-y-2">
              {item.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-neutral-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  {feature}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Specifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-sm"
          >
            <h3 className="text-xl font-semibold mb-4">Specifications</h3>
            <div className="space-y-3">
              {Object.entries(item.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <span className="font-medium text-neutral-700">{key}</span>
                  <span className="text-neutral-600">{value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Rental Terms */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl p-6 shadow-sm"
          >
            <h3 className="text-xl font-semibold mb-4">Rental Terms</h3>
            <ul className="space-y-2">
              {item.rentalTerms.map((term, index) => (
                <li key={index} className="flex items-center gap-2 text-neutral-700">
                  <Shield size={16} className="text-green-500" />
                  {term}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 bg-white rounded-2xl p-6 shadow-sm"
        >
          <h3 className="text-xl font-semibold mb-6">Reviews ({item.reviewCount})</h3>
          <div className="space-y-6">
            {item.reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-100 last:border-b-0 pb-6 last:pb-0">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {review.user.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold">{review.user}</div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-neutral-500">{review.date}</span>
                    </div>
                  </div>
                </div>
                <p className="text-neutral-700">{review.comment}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ItemDetails;
