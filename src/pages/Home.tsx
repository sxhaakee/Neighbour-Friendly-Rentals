import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, PenTool as Tool, Smartphone, Sofa, Package, Shield, Users, Star, Book } from 'lucide-react';
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
    { name: 'Tools', icon: Tool, color: 'bg-blue-100 text-blue-600' },
    { name: 'Books', icon: Book, color: 'bg-green-100 text-green-600' },
    { name: 'Electronics', icon: Smartphone, color: 'bg-purple-100 text-purple-600' },
    { name: 'Furniture', icon: Sofa, color: 'bg-orange-100 text-orange-600' },
    { name: 'Miscellaneous', icon: Package, color: 'bg-pink-100 text-pink-600' },
  ];

  useEffect(() => {
    fetchFeaturedListings();
  }, []);

  const fetchFeaturedListings = async () => {
    try {
      setLoading(true);
      const data = await listingService.getApprovedListings();
      // Get first 3 listings as featured
      setFeaturedListings(data.slice(0, 3));
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

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group"
              >
                <div className={`w-16 h-16 ${category.color} rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-200`}>
                  <category.icon className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-center text-gray-900">{category.name}</h3>
              </motion.div>
            ))}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredListings.map((item: Listing, index: number) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  onClick={() => navigate(`/item/${item.id}`)}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden group cursor-pointer"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={item.images[0] || '/placeholder.jpg'}
                      alt={item.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-1">{item.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-primary">
                        ₹{item.price}<span className="text-sm text-gray-500">/day</span>
                      </span>
                      <span className="text-gray-500 text-sm">{item.location}</span>
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
