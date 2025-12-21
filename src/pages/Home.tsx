import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, PenTool as Tool, Smartphone, Sofa, Package, Shield, Users, Star, Book, Camera, Dumbbell, Music, Shirt, PartyPopper, Gamepad2, Tent, Baby, Home as HomeIcon, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { listingService } from '../services/listingService';
import { serviceProviderService } from '../services/serviceProviderService';
import { propertyService } from '../services/propertyService';
import { PremiumHero } from '../components/PremiumHero';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { formatPricingModel } from '../utils/pricing';

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
    { name: 'Books', icon: Book, color: 'bg-amber-100 text-amber-600' },
    { name: 'Media', icon: Book, color: 'bg-amber-100 text-amber-600' },
    { name: 'Clothing & Accessories', icon: Shirt, color: 'bg-amber-100 text-amber-600' },
    { name: 'Party & Events', icon: PartyPopper, color: 'bg-yellow-100 text-yellow-600' },
    { name: 'Gaming & Consoles', icon: Gamepad2, color: 'bg-violet-100 text-violet-600' },
    { name: 'Outdoor & Camping', icon: Tent, color: 'bg-amber-100 text-amber-600' },
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

      setIsPremium((data as any)?.is_premium || false);
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
        <section className="relative bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 py-20 px-4 overflow-hidden">
          {/* Premium Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, gold 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }} />
          </div>

          {/* Floating Gold Particles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          <div className="relative z-10 max-w-6xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight"
            >
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                Rent from people you can trust —
              </span>
              <br />
              <span className="bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 bg-clip-text text-transparent">
                right in your neighbourhood
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl mb-8 text-gray-700 max-w-3xl mx-auto"
            >
              A trust-first rental marketplace with verified users, digital agreements, and local discovery.
            </motion.p>

            {/* Premium Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-2xl p-2 max-w-3xl mx-auto mb-8 shadow-xl border-2 border-yellow-200"
            >
              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                <div className="flex flex-1 items-center gap-3 px-6 h-14 rounded-xl bg-gray-50">
                  <Search className="text-amber-500 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search items near you..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 text-base focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="h-14 px-8 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-white rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all"
                >
                  Search
                </button>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/listings"
                  className="block bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
                >
                  💸 Start Saving Now
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/add-item"
                  className="block bg-white text-amber-600 px-10 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all border-2 border-amber-300"
                >
                  🚀 Start Earning Today
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Trust Signals Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Why Neighbour Friendly Rentals works</h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
            {[
              { icon: Shield, label: 'Verified renters & listers' },
              { icon: Book, label: 'Secure digital rental agreements' },
              { icon: Star, label: 'Transparent reviews after every rental' },
              { icon: MapPin, label: 'Neighbourhood-based discovery' },
              { icon: Users, label: 'Support before & after rental' }
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl flex items-center justify-center mx-auto mb-4 border border-yellow-200">
                  <item.icon className="w-8 h-8 text-amber-600" />
                </div>
                <p className="text-sm text-gray-700 font-medium leading-tight">{item.label}</p>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center text-gray-600 italic text-sm"
          >
            Trust isn't claimed. It's built into the system.
          </motion.p>
        </div>
      </section>

      {/* First Time Here Section */}
      <section className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">First time here?</h2>
            <p className="text-xl text-gray-600">Renting is simple:</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { num: '1', text: 'Browse items & services near you' },
              { num: '2', text: 'Chat and confirm securely' },
              { num: '3', text: 'Digital agreement protects both sides' },
              { num: '4', text: 'Rent → Return → Review' }
            ].map((step, index) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-md text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                  {step.num}
                </div>
                <p className="text-gray-700 font-medium">{step.text}</p>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center text-gray-700 font-semibold"
          >
            No paperwork. No awkward follow-ups. No confusion.
          </motion.p>
        </div>
      </section>

      {/* Fear Handling Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">We've already thought about that.</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {[
              'Digital agreements give clarity to both sides',
              'Clear communication at every step',
              'Support if an issue arises',
              'Post-rental follow-ups for peace of mind'
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start gap-3"
              >
                <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold text-sm">✓</span>
                </div>
                <p className="text-gray-700 font-medium">{item}</p>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center text-2xl md:text-3xl font-bold text-gray-900"
          >
            Renting should feel safe — not stressful.
          </motion.p>
        </div>
      </section>

      {/* Featured Items */}
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
                className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:scale-105 transition-colors shadow-lg inline-block"
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
                  className="bg-gradient-to-br from-white to-amber-50 rounded-lg shadow-md border border-yellow-100-md hover:shadow-lg transition-all duration-200 overflow-hidden group cursor-pointer flex flex-col"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={item.images[0] || '/placeholder.jpg'}
                      alt={item.title}
                      className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white px-2 py-1 rounded text-xs font-semibold">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 flex flex-col flex-grow">
                    <h3 className="font-semibold text-sm text-gray-900 mb-2 line-clamp-2 h-10 group-hover:text-amber-600 transition-colors">{item.title}</h3>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2 h-8">{item.description}</p>
                    <div className="mt-auto">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold text-amber-600">
                          ₹{item.price}<span className="text-xs text-gray-500">{formatPricingModel(item.pricing_model)}</span>
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
              className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:scale-105 transition-colors shadow-lg"
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
              <h2 className="text-4xl font-bold mb-4"><span className="bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 bg-clip-text text-transparent">⭐ Featured Services</span></h2>
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
                  className="bg-gradient-to-br from-white to-amber-50 rounded-lg shadow-md border border-yellow-100-md hover:shadow-lg transition-all duration-200 overflow-hidden group cursor-pointer flex flex-col"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={service.images?.[0] || '/placeholder.jpg'}
                      alt={service.business_name}
                      className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="bg-amber-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        {service.category || 'Service'}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 flex flex-col flex-grow">
                    <h3 className="font-semibold text-sm text-gray-900 mb-2 line-clamp-2 h-10 group-hover:text-amber-600 transition-colors">{service.business_name}</h3>
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
                to="/listings?tab=services"
                className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:scale-105 transition-colors shadow-lg"
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
              <h2 className="text-4xl font-bold mb-4"><span className="bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 bg-clip-text text-transparent">🏠 Featured Properties</span></h2>
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
                  className="bg-gradient-to-br from-white to-amber-50 rounded-lg shadow-md border border-yellow-100-md hover:shadow-lg transition-all duration-200 overflow-hidden group cursor-pointer flex flex-col"
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
                    <h3 className="font-semibold text-sm text-gray-900 mb-2 line-clamp-2 h-10 group-hover:text-amber-600 transition-colors">{property.title}</h3>
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
                className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:scale-105 transition-colors shadow-lg"
              >
                View All Properties
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Two Paths: For Owners & Renters */}
      <section className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Two ways to use Neighbour Friendly</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* LEFT - FOR OWNERS */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-lg"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Turn unused items into income — safely</h3>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  'Rent only to verified users',
                  'Clear terms & digital proof',
                  'You decide availability & pricing',
                  'Earn from what you already own'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white font-bold text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/add-item"
                className="block w-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold text-center hover:shadow-xl transition-all"
              >
                List Your Item
              </Link>
            </motion.div>

            {/* RIGHT - FOR RENTERS */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-lg"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Get what you need, without buying</h3>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  'Affordable local rentals',
                  'Faster than online shopping',
                  'Better for the planet',
                  'No long-term commitment'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white font-bold text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/listings"
                className="block w-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold text-center hover:shadow-xl transition-all"
              >
                Explore Rentals
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Community Statement Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
              We're not just building a rental platform.
              <br />
              <span className="bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 bg-clip-text text-transparent">
                We're building neighbourhood trust at scale.
              </span>
            </h2>
          </motion.div>
        </div>
      </section>

      {/* Soft CTA Section */}
      <section className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Start with one rental.
            </h2>
            <p className="text-xl text-gray-600 mb-8">See how trust feels.</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/listings"
                className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition-all"
              >
                Find Rentals
              </Link>
              <Link
                to="/add-item"
                className="bg-white text-amber-600 px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition-all border-2 border-amber-300"
              >
                List an Item
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
