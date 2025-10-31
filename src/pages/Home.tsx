import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, PenTool as Tool, Smartphone, Sofa, Package, Shield, Users, Star, Book, Camera, Dumbbell, Music, Shirt, PartyPopper, Gamepad2, Tent, Baby, Home as HomeIcon, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { listingService } from '../services/listingService';
import { serviceProviderService } from '../services/serviceProviderService';
import { propertyService } from '../services/propertyService';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { PremiumHero } from '../components/PremiumHero';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [featuredListings, setFeaturedListings] = useState<any[]>([]);
  const [featuredServices, setFeaturedServices] = useState<any[]>([]);
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  const categories = [
    { name: 'Electronics', icon: Smartphone, color: 'bg-purple-100 text-purple-600' },
    { name: 'Cameras & Photography', icon: Camera, color: 'bg-indigo-100 text-indigo-600' },
    { name: 'Tools & Equipment', icon: Tool, color: 'bg-blue-100 text-blue-600' },
    { name: 'Sports & Fitness', icon: Dumbbell, color: 'bg-red-100 text-red-600' },
    { name: 'Musical Instruments', icon: Music, color: 'bg-pink-100 text-pink-600' },
    { name: 'Furniture', icon: Sofa, color: 'bg-orange-100 text-orange-600' },
    { name: 'Books & Media', icon: Book, color: 'bg-green-100 text-green-600' },
    { name: 'Clothing & Accessories', icon: Shirt, color: 'bg-teal-100 text-teal-600' },
    { name: 'Party & Events', icon: PartyPopper, color: 'bg-yellow-100 text-yellow-600' },
    { name: 'Gaming & Consoles', icon: Gamepad2, color: 'bg-violet-100 text-violet-600' },
    { name: 'Outdoor & Camping', icon: Tent, color: 'bg-emerald-100 text-emerald-600' },
    { name: 'Baby & Kids', icon: Baby, color: 'bg-rose-100 text-rose-600' },
  ];

  useEffect(() => {
    fetchFeaturedListings();
    checkPremiumStatus();
  }, [user]);

  const checkPremiumStatus = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('id', user.id)
        .single();
      
      setIsPremium(data?.is_premium || false);
    } catch (error) {
      console.error('Error checking premium status:', error);
    }
  };

  const fetchFeaturedListings = async () => {
    try {
      setLoading(true);
      // Fetch featured items, services, and properties
      const [items, services, properties] = await Promise.all([
        listingService.getFeaturedListings(6),
        serviceProviderService.getFeaturedProviders(6),
        propertyService.getFeaturedProperties(6)
      ]);
      
      setFeaturedListings(items);
      setFeaturedServices(services);
      setFeaturedProperties(properties);
    } catch (error) {
      console.error('Error fetching featured items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/listings?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/listings');
    }
  };


  return (
    <div className="min-h-screen">
      {/* Hero Section - Premium or Regular */}
      {isPremium ? (
        <PremiumHero />
      ) : (
        <section className="relative bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 py-20 px-4 overflow-hidden">
          <AnimatedBackground />
          <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Turn Your Stuff Into
              <br />
              <span className="text-white drop-shadow-lg">
                ₹15,000+ Monthly Income
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-white/90 font-medium">
              That camera in your closet? It could earn you ₹500/day. Your spare room? ₹20,000/month. Start earning from what you already own!
            </p>
            <p className="text-lg md:text-xl mb-8 text-white/95 font-bold drop-shadow-md">
              💰 Your neighbours are making ₹10,000-₹50,000/month. Why not you?
            </p>
          
          {/* Search Bar */}
          <div className="bg-white rounded-xl p-2 max-w-2xl mx-auto mb-8 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              <div className="flex flex-1 items-center gap-3 px-4 h-12 rounded-lg bg-white">
                <Search className="text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search items near you..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 bg-transparent text-gray-700 text-base focus:outline-none"
                />
              </div>
              <button 
                onClick={handleSearch}
                className="h-12 px-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg font-semibold hover:shadow-xl transition-all"
              >
                Search
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to="/listings"
                className="block bg-white text-amber-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-amber-50 transition-colors shadow-lg hover:shadow-2xl border-2 border-white"
              >
                💸 Start Saving Now
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to="/add-item"
                className="block bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/30 transition-colors border-2 border-white/30 hover:border-white/50"
              >
                🚀 Start Earning Today
              </Link>
            </motion.div>
          </div>
        </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-white via-amber-50/30 to-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4"><span className="bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 bg-clip-text text-transparent">Rent Anything.</span> Save Everything.</h2>
            <p className="text-xl text-gray-600">Why waste thousands buying when you can rent for a fraction?</p>
          </motion.div>

          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -3 }}
                onClick={() => navigate(`/listings?category=${encodeURIComponent(category.name)}`)}
                className="bg-gradient-to-br from-white to-amber-50 p-3 sm:p-4 rounded-lg shadow-md hover:shadow-xl border border-yellow-100 transition-all duration-200 cursor-pointer group"
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${category.color} rounded-lg flex items-center justify-center mb-2 mx-auto group-hover:scale-110 transition-transform duration-200`}>
                  <category.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-center text-gray-900 line-clamp-2">{category.name}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* New Platform Features */}
      <section className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4"><span className="bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 bg-clip-text text-transparent">Your Money-Making Machine</span></h2>
            <p className="text-xl text-gray-600">List once. Earn forever. It's that simple.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Property Rentals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              onClick={() => navigate('/properties')}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <HomeIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">💰 Properties That Pay</h3>
              <p className="text-gray-600 mb-4">
                Stop wasting rent! Find verified homes, PGs, and spaces. Or list your property and earn monthly passive income.
              </p>
              <div className="flex items-center text-primary font-semibold group-hover:gap-2 transition-all">
                Browse Properties
                <span className="ml-2 group-hover:ml-0 transition-all">→</span>
              </div>
            </motion.div>

            {/* Product Rentals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              onClick={() => navigate('/listings')}
              className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-6 shadow-lg hover:shadow-2xl border border-blue-100 transition-all duration-300 cursor-pointer group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">🎯 The Smart Money Move</h3>
              <p className="text-gray-600 mb-4">
                That camera collecting dust? List it and earn daily. Need a drill for one day? Rent instead of buying. Everyone wins.
              </p>
              <div className="flex items-center text-primary font-semibold group-hover:gap-2 transition-all">
                Browse Items
                <span className="ml-2 group-hover:ml-0 transition-all">→</span>
              </div>
            </motion.div>

            {/* Service Providers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              onClick={() => navigate('/services')}
              className="bg-gradient-to-br from-white to-orange-50 rounded-xl p-6 shadow-lg hover:shadow-2xl border border-orange-100 transition-all duration-300 cursor-pointer group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                <PartyPopper className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">💼 Turn Skills Into Cash</h3>
              <p className="text-gray-600 mb-4">
                DJ? Photographer? Caterer? Get booked daily. Customers save 40%, you earn more. No middlemen eating your profits.
              </p>
              <div className="flex items-center text-primary font-semibold group-hover:gap-2 transition-all">
                Browse Services
                <span className="ml-2 group-hover:ml-0 transition-all">→</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="bg-gradient-to-br from-white via-amber-50/20 to-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4"><span className="bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 bg-clip-text text-transparent">Featured Items</span></h2>
            <p className="text-xl text-gray-600">Popular rentals in your area</p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : featuredListings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-6">No listings available yet. Be the first to list an item!</p>
              <Link
                to="/add-item"
                className="bg-primary text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-colors shadow-lg inline-block"
              >
                Add Your First Item
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {featuredListings.map((item: any, index: number) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -3 }}
                  onClick={() => navigate(`/item/${item.id}`)}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden group cursor-pointer flex flex-col"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={item.images[0] || '/placeholder.jpg'}
                      alt={item.title}
                      className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="bg-primary text-white px-2 py-1 rounded text-xs font-semibold">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 flex flex-col flex-grow">
                    <h3 className="font-semibold text-sm text-gray-900 mb-2 line-clamp-2 h-10 group-hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2 h-8">{item.description}</p>
                    <div className="mt-auto">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold text-primary">
                          ₹{item.price}<span className="text-xs text-gray-500">/day</span>
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 truncate block">{item.location}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link
              to="/listings"
              className="bg-primary text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-colors shadow-lg"
            >
              View All Listings
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Services */}
      {featuredServices.length > 0 && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">⭐ Featured Services</h2>
              <p className="text-xl text-gray-600">Top-rated service providers</p>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {featuredServices.map((service: any, index: number) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -3 }}
                  onClick={() => navigate(`/services/${service.id}`)}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden group cursor-pointer flex flex-col"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={service.images?.[0] || '/placeholder.jpg'}
                      alt={service.business_name}
                      className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        {service.service_category || 'Service'}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 flex flex-col flex-grow">
                    <h3 className="font-semibold text-sm text-gray-900 mb-2 line-clamp-2 h-10 group-hover:text-primary transition-colors">{service.business_name}</h3>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2 h-8">{service.description}</p>
                    <div className="mt-auto">
                      <span className="text-xs text-gray-500 truncate block flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {service.city}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <Link
                to="/listings"
                className="bg-primary text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-colors shadow-lg"
              >
                View All Services
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Featured Properties */}
      {featuredProperties.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">⭐ Featured Properties</h2>
              <p className="text-xl text-gray-600">Premium rental properties</p>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {featuredProperties.map((property: any, index: number) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -3 }}
                  onClick={() => navigate(`/properties/${property.id}`)}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden group cursor-pointer flex flex-col"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={property.images?.[0] || '/placeholder.jpg'}
                      alt={property.title}
                      className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        Property
                      </span>
                    </div>
                  </div>
                  <div className="p-3 flex flex-col flex-grow">
                    <h3 className="font-semibold text-sm text-gray-900 mb-2 line-clamp-2 h-10 group-hover:text-primary transition-colors">{property.title}</h3>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2 h-8">₹{property.rent_amount}/month</p>
                    <div className="mt-auto">
                      <span className="text-xs text-gray-500 truncate block flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {property.city}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <Link
                to="/listings"
                className="bg-primary text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-colors shadow-lg"
              >
                View All Properties
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Trust Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Safe, Verified, and Local</h2>
            <p className="text-xl text-gray-600">Building trust in our community</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Verified Users',
                description: 'All members go through verification to ensure safe transactions'
              },
              {
                icon: Users,
                title: 'Community Driven',
                description: 'Built by neighbors, for neighbors. Stronger communities together'
              },
              {
                icon: Star,
                title: 'Trusted Reviews',
                description: 'Transparent rating system helps you make informed decisions'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
