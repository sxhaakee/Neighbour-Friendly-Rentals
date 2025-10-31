import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Users, Package, Calendar, BarChart3, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../utils/toast';

interface Analytics {
  totalRevenue: number;
  platformCommission: number;
  totalBookings: number;
  activeUsers: number;
  totalListings: number;
  pendingApprovals: number;
  monthlyRevenue: { month: string; revenue: number }[];
  topItems: { name: string; bookings: number; revenue: number }[];
}

export const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalRevenue: 0,
    platformCommission: 0,
    totalBookings: 0,
    activeUsers: 0,
    totalListings: 0,
    pendingApprovals: 0,
    monthlyRevenue: [],
    topItems: [],
  });
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [
        bookingsData,
        usersData,
        listingsData,
        pendingListingsData,
      ] = await Promise.all([
        supabase.from('bookings').select('*'),
        supabase.from('profiles').select('id'),
        supabase.from('listings').select('*'),
        supabase.from('listings').select('*').eq('status', 'pending'),
      ]);

      // Calculate total revenue and commission
      const totalRevenue = bookingsData.data?.reduce((sum, booking: any) => 
        sum + (booking.total_price || 0), 0) || 0;
      
      const platformCommission = bookingsData.data?.reduce((sum, booking: any) => 
        sum + (booking.platform_commission || 0), 0) || 0;

      // Calculate monthly revenue (last 6 months)
      const monthlyRevenue = calculateMonthlyRevenue(bookingsData.data || []);

      // Calculate top items
      const topItems = calculateTopItems(bookingsData.data || [], listingsData.data || []);

      setAnalytics({
        totalRevenue,
        platformCommission,
        totalBookings: bookingsData.data?.length || 0,
        activeUsers: usersData.data?.length || 0,
        totalListings: listingsData.data?.length || 0,
        pendingApprovals: pendingListingsData.data?.length || 0,
        monthlyRevenue,
        topItems,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      showToast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyRevenue = (bookings: any[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const monthlyData: { month: string; revenue: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const monthName = months[monthIndex];
      
      const revenue = bookings
        .filter(b => {
          const bookingMonth = new Date(b.created_at).getMonth();
          return bookingMonth === monthIndex;
        })
        .reduce((sum, b) => sum + (b.platform_commission || 0), 0);

      monthlyData.push({ month: monthName, revenue });
    }

    return monthlyData;
  };

  const calculateTopItems = (bookings: any[], listings: any[]) => {
    const itemStats: { [key: string]: { name: string; bookings: number; revenue: number } } = {};

    bookings.forEach(booking => {
      const listingId = booking.listing_id;
      if (!listingId) return;

      const listing = listings.find(l => l.id === listingId);
      if (!listing) return;

      if (!itemStats[listingId]) {
        itemStats[listingId] = {
          name: listing.title,
          bookings: 0,
          revenue: 0,
        };
      }

      itemStats[listingId].bookings += 1;
      itemStats[listingId].revenue += booking.platform_commission || 0;
    });

    return Object.values(itemStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  const handleResetRevenue = async () => {
    if (!confirm('Are you sure you want to reset all revenue data? This action cannot be undone!')) {
      return;
    }

    try {
      setResetting(true);

      // Reset platform_commission to 0 for all bookings
      const { error } = await supabase
        .from('bookings')
        .update({ platform_commission: 0 })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all

      if (error) throw error;

      showToast.success('Revenue data reset successfully!');
      fetchAnalytics(); // Refresh data
    } catch (error) {
      console.error('Error resetting revenue:', error);
      showToast.error('Failed to reset revenue');
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Reset Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Platform performance and metrics</p>
        </div>
        <button
          onClick={handleResetRevenue}
          disabled={resetting}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
          {resetting ? 'Resetting...' : 'Reset Revenue'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8" />
            <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
              All Time
            </span>
          </div>
          <h3 className="text-3xl font-bold mb-1">₹{analytics.totalRevenue.toLocaleString()}</h3>
          <p className="text-green-100">Total Revenue</p>
        </motion.div>

        {/* Platform Commission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8" />
            <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
              15% Fee
            </span>
          </div>
          <h3 className="text-3xl font-bold mb-1">₹{analytics.platformCommission.toLocaleString()}</h3>
          <p className="text-blue-100">Platform Earnings</p>
        </motion.div>

        {/* Total Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8" />
            <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
              Total
            </span>
          </div>
          <h3 className="text-3xl font-bold mb-1">{analytics.totalBookings}</h3>
          <p className="text-purple-100">Total Bookings</p>
        </motion.div>

        {/* Active Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8" />
            <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
              Registered
            </span>
          </div>
          <h3 className="text-3xl font-bold mb-1">{analytics.activeUsers}</h3>
          <p className="text-orange-100">Active Users</p>
        </motion.div>

        {/* Total Listings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <Package className="w-8 h-8" />
            <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
              Live
            </span>
          </div>
          <h3 className="text-3xl font-bold mb-1">{analytics.totalListings}</h3>
          <p className="text-teal-100">Total Listings</p>
        </motion.div>

        {/* Pending Approvals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="w-8 h-8" />
            <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
              Pending
            </span>
          </div>
          <h3 className="text-3xl font-bold mb-1">{analytics.pendingApprovals}</h3>
          <p className="text-yellow-100">Awaiting Approval</p>
        </motion.div>
      </div>

      {/* Monthly Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl p-6 shadow-lg"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-6">Monthly Platform Earnings (Last 6 Months)</h3>
        <div className="flex items-end justify-between gap-4 h-64">
          {analytics.monthlyRevenue.map((data, index) => {
            const maxRevenue = Math.max(...analytics.monthlyRevenue.map(d => d.revenue), 1);
            const height = (data.revenue / maxRevenue) * 100;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="text-sm font-semibold text-gray-700">
                  ₹{data.revenue.toLocaleString()}
                </div>
                <div 
                  className="w-full bg-gradient-to-t from-primary to-accent rounded-t-lg transition-all duration-500"
                  style={{ height: `${height}%` }}
                ></div>
                <div className="text-sm font-medium text-gray-600">{data.month}</div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Top Performing Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-2xl p-6 shadow-lg"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-6">Top 5 Revenue Generating Items</h3>
        <div className="space-y-4">
          {analytics.topItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-600">{item.bookings} bookings</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-amber-600">₹{item.revenue.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Commission</p>
              </div>
            </div>
          ))}
          {analytics.topItems.length === 0 && (
            <p className="text-center text-gray-500 py-8">No data available yet</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};
