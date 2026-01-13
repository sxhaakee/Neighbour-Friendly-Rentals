import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  followers_count: number;
  following_count: number;
  listings_count: number;
  is_following?: boolean;
}

export interface ActivityFeed {
  id: string;
  user_id: string;
  type: 'listing' | 'booking' | 'review' | 'follow';
  action: string;
  target_id?: string;
  target_title?: string;
  created_at: string;
  user?: UserProfile;
}

export interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  avatar_url?: string;
  score: number;
  rank: number;
  badge?: string;
}

export const socialService = {
  // Follow a user
  async followUser(followerId: string, followingId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: followerId,
          following_id: followingId,
        });

      if (error) throw error;

      // Update follower counts
      await this.updateFollowerCounts(followerId, followingId);

      // Create activity
      await this.createActivity(followerId, 'follow', 'followed a user', followingId);
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  },

  // Unfollow a user
  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);

      if (error) throw error;

      // Update follower counts
      await this.updateFollowerCounts(followerId, followingId);
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  },

  // Check if user is following another user
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .single();

      return !!data;
    } catch (error) {
      return false;
    }
  },

  // Get user's followers
  async getFollowers(userId: string): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select(`
          follower_id,
          follower:profiles!user_follows_follower_id_fkey(
            id,
            full_name,
            avatar_url,
            bio
          )
        `)
        .eq('following_id', userId);

      if (error) throw error;

      return (data || []).map((item: any) => ({
        ...item.follower,
        followers_count: 0,
        following_count: 0,
        listings_count: 0,
      }));
    } catch (error) {
      console.error('Error getting followers:', error);
      return [];
    }
  },

  // Get users that user is following
  async getFollowing(userId: string): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select(`
          following_id,
          following:profiles!user_follows_following_id_fkey(
            id,
            full_name,
            avatar_url,
            bio
          )
        `)
        .eq('follower_id', userId);

      if (error) throw error;

      return (data || []).map((item: any) => ({
        ...item.following,
        followers_count: 0,
        following_count: 0,
        listings_count: 0,
      }));
    } catch (error) {
      console.error('Error getting following:', error);
      return [];
    }
  },

  // Get follower counts
  async getFollowerCounts(userId: string): Promise<{ followers: number; following: number }> {
    try {
      const [followers, following] = await Promise.all([
        supabase
          .from('user_follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', userId),
        supabase
          .from('user_follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', userId),
      ]);

      return {
        followers: followers.count || 0,
        following: following.count || 0,
      };
    } catch (error) {
      console.error('Error getting follower counts:', error);
      return { followers: 0, following: 0 };
    }
  },

  // Update follower counts in profiles
  async updateFollowerCounts(followerId: string, followingId: string): Promise<void> {
    try {
      const [followerCounts, followingCounts] = await Promise.all([
        this.getFollowerCounts(followerId),
        this.getFollowerCounts(followingId),
      ]);

      await Promise.all([
        supabase
          .from('profiles')
          .update({
            followers_count: followerCounts.followers,
            following_count: followerCounts.following,
          })
          .eq('id', followerId),
        supabase
          .from('profiles')
          .update({
            followers_count: followingCounts.followers,
            following_count: followingCounts.following,
          })
          .eq('id', followingId),
      ]);
    } catch (error) {
      console.error('Error updating follower counts:', error);
    }
  },

  // Create activity
  async createActivity(
    userId: string,
    type: 'listing' | 'booking' | 'review' | 'follow',
    action: string,
    targetId?: string,
    targetTitle?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('activity_feed')
        .insert({
          user_id: userId,
          type,
          action,
          target_id: targetId,
          target_title: targetTitle,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating activity:', error);
    }
  },

  // Get activity feed
  async getActivityFeed(userId: string, limit = 50): Promise<ActivityFeed[]> {
    try {
      // Get users that the current user is following
      const { data: following } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', userId);

      const followingIds = following?.map(f => f.following_id) || [];
      followingIds.push(userId); // Include own activities

      // Get activities from followed users
      const { data, error } = await supabase
        .from('activity_feed')
        .select(`
          *,
          user:profiles(id, full_name, avatar_url)
        `)
        .in('user_id', followingIds)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting activity feed:', error);
      return [];
    }
  },

  // Generate Share Link (Edge Function)
  generateShareLink(type: 'listing' | 'service' | 'property', id: string): string {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    return `${supabaseUrl}/functions/v1/share?type=${type}&id=${id}`;
  },

  // Share Content (Generic)
  async shareContent(userId: string, type: 'listing' | 'service' | 'property', id: string, platform: string, title: string): Promise<string> {
    try {
      // Create share URL using Edge Function
      const shareUrl = this.generateShareLink(type, id);
      const text = `Check out this ${type}: ${title}`;

      // Generate share link based on platform
      const shareLinks: Record<string, string> = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
        copy: shareUrl,
      };

      // Track share
      await this.createActivity(userId, 'listing', `shared a ${type}`, id, title); // 'listing' type used for generic share activity for now

      return shareLinks[platform] || shareUrl;
    } catch (error) {
      console.error('Error sharing content:', error);
      return '';
    }
  },

  // Share listing
  async shareListing(userId: string, listingId: string, platform: string): Promise<string> {
    try {
      const { data: listing } = await supabase
        .from('listings')
        .select('title')
        .eq('id', listingId)
        .single();

      if (!listing) return '';

      return this.shareContent(userId, 'listing', listingId, platform, listing.title);
    } catch (error) {
      console.error('Error sharing listing:', error);
      return '';
    }
  },

  // Get referral code
  async getReferralCode(userId: string): Promise<string> {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', userId)
        .single();

      if (profile?.referral_code) {
        return profile.referral_code;
      }

      // Generate new referral code
      const code = `NFR${userId.substring(0, 8).toUpperCase()}`;
      
      await supabase
        .from('profiles')
        .update({ referral_code: code })
        .eq('id', userId);

      return code;
    } catch (error) {
      console.error('Error getting referral code:', error);
      return '';
    }
  },

  // Apply referral code
  async applyReferralCode(userId: string, code: string): Promise<boolean> {
    try {
      // Find user with this referral code
      const { data: referrer } = await supabase
        .from('profiles')
        .select('id')
        .eq('referral_code', code)
        .single();

      if (!referrer) return false;

      // Create referral record
      const { error } = await supabase
        .from('referrals')
        .insert({
          referrer_id: referrer.id,
          referred_id: userId,
          status: 'pending',
        });

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error applying referral code:', error);
      return false;
    }
  },

  // Get leaderboard
  async getLeaderboard(type: 'listings' | 'bookings' | 'reviews' | 'earnings', limit = 10): Promise<LeaderboardEntry[]> {
    try {
      let query = supabase
        .from('profiles')
        .select('id, full_name, avatar_url');

      // Add score calculation based on type
      if (type === 'listings') {
        query = query.order('listings_count', { ascending: false });
      } else if (type === 'bookings') {
        query = query.order('bookings_count', { ascending: false });
      } else if (type === 'reviews') {
        query = query.order('reviews_count', { ascending: false });
      }

      const { data, error } = await query.limit(limit);

      if (error) throw error;

      return (data || []).map((user, index) => ({
        user_id: user.id,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        score: 100 - index * 5, // Mock score
        rank: index + 1,
        badge: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : undefined,
      }));
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  },

  // Get user stats
  async getUserStats(userId: string): Promise<{
    listings_count: number;
    bookings_count: number;
    reviews_count: number;
    followers_count: number;
    following_count: number;
    total_earnings: number;
  }> {
    try {
      const [listings, bookings, reviews, followers] = await Promise.all([
        supabase
          .from('listings')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId),
        supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', userId),
        supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId),
        this.getFollowerCounts(userId),
      ]);

      return {
        listings_count: listings.count || 0,
        bookings_count: bookings.count || 0,
        reviews_count: reviews.count || 0,
        followers_count: followers.followers,
        following_count: followers.following,
        total_earnings: 0, // Calculate from payments
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        listings_count: 0,
        bookings_count: 0,
        reviews_count: 0,
        followers_count: 0,
        following_count: 0,
        total_earnings: 0,
      };
    }
  },
};
