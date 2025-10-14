import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, Calendar, User, Edit, Trash2, Eye, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { listingService } from '../services/listingService';
import { bookingService } from '../services/bookingService';
import { supabase } from '../lib/supabase';
import { showToast } from '../utils/toast';
import { Database } from '../lib/database.types';

type Listing = Database['public']['Tables']['listings']['Row'];
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
  const { user, profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('listings');
  const [myListings, setMyListings] = useState<Listing[]>([]);
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
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

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
      const [listings, bookings, ownerBkgs] = await Promise.all([
        listingService.getUserListings(user.id),
        bookingService.getUserBookings(user.id),
        bookingService.getOwnerBookings(user.id),
      ]);
      
      setMyListings(listings);
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
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'listings', label: 'My Listings', icon: Package },
    { id: 'bookings', label: 'My Bookings', icon: Calendar },
    { id: 'rentals', label: 'Incoming Rentals', icon: CheckCircle },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const renderListings = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Listings</h2>
        <button
          onClick={() => navigate('/add-item')}
          className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Item</span>
        </button>
      </div>

      {myListings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings yet</h3>
          <p className="text-gray-600 mb-6">Start earning by listing your first item!</p>
          <button
            onClick={() => navigate('/add-item')}
            className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Add Your First Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {myListings.map((listing) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="md:flex">
                <div className="md:w-48">
                  <img
                    src={listing.images[0] || '/placeholder.jpg'}
                    alt={listing.title}
                    className="w-full h-48 md:h-full object-cover"
                  />
                </div>
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{listing.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(listing.status)}`}>
                      {listing.status}
                    </span>
                  </div>
                  
                  <p className="text-2xl font-bold text-primary mb-3">
                    ₹{listing.price}<span className="text-sm text-gray-500">/day</span>
                  </p>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{listing.description}</p>
                  
                  {listing.status === 'rejected' && listing.rejection_reason && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm mb-4">
                      <strong>Rejected:</strong> {listing.rejection_reason}
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/item/${listing.id}`)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => handleDeleteListing(listing.id)}
                      className="bg-red-100 text-red-700 py-2 px-4 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const renderBookings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
      
      {myBookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-600 mb-6">Browse listings and book your first rental!</p>
          <button
            onClick={() => navigate('/listings')}
            className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
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
              className="bg-white rounded-xl shadow-lg p-6"
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
                    <span className="font-semibold text-primary">₹{booking.total_price}</span>
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
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
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
              className="bg-white rounded-xl shadow-lg p-6"
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
                    <span className="font-semibold text-green-600">+₹{booking.total_price}</span>
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
      
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-6 mb-8">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-primary" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{profile?.full_name || 'User'}</h3>
            <p className="text-gray-600">{profile?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
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
            className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      case 'profile':
        return renderProfile();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-xl text-gray-600">Manage your rentals and profile</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
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
