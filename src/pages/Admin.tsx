import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, XCircle, Clock, TrendingUp, Package, Users, DollarSign, Eye, Trash2, X, ChevronLeft, ChevronRight, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { listingService } from '../services/listingService';
import { showToast } from '../utils/toast';
import { Database } from '../lib/database.types';
import { notificationService } from '../services/notificationService';
import { IDVerificationDashboard } from '../components/Admin/IDVerificationDashboard';
import { OrdersManagement } from '../components/Admin/OrdersManagement';
import { AgreementsManagement } from '../components/Admin/AgreementsManagement';
import { PropertiesManagement } from '../components/Admin/PropertiesManagement';
import { ServicesManagement } from '../components/Admin/ServicesManagement';
import { AnalyticsDashboard } from '../components/Admin/AnalyticsDashboard';

type Listing = Database['public']['Tables']['listings']['Row'];

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'analytics' | 'listings' | 'properties' | 'services' | 'verifications' | 'orders' | 'agreements'>('analytics');
  const [listings, setListings] = useState<Listing[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [editingCategory, setEditingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });

  useEffect(() => {
    // Wait for auth to load before checking
    if (authLoading) return;
    
    if (!user || !isAdmin) {
      navigate('/', { replace: true });
      return;
    }
    fetchListings();
  }, [user, isAdmin, authLoading, navigate, filter]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      let data: Listing[];
      
      if (filter === 'all') {
        data = await listingService.getAllListings();
      } else {
        data = await listingService.getListingsByStatus(filter);
      }
      
      setListings(data);
      
      // Calculate stats
      const allListings = await listingService.getAllListings();
      setStats({
        pending: allListings.filter(l => l.status === 'pending').length,
        approved: allListings.filter(l => l.status === 'approved').length,
        rejected: allListings.filter(l => l.status === 'rejected').length,
        total: allListings.length,
      });
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const listing = listings.find(l => l.id === id);
      await listingService.approveListing(id);
      
      // Send notification to owner
      if (listing) {
        await notificationService.notifyListingApproval(
          listing.owner_id,
          listing.title,
          listing.id
        );
      }
      
      showToast.success('Listing approved and owner notified');
      fetchListings();
    } catch (error) {
      console.error('Error approving listing:', error);
      showToast.error('Failed to approve listing');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      const listing = listings.find(l => l.id === id);
      await listingService.rejectListing(id, reason);
      
      // Send notification to owner
      if (listing) {
        await notificationService.notifyListingRejection(
          listing.owner_id,
          listing.title,
          reason
        );
      }
      
      showToast.success('Listing rejected and owner notified');
      setSelectedListing(null);
      fetchListings();
    } catch (error) {
      console.error('Error rejecting listing:', error);
      showToast.error('Failed to reject listing');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this listing? This action cannot be undone.')) {
      return;
    }

    try {
      await listingService.deleteListing(id);
      showToast.success('Listing deleted successfully');
      setSelectedListing(null);
      fetchListings();
    } catch (error) {
      console.error('Error deleting listing:', error);
      showToast.error('Failed to delete listing');
    }
  };

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      await listingService.toggleFeatured(id, !currentFeatured);
      showToast.success(currentFeatured ? 'Removed from featured' : 'Marked as featured!');
      fetchListings();
    } catch (error) {
      console.error('Error toggling featured status:', error);
      showToast.error('Failed to toggle featured status');
    }
  };

  const nextImage = () => {
    if (selectedListing && currentImageIndex < selectedListing.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleUpdateCategory = async () => {
    if (!selectedListing || !newCategory) return;
    
    try {
      await listingService.updateListing(selectedListing.id, {
        category: newCategory,
      });
      
      showToast.success('Category updated successfully!');
      setEditingCategory(false);
      setSelectedListing({ ...selectedListing, category: newCategory });
      fetchListings(); // Refresh the list
    } catch (error) {
      console.error('Error updating category:', error);
      showToast.error('Failed to update category');
    }
  };

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-xs sm:text-sm font-medium">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{value}</p>
        </div>
        <div className={`p-2 sm:p-3 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600">Manage listings and monitor platform activity</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-md p-1 sm:p-2 mb-4 sm:mb-6 overflow-x-auto">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 px-3 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📊 Analytics
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 px-3 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              🛒 Orders
            </button>
            <button
              onClick={() => setActiveTab('listings')}
              className={`flex-1 px-3 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'listings'
                  ? 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📦 Products
            </button>
            <button
              onClick={() => setActiveTab('properties')}
              className={`flex-1 px-3 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'properties'
                  ? 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              🏠 Properties
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`flex-1 px-3 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'services'
                  ? 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              🎉 Services
            </button>
            <button
              onClick={() => setActiveTab('verifications')}
              className={`flex-1 px-3 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'verifications'
                  ? 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              🛡️ ID
            </button>
            <button
              onClick={() => setActiveTab('agreements')}
              className={`flex-1 px-3 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'agreements'
                  ? 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📄 Docs
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'analytics' ? (
          <AnalyticsDashboard />
        ) : activeTab === 'orders' ? (
          <OrdersManagement />
        ) : activeTab === 'properties' ? (
          <PropertiesManagement />
        ) : activeTab === 'services' ? (
          <ServicesManagement />
        ) : activeTab === 'verifications' ? (
          <IDVerificationDashboard />
        ) : activeTab === 'agreements' ? (
          <AgreementsManagement />
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
              <StatCard
                icon={Clock}
                label="Pending Approval"
                value={stats.pending}
                color="bg-yellow-500"
              />
              <StatCard
                icon={CheckCircle}
                label="Approved"
                value={stats.approved}
                color="bg-green-500"
              />
              <StatCard
                icon={XCircle}
                label="Rejected"
                value={stats.rejected}
                color="bg-red-500"
              />
              <StatCard
                icon={Package}
                label="Total Listings"
                value={stats.total}
                color="bg-primary"
              />
            </div>

            {/* Recent Activity / Notifications */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
              <h3 className="text-lg font-bold mb-4">📬 Recent Activity</h3>
              <div className="space-y-2">
                {listings.filter(l => l.status === 'pending').slice(0, 5).map(listing => (
                  <div key={listing.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div>
                        <p className="font-semibold text-sm">{listing.title}</p>
                        <p className="text-xs text-gray-600">Awaiting approval</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedListing(listing)}
                      className="text-amber-600 text-sm font-semibold hover:underline"
                    >
                      Review
                    </button>
                  </div>
                ))}
                {listings.filter(l => l.status === 'pending').length === 0 && (
                  <p className="text-gray-500 text-center py-4">No pending items</p>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 mb-4 sm:mb-6 overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                {['all', 'pending', 'approved', 'rejected'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status as any)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  filter === status
                    ? 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading listings...</p>
                </div>
              ) : listings.length === 0 ? (
                <div className="p-8 text-center">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No listings found</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {listings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={listing.images[0] || '/placeholder.jpg'}
                            alt={listing.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {listing.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {listing.location}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{listing.owner_name}</div>
                        <div className="text-sm text-gray-500">{listing.owner_email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {listing.category}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedListing(listing);
                              setEditingCategory(true);
                              setNewCategory(listing.category);
                              setCurrentImageIndex(0);
                            }}
                            className="text-amber-600 hover:text-amber-700"
                            title="Edit Category"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{listing.price}/day
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            listing.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : listing.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {listing.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedListing(listing);
                              setCurrentImageIndex(0);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          {listing.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(listing.id)}
                                className="text-green-600 hover:text-green-900"
                                title="Approve"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleReject(listing.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Reject"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          {listing.status === 'approved' && (
                            <button
                              onClick={() => handleToggleFeatured(listing.id, (listing as any).featured || false)}
                              className={`${
                                (listing as any).featured
                                  ? 'text-yellow-600 hover:text-yellow-900'
                                  : 'text-gray-400 hover:text-yellow-600'
                              }`}
                              title={(listing as any).featured ? 'Remove from featured' : 'Mark as featured'}
                            >
                              ⭐
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(listing.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        {listing.status === 'rejected' && listing.rejection_reason && (
                          <p className="text-xs text-red-600 mt-1">{listing.rejection_reason}</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </>
        )}

        {/* Listing Details Modal */}
        {selectedListing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Listing Details</h2>
                <button
                  onClick={() => setSelectedListing(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Image Gallery */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Images</h3>
                  {selectedListing.images && selectedListing.images.length > 0 ? (
                    <>
                      <div className="relative">
                        <img
                          src={selectedListing.images[currentImageIndex] || '/placeholder.png'}
                          alt={`${selectedListing.title} - Image ${currentImageIndex + 1}`}
                          className="w-full h-96 object-contain bg-gray-100 rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.png';
                            e.currentTarget.alt = 'Image failed to load';
                          }}
                        />
                        {selectedListing.images.length > 1 && (
                          <>
                            <button
                              onClick={prevImage}
                              disabled={currentImageIndex === 0}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                              onClick={nextImage}
                              disabled={currentImageIndex === selectedListing.images.length - 1}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ChevronRight className="w-6 h-6" />
                            </button>
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                              {currentImageIndex + 1} / {selectedListing.images.length}
                            </div>
                          </>
                        )}
                      </div>
                      {/* Thumbnail Strip */}
                      {selectedListing.images.length > 1 && (
                        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                          {selectedListing.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`Thumbnail ${idx + 1}`}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 ${
                                idx === currentImageIndex ? 'border-primary' : 'border-transparent'
                              }`}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <p className="text-lg font-semibold">No images available</p>
                        <p className="text-sm">Images may have failed to upload</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Basic Info */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Title</p>
                      <p className="font-semibold">{selectedListing.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Category</p>
                      {editingCategory ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          >
                            <option value="">Select Category</option>
                            <option value="Tools">Tools</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Furniture">Furniture</option>
                            <option value="Appliances">Appliances</option>
                            <option value="Sports">Sports</option>
                            <option value="Books">Books</option>
                            <option value="Clothing">Clothing</option>
                            <option value="Toys">Toys</option>
                            <option value="Vehicles">Vehicles</option>
                            <option value="Musical Instruments">Musical Instruments</option>
                            <option value="Party Supplies">Party Supplies</option>
                            <option value="Camping Gear">Camping Gear</option>
                            <option value="Photography">Photography</option>
                            <option value="Gaming">Gaming</option>
                            <option value="Other">Other</option>
                          </select>
                          <button
                            onClick={handleUpdateCategory}
                            disabled={!newCategory}
                            className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingCategory(false);
                              setNewCategory('');
                            }}
                            className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{selectedListing.category}</p>
                          <button
                            onClick={() => {
                              setEditingCategory(true);
                              setNewCategory(selectedListing.category);
                            }}
                            className="text-xs text-amber-600 hover:text-amber-700 underline"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Price</p>
                      <p className="font-semibold text-amber-600">₹{selectedListing.price}/day</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-semibold">{selectedListing.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        selectedListing.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : selectedListing.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedListing.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="font-semibold">{new Date(selectedListing.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedListing.description}</p>
                </div>

                {/* Owner Info */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Owner Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-semibold">{selectedListing.owner_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold">{selectedListing.owner_email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Contact</p>
                      <p className="font-semibold">{selectedListing.contact_info}</p>
                    </div>
                  </div>
                </div>

                {selectedListing.rejection_reason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="font-semibold text-red-800 mb-2">Rejection Reason</h3>
                    <p className="text-red-700">{selectedListing.rejection_reason}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-4">
                {selectedListing.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(selectedListing.id)}
                      className="flex-1 bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve Listing
                    </button>
                    <button
                      onClick={() => handleReject(selectedListing.id)}
                      className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject Listing
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(selectedListing.id)}
                  className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete Permanently
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
