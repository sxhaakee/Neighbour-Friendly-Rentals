import React, { useState } from 'react';
import { Search, Filter, MapPin, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const Listings = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 8300]);

  const categories = ['All', 'Tools', 'Vehicles', 'Electronics', 'Furniture', 'Miscellaneous'];

  const listings = [
    {
      id: 1,
      title: 'Professional Power Drill Set',
      category: 'Tools',
      price: 500,
      image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=400',
      distance: '0.5 miles',
      rating: 4.8,
      owner: 'Mike Johnson'
    },
    {
      id: 2,
      title: 'Vintage Road Bicycle',
      category: 'Vehicles',
      price: 400,
      image: 'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=400',
      distance: '0.8 miles',
      rating: 4.9,
      owner: 'Sarah Chen'
    },
    {
      id: 3,
      title: 'Canon DSLR Camera',
      category: 'Electronics',
      price: 2000,
      image: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400',
      distance: '1.2 miles',
      rating: 5.0,
      owner: 'David Wilson'
    },
    {
      id: 4,
      title: 'Camping Tent 4-Person',
      category: 'Miscellaneous',
      price: 1200,
      image: 'https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg?auto=compress&cs=tinysrgb&w=400',
      distance: '0.3 miles',
      rating: 4.7,
      owner: 'Emma Davis'
    },
    {
      id: 5,
      title: 'Comfortable Office Chair',
      category: 'Furniture',
      price: 600,
      image: 'https://images.pexels.com/photos/586795/pexels-photo-586795.jpeg?auto=compress&cs=tinysrgb&w=400',
      distance: '0.7 miles',
      rating: 4.6,
      owner: 'Alex Turner'
    },
    {
      id: 6,
      title: 'Electric Lawn Mower',
      category: 'Tools',
      price: 2490,
      image: 'https://images.pexels.com/photos/1072824/pexels-photo-1072824.jpeg?auto=compress&cs=tinysrgb&w=400',
      distance: '1.1 miles',
      rating: 4.8,
      owner: 'Jennifer Lee'
    }
  ];

  const filteredListings = listings.filter(item => {
    const categoryMatch = selectedCategory === 'All' || item.category === selectedCategory;
    const priceMatch = item.price >= priceRange[0] && item.price <= priceRange[1];
    return categoryMatch && priceMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Browse Rentals</h1>
          <p className="text-xl text-gray-600">Discover amazing items from your neighbors</p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search items..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Categories */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="lg:w-64">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}/day
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="w-full accent-primary"
              />
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6"
        >
          <p className="text-gray-600">
            Showing <span className="font-semibold">{filteredListings.length}</span> results
          </p>
        </motion.div>

        {/* Listings Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredListings.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden group cursor-pointer"
            >
              <div className="relative overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-semibold">{item.rating}</span>
                </div>
                <div className="absolute top-4 left-4">
                  <span className="bg-primary text-white px-2 py-1 rounded-full text-xs font-semibold">
                    {item.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-600 mb-4">by {item.owner}</p>
                
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-primary">
                    ₹{item.price}<span className="text-sm text-gray-500">/day</span>
                  </span>
                  <div className="flex items-center text-gray-500">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">{item.distance}</span>
                  </div>
                </div>
                
                <button className="w-full bg-secondary text-gray-900 py-3 rounded-lg font-semibold hover:bg-secondary/80 transition-colors">
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Listings;