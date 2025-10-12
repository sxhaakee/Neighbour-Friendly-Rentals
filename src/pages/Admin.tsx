import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, XCircle, Clock, TrendingUp, Package, Users, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { listingService } from '../services/listingService';
import { Database } from '../lib/database.types';
import { IDVerificationDashboard } from '../components/Admin/IDVerificationDashboard';
import { OrdersManagement } from '../components/Admin/OrdersManagement';
import { AgreementsManagement } from '../components/Admin/AgreementsManagement';

type Listing = Database['public']['Tables']['listings']['Row'];

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'listings' | 'verifications' | 'orders' | 'agreements'>('orders');
  const [listings, setListings] = useState<Listing[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/');
      return;
    }
    fetchListings();
  }, [user, isAdmin, navigate, filter]);

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
      await listingService.approveListing(id);
      fetchListings();
    } catch (error) {
      console.error('Error approving listing:', error);
      alert('Failed to approve listing');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await listingService.rejectListing(id, reason);
      fetchListings();
    } catch (error) {
      console.error('Error rejecting listing:', error);
      alert('Failed to reject listing');
    }
  };

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600">Manage listings and monitor platform activity</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-md p-2 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'orders'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              🛒 Orders
            </button>
            <button
              onClick={() => setActiveTab('listings')}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'listings'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📦 Listings
            </button>
            <button
              onClick={() => setActiveTab('verifications')}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'verifications'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              🛡️ ID Verifications
            </button>
            <button
              onClick={() => setActiveTab('agreements')}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'agreements'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📄 Agreements
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'orders' ? (
          <OrdersManagement />
        ) : activeTab === 'verifications' ? (
          <IDVerificationDashboard />
        ) : activeTab === 'agreements' ? (
          <AgreementsManagement />
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
              <div className="flex flex-wrap gap-2">
                {['all', 'pending', 'approved', 'rejected'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? 'bg-primary text-white'
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
                <div className="overflow-x-auto">
              <table className="w-full">
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
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {listing.category}
                        </span>
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
                        {listing.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(listing.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleReject(listing.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                        {listing.status === 'rejected' && listing.rejection_reason && (
                          <p className="text-xs text-red-600">{listing.rejection_reason}</p>
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
      </div>
    </div>
  );
};

export default Admin;
