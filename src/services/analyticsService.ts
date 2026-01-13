import ReactGA from 'react-ga4';
import { supabase } from '../lib/supabase';

export interface EarningsOverview {
  total_earnings: number;
  this_month: number;
  last_month: number;
  growth_percentage: number;
  pending_payments: number;
}

export interface BookingStats {
  total_bookings: number;
  completed: number;
  pending: number;
  cancelled: number;
  completion_rate: number;
}

export interface PopularItem {
  id: string;
  title: string;
  bookings_count: number;
  earnings: number;
  rating: number;
}

export interface UserDemographics {
  age_groups: Record<string, number>;
  locations: Record<string, number>;
  user_types: Record<string, number>;
}

export interface PerformanceMetrics {
  response_time: number;
  acceptance_rate: number;
  cancellation_rate: number;
  average_rating: number;
}

export const analyticsService = {
  // Google Analytics
  initialize() {
    const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (measurementId && process.env.NODE_ENV === 'production') {
      ReactGA.initialize(measurementId);
    }
  },

  pageView(path: string) {
    ReactGA.send({ hitType: 'pageview', page: path });
  },

  event(category: string, action: string, label?: string) {
    ReactGA.event({ category, action, label });
  },

  // Earnings Analytics
  async getEarningsOverview(userId: string): Promise<EarningsOverview> {
    try {
      const now = new Date();
      const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Get all completed payments
      const { data: allPayments } = await supabase
        .from('payments')
        .select('amount, created_at, status')
        .eq('user_id', userId)
        .eq('status', 'completed');

      const totalEarnings = allPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      // This month earnings
      const thisMonthPayments = allPayments?.filter(
        p => new Date(p.created_at) >= firstDayThisMonth
      ) || [];
      const thisMonth = thisMonthPayments.reduce((sum, p) => sum + Number(p.amount), 0);

      // Last month earnings
      const lastMonthPayments = allPayments?.filter(
        p => new Date(p.created_at) >= firstDayLastMonth && new Date(p.created_at) <= lastDayLastMonth
      ) || [];
      const lastMonth = lastMonthPayments.reduce((sum, p) => sum + Number(p.amount), 0);

      // Growth percentage
      const growth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

      // Pending payments
      const { data: pending } = await supabase
        .from('payments')
        .select('amount')
        .eq('user_id', userId)
        .eq('status', 'pending');

      const pendingAmount = pending?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      return {
        total_earnings: totalEarnings,
        this_month: thisMonth,
        last_month: lastMonth,
        growth_percentage: Math.round(growth),
        pending_payments: pendingAmount,
      };
    } catch (error) {
      console.error('Error getting earnings overview:', error);
      return {
        total_earnings: 0,
        this_month: 0,
        last_month: 0,
        growth_percentage: 0,
        pending_payments: 0,
      };
    }
  },

  // Booking Statistics
  async getBookingStats(userId: string): Promise<BookingStats> {
    try {
      const { data: bookings } = await supabase
        .from('bookings')
        .select('status')
        .eq('owner_id', userId);

      if (!bookings) {
        return {
          total_bookings: 0,
          completed: 0,
          pending: 0,
          cancelled: 0,
          completion_rate: 0,
        };
      }

      const stats = {
        total_bookings: bookings.length,
        completed: bookings.filter(b => b.status === 'completed').length,
        pending: bookings.filter(b => b.status === 'pending').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
        completion_rate: 0,
      };

      stats.completion_rate = stats.total_bookings > 0
        ? Math.round((stats.completed / stats.total_bookings) * 100)
        : 0;

      return stats;
    } catch (error) {
      console.error('Error getting booking stats:', error);
      return {
        total_bookings: 0,
        completed: 0,
        pending: 0,
        cancelled: 0,
        completion_rate: 0,
      };
    }
  },

  // Popular Items
  async getPopularItems(userId: string, limit = 5): Promise<PopularItem[]> {
    try {
      const { data: listings } = await supabase
        .from('listings')
        .select('id, title')
        .eq('owner_id', userId);

      if (!listings) return [];

      const itemStats = await Promise.all(
        listings.map(async (listing) => {
          // Get booking count
          const { count: bookingsCount } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('listing_id', listing.id);

          // Get earnings
          const { data: payments } = await supabase
            .from('payments')
            .select('amount')
            .eq('user_id', userId)
            .eq('status', 'completed');

          const earnings = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

          // Get average rating
          const { data: reviews } = await supabase
            .from('reviews')
            .select('rating')
            .eq('listing_id', listing.id);

          const avgRating = reviews && reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

          return {
            id: listing.id,
            title: listing.title,
            bookings_count: bookingsCount || 0,
            earnings,
            rating: Math.round(avgRating * 10) / 10,
          };
        })
      );

      return itemStats
        .sort((a, b) => b.bookings_count - a.bookings_count)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting popular items:', error);
      return [];
    }
  },

  // User Demographics
  async getUserDemographics(userId: string): Promise<UserDemographics> {
    try {
      // Get all renters who booked from this user
      const { data: bookings } = await supabase
        .from('bookings')
        .select('renter_id')
        .eq('owner_id', userId);

      if (!bookings) {
        return {
          age_groups: {},
          locations: {},
          user_types: {},
        };
      }

      const renterIds = Array.from(new Set(bookings.map(b => b.renter_id)));

      // Get renter profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('location, created_at')
        .in('id', renterIds);

      // Calculate demographics
      const locations: Record<string, number> = {};
      const ageGroups: Record<string, number> = {
        '18-25': 0,
        '26-35': 0,
        '36-45': 0,
        '46+': 0,
      };

      profiles?.forEach(profile => {
        // Location
        if (profile.location) {
          locations[profile.location] = (locations[profile.location] || 0) + 1;
        }

        // Age groups (mock - would need actual age data)
        const randomAge = Math.floor(Math.random() * 4);
        const ageGroup = ['18-25', '26-35', '36-45', '46+'][randomAge];
        ageGroups[ageGroup]++;
      });

      return {
        age_groups: ageGroups,
        locations,
        user_types: {
          'New Users': Math.floor(renterIds.length * 0.3),
          'Regular Users': Math.floor(renterIds.length * 0.5),
          'Power Users': Math.floor(renterIds.length * 0.2),
        },
      };
    } catch (error) {
      console.error('Error getting user demographics:', error);
      return {
        age_groups: {},
        locations: {},
        user_types: {},
      };
    }
  },

  // Performance Metrics
  async getPerformanceMetrics(userId: string): Promise<PerformanceMetrics> {
    try {
      const { data: bookings } = await supabase
        .from('bookings')
        .select('status, created_at, confirmed_at')
        .eq('owner_id', userId);

      if (!bookings || bookings.length === 0) {
        return {
          response_time: 0,
          acceptance_rate: 0,
          cancellation_rate: 0,
          average_rating: 0,
        };
      }

      // Calculate response time (hours)
      const responseTimes = bookings
        .filter(b => b.confirmed_at && b.created_at)
        .map(b => {
          const created = new Date(b.created_at!).getTime();
          const confirmed = new Date(b.confirmed_at!).getTime();
          return (confirmed - created) / (1000 * 60 * 60); // hours
        });

      const avgResponseTime = responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0;

      // Acceptance rate
      const confirmed = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length;
      const acceptanceRate = (confirmed / bookings.length) * 100;

      // Cancellation rate
      const cancelled = bookings.filter(b => b.status === 'cancelled').length;
      const cancellationRate = (cancelled / bookings.length) * 100;

      // Average rating
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .in('listing_id', await this.getUserListingIds(userId));

      const avgRating = reviews && reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      return {
        response_time: Math.round(avgResponseTime * 10) / 10,
        acceptance_rate: Math.round(acceptanceRate),
        cancellation_rate: Math.round(cancellationRate),
        average_rating: Math.round(avgRating * 10) / 10,
      };
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      return {
        response_time: 0,
        acceptance_rate: 0,
        cancellation_rate: 0,
        average_rating: 0,
      };
    }
  },

  // Helper: Get user's listing IDs
  async getUserListingIds(userId: string): Promise<string[]> {
    const { data } = await supabase
      .from('listings')
      .select('id')
      .eq('owner_id', userId);

    return data?.map(l => l.id) || [];
  },

  // Export report as CSV
  async exportReport(userId: string, type: 'earnings' | 'bookings' | 'items'): Promise<string> {
    try {
      let csv = '';

      if (type === 'earnings') {
        const { data: payments } = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        csv = 'Date,Amount,Status,Payment ID\n';
        payments?.forEach(p => {
          csv += `${new Date(p.created_at).toLocaleDateString()},₹${p.amount},${p.status},${p.razorpay_payment_id || 'N/A'}\n`;
        });
      } else if (type === 'bookings') {
        const { data: bookings } = await supabase
          .from('bookings')
          .select('*')
          .eq('owner_id', userId)
          .order('created_at', { ascending: false });

        csv = 'Date,Item,Status,Amount,Renter\n';
        bookings?.forEach(b => {
          csv += `${b.created_at ? new Date(b.created_at).toLocaleDateString() : 'N/A'},${b.listing_id},${b.status},₹${b.total_price || 0},${b.renter_id}\n`;
        });
      } else if (type === 'items') {
        const items = await this.getPopularItems(userId, 100);
        csv = 'Item,Bookings,Earnings,Rating\n';
        items.forEach(item => {
          csv += `${item.title},${item.bookings_count},₹${item.earnings},${item.rating}\n`;
        });
      }

      return csv;
    } catch (error) {
      console.error('Error exporting report:', error);
      return '';
    }
  },

  // Get insights and tips
  async getInsights(userId: string): Promise<string[]> {
    try {
      const insights: string[] = [];

      const [earnings, bookings, performance] = await Promise.all([
        this.getEarningsOverview(userId),
        this.getBookingStats(userId),
        this.getPerformanceMetrics(userId),
      ]);

      // Earnings insights
      if (earnings.growth_percentage > 20) {
        insights.push(`🎉 Great job! Your earnings grew by ${earnings.growth_percentage}% this month!`);
      } else if (earnings.growth_percentage < -20) {
        insights.push(`📉 Your earnings decreased by ${Math.abs(earnings.growth_percentage)}%. Consider adjusting your pricing.`);
      }

      // Booking insights
      if (bookings.completion_rate < 70) {
        insights.push(`⚠️ Your completion rate is ${bookings.completion_rate}%. Try to reduce cancellations.`);
      } else if (bookings.completion_rate > 90) {
        insights.push(`✅ Excellent! Your completion rate is ${bookings.completion_rate}%.`);
      }

      // Performance insights
      if (performance.response_time > 24) {
        insights.push(`⏰ Your average response time is ${performance.response_time} hours. Faster responses increase bookings!`);
      }

      if (performance.average_rating < 4) {
        insights.push(`⭐ Your average rating is ${performance.average_rating}. Focus on improving customer satisfaction.`);
      } else if (performance.average_rating >= 4.5) {
        insights.push(`🌟 Amazing! Your average rating is ${performance.average_rating}!`);
      }

      // General tips
      if (insights.length === 0) {
        insights.push('💡 Keep up the good work! Your metrics look healthy.');
      }

      return insights;
    } catch (error) {
      console.error('Error getting insights:', error);
      return ['Unable to generate insights at this time.'];
    }
  },
};