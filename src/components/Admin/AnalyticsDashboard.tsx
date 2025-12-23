import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Users, Package, BarChart3, RefreshCw, Trash2 } from 'lucide-react';
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
        .update({ platform_commission: 0 } as any)
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
    <div className="space-y-8 pb-10">
      {/* Header & Global Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/50 backdrop-blur-md p-6 rounded-[2rem] border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Platform Analytics</h2>
          <p className="text-gray-500 font-medium">Monitoring the pulse of your neighbourhood marketplace</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={fetchAnalytics}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all border border-gray-200 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleResetRevenue}
            disabled={resetting}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all border border-red-100"
          >
            <Trash2 className="w-4 h-4" />
            {resetting ? 'Resetting...' : 'Reset Stats'}
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Card (Large) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 bg-gray-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500 rounded-full blur-[100px] opacity-20 -mr-20 -mt-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 mb-2 block">Net Value Processed</span>
                <h3 className="text-6xl font-black tracking-tighter mb-2">₹{analytics.totalRevenue.toLocaleString()}</h3>
                <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>+12.5% from last month</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <DollarSign className="w-8 h-8 text-amber-400" />
              </div>
            </div>

            <div className="mt-12 flex items-center gap-8">
              <div className="flex flex-col">
                <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Platform Cut (15%)</span>
                <span className="text-2xl font-bold text-white">₹{analytics.platformCommission.toLocaleString()}</span>
              </div>
              <div className="w-px h-10 bg-white/10"></div>
              <div className="flex flex-col">
                <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Orders</span>
                <span className="text-2xl font-bold text-white">{analytics.totalBookings}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* User Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
              <Users className="w-7 h-7 text-amber-600" />
            </div>
            <h4 className="text-4xl font-black text-gray-900 tracking-tight mb-1">{analytics.activeUsers}</h4>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Registered Neighbours</p>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-50 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-gray-700">Live Items</span>
              </div>
              <span className="text-sm font-black text-gray-900">{analytics.totalListings}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-bold text-gray-700">Awaiting Verified</span>
              </div>
              <span className="text-sm font-black text-gray-900">{analytics.pendingApprovals}</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Earnings Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Earnings Flow</h3>
            <div className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black text-gray-500 uppercase">Last 6 Months</div>
          </div>

          <div className="flex items-end justify-between gap-4 h-64 px-4">
            {analytics.monthlyRevenue.map((data: any, index: number) => {
              const maxRevenue = Math.max(...analytics.monthlyRevenue.map((d: any) => d.revenue), 1);
              const height = (data.revenue / maxRevenue) * 100;

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-3 group">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded mb-2">
                    ₹{data.revenue}
                  </div>
                  <div className="w-full relative">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 1, delay: 0.5 + (index * 0.1) }}
                      className="w-full bg-gradient-to-t from-amber-600 via-amber-400 to-yellow-300 rounded-t-xl"
                    />
                  </div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{data.month}</div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Top Items List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Top performing Assets</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            {analytics.topItems.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-5 bg-gray-50/50 hover:bg-white hover:shadow-lg rounded-[1.5rem] transition-all border border-transparent hover:border-amber-100 group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center font-black text-xs group-hover:bg-amber-600 transition-colors">
                    0{index + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{item.bookings} Rent-outs</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-gray-900">₹{item.revenue.toLocaleString()}</p>
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Share</p>
                </div>
              </div>
            ))}
            {analytics.topItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Package className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-bold">No rental history observed yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
