import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Phone, Mail, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { serviceProviderService, ServiceProvider } from '../services/serviceProviderService';
import { showToast } from '../utils/toast';

const Services = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    city: '',
    minPrice: '',
    maxPrice: '',
  });

  const categories = [
    { value: 'all', label: 'All Services' },
    { value: 'event-management', label: 'Event Management' },
    { value: 'catering', label: 'Catering' },
    { value: 'dj', label: 'DJ' },
    { value: 'decoration', label: 'Decoration' },
    { value: 'photography', label: 'Photography' },
    { value: 'videography', label: 'Videography' },
    { value: 'shamiyana', label: 'Shamiyana' },
    { value: 'sound-system', label: 'Sound System' },
    { value: 'lighting', label: 'Lighting' },
    { value: 'mehendi', label: 'Mehendi' },
    { value: 'makeup', label: 'Makeup' },
  ];

  useEffect(() => {
    fetchServices();
  }, [filters]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const filterObj: any = {};
      
      if (filters.category !== 'all') filterObj.category = filters.category;
      if (filters.city) filterObj.city = filters.city;
      if (filters.minPrice) filterObj.price_range_min = parseInt(filters.minPrice);
      if (filters.maxPrice) filterObj.price_range_max = parseInt(filters.maxPrice);

      const data = await serviceProviderService.getServiceProviders(filterObj);
      
      // OLX/JustDial Style: Featured first, then by rating
      const sorted = data.sort((a, b) => {
        // Priority 1: Featured items come first
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        
        // Priority 2: Verified providers
        if (a.verified && !b.verified) return -1;
        if (!a.verified && b.verified) return 1;
        
        // Priority 3: By rating
        return (b.rating || 0) - (a.rating || 0);
      });
      
      setServices(sorted);
    } catch (error) {
      console.error('Error fetching services:', error);
      showToast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setFilters({ ...filters, city: searchQuery });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-500 to-pink-600 text-white py-12 md:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Find Perfect Service Providers</h1>
            <p className="text-lg md:text-xl text-white/90">
              DJ, Catering, Photography, Decoration & More
            </p>
          </motion.div>

          {/* Search Bar */}
          <div className="bg-white rounded-xl p-2 max-w-2xl mx-auto shadow-2xl">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex flex-1 items-center gap-3 px-4 h-12 rounded-lg bg-white">
                <Search className="text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by city or service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 bg-transparent text-gray-700 focus:outline-none"
                />
              </div>
              <button
                onClick={handleSearch}
                className="h-12 px-6 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
              <input
                type="text"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                placeholder="e.g., Bangalore"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Min Price</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                placeholder="₹ Min"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Max Price</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                placeholder="₹ Max"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            {loading ? 'Loading...' : `${services.length} Service Provider${services.length !== 1 ? 's' : ''} Found`}
          </p>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No service providers found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate(`/services/${service.id}`)}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group"
              >
                {/* Image */}
                <div className="relative h-48 bg-gradient-to-br from-orange-100 to-pink-100 overflow-hidden">
                  {service.images && service.images.length > 0 ? (
                    <img
                      src={service.images[0]}
                      alt={service.business_name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <TrendingUp className="w-16 h-16 text-orange-300" />
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {service.featured && (
                      <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                        ⭐ Featured
                      </span>
                    )}
                    {service.verified && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                    {service.business_name}
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="line-clamp-1">{service.city}, {service.state}</span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{service.rating?.toFixed(1) || '0.0'}</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-600">{service.total_bookings || 0} bookings</span>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{service.description}</p>

                  {service.base_price && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Starting from</span>
                      <span className="text-lg font-bold text-orange-600">
                        ₹{service.base_price.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}

                  <button className="w-full mt-4 bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
