import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, MapPin, Star, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';
import { listingService } from '../services/listingService';
import { Database } from '../lib/database.types';

type Listing = Database['public']['Tables']['listings']['Row'];

const Listings = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [maxPrice, setMaxPrice] = useState(10000);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<string>('');
  const [sortBy, setSortBy] = useState<'relevance' | 'price-low' | 'price-high' | 'distance'>('relevance');

  const categories = ['All', 'Tools', 'Vehicles', 'Electronics', 'Furniture', 'Miscellaneous'];

  useEffect(() => {
    fetchListings();
    getUserLocation();
  }, []);

  useEffect(() => {
    filterListings();
  }, [listings, selectedCategory, searchQuery, maxPrice, sortBy, userLocation]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const data = await listingService.getApprovedListings();
      setListings(data);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // For demo purposes, we'll use a placeholder location
          // In production, you'd reverse geocode the coordinates
          setUserLocation('Current Location');
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  };

  const calculateDistance = (location1: string, location2: string): number => {
    // Simple string similarity for demo - in production use actual geocoding
    const loc1 = location1.toLowerCase();
    const loc2 = location2.toLowerCase();
    
    if (loc1 === loc2) return 0;
    if (loc1.includes(loc2) || loc2.includes(loc1)) return 1;
    
    // Extract city names and compare
    const city1 = loc1.split(',')[0].trim();
    const city2 = loc2.split(',')[0].trim();
    
    if (city1 === city2) return 2;
    return 10;
  };

  const filterListings = () => {
    let filtered = listings;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filtered = filtered.filter(item => item.price <= maxPrice);

    // Sort listings
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'distance' && userLocation) {
      filtered.sort((a, b) => {
        const distA = calculateDistance(userLocation, a.location);
        const distB = calculateDistance(userLocation, b.location);
        return distA - distB;
      });
    }

    setFilteredListings(filtered);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4"><span className="text-primary">Browse</span> Rentals</h1>
          <p className="text-xl text-gray-600">Find the perfect item to rent from your neighbors</p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Search */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search items or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="relevance">Sort: Relevance</option>
                <option value="distance">Sort: Nearest First</option>
                <option value="price-low">Sort: Price Low to High</option>
                <option value="price-high">Sort: Price High to Low</option>
              </select>
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Price: ₹{maxPrice}
            </label>
            <input
              type="range"
              min="0"
              max="10000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-primary"
            />
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
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">No listings found matching your criteria</p>
          </div>
        ) : (
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
                    src={item.images[0] || '/placeholder.jpg'}
                    alt={item.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary text-white px-2 py-1 rounded-full text-xs font-semibold">
                      {item.category}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      {item.availability}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 mb-4">by {item.owner_name}</p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-primary">
                      ₹{item.price}<span className="text-sm text-gray-500">/day</span>
                    </span>
                    <div className="flex items-center text-gray-500">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{item.location}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => navigate(`/item/${item.id}`)}
                    className="w-full bg-secondary text-gray-900 py-3 rounded-lg font-semibold hover:bg-secondary/80 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Listings;
