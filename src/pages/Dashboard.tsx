import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, Calendar, User, Edit, Trash2, Eye, Clock, CheckCircle, Home, Briefcase, TrendingUp, Crown, Heart, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { listingService } from '../services/listingService';
import { propertyService } from '../services/propertyService';
import { serviceProviderService } from '../services/serviceProviderService';
import { bookingService } from '../services/bookingService';
import { supabase } from '../lib/supabase';
import { showToast } from '../utils/toast';
import { Database } from '../lib/database.types';

type Listing = Database['public']['Tables']['listings']['Row'];
type Property = any; // Property type from propertyService
type ServiceProvider = any; // ServiceProvider type from serviceProviderService
type Booking = Database['public']['Tables']['bookings']['Row'] & {
  listings: {
    title: string;
    images: string[];
    category: string;
    price: number;
  } | null;
};

const DashboardNew = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, isAdmin, isPremium, listingCounts, canAddListing, refreshListingCounts } = useAuth();
  const [activeTab, setActiveTab] = useState('listings');
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [myServices, setMyServices] = useState<ServiceProvider[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [ownerBookings, setOwnerBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Profile form state
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    fetchData();
  }, [user, authLoading, navigate]);

  useEffect(() => {
    // Update form when profile changes
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setLocation(profile.location || '');
      setAddress(profile.address || '');
    }
  }, [profile]);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch all user data
      const [listings, properties, services, bookings, ownerBkgs] = await Promise.all([
        listingService.getUserListings(user.id),
        propertyService.getOwnerProperties(user.id),
        serviceProviderService.getOwnerProviders(user.id),
        bookingService.getUserBookings(user.id),
        bookingService.getOwnerBookings(user.id),
      ]);
      
      setMyListings(listings);
      setMyProperties(properties);
      setMyServices(services);
      setMyBookings(bookings as Booking[]);
      setOwnerBookings(ownerBkgs as Booking[]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    
    try {
      await listingService.deleteListing(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('Failed to delete listing');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-amber-100 text-amber-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-amber-100 text-amber-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'completed':
        return 'bg-amber-100 text-amber-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'listings', label: 'Listings', icon: Package, mobileLabel: 'Listings' },
    { id: 'bookings', label: 'Bookings', icon: Calendar, mobileLabel: 'Bookings' },
    { id: 'favorites', label: 'Favorites', icon: Heart, mobileLabel: 'Saved' },
    { id: 'rentals', label: 'Rentals', icon: CheckCircle, mobileLabel: 'Rentals' },
    { id: 'earnings', label: 'Earnings', icon: TrendingUp, mobileLabel: 'Earnings' },
    { id: 'profile', label: 'Profile', icon: User, mobileLabel: 'Profile' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleDeleteProperty = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    
    try {
      await propertyService.deleteProperty(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    try {
      await serviceProviderService.deleteProvider(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service');
    }
  };

  const renderListings = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Listings</h2>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/add-item')}
            className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Product</span>
          </button>
          <button
            onClick={() => navigate('/add-property')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Property</span>
          </button>
          <button
            onClick={() => navigate('/add-service')}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Service</span>
          </button>
        </div>
      </div>

      {myListings.length === 0 && myProperties.length === 0 && myServices.length === 0 ? (
        <div className="bg-gradient-to-br from-white to-amber-50 rounded-xl shadow-lg border border-yellow-100 p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings yet</h3>
          <p className="text-gray-600 mb-6">Start earning by listing your first item!</p>
          <button
            onClick={() => navigate('/add-item')}
            className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-xl hover:scale-105 transition-colors"
          >
            Add Your First Item
          </button>
        </div>
      ) : (
        <>
          {/* Products Section */}
          {myListings.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Products ({myListings.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myListings.map((listing) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-white to-amber-50 rounded-lg shadow-md hover:shadow-xl border border-yellow-100 transition-shadow overflow-hidden"
                  >
                    <img
                      src={listing.images[0] || '/placeholder.jpg'}
                      alt={listing.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">{listing.title}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(listing.status)}`}>
                          {listing.status}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-amber-600 mb-2">
                        ₹{listing.price}<span className="text-xs text-gray-500">/day</span>
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/item/${listing.id}`)}
                          className="flex-1 bg-gray-100 text-gray-700 py-1.5 px-3 rounded text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteListing(listing.id)}
                          className="bg-red-100 text-red-700 py-1.5 px-3 rounded hover:bg-red-200 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Properties Section */}
          {myProperties.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Home className="w-5 h-5" />
                Properties ({myProperties.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myProperties.map((property: any) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-white to-amber-50 rounded-lg shadow-md hover:shadow-xl border border-yellow-100 transition-shadow overflow-hidden"
                  >
                    <img
                      src={property.images?.[0] || '/placeholder.jpg'}
                      alt={property.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">{property.title}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(property.status)}`}>
                          {property.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{property.city}, {property.state}</p>
                      <p className="text-lg font-bold text-amber-600 mb-2">
                        ₹{property.monthly_rent || property.price}<span className="text-xs text-gray-500">/month</span>
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/properties/${property.id}`)}
                          className="flex-1 bg-gray-100 text-gray-700 py-1.5 px-3 rounded text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteProperty(property.id)}
                          className="bg-red-100 text-red-700 py-1.5 px-3 rounded hover:bg-red-200 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Services Section */}
          {myServices.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Services ({myServices.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myServices.map((service: any) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-white to-amber-50 rounded-lg shadow-md hover:shadow-xl border border-yellow-100 transition-shadow overflow-hidden"
                  >
                    <img
                      src={service.portfolio_images?.[0] || '/placeholder.jpg'}
                      alt={service.business_name}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">{service.business_name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(service.status)}`}>
                          {service.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{service.category}</p>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{service.tagline || service.description}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/services/${service.id}`)}
                          className="flex-1 bg-gray-100 text-gray-700 py-1.5 px-3 rounded text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteService(service.id)}
                          className="bg-red-100 text-red-700 py-1.5 px-3 rounded hover:bg-red-200 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderBookings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
      
      {myBookings.length === 0 ? (
        <div className="bg-gradient-to-br from-white to-amber-50 rounded-xl shadow-lg border border-yellow-100 p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-600 mb-6">Browse listings and book your first rental!</p>
          <button
            onClick={() => navigate('/listings')}
            className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-xl hover:scale-105 transition-colors"
          >
            Browse Listings
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {myBookings.map((booking) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-white to-amber-50 rounded-xl shadow-lg border border-yellow-100 p-6"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={booking.listings?.images[0] || '/placeholder.jpg'}
                  alt={booking.listings?.title}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{booking.listings?.title}</h3>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <span>
                      <Clock className="w-4 h-4 inline mr-1" />
                      {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                    </span>
                    <span className="font-semibold text-amber-600">₹{booking.total_price}</span>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPaymentStatusBadge(booking.payment_status || 'pending')}`}>
                      {booking.payment_status === 'completed' ? '✓ Paid' : booking.payment_status === 'failed' ? '✗ Failed' : '⏳ Pending'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const renderIncomingRentals = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Incoming Rentals</h2>
      <p className="text-gray-600">Items you own that others have booked</p>
      
      {ownerBookings.length === 0 ? (
        <div className="bg-gradient-to-br from-white to-amber-50 rounded-xl shadow-lg border border-yellow-100 p-12 text-center">
          <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No incoming rentals</h3>
          <p className="text-gray-600">Your listings haven't been booked yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {ownerBookings.map((booking) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-white to-amber-50 rounded-xl shadow-lg border border-yellow-100 p-6"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={booking.listings?.images[0] || '/placeholder.jpg'}
                  alt={booking.listings?.title}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{booking.listings?.title}</h3>
                  <p className="text-sm text-gray-600">Rented by: {booking.renter_name}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <span>
                      <Clock className="w-4 h-4 inline mr-1" />
                      {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                    </span>
                    <span className="font-semibold text-amber-600">+₹{booking.total_price}</span>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPaymentStatusBadge(booking.payment_status || 'pending')}`}>
                      {booking.payment_status === 'completed' ? '✓ Paid' : booking.payment_status === 'failed' ? '✗ Failed' : '⏳ Pending'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const renderEarnings = () => {
    const totalEarnings = ownerBookings
      .filter(booking => booking.status === 'completed' && booking.payment_status === 'completed')
      .reduce((sum, booking) => sum + (booking.platform_commission || 0), 0);

    const totalBookings = ownerBookings.filter(booking => booking.status === 'completed').length;
    const averageRating = 4.2; // This would come from actual reviews

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Earnings & Analytics</h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-amber-600 font-medium">Total Earnings</p>
                <p className="text-2xl font-bold text-amber-800">₹{totalEarnings.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Completed Rentals</p>
                <p className="text-2xl font-bold text-blue-800">{totalBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <User className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-yellow-600 font-medium">Average Rating</p>
                <p className="text-2xl font-bold text-yellow-800">{averageRating}⭐</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Earnings */}
        <div className="bg-gradient-to-br from-white to-amber-50 rounded-xl shadow-lg border border-yellow-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Completed Rentals</h3>
          {ownerBookings.filter(booking => booking.status === 'completed').length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No completed rentals yet</p>
              <p className="text-sm text-gray-500">Earnings will appear here when rentals are completed</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ownerBookings
                .filter(booking => booking.status === 'completed')
                .slice(0, 5)
                .map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <img
                        src={booking.listings?.images[0] || '/placeholder.jpg'}
                        alt={booking.listings?.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{booking.listings?.title}</p>
                        <p className="text-sm text-gray-600">Rented by {booking.renter_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-amber-600">+₹{booking.platform_commission || 0}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(booking.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      // Build update object - only include address if it has a value
      const updateData: any = {
        full_name: fullName,
        phone: phone,
        location: location,
        updated_at: new Date().toISOString(),
      };

      // Only include address if it's not empty
      if (address && address.trim()) {
        updateData.address = address;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        // If error is about address column, show helpful message
        if (error.message.includes('address')) {
          throw new Error('Please run the database migration to add the address column. Check add-address-column.sql file.');
        }
        throw error;
      }

      // Refresh profile in context
      if (refreshProfile) {
        await refreshProfile();
      }

      showToast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      showToast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const renderProfile = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>

      <div className="bg-gradient-to-br from-white to-amber-50 rounded-xl shadow-lg border border-yellow-100 p-8">
        <div className="flex items-center space-x-6 mb-8">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-amber-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{profile?.full_name || 'User'}</h3>
            <p className="text-gray-600">{profile?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-primary/10 text-amber-600 rounded-full text-sm font-medium">
              {profile?.role === 'admin' ? 'Admin' : 'Customer'}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter your city/location"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter your full address"
            />
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-xl hover:scale-105 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'listings':
        return renderListings();
      case 'bookings':
        return renderBookings();
      case 'rentals':
        return renderIncomingRentals();
      case 'earnings':
        return renderEarnings();
      case 'profile':
        return renderProfile();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Premium Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-8 pb-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-base sm:text-xl text-gray-600">Manage your rentals and profile</p>
            </div>
            {isPremium && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-xl shadow-lg">
                <Crown className="w-5 h-5" />
                <span className="font-bold">Premium Member</span>
                <Star className="w-4 h-4" />
              </div>
            )}
          </div>
        </motion.div>

        {/* Mobile Horizontal Tabs */}
        <div className="lg:hidden mb-6 -mx-4 px-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 pb-2 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center px-4 py-3 rounded-xl transition-all min-w-[80px] ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-600 hover:bg-gray-50 shadow'
                }`}
              >
                <tab.icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-semibold">{tab.mobileLabel}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Desktop Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block lg:col-span-1"
          >
            <div className="bg-gradient-to-br from-white to-amber-50 rounded-xl shadow-lg border border-yellow-100 p-4 sticky top-24">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all text-left ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:col-span-3"
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DashboardNew;
