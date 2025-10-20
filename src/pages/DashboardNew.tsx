import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, Home, Briefcase, Heart, TrendingUp, Eye, Trash2, Edit2, Star, Crown, Calendar, MapPin, IndianRupee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { listingService } from '../services/listingService';
import { propertyService } from '../services/propertyService';
import { serviceProviderService } from '../services/serviceProviderService';
import { favoritesService } from '../services/favoritesService';
import { showToast } from '../utils/toast';
import { FavoriteButton } from '../components/FavoriteButton';
import { PremiumUpgradeModal } from '../components/PremiumUpgradeModal';

const DashboardNew = () => {
  const navigate = useNavigate();
  const { user, profile, isPremium, listingCounts, canAddListing, refreshListingCounts, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'items' | 'properties' | 'services' | 'favorites'>('items');
  const [myListings, setMyListings] = useState<any[]>([]);
  const [myProperties, setMyProperties] = useState<any[]>([]);
  const [myServices, setMyServices] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumModalType, setPremiumModalType] = useState<'item' | 'property' | 'service'>('item');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    fetchData();
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [items, properties, services, favs] = await Promise.all([
        listingService.getUserListings(user!.id),
        propertyService.getOwnerProperties(user!.id),
        serviceProviderService.getOwnerProviders(user!.id),
        favoritesService.getUserFavorites(user!.id),
      ]);

      setMyListings(items);
      setMyProperties(properties);
      setMyServices(services);
      setFavorites(favs);
      await refreshListingCounts();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showToast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = (type: 'item' | 'property' | 'service') => {
    if (!canAddListing(type)) {
      setPremiumModalType(type);
      setShowPremiumModal(true);
      return;
    }

    const routes = {
      item: '/add-item',
      property: '/add-property',
      service: '/add-service',
    };
    navigate(routes[type]);
  };

  const handleDelete = async (type: 'item' | 'property' | 'service', id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      // Optimistic UI update - remove from state immediately
      if (type === 'item') {
        setMyListings(prev => prev.filter(item => item.id !== id));
      } else if (type === 'property') {
        setMyProperties(prev => prev.filter(item => item.id !== id));
      } else {
        setMyServices(prev => prev.filter(item => item.id !== id));
      }

      // Delete from database
      if (type === 'item') await listingService.deleteListing(id);
      else if (type === 'property') await propertyService.deleteProperty(id);
      else await serviceProviderService.deleteProvider(id);

      showToast.success(`${type} deleted successfully`);
      
      // Refresh counts and data
      await refreshListingCounts();
      await fetchData();
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      showToast.error(`Failed to delete ${type}`);
      // Revert optimistic update on error
      await fetchData();
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      available: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const tabs = [
    { id: 'items', label: 'Products', icon: Package, count: listingCounts.items, color: 'from-blue-500 to-cyan-500' },
    { id: 'properties', label: 'Properties', icon: Home, count: listingCounts.properties, color: 'from-purple-500 to-pink-500' },
    { id: 'services', label: 'Services', icon: Briefcase, count: listingCounts.services, color: 'from-orange-500 to-red-500' },
    { id: 'favorites', label: 'Favorites', icon: Heart, count: favorites.length, color: 'from-red-500 to-pink-500' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-teal-500 to-green-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}! 👋
              </h1>
              <p className="text-teal-100 text-sm md:text-base">
                Manage your listings and grow your business
              </p>
            </div>

            {isPremium && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 bg-yellow-400 text-gray-900 px-4 py-2 rounded-full font-bold shadow-lg"
              >
                <Crown className="w-5 h-5" />
                <span>Premium Member</span>
              </motion.div>
            )}
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6 md:mt-8">
            {[
              { label: 'Products', value: listingCounts.items, max: isPremium ? '∞' : '3', icon: Package, color: 'bg-blue-500' },
              { label: 'Properties', value: listingCounts.properties, max: isPremium ? '∞' : '2', icon: Home, color: 'bg-purple-500' },
              { label: 'Services', value: listingCounts.services, max: isPremium ? '∞' : '2', icon: Briefcase, color: 'bg-orange-500' },
              { label: 'Favorites', value: favorites.length, max: '∞', icon: Heart, color: 'bg-red-500' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs md:text-sm text-teal-100">{stat.label}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl md:text-3xl font-bold">{stat.value}</span>
                  <span className="text-sm text-teal-200">/ {stat.max}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="whitespace-nowrap">{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === tab.id ? 'bg-white/30' : 'bg-gray-200'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Products Tab */}
            {activeTab === 'items' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">My Products</h2>
                  <button
                    onClick={() => handleAddNew('item')}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">Add Product</span>
                  </button>
                </div>

                {myListings.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No products yet</h3>
                    <p className="text-gray-600 mb-6">Start earning by listing your first product!</p>
                    <button
                      onClick={() => handleAddNew('item')}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                      Add Your First Product
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {myListings.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden group"
                      >
                        <div className="relative h-48">
                          <img
                            src={item.images?.[0] || '/placeholder.jpg'}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute top-2 right-2">
                            <FavoriteButton itemType="item" itemId={item.id} size="sm" />
                          </div>
                          <div className="absolute top-2 left-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{item.title}</h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-1">{item.category}</p>
                          <div className="flex items-center gap-1 text-primary font-bold text-lg mb-3">
                            <IndianRupee className="w-4 h-4" />
                            {item.price}
                            <span className="text-xs text-gray-500 font-normal">/day</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/item/${item.id}`)}
                              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                            <button
                              onClick={() => navigate(`/edit-item/${item.id}`)}
                              className="bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-3 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete('item', item.id)}
                              className="bg-red-100 hover:bg-red-200 text-red-700 py-2 px-3 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Properties Tab */}
            {activeTab === 'properties' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">My Properties</h2>
                  <button
                    onClick={() => handleAddNew('property')}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">Add Property</span>
                  </button>
                </div>

                {myProperties.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
                    <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No properties yet</h3>
                    <p className="text-gray-600 mb-6">List your property and start earning!</p>
                    <button
                      onClick={() => handleAddNew('property')}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                      Add Your First Property
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {myProperties.map((property) => (
                      <motion.div
                        key={property.id}
                        layout
                        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden group"
                      >
                        <div className="relative h-48">
                          <img
                            src={property.images?.[0] || '/placeholder.jpg'}
                            alt={property.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute top-2 right-2">
                            <FavoriteButton itemType="property" itemId={property.id} size="sm" />
                          </div>
                          <div className="absolute top-2 left-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(property.status)}`}>
                              {property.status}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{property.title}</h3>
                          <div className="flex items-center gap-1 text-gray-600 text-sm mb-2">
                            <MapPin className="w-3 h-3" />
                            <span className="line-clamp-1">{property.city}, {property.state}</span>
                          </div>
                          <div className="flex items-center gap-1 text-purple-600 font-bold text-lg mb-3">
                            <IndianRupee className="w-4 h-4" />
                            {property.monthly_rent || property.price}
                            <span className="text-xs text-gray-500 font-normal">/month</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/properties/${property.id}`)}
                              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                            <button
                              onClick={() => navigate(`/edit-property/${property.id}`)}
                              className="bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-3 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete('property', property.id)}
                              className="bg-red-100 hover:bg-red-200 text-red-700 py-2 px-3 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">My Services</h2>
                  <button
                    onClick={() => handleAddNew('service')}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">Add Service</span>
                  </button>
                </div>

                {myServices.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
                    <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No services yet</h3>
                    <p className="text-gray-600 mb-6">Offer your services and grow your business!</p>
                    <button
                      onClick={() => handleAddNew('service')}
                      className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                      Add Your First Service
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {myServices.map((service) => (
                      <motion.div
                        key={service.id}
                        layout
                        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden group"
                      >
                        <div className="relative h-48">
                          <img
                            src={service.portfolio_images?.[0] || service.images?.[0] || '/placeholder.jpg'}
                            alt={service.business_name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute top-2 right-2">
                            <FavoriteButton itemType="service" itemId={service.id} size="sm" />
                          </div>
                          <div className="absolute top-2 left-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(service.status)}`}>
                              {service.status}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{service.business_name}</h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-1">{service.category}</p>
                          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{service.tagline || service.description}</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/services/${service.id}`)}
                              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                            <button
                              onClick={() => navigate(`/edit-service/${service.id}`)}
                              className="bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-3 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete('service', service.id)}
                              className="bg-red-100 hover:bg-red-200 text-red-700 py-2 px-3 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Favorites Tab */}
            {activeTab === 'favorites' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">My Favorites</h2>
                
                {favorites.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No favorites yet</h3>
                    <p className="text-gray-600 mb-6">Start adding items to your favorites!</p>
                    <button
                      onClick={() => navigate('/browse')}
                      className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                      Browse Items
                    </button>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <p className="text-gray-600 mb-4">You have {favorites.length} favorite items</p>
                    <div className="space-y-2">
                      {favorites.map((fav) => (
                        <div key={fav.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            {fav.type === 'item' && <Package className="w-5 h-5 text-blue-500" />}
                            {fav.type === 'property' && <Home className="w-5 h-5 text-purple-500" />}
                            {fav.type === 'service' && <Briefcase className="w-5 h-5 text-orange-500" />}
                            <div>
                              <p className="font-semibold text-gray-900 capitalize">{fav.type}</p>
                              <p className="text-xs text-gray-500">Added {new Date(fav.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const routes = { item: '/item/', property: '/properties/', service: '/services/' };
                              navigate(`${routes[fav.type as keyof typeof routes]}${fav.item_id}`);
                            }}
                            className="text-primary hover:text-primary/80 font-semibold text-sm"
                          >
                            View
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Premium Modal */}
      <PremiumUpgradeModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        listingType={premiumModalType}
        currentCount={
          premiumModalType === 'item' ? listingCounts.items :
          premiumModalType === 'property' ? listingCounts.properties :
          listingCounts.services
        }
        limit={premiumModalType === 'item' ? 3 : 2}
      />
    </div>
  );
};

export default DashboardNew;
