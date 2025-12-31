import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Shield, Users, MapPin, Search, Package, Book, MessageCircle, FileCheck, RefreshCw, ArrowRight } from 'lucide-react';

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
        <section className="relative bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 pt-16 pb-2 lg:py-24 px-4 overflow-hidden lg:min-h-[90vh] flex items-center">
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
                left: `${Math.random() * 100}%`,
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
                  className="text-3xl md:text-7xl font-black mb-4 lg:mb-6 leading-tight tracking-tight"
                >
                  <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent block">
                    Rent from people
                  </span>
                  <span className="text-gray-900 block">
                    you can trust
                  </span>
                  <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent block text-2xl md:text-6xl mt-2 pb-2">
                    — right next door.
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="text-base md:text-xl mb-6 lg:mb-10 text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed"
                >
                  A trust-first rental marketplace with verified users, digital agreements, and local discovery.
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
                      className="h-14 px-8 bg-gradient-to-r from-gray-900 to-black text-white rounded-xl font-bold hover:shadow-xl transition-all active:scale-95 whitespace-nowrap"
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
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
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
      <section className="py-10 lg:py-20 px-4 relative bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/images/neighbours-bg.png')" }}>
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-6 lg:mb-12"
          >
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 lg:mb-6">Why Neighbour Friendly Rentals works</h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
            {[
              { icon: Shield, label: 'Verified renters & listers', delay: 0 },
              { icon: Book, label: 'Secure digital rental agreements', delay: 0.1 },
              { icon: Star, label: 'Transparent reviews after every rental', delay: 0.2 },
              { icon: MapPin, label: 'Neighbourhood-based discovery', delay: 0.3 },
              { icon: Users, label: 'Support before & after rental', delay: 0.4 }
            ].map((item) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: item.delay }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.05 }}
                className="text-center group cursor-default p-4 rounded-2xl transition-all duration-300 hover:bg-white/40 hover:backdrop-blur-sm hover:shadow-lg"
              >
                <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/50 shadow-sm group-hover:shadow-md group-hover:bg-white group-hover:border-amber-200 transition-all duration-300">
                  <item.icon className="w-8 h-8 text-amber-500 group-hover:text-amber-600 transition-colors" />
                </div>
                <p className="text-sm text-gray-900 font-bold leading-tight group-hover:text-amber-900 transition-colors drop-shadow-sm">{item.label}</p>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center text-black italic text-lg font-bold"
          >
            Trust isn't claimed. It's built into the system.
          </motion.p>
        </div>
      </section>

      {/* First Time Here Section */}
      <section className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 py-10 lg:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8 lg:mb-16"
          >
            <span className="text-amber-600 font-bold uppercase tracking-wider text-sm mb-2 block">How it works</span>
            <h2 className="text-2xl md:text-5xl font-black text-gray-900 mb-4 lg:mb-6">First time here?</h2>
            <p className="text-lg text-gray-600 font-bold">Renting is simple:</p>
          </motion.div>

          <div className="relative">
            {/* Desktop Connecting Line */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-200 to-transparent z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 relative z-10">
              {[
                {
                  icon: Search,
                  title: 'Browse',
                  text: 'Browse items & services near you',
                  color: 'from-amber-400 to-yellow-600'
                },
                {
                  icon: MessageCircle,
                  title: 'Chat',
                  text: 'Chat and confirm securely',
                  color: 'from-yellow-400 to-orange-500'
                },
                {
                  icon: FileCheck,
                  title: 'Verify',
                  text: 'Digital agreement protects both sides',
                  color: 'from-amber-500 to-yellow-500'
                },
                {
                  icon: RefreshCw,
                  title: 'Review',
                  text: 'Rent → Return → Review',
                  color: 'from-orange-400 to-amber-600'
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
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${step.color} p-[2px] shadow-lg shadow-gray-200 group-hover:scale-110 transition-transform duration-300`}>
                        <div className="w-full h-full bg-white rounded-full flex items-center justify-center relative overflow-hidden">
                          <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                          <step.icon className={`w-8 h-8 text-gray-700`} strokeWidth={1.5} />
                        </div>
                      </div>
                      <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center font-bold text-gray-400 text-xs border border-gray-100">
                        {index + 1}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-800 font-medium text-sm leading-relaxed max-w-[200px]">{step.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center text-gray-700 font-semibold italic"
            >
              No paperwork. No awkward follow-ups. No confusion.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Fear Handling Section - World Class Design */}
      <section className="py-10 lg:py-20 px-4 bg-white relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl opacity-50 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-50 rounded-full blur-3xl opacity-50 -z-10"></div>

        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8 lg:mb-16"
          >
            <span className="text-amber-600 font-bold uppercase tracking-wider text-sm mb-2 block">Peace of Mind</span>
            <h2 className="text-2xl md:text-5xl font-black text-gray-900 mb-4 lg:mb-6">What if something goes wrong?</h2>
            <p className="text-lg text-gray-600 font-bold">We've already thought about that.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {[
              { text: 'Digital agreements give clarity to both sides', icon: FileCheck },
              { text: 'Clear communication at every step', icon: MessageCircle },
              { text: 'Support if an issue arises', icon: Shield },
              { text: 'Post-rental follow-ups for peace of mind', icon: Star }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex items-center gap-6 group hover:border-amber-200 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500 transition-colors duration-300">
                  <item.icon className="w-6 h-6 text-amber-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <p className="text-lg text-gray-700 font-medium group-hover:text-gray-900 transition-colors">{item.text}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
              Renting should feel safe — not stressful.
            </h3>
          </motion.div>
        </div>
      </section>



      {/* Featured Items */}
      <section className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 py-10 lg:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8 lg:mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-sm font-bold mb-4 shadow-sm">
              <Package className="w-4 h-4 fill-amber-500 text-amber-500" />
              Top Rated Items
            </div>
            <h2 className="text-2xl md:text-5xl font-black mb-2 lg:mb-4 text-gray-900 tracking-tight">Featured Items</h2>
            <p className="text-lg text-gray-600">Popular rentals in your area</p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
            </div>
          ) : featuredListings.length === 0 ? (
            <div className="text-center py-20 bg-amber-50/50 rounded-3xl border border-amber-100">
              <Package className="w-16 h-16 text-amber-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-8">No listings available yet. Be the first to list an item!</p>
              <Link
                to="/add-item"
                className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all shadow-lg inline-block"
              >
                Add Your First Item
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {featuredListings.map((item: any, index: number) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  onClick={() => navigate(`/item/${item.id}`)}
                  className="group cursor-pointer"
                >
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 h-full flex flex-col relative">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={item.images[0] || '/placeholder.jpg'}
                        alt={item.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="bg-white/90 backdrop-blur-md text-gray-900 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border border-gray-100">
                          {item.category}
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="font-bold text-gray-900 group-hover:text-amber-600 transition-colors line-clamp-1 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-400 uppercase tracking-tighter text-[10px]">Price</span>
                          <span className="text-xl font-black text-amber-600">
                            ₹{item.price}<span className="text-xs font-medium text-gray-400">/{formatPricingModel(item.pricing_model)}</span>
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 uppercase block mb-1">Location</span>
                          <span className="text-xs font-bold text-gray-900 flex items-center justify-end">
                            <MapPin className="w-3 h-3 mr-1 text-amber-500" />
                            {item.location.split(',')[0]}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Link
              to="/listings"
              className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white px-12 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl hover:scale-105 transition-all inline-flex items-center gap-2 group shimmer-gold"
            >
              Explore All Items
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section >

      {/* Featured Services */}
      {
        featuredServices.length > 0 && (
          <section className="py-12 lg:py-24 px-4 bg-gray-50/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100/30 rounded-full blur-3xl -z-10"></div>
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-8 lg:mb-16"
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-sm font-bold mb-4 shadow-sm">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  Verified Experts
                </div>
                <h2 className="text-3xl md:text-5xl font-black mb-2 lg:mb-4 text-gray-900 tracking-tight">Featured Services</h2>
                <p className="text-lg text-gray-600">Top-rated service providers in your vicinity</p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredServices.map((service: any, index: number) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    onClick={() => navigate(`/services/${service.id}`)}
                    className="group cursor-pointer bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={service.images?.[0] || '/placeholder.jpg'}
                        alt={service.business_name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute top-3 right-3">
                        <div className="bg-amber-500 text-white p-2 rounded-full shadow-lg transform -rotate-12 group-hover:rotate-0 transition-transform font-black">
                          <Star className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                          {service.category || 'Expert'}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-amber-600 transition-colors mb-2 line-clamp-1">
                        {service.business_name}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-6 leading-relaxed">
                        {service.description}
                      </p>

                      <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-gray-400">
                        <span className="text-xs font-bold flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-amber-500" />
                          {service.city}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-tighter">View Profile →</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="text-center mt-16"
              >
                <Link
                  to="/listings?tab=services"
                  className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white px-12 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl hover:scale-105 transition-all inline-flex items-center gap-2 group shimmer-gold"
                >
                  Browse Service Directory
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>
          </section>
        )
      }

      {/* Featured Properties */}
      {
        featuredProperties.length > 0 && (
          <section className="py-24 px-4 bg-white">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900 tracking-tight">Premium Properties</h2>
                <p className="text-xl text-gray-500">Curated living spaces for your next move</p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {featuredProperties.map((property: any, index: number) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    onClick={() => navigate(`/properties/${property.id}`)}
                    className="group cursor-pointer"
                  >
                    <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 h-full flex flex-col">
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img
                          src={property.images?.[0] || '/placeholder.jpg'}
                          alt={property.title}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                          <div className="text-white">
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-1 block">Luxury Stay</span>
                            <span className="text-2xl font-black">₹{property.rent_amount}<span className="text-xs font-normal opacity-80">/mo</span></span>
                          </div>
                          <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold border border-white/30 uppercase tracking-tighter">
                            {property.property_type || 'Property'}
                          </span>
                        </div>
                      </div>

                      <div className="p-8 flex flex-col flex-grow">
                        <h3 className="font-bold text-xl text-gray-900 group-hover:text-amber-600 transition-colors mb-2">
                          {property.title}
                        </h3>
                        <div className="flex items-center gap-4 text-gray-400 text-sm mb-6">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-amber-500" />
                            {property.city}
                          </span>
                        </div>
                        <Link
                          to={`/properties/${property.id}`}
                          className="mt-auto w-full py-3 rounded-xl border border-gray-100 group-hover:border-amber-500 group-hover:bg-amber-50 transition-all text-center font-bold text-gray-900"
                        >
                          Discover Details
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="text-center mt-20"
              >
                <Link
                  to="/listings?tab=properties"
                  className="inline-flex items-center gap-2 text-amber-600 font-black text-xl hover:translate-x-2 transition-transform"
                >
                  Explore All Residential Listings <span>→</span>
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
                      <h3 className="text-3xl font-bold text-white leading-tight">Turn unused items into income — safely</h3>
                    </div>
                  </div>
                </div>

                <div className="p-8 md:p-10 flex-1 flex flex-col">
                  <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                    Have a camera, drill, or party speaker gathering dust? List it in seconds and let your neighbours rent it safely.
                  </p>

                  <ul className="space-y-4 mb-10 flex-1">
                    {[
                      { text: 'Rent only to verified users' },
                      { text: 'Clear terms & digital proof' },
                      { text: 'You decide availability & pricing' },
                      { text: 'Earn from what you already own' }
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                        <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-amber-600 text-sm font-bold">✓</span>
                        </div>
                        {item.text}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/add-item"
                    className="w-full block text-center bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-black hover:shadow-lg transition-all"
                  >
                    List Your Item
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
                      <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">For Renters</span>
                      <h3 className="text-3xl font-bold text-white leading-tight">Get what you need, without buying</h3>
                    </div>
                  </div>
                </div>

                <div className="p-8 md:p-10 flex-1 flex flex-col">
                  <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                    Why buy a tent for one weekend? Rent high-quality items from neighbours near you for a fraction of the cost.
                  </p>

                  <ul className="space-y-4 mb-10 flex-1">
                    {[
                      { text: 'Affordable local rentals' },
                      { text: 'Faster than online shopping' },
                      { text: 'Better for the planet' },
                      { text: 'No long-term commitment' }
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-4">
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-gray-600 font-bold text-xs">✓</span>
                        </div>
                        <span className="text-gray-700 font-medium">{item.text}</span>
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
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 1.2,
              ease: [0.22, 1, 0.36, 1], // Premium quint ease
              delay: 0.1
            }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-5xl md:text-8xl font-black text-gray-900 leading-tight mb-8 tracking-tighter">
              We're not just building <br className="hidden md:block" /> a rental platform.
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
    </div >
  );
};

export default Home;
