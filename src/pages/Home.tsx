import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Shield, Users, MapPin, Search, Package, Book, MessageCircle, FileCheck, RefreshCw, HandHeart } from 'lucide-react';

import { motion, useScroll, useTransform } from 'framer-motion';
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
      {/* Hero Section - World Class & Dynamic */}
      {isPremium ? (
        <PremiumHero />
      ) : (
        <section className="relative bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 pt-24 pb-6 lg:py-20 px-4 overflow-hidden lg:min-h-[90vh] flex items-center">
          {/* Premium Background Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, gold 1px, transparent 0)`,

              backgroundSize: '40px 40px'
            }} />
          </div>

          {/* Floating Gold Particles with different speeds */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full blur-[1px]"
              style={{
                left: `${Math.random() * 100}% `,
                top: `${Math.random() * 100}% `,
              }}
              animate={{
                y: [0, -40, 0],
                x: [0, Math.random() * 20 - 10, 0],
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 2,
              }}
            />
          ))}

          <div className="relative z-10 max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

              {/* Left Content */}
              <div className="text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="inline-block bg-white/80 backdrop-blur-sm border border-yellow-200 px-4 py-1.5 rounded-full mb-6 shadow-sm"
                >
                  <span className="text-amber-600 font-bold text-sm tracking-wide uppercase">✨ The #1 Neighbourhood Marketplace</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                  className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight"
                >
                  <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent block">
                    Rent from
                  </span>
                  <span className="text-gray-900 block">
                    people you trust
                  </span>
                  <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent block text-4xl md:text-6xl mt-2 pb-2">
                    — right next door.
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="text-lg md:text-xl mb-10 text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed"
                >
                  Experience the joy of sharing. A trust-first marketplace with verified users, secure digital agreements, and a community that cares.
                </motion.p>

                {/* Premium Search Bar */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white p-2 rounded-2xl shadow-xl border border-yellow-100/50 mb-10 lg:max-w-md w-full relative z-20"
                >
                  <div className="flex flex-col sm:flex-row items-stretch gap-2">
                    <div className="flex flex-1 items-center gap-3 px-4 h-14 rounded-xl bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-100 transition-all">
                      <Search className="text-gray-400 w-5 h-5 flex-shrink-0" />
                      <input
                        type="text"
                        placeholder="Camera, Drill, Bicycle..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 text-base focus:outline-none min-w-0"
                      />
                    </div>
                    <button
                      onClick={handleSearch}
                      className="h-14 px-8 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl font-bold hover:shadow-lg hover:from-black hover:to-gray-900 transition-all active:scale-95"
                    >
                      Search
                    </button>
                  </div>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap gap-4 justify-center lg:justify-start"
                >
                  <Link
                    to="/listings"
                    className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-amber-200/50 hover:shadow-xl hover:scale-105 transition-all group relative overflow-hidden"
                  >
                    <span className="relative z-10">Find Rentals</span>
                    <MapPin className="w-5 h-5 group-hover:animate-bounce relative z-10" />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3, ease: 'linear' }}
                    />
                  </Link>
                  <Link
                    to="/add-item"
                    className="flex items-center gap-2 bg-white text-amber-600 px-8 py-4 rounded-xl font-bold text-lg shadow-md border-2 border-amber-50 hover:border-amber-200 hover:shadow-lg transition-all"
                  >
                    <span>List Something</span>
                    <Package className="w-5 h-5" />
                  </Link>
                </motion.div>

                {/* Social Proof */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-500 font-medium relative z-30"
                >
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map(i => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + (i * 0.1) }}
                        className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden shadow-sm"
                      >
                        <img src={`/images/avatar-${i}.png`} alt="Verified User" className="w-full h-full object-cover" />
                      </motion.div>
                    ))}
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.2 }}
                      className="w-10 h-10 rounded-full border-2 border-white bg-amber-100 flex items-center justify-center text-xs text-amber-700 font-bold shadow-sm"
                    >
                      +2k
                    </motion.div>
                  </div>
                  <p>Trusted by verified neighbours</p>
                </motion.div>
              </div>

              {/* Right Visuals - Dynamic Collage (Visible on Mobile now too, scaled) */}
              <div className="relative h-[380px] md:h-[600px] w-full perspective-[1000px] mt-20 mb-4 lg:mt-0 lg:mb-0 flex justify-center lg:block z-0">
                {/* Main Image - Tilted with Parallax */}
                <motion.div
                  initial={{ opacity: 0, rotateY: 5, rotateZ: -2, y: 30 }}
                  animate={{ opacity: 1, rotateY: 0, rotateZ: 2, y: 0 }}
                  transition={{ duration: 1, type: "spring" }}
                  whileHover={{ scale: 1.05, zIndex: 50, transition: { duration: 0.3 } }}
                  style={{ y: useTransform(useScroll().scrollY, [0, 500], [0, -30]) }}
                  className="absolute top-10 right-4 lg:right-10 w-[280px] md:w-[400px] h-[350px] md:h-[500px] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white z-10 relative group hover:shadow-[0_0_50px_rgba(255,193,7,0.4)] transition-all cursor-pointer"
                >
                  <img
                    src="/images/hero-community.png"
                    alt="Happy Indian Community"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg">
                      <p className="text-gray-900 font-bold text-sm">"Met my best friend through NFR!"</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <p className="text-xs text-gray-500">Verified Rental • 2 days ago</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Stack Effect Wrapper for Hero */}
                <motion.div
                  initial={{ opacity: 0, rotateZ: -8, y: 50 }}
                  animate={{ opacity: 1, rotateZ: -2, y: 10 }}
                  transition={{ duration: 1.2, delay: 0.2 }}
                  style={{
                    y: useTransform(useScroll().scrollY, [0, 500], [0, -50]),
                    rotateZ: useTransform(useScroll().scrollY, [0, 500], [-2, -5])
                  }}
                  whileHover={{ scale: 1.05, zIndex: 50, transition: { duration: 0.3 } }}
                  className="absolute top-14 right-6 w-[280px] md:w-[400px] h-[350px] md:h-[500px] bg-amber-100 rounded-[2rem] shadow-xl border-4 border-white/50 overflow-hidden cursor-pointer group"
                >
                  <img
                    src="/images/hero-stack-s3.png"
                    alt="Happy neighbours sharing"
                    className="w-full h-full object-cover opacity-90"
                  />

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-20">
                    <p className="text-white text-lg font-bold leading-tight text-right">Renting for <br /> <span className="text-yellow-400">₹50/day</span></p>
                  </div>
                </motion.div>




                {/* Floating Card 2 - Banana Image (Large) */}

              </div>

            </div>
          </div>
        </section >
      )
      }

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
              { icon: Shield, label: 'Verified renters & listers', delay: 0 },
              { icon: Book, label: 'Secure digital agreements', delay: 0.1 },
              { icon: Star, label: 'Genuine transparent reviews', delay: 0.2 },
              { icon: MapPin, label: 'Hyper-local discovery', delay: 0.3 },
              { icon: Users, label: '24/7 Human Support', delay: 0.4 }
            ].map((item) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: item.delay }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.05 }}
                className="text-center group cursor-default"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-white to-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-yellow-100 shadow-sm group-hover:shadow-md group-hover:border-amber-200 transition-all duration-300">
                  <item.icon className="w-8 h-8 text-amber-500 group-hover:text-amber-600 transition-colors" />
                </div>
                <p className="text-sm text-gray-700 font-bold leading-tight group-hover:text-amber-800 transition-colors">{item.label}</p>
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

          <div className="relative">
            {/* Desktop Connecting Line */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-200 to-transparent z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 relative z-10">
              {[
                {
                  icon: Search,
                  title: 'Search',
                  text: 'Browse items near you',
                  color: 'from-blue-400 to-blue-600'
                },
                {
                  icon: MessageCircle,
                  title: 'Chat',
                  text: 'Connect securely',
                  color: 'from-amber-400 to-orange-500'
                },
                {
                  icon: FileCheck,
                  title: 'Verify',
                  text: 'Digital Agreement',
                  color: 'from-green-400 to-emerald-600'
                },
                {
                  icon: RefreshCw,
                  title: 'Return',
                  text: 'Hand back & Review',
                  color: 'from-purple-400 to-indigo-600'
                }
              ].map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="group relative"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                      <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${step.color} p-[2px] shadow-lg shadow-gray-200 group-hover:scale-110 transition-transform duration-300`}>
                        <div className="w-full h-full bg-white rounded-full flex items-center justify-center relative overflow-hidden">
                          <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                          <step.icon className={`w-10 h-10 text-gray-700`} strokeWidth={1.5} />
                        </div>
                      </div>
                      <div className="absolute -bottom-3 -right-3 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center font-bold text-gray-400 text-sm border border-gray-100">
                        {index + 1}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600 text-sm font-medium leading-relaxed max-w-[200px]">{step.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              viewport={{ once: true }}
              className="mt-12 text-center"
            >
              <div className="inline-flex items-center gap-2 bg-white px-6 py-2 rounded-full shadow-sm border border-gray-100 text-gray-500 text-sm font-medium">
                <HandHeart className="w-4 h-4 text-amber-500" />
                <span>Simple. Secure. Neighbourly.</span>
              </div>
            </motion.div>
          </div>

          {/* Safety Guarantee Strip - Sleek Design */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            viewport={{ once: true }}
            className="mt-16 pt-10 border-t border-amber-100"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              {[
                { title: 'Verified Profiles', text: 'Real neighbours, verified identities.' },
                { title: 'Secure Payments', text: 'Money held safely until you approve.' },
                { title: 'Support is here', text: 'Issues? We mediate so you don\'t have to.' }
              ].map((feature, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-amber-500" />
                    <h4 className="font-bold text-gray-900">{feature.title}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{feature.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* NEW: How It Works / Value Prop Interstitial */}
      <section className="py-20 bg-gray-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('/images/community-bg.png')] opacity-20 bg-cover bg-center fixed-background"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-8">Join the Sharing Revolution</h2>
            <p className="text-xl text-gray-300 leading-relaxed mb-12">
              Every rental on NFR builds a stronger, more connected neighbourhood. Stop buying things you only use once. Start sharing today.
            </p>
          </motion.div>
        </div>
      </section >

      {/* Featured Items */}
      < section className="bg-gradient-to-br from-white via-amber-50/20 to-white py-16 px-4" >
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
                  onClick={() => navigate(`/ item / ${item.id} `)}
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
      </section >

      {/* Featured Services */}
      {
        featuredServices.length > 0 && (
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
                    onClick={() => navigate(`/ services / ${service.id} `)}
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
        )
      }

      {/* Featured Properties */}
      {
        featuredProperties.length > 0 && (
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
                    onClick={() => navigate(`/ properties / ${property.id} `)}
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
        )
      }

      {/* Two Paths: For Owners & Renters - World Class Cards */}
      <section className="bg-gray-50 py-24 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">Two ways to join the mission</h2>
            <p className="text-xl text-gray-500">Whether you have things or need things — we've got you.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 px-4">
            {/* LEFT - FOR OWNERS */}
            <div className="relative group">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-black/5 flex flex-col relative z-10"
              >
                <div className="h-72 overflow-hidden relative">
                  <img
                    src="/images/owner-camera.png"
                    alt="Owner listing item"
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8">
                    <div>
                      <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">For Listers</span>
                      <h3 className="text-3xl font-bold text-white leading-tight">Turn clutter into cash.</h3>
                    </div>
                  </div>
                </div>

                <div className="p-8 md:p-10 flex-1 flex flex-col">
                  <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                    Have a camera, drill, or party speaker gathering dust? List it in seconds and let your neighbours rent it safely.
                  </p>

                  <ul className="space-y-4 mb-10 flex-1">
                    {[
                      'You control the price & availability',
                      'Verified renters only',
                      'Insurance coverage included',
                      'Digital condition reports'
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-4">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-green-600 font-bold text-xs">✓</span>
                        </div>
                        <span className="text-gray-700 font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/add-item"
                    className="block w-full bg-gray-900 text-white px-6 py-4 rounded-xl font-bold text-center hover:bg-black transition-all text-lg shadow-lg"
                  >
                    Start Earning
                  </Link>
                </div>
              </motion.div>

              {/* Stack Effect Wrapper */}
              <div className="absolute top-4 -right-4 w-full h-full bg-gray-200 rounded-[2rem] -z-10 transform rotate-3"></div>
            </div>

            {/* RIGHT - FOR RENTERS */}
            <div className="relative group">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-black/5 flex flex-col relative z-10"
              >
                <div className="h-72 overflow-hidden relative">
                  <img
                    src="/images/renter-bike.png"
                    alt="Renter enjoying item"
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8">
                    <div>
                      <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">For Renters</span>
                      <h3 className="text-3xl font-bold text-white leading-tight">Own the experience, not the thing.</h3>
                    </div>
                  </div>
                </div>

                <div className="p-8 md:p-10 flex-1 flex flex-col">
                  <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                    Why buy a tent for one weekend? Rent high-quality items from neighbours near you for a fraction of the cost.
                  </p>

                  <ul className="space-y-4 mb-10 flex-1">
                    {[
                      'Save 90% compared to buying',
                      'No storage hassle',
                      'Meet cool neighbours',
                      'Eco-friendly consumption'
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-4">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-blue-600 font-bold text-xs">✓</span>
                        </div>
                        <span className="text-gray-700 font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/listings"
                    className="block w-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-white px-6 py-4 rounded-xl font-bold text-center hover:shadow-xl hover:scale-105 transition-all text-lg shadow-lg"
                  >
                    Explore Rentals
                  </Link>
                </div>
              </motion.div>
              {/* Stack Effect Wrapper */}
              <div className="absolute top-4 -left-4 w-full h-full bg-amber-100 rounded-[2rem] -z-10 transform -rotate-2"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Statement Section - World Class Parallax */}
      <section className="relative py-32 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/community-bg.png"
            alt="Community gathering"
            className="w-full h-full object-cover opacity-10 fixed-background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-white"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight mb-8 tracking-tight">
              We're not just building a platform.
              <br />
              <span className="bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 bg-clip-text text-transparent">
                We're building trust.
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-medium leading-relaxed">
              Behind every rental is a neighbour. Behind every transaction is a connection. Join 5,000+ others who are sharing more, buying less, and trusting their community again.
            </p>
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
    </div >
  );
};

export default Home;
