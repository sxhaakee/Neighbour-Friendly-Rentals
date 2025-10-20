import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Star, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';
import { listingService } from '../services/listingService';
import { serviceProviderService } from '../services/serviceProviderService';
import { propertyService } from '../services/propertyService';
import { Database } from '../lib/database.types';
import { SearchFilters, FilterValues } from '../components/SearchFilters';

type Listing = Database['public']['Tables']['listings']['Row'];
type ServiceProvider = Database['public']['Tables']['service_providers']['Row'];
type Property = Database['public']['Tables']['properties']['Row'];

const Listings = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'items' | 'services' | 'properties'>('items');
  const [listings, setListings] = useState<Listing[]>([]);
  const [services, setServices] = useState<ServiceProvider[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [filteredServices, setFilteredServices] = useState<ServiceProvider[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [maxPrice, setMaxPrice] = useState(10000);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<string>('');
  const [sortBy, setSortBy] = useState<'relevance' | 'price-low' | 'price-high' | 'distance'>('relevance');

  const categories = [
    'All',
    'Electronics',
    'Cameras & Photography',
    'Tools & Equipment',
    'Vehicles',
    'Sports & Fitness',
    'Musical Instruments',
    'Furniture',
    'Appliances',
    'Books & Media',
    'Clothing & Accessories',
    'Party & Events',
    'Gaming & Consoles',
    'Outdoor & Camping',
    'Baby & Kids',
    'Medical & Health',
    'Miscellaneous'
  ];

  useEffect(() => {
    fetchListings();
    fetchServices();
    fetchProperties();
    getUserLocation();
  }, []);

  useEffect(() => {
    filterListings();
  }, [listings, selectedCategory, searchQuery, maxPrice, sortBy, userLocation]);

  useEffect(() => {
    filterServices();
  }, [services, searchQuery]);

  useEffect(() => {
    filterProperties();
  }, [properties, searchQuery, maxPrice]);

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

  const fetchServices = async () => {
    try {
      const data = await serviceProviderService.getApprovedProviders();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchProperties = async () => {
    try {
      const data = await propertyService.getApprovedProperties();
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
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

    // Sort listings - OLX/JustDial style: Featured items first!
    filtered.sort((a, b) => {
      // First priority: Featured items come first
      const aFeatured = (a as any).featured || false;
      const bFeatured = (b as any).featured || false;
      
      if (aFeatured && !bFeatured) return -1;
      if (!aFeatured && bFeatured) return 1;
      
      // Second priority: Apply user's selected sort
      if (sortBy === 'price-low') {
        return a.price - b.price;
      } else if (sortBy === 'price-high') {
        return b.price - a.price;
      } else if (sortBy === 'distance' && userLocation) {
        const distA = calculateDistance(userLocation, a.location);
        const distB = calculateDistance(userLocation, b.location);
        return distA - distB;
      }
      
      // Default: Most recent first
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    setFilteredListings(filtered);
  };

  const filterServices = () => {
    let filtered = services;

    if (searchQuery) {
      filtered = filtered.filter(service =>
        service.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort: Featured first
    filtered.sort((a, b) => {
      const aFeatured = (a as any).featured || false;
      const bFeatured = (b as any).featured || false;
      
      if (aFeatured && !bFeatured) return -1;
      if (!aFeatured && bFeatured) return 1;
      
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    setFilteredServices(filtered);
  };

  const filterProperties = () => {
    let filtered = properties;

    if (searchQuery) {
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filtered = filtered.filter(property => property.rent_amount <= maxPrice);

    // Sort: Featured first
    filtered.sort((a, b) => {
      const aFeatured = (a as any).featured || false;
      const bFeatured = (b as any).featured || false;
      
      if (aFeatured && !bFeatured) return -1;
      if (!aFeatured && bFeatured) return 1;
      
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    setFilteredProperties(filtered);
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

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex justify-center gap-2 mb-8"
        >
          <button
            onClick={() => setActiveTab('items')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'items'
                ? 'bg-primary text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            📦 Items
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'services'
                ? 'bg-primary text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            🛠️ Services
          </button>
          <button
            onClick={() => setActiveTab('properties')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'properties'
                ? 'bg-primary text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            🏠 Properties
          </button>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search items or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Advanced Filters */}
            <SearchFilters
              onApplyFilters={(filters: FilterValues) => {
                if (filters.category) setSelectedCategory(filters.category);
                if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
                  setMaxPrice(filters.priceMax || 10000);
                }
                if (filters.sortBy) {
                  const sortMap: Record<string, string> = {
                    newest: 'relevance',
                    price_low: 'price-low',
                    price_high: 'price-high',
                    popular: 'relevance'
                  };
                  setSortBy(sortMap[filters.sortBy] as any);
                }
              }}
              onReset={() => {
                setSelectedCategory('All');
                setMaxPrice(10000);
                setSortBy('relevance');
              }}
            />
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
        ) : activeTab === 'items' && filteredListings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">No items found matching your criteria</p>
          </div>
        ) : activeTab === 'services' && filteredServices.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">No services found matching your criteria</p>
          </div>
        ) : activeTab === 'properties' && filteredProperties.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">No properties found matching your criteria</p>
          </div>
        ) : (
          <>
            {/* Items Grid */}
            {activeTab === 'items' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3"
              >
                {filteredListings.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.5) }}
                whileHover={{ y: -3 }}
                onClick={() => navigate(`/item/${item.id}`)}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer group flex flex-col"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={item.images[0] || '/placeholder.jpg'}
                    alt={item.title}
                    className="w-full h-32 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Featured Badge - OLX/JustDial Style */}
                  {(item as any).featured && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded text-xs font-bold shadow-lg flex items-center gap-1">
                        ⭐ FEATURED
                      </span>
                    </div>
                  )}
                  {!(item as any).featured && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-primary text-white px-1.5 py-0.5 rounded text-xs font-semibold">
                        {item.category}
                      </span>
                    </div>
                  )}
                  {item.availability === 'Available' && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-green-500 text-white px-1.5 py-0.5 rounded text-xs font-semibold">
                        ✓
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-2 sm:p-3 flex flex-col h-full">
                  <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2 truncate">by {item.owner_name}</p>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base sm:text-lg font-bold text-primary">
                      ₹{item.price}<span className="text-xs text-gray-500">/day</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-500 mb-3">
                    <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="text-xs truncate">{item.location}</span>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/item/${item.id}`);
                    }}
                    className="w-full bg-secondary text-gray-900 py-1.5 sm:py-2 rounded text-xs sm:text-sm font-semibold hover:bg-secondary/80 transition-colors mt-auto"
                  >
                    View
                  </button>
                </div>
              </motion.div>
            ))}
              </motion.div>
            )}

            {/* Services Grid */}
            {activeTab === 'services' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              >
                {filteredServices.map((service, index) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.5) }}
                    whileHover={{ y: -3 }}
                    onClick={() => navigate(`/services/${service.id}`)}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={service.images?.[0] || '/placeholder.jpg'}
                      alt={service.business_name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2">{service.business_name}</h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{service.description}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{service.city}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Properties Grid */}
            {activeTab === 'properties' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              >
                {filteredProperties.map((property, index) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.5) }}
                    whileHover={{ y: -3 }}
                    onClick={() => navigate(`/properties/${property.id}`)}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={property.images?.[0] || '/placeholder.jpg'}
                      alt={property.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2">{property.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">₹{property.rent_amount}/month</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{property.city}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Listings;
