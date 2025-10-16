import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Home, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import PropertyCard from '../components/Properties/PropertyCard';
import { propertyService, Property, PropertyFilters } from '../services/propertyService';
import { showToast } from '../utils/toast';

const Properties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState<PropertyFilters>({
    type: [],
    city: '',
    minRent: undefined,
    maxRent: undefined,
    bedrooms: undefined,
    furnishing: undefined,
  });

  const propertyTypes = [
    { value: 'flat', label: 'Flat', icon: Home },
    { value: 'house', label: 'House', icon: Home },
    { value: 'pg', label: 'PG', icon: Building2 },
    { value: 'hostel', label: 'Hostel', icon: Building2 },
    { value: 'villa', label: 'Villa', icon: Home },
    { value: 'commercial', label: 'Commercial', icon: Building2 },
  ];

  const furnishingOptions = [
    { value: 'furnished', label: 'Furnished' },
    { value: 'semi-furnished', label: 'Semi-Furnished' },
    { value: 'unfurnished', label: 'Unfurnished' },
  ];

  const bedroomOptions = [1, 2, 3, 4, 5];

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [properties, filters, searchQuery]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const data = await propertyService.getApprovedProperties();
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      showToast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...properties];

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (property) =>
          property.title.toLowerCase().includes(query) ||
          property.description.toLowerCase().includes(query) ||
          property.city.toLowerCase().includes(query) ||
          property.locality?.toLowerCase().includes(query)
      );
    }

    // Property type
    if (filters.type && filters.type.length > 0) {
      filtered = filtered.filter((property) => filters.type!.includes(property.type));
    }

    // City
    if (filters.city) {
      filtered = filtered.filter((property) =>
        property.city.toLowerCase().includes(filters.city!.toLowerCase())
      );
    }

    // Rent range
    if (filters.minRent) {
      filtered = filtered.filter((property) => property.rent_amount >= filters.minRent!);
    }
    if (filters.maxRent) {
      filtered = filtered.filter((property) => property.rent_amount <= filters.maxRent!);
    }

    // Bedrooms
    if (filters.bedrooms) {
      filtered = filtered.filter((property) => property.bedrooms === filters.bedrooms);
    }

    // Furnishing
    if (filters.furnishing) {
      filtered = filtered.filter((property) => property.furnishing === filters.furnishing);
    }

    // OLX/JustDial Style: Featured properties first!
    filtered.sort((a, b) => {
      // Featured items come first
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      
      // Then by most recent
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    setFilteredProperties(filtered);
  };

  const handleTypeToggle = (type: string) => {
    const currentTypes = filters.type || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];
    setFilters({ ...filters, type: newTypes });
  };

  const clearFilters = () => {
    setFilters({
      type: [],
      city: '',
      minRent: undefined,
      maxRent: undefined,
      bedrooms: undefined,
      furnishing: undefined,
    });
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold mb-4">Find Your Perfect Home</h1>
            <p className="text-xl text-white/90 mb-8">
              Discover flats, houses, PG, and commercial spaces across India
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-lg p-2 flex gap-2">
              <div className="flex-1 flex items-center gap-2 px-4">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by location, locality, or property name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 outline-none text-gray-900"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filters
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white border-b border-gray-200 shadow-sm"
        >
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="space-y-6">
              {/* Property Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Property Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {propertyTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = filters.type?.includes(type.value);
                    return (
                      <button
                        key={type.value}
                        onClick={() => handleTypeToggle(type.value)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
                          isSelected
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-primary'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Min Rent (₹/month)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 10000"
                    value={filters.minRent || ''}
                    onChange={(e) =>
                      setFilters({ ...filters, minRent: e.target.value ? parseInt(e.target.value) : undefined })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Max Rent (₹/month)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 50000"
                    value={filters.maxRent || ''}
                    onChange={(e) =>
                      setFilters({ ...filters, maxRent: e.target.value ? parseInt(e.target.value) : undefined })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* Bedrooms & Furnishing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bedrooms
                  </label>
                  <div className="flex gap-2">
                    {bedroomOptions.map((num) => (
                      <button
                        key={num}
                        onClick={() => setFilters({ ...filters, bedrooms: num })}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          filters.bedrooms === num
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-primary'
                        }`}
                      >
                        {num} BHK
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Furnishing
                  </label>
                  <select
                    value={filters.furnishing || ''}
                    onChange={(e) => setFilters({ ...filters, furnishing: e.target.value || undefined })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Any</option>
                    {furnishingOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {filteredProperties.length} Properties Found
          </h2>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-20">
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Properties Found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or search criteria</p>
            <button
              onClick={clearFilters}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property, index) => (
              <PropertyCard key={property.id} property={property} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;
