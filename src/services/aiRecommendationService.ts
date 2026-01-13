import { supabase } from '../lib/supabase';

export interface RecommendationResult {
  id: string;
  title: string;
  score: number;
  reason: string;
  type: 'listing' | 'property' | 'service';
}

export interface PricePrediction {
  suggested_price: number;
  min_price: number;
  max_price: number;
  confidence: number;
  factors: string[];
}

export const aiRecommendationService = {
  // Get personalized recommendations for user
  async getPersonalizedRecommendations(userId: string, limit = 10): Promise<RecommendationResult[]> {
    try {
      // Get user's booking history
      const { data: bookings } = await supabase
        .from('bookings')
        .select('listing_id')
        .eq('renter_id', userId)
        .limit(20);

      // Get user's search history
      // TODO: Uncomment when recent_searches table is created
      // const { data: searches } = await supabase
      //   .from('recent_searches')
      //   .select('query, filters')
      //   .eq('user_id', userId)
      //   .order('created_at', { ascending: false })
      //   .limit(10);

      // Extract categories from history
      const categories = new Set<string>();
      if (bookings) {
        for (const booking of bookings) {
          if (booking.listing_id) {
            const { data: listing } = await supabase
              .from('listings')
              .select('category')
              .eq('id', booking.listing_id)
              .single();
            if (listing) categories.add(listing.category);
          }
        }
      }

      // Get recommendations based on categories
      const recommendations: RecommendationResult[] = [];
      
      if (categories.size > 0) {
        const { data: listings } = await supabase
          .from('listings')
          .select('id, title, category, price')
          .in('category', Array.from(categories))
          .eq('status', 'approved')
          .limit(limit);

        if (listings) {
          recommendations.push(...listings.map(item => ({
            id: item.id,
            title: item.title,
            score: 0.8,
            reason: `Based on your interest in ${item.category}`,
            type: 'listing' as const,
          })));
        }
      }

      // If no history, get popular items
      if (recommendations.length === 0) {
        const { data: popular } = await supabase
          .from('listings')
          .select('id, title, category')
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (popular) {
          recommendations.push(...popular.map(item => ({
            id: item.id,
            title: item.title,
            score: 0.5,
            reason: 'Popular in your area',
            type: 'listing' as const,
          })));
        }
      }

      return recommendations;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  },

  // Find similar items
  async getSimilarItems(itemId: string, type: 'listing' | 'property' | 'service', limit = 5): Promise<RecommendationResult[]> {
    try {
      const table = type === 'listing' ? 'listings' : type === 'property' ? 'properties' : 'service_providers';
      
      // Get the original item
      const { data: original } = await supabase
        .from(table)
        .select('*')
        .eq('id', itemId)
        .single();

      if (!original) return [];

      // Find similar items based on category/type
      const query = supabase
        .from(table)
        .select('id, title, category')
        .neq('id', itemId)
        .limit(limit);

      if (type === 'listing') {
        query.eq('category', (original as any).category);
      } else if (type === 'service') {
        query.eq('service_type', (original as any).service_type);
      }

      const { data: similar } = await query;

      if (!similar) return [];

      return (similar as any[]).map(item => ({
        id: item.id,
        title: item.title || item.business_name || 'Unknown',
        score: 0.7,
        reason: 'Similar to what you viewed',
        type,
      }));
    } catch (error) {
      console.error('Error finding similar items:', error);
      return [];
    }
  },

  // Predict optimal price
  async predictPrice(itemData: {
    category: string;
    condition?: string;
    location?: string;
  }): Promise<PricePrediction> {
    try {
      // Get similar items in the same category
      const { data: similar } = await supabase
        .from('listings')
        .select('price')
        .eq('category', itemData.category)
        .eq('status', 'approved')
        .not('price', 'is', null);

      if (!similar || similar.length === 0) {
        return {
          suggested_price: 100,
          min_price: 50,
          max_price: 200,
          confidence: 0.3,
          factors: ['Limited data available'],
        };
      }

      // Calculate statistics
      const prices = similar.map(item => item.price).filter(p => p > 0);
      const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
      const sorted = prices.sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      const min = Math.min(...prices);
      const max = Math.max(...prices);

      // Calculate suggested price (weighted average of mean and median)
      const suggested = Math.round((avg * 0.6 + median * 0.4));

      return {
        suggested_price: suggested,
        min_price: Math.round(min * 0.8),
        max_price: Math.round(max * 1.2),
        confidence: Math.min(prices.length / 20, 1),
        factors: [
          `Based on ${prices.length} similar items`,
          `Average price: ₹${Math.round(avg)}`,
          `Market range: ₹${min} - ₹${max}`,
        ],
      };
    } catch (error) {
      console.error('Error predicting price:', error);
      return {
        suggested_price: 100,
        min_price: 50,
        max_price: 200,
        confidence: 0.3,
        factors: ['Error calculating price'],
      };
    }
  },

  // Forecast demand
  async forecastDemand(category: string, location?: string): Promise<{
    demand_score: number;
    trend: 'increasing' | 'stable' | 'decreasing';
    peak_days: string[];
    insights: string[];
  }> {
    try {
      // Get booking data for the category
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: recentBookings } = await supabase
        .from('bookings')
        .select('created_at, listing_id')
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Count bookings per day
      const bookingsByDay: Record<string, number> = {};
      if (recentBookings) {
        for (const booking of recentBookings) {
          const day = booking.created_at ? new Date(booking.created_at).toLocaleDateString() : null;
          if (day) {
            bookingsByDay[day] = (bookingsByDay[day] || 0) + 1;
          }
        }
      }

      const days = Object.keys(bookingsByDay);
      const counts = Object.values(bookingsByDay);
      const avgBookings = counts.reduce((a, b) => a + b, 0) / counts.length || 0;

      // Determine trend
      const recentAvg = counts.slice(-7).reduce((a, b) => a + b, 0) / 7 || 0;
      const olderAvg = counts.slice(0, 7).reduce((a, b) => a + b, 0) / 7 || 0;
      
      let trend: 'increasing' | 'stable' | 'decreasing' = 'stable';
      if (recentAvg > olderAvg * 1.2) trend = 'increasing';
      else if (recentAvg < olderAvg * 0.8) trend = 'decreasing';

      // Find peak days
      const sortedDays = days.sort((a, b) => bookingsByDay[b] - bookingsByDay[a]);
      const peakDays = sortedDays.slice(0, 3);

      return {
        demand_score: Math.min(avgBookings / 10, 1),
        trend,
        peak_days: peakDays,
        insights: [
          `Average ${Math.round(avgBookings)} bookings per day`,
          `Demand is ${trend}`,
          trend === 'increasing' ? 'Good time to list items' : 'Consider competitive pricing',
        ],
      };
    } catch (error) {
      console.error('Error forecasting demand:', error);
      return {
        demand_score: 0.5,
        trend: 'stable',
        peak_days: [],
        insights: ['Insufficient data for forecast'],
      };
    }
  },

  // Auto-categorize item from title and description
  async autoCategorize(title: string, description: string): Promise<{
    category: string;
    confidence: number;
    alternatives: string[];
  }> {
    const categories = [
      'Electronics',
      'Cameras & Photography',
      'Tools & Equipment',
      'Vehicles',
      'Sports & Fitness',
      'Musical Instruments',
      'Furniture',
      'Appliances',
      'Books',
      'Media',
      'Clothing & Accessories',
      'Party & Events',
      'Gaming & Consoles',
      'Outdoor & Camping',
      'Baby & Kids',
      'Medical & Health',
      'Miscellaneous',
    ];

    // Simple keyword matching (in production, use ML model)
    const text = `${title} ${description}`.toLowerCase();
    const scores: Record<string, number> = {};

    const keywords: Record<string, string[]> = {
      'Electronics': ['laptop', 'phone', 'tablet', 'computer', 'electronic', 'gadget'],
      'Cameras & Photography': ['camera', 'lens', 'photography', 'dslr', 'tripod'],
      'Tools & Equipment': ['drill', 'hammer', 'saw', 'tool', 'equipment', 'ladder'],
      'Vehicles': ['car', 'bike', 'scooter', 'vehicle', 'motorcycle'],
      'Sports & Fitness': ['gym', 'fitness', 'sports', 'exercise', 'yoga', 'bicycle'],
      'Musical Instruments': ['guitar', 'piano', 'drum', 'music', 'instrument'],
      'Furniture': ['chair', 'table', 'sofa', 'bed', 'furniture', 'desk'],
      'Appliances': ['fridge', 'washing', 'microwave', 'appliance', 'oven'],
      'Party & Events': ['party', 'event', 'decoration', 'tent', 'speaker'],
      'Gaming & Consoles': ['game', 'console', 'playstation', 'xbox', 'gaming'],
    };

    for (const [category, words] of Object.entries(keywords)) {
      scores[category] = words.filter(word => text.includes(word)).length;
    }

    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const topCategory = sorted[0][0];
    const topScore = sorted[0][1];

    return {
      category: topScore > 0 ? topCategory : 'Miscellaneous',
      confidence: Math.min(topScore / 3, 1),
      alternatives: sorted.slice(1, 4).map(([cat]) => cat),
    };
  },

  // Get smart pricing suggestions
  async getSmartPricing(itemId: string, currentPrice: number): Promise<{
    recommended_price: number;
    price_change: number;
    reason: string;
    expected_impact: string;
  }> {
    try {
      // Get item details
      const { data: item } = await supabase
        .from('listings')
        .select('category, created_at')
        .eq('id', itemId)
        .single();

      if (!item) {
        return {
          recommended_price: currentPrice,
          price_change: 0,
          reason: 'Item not found',
          expected_impact: 'No change',
        };
      }

      // Get market price
      const prediction = await this.predictPrice({ category: item.category });
      const marketPrice = prediction.suggested_price;

      // Calculate recommendation
      const priceDiff = currentPrice - marketPrice;
      const percentDiff = (priceDiff / marketPrice) * 100;

      if (percentDiff > 20) {
        return {
          recommended_price: Math.round(marketPrice * 1.1),
          price_change: Math.round(marketPrice * 1.1 - currentPrice),
          reason: 'Your price is significantly above market average',
          expected_impact: 'Lowering price may increase bookings by 30-50%',
        };
      } else if (percentDiff < -20) {
        return {
          recommended_price: Math.round(marketPrice * 0.9),
          price_change: Math.round(marketPrice * 0.9 - currentPrice),
          reason: 'Your price is below market average',
          expected_impact: 'Increasing price may boost earnings without affecting demand',
        };
      } else {
        return {
          recommended_price: currentPrice,
          price_change: 0,
          reason: 'Your price is competitive',
          expected_impact: 'Current pricing is optimal',
        };
      }
    } catch (error) {
      console.error('Error getting smart pricing:', error);
      return {
        recommended_price: currentPrice,
        price_change: 0,
        reason: 'Error calculating pricing',
        expected_impact: 'No change',
      };
    }
  },
};
