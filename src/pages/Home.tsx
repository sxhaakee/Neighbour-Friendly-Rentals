import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, PenTool as Tool, Smartphone, Sofa, Package, Shield, Users, Star, Book, Camera, Dumbbell, Music, Shirt, PartyPopper, Gamepad2, Tent, Baby, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { listingService } from '../services/listingService';
import { Database } from '../lib/database.types';

type Listing = Database['public']['Tables']['listings']['Row'];

const Home = () => {
  const navigate = useNavigate();
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

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
  }, []);

  const fetchFeaturedListings = async () => {
    try {
      setLoading(true);
      const data = await listingService.getApprovedListings();
      // Get first 4 listings as featured
      setFeaturedListings(data.slice(0, 4));
    } catch (error) {
      console.error('Error fetching listings:', error);
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary/90 to-accent py-20 px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center text-white"
        >
          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
          >
            Rent Smart.<br />
            Share Local.<br />
            <span className="text-secondary">Save Together.</span>
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-xl md:text-2xl mb-8 text-teal-100"
          >
            Connect with your neighbours to share tools, books, electronics, and more.
          </motion.p>
          
          {/* Search Bar */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-xl p-2 max-w-2xl mx-auto mb-8 shadow-2xl"
          >
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
                className="h-12 px-6 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Search
              </button>
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/listings"
              className="bg-secondary text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-secondary/90 transition-colors shadow-lg"
            >
              Browse Rentals
            </Link>
            <button className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/30 transition-colors border border-white/30">
              Post an Item
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-xl text-gray-600">Find exactly what you need from trusted neighbors</p>
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
                className="bg-white p-3 sm:p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group"
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
      <section className="bg-gradient-to-br from-purple-50 to-blue-50 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">One Platform, All Your Rental Needs</h2>
            <p className="text-xl text-gray-600">From homes to events, we've got you covered</p>
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
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Find Your Home</h3>
              <p className="text-gray-600 mb-4">
                Discover flats, houses, PG, and commercial spaces across India. Verified listings from trusted owners and builders.
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
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Rent Products</h3>
              <p className="text-gray-600 mb-4">
                Electronics, tools, cameras, furniture and more. Rent from your neighbors and save money while building community.
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
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group opacity-75"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <PartyPopper className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Event Services</h3>
              <p className="text-gray-600 mb-4">
                DJ, catering, decorations, photography and more. Find verified service providers for all your celebrations.
              </p>
              <div className="flex items-center text-gray-400 font-semibold">
                Coming Soon
                <span className="ml-2">🚀</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Items</h2>
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
              {featuredListings.map((item: Listing, index: number) => (
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
