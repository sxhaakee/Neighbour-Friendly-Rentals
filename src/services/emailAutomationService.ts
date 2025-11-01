import { supabase } from '../lib/supabase';

// NOTE: Resend is a SERVER-SIDE API and cannot be called from the browser
// It causes CORS errors when called from frontend
// Solution: Use Supabase Edge Functions to send emails
// For now, we'll log emails to console instead of sending them

const getResendClient = () => {
  // Always return null in browser environment
  // Emails will be logged to console instead
  console.log('📧 Email automation service running in browser mode (logging only)');
  return null;
};

interface EmailCampaign {
  delay: number; // days
  template: string;
  subject: string;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  last_login?: string;
}

export const emailAutomationService = {
  /**
   * Welcome Series - Onboard new users
   */
  async sendWelcomeSeries(userId: string, email: string, name: string) {
    const campaigns: EmailCampaign[] = [
      { 
        delay: 0, 
        template: 'welcome',
        subject: `Welcome to NeighbourFriendly, ${name}! 🎉`
      },
      { 
        delay: 1, 
        template: 'first-listing-guide',
        subject: 'List your first item in 5 minutes ⚡'
      },
      { 
        delay: 3, 
        template: 'success-stories',
        subject: 'See how others are earning with NFRR 💰'
      },
      { 
        delay: 5, 
        template: 'first-booking-discount',
        subject: '🎁 Special offer: 10% off your first booking!'
      },
      { 
        delay: 7, 
        template: 'verification-tips',
        subject: 'Get verified & unlock more bookings ✅'
      }
    ];

    // Schedule all emails
    for (const campaign of campaigns) {
      await this.scheduleEmail(userId, email, name, campaign);
    }

    console.log(`✅ Welcome series scheduled for ${email}`);
  },

  /**
   * Schedule an email to be sent after a delay
   */
  async scheduleEmail(
    userId: string, 
    email: string, 
    name: string, 
    campaign: EmailCampaign
  ) {
    const sendAt = new Date();
    sendAt.setDate(sendAt.getDate() + campaign.delay);

    // Store in database for scheduled sending
    await supabase.from('scheduled_emails').insert({
      user_id: userId,
      email,
      template: campaign.template,
      subject: campaign.subject,
      scheduled_for: sendAt.toISOString(),
      status: 'pending'
    });
  },

  /**
   * Send weekly digest with nearby items and recommendations
   */
  async sendWeeklyDigest(userId: string) {
    try {
      const resend = getResendClient();
      if (!resend) {
        console.log('⚠️ Resend not configured, skipping weekly digest');
        return;
      }

      // Get user details
      const { data: user } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!user) return;

      // Get nearby items (simplified - you can enhance this)
      const { data: nearbyItems } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'approved')
        .limit(5);

      // Send email
      await resend.emails.send({
        from: 'NeighbourFriendly Rentals <noreply@neighbourfriendly.in>',
        to: user.email,
        subject: '🏠 New items near you this week!',
        html: this.generateWeeklyDigestHTML(user.full_name, nearbyItems || [])
      });

      console.log(`✅ Weekly digest sent to ${user.email}`);
    } catch (error) {
      console.error('Error sending weekly digest:', error);
    }
  },

  /**
   * Re-engagement campaigns for inactive users
   */
  async sendReEngagementCampaign(inactiveUsers: User[]) {
    const resend = getResendClient();
    if (!resend) {
      console.log('⚠️ Resend not configured, skipping re-engagement campaign');
      return;
    }

    for (const user of inactiveUsers) {
      const daysSinceLastLogin = this.getDaysSinceLastLogin(user);
      
      try {
        if (daysSinceLastLogin === 30) {
          await resend.emails.send({
            from: 'NeighbourFriendly Rentals <noreply@neighbourfriendly.in>',
            to: user.email,
            subject: 'We miss you! 15% off your next booking 🎁',
            html: this.generateReEngagementHTML(user.full_name, 15)
          });
        } else if (daysSinceLastLogin === 60) {
          await resend.emails.send({
            from: 'NeighbourFriendly Rentals <noreply@neighbourfriendly.in>',
            to: user.email,
            subject: "See what's new on NeighbourFriendly! 🆕",
            html: this.generateWhatsNewHTML(user.full_name)
          });
        } else if (daysSinceLastLogin === 90) {
          await resend.emails.send({
            from: 'NeighbourFriendly Rentals <noreply@neighbourfriendly.in>',
            to: user.email,
            subject: 'Last chance: 20% off before we say goodbye 😢',
            html: this.generateLastChanceHTML(user.full_name, 20)
          });
        }

        console.log(`✅ Re-engagement email sent to ${user.email}`);
      } catch (error) {
        console.error(`Error sending re-engagement email to ${user.email}:`, error);
      }
    }
  },

  /**
   * Send booking confirmation email
   */
  async sendBookingConfirmation(bookingId: string) {
    try {
      const resend = getResendClient();
      if (!resend) {
        console.log('⚠️ Resend not configured, skipping booking confirmation');
        return;
      }

      const { data: booking } = await supabase
        .from('bookings')
        .select(`
          *,
          renter:profiles!bookings_renter_id_fkey(full_name, email),
          listing:listings(title, daily_rate)
        `)
        .eq('id', bookingId)
        .single();

      if (!booking) return;

      await resend.emails.send({
        from: 'NeighbourFriendly Rentals <noreply@neighbourfriendly.in>',
        to: booking.renter.email,
        subject: `Booking Confirmed: ${booking.listing.title} ✅`,
        html: this.generateBookingConfirmationHTML(booking)
      });

      console.log(`✅ Booking confirmation sent for ${bookingId}`);
    } catch (error) {
      console.error('Error sending booking confirmation:', error);
    }
  },

  /**
   * Send rental reminder (24 hours before pickup)
   */
  async sendRentalReminder(bookingId: string) {
    try {
      const resend = getResendClient();
      if (!resend) {
        console.log('⚠️ Resend not configured, skipping rental reminder');
        return;
      }

      const { data: booking } = await supabase
        .from('bookings')
        .select(`
          *,
          renter:profiles!bookings_renter_id_fkey(full_name, email),
          listing:listings(title, pickup_location)
        `)
        .eq('id', bookingId)
        .single();

      if (!booking) return;

      await resend.emails.send({
        from: 'NeighbourFriendly Rentals <noreply@neighbourfriendly.in>',
        to: booking.renter.email,
        subject: `Reminder: Pick up ${booking.listing.title} tomorrow! 📅`,
        html: this.generateRentalReminderHTML(booking)
      });

      console.log(`✅ Rental reminder sent for ${bookingId}`);
    } catch (error) {
      console.error('Error sending rental reminder:', error);
    }
  },

  /**
   * Send review request after rental completion
   */
  async sendReviewRequest(bookingId: string) {
    try {
      const resend = getResendClient();
      if (!resend) {
        console.log('⚠️ Resend not configured, skipping review request');
        return;
      }

      const { data: booking } = await supabase
        .from('bookings')
        .select(`
          *,
          renter:profiles!bookings_renter_id_fkey(full_name, email),
          listing:listings(title)
        `)
        .eq('id', bookingId)
        .single();

      if (!booking) return;

      await resend.emails.send({
        from: 'NeighbourFriendly Rentals <noreply@neighbourfriendly.in>',
        to: booking.renter.email,
        subject: `How was your experience with ${booking.listing.title}? ⭐`,
        html: this.generateReviewRequestHTML(booking)
      });

      console.log(`✅ Review request sent for ${bookingId}`);
    } catch (error) {
      console.error('Error sending review request:', error);
    }
  },

  /**
   * Send premium upgrade email
   */
  async sendPremiumUpgradeEmail(userId: string) {
    try {
      const resend = getResendClient();
      if (!resend) {
        console.log('⚠️ Resend not configured, skipping premium upgrade email');
        return;
      }

      const { data: user } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!user || user.is_premium) return;

      await resend.emails.send({
        from: 'NeighbourFriendly Rentals <noreply@neighbourfriendly.in>',
        to: user.email,
        subject: '🚀 Unlock unlimited listings with Premium!',
        html: this.generatePremiumUpgradeHTML(user.full_name)
      });

      console.log(`✅ Premium upgrade email sent to ${user.email}`);
    } catch (error) {
      console.error('Error sending premium upgrade email:', error);
    }
  },

  // ========== Helper Functions ==========

  getDaysSinceLastLogin(user: User): number {
    if (!user.last_login) return 999;
    const lastLogin = new Date(user.last_login);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastLogin.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  },

  // ========== HTML Email Templates ==========

  generateWeeklyDigestHTML(name: string, items: any[]): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
            .item { border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin: 15px 0; }
            .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏠 New Items Near You!</h1>
              <p>Hi ${name}, check out what's available this week</p>
            </div>
            
            <div style="padding: 20px 0;">
              ${items.map(item => `
                <div class="item">
                  <h3>${item.title}</h3>
                  <p>₹${item.daily_rate}/day</p>
                  <a href="https://neighbourfriendly.vercel.app/listing/${item.id}" class="button">View Details</a>
                </div>
              `).join('')}
            </div>
            
            <div style="text-align: center; padding: 20px; color: #666;">
              <p>Happy renting! 🎉</p>
              <p style="font-size: 12px;">You're receiving this because you're a member of NeighbourFriendly</p>
            </div>
          </div>
        </body>
      </html>
    `;
  },

  generateReEngagementHTML(name: string, discount: number): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 40px; text-align: center; border-radius: 10px; }
            .discount-badge { background: #ffd700; color: #333; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; font-size: 24px; font-weight: bold; }
            .button { background: #f5576c; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; font-size: 18px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>We Miss You, ${name}! 😢</h1>
              <p>It's been a while since we've seen you...</p>
            </div>
            
            <div class="discount-badge">
              🎁 ${discount}% OFF YOUR NEXT BOOKING!
            </div>
            
            <div style="padding: 20px; text-align: center;">
              <p style="font-size: 18px;">Come back and discover amazing items near you!</p>
              <a href="https://neighbourfriendly.vercel.app" class="button">Browse Items Now</a>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
              <p>This offer expires in 7 days. Use code: <strong>COMEBACK${discount}</strong></p>
            </div>
          </div>
        </body>
      </html>
    `;
  },

  generateWhatsNewHTML(name: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
            .feature { background: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 15px 0; }
            .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🆕 What's New on NFRR!</h1>
              <p>Hi ${name}, we've been busy improving!</p>
            </div>
            
            <div style="padding: 20px;">
              <div class="feature">
                <h3>✨ New Categories Added</h3>
                <p>Explore cameras, sports equipment, and more!</p>
              </div>
              
              <div class="feature">
                <h3>🚀 Faster Booking Process</h3>
                <p>Book items in just 2 clicks!</p>
              </div>
              
              <div class="feature">
                <h3>💰 Lower Service Fees</h3>
                <p>Save more on every rental!</p>
              </div>
              
              <div style="text-align: center;">
                <a href="https://neighbourfriendly.vercel.app" class="button">Explore Now</a>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  },

  generateLastChanceHTML(name: string, discount: number): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: #333; padding: 40px; text-align: center; border-radius: 10px; }
            .urgent { background: #ff4757; color: white; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; font-size: 20px; font-weight: bold; }
            .button { background: #ff4757; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; font-size: 18px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Last Chance, ${name}!</h1>
              <p>We don't want to say goodbye...</p>
            </div>
            
            <div class="urgent">
              🎁 FINAL OFFER: ${discount}% OFF!
            </div>
            
            <div style="padding: 20px; text-align: center;">
              <p style="font-size: 18px;">This is our last attempt to bring you back.</p>
              <p style="font-size: 16px; color: #666;">After this, we'll stop sending emails.</p>
              <a href="https://neighbourfriendly.vercel.app" class="button">Claim Your Discount</a>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
              <p>Use code: <strong>LASTCHANCE${discount}</strong> at checkout</p>
              <p>Valid for 3 days only!</p>
            </div>
          </div>
        </body>
      </html>
    `;
  },

  generateBookingConfirmationHTML(booking: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 10px; }
            .details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Booking Confirmed!</h1>
              <p>Your rental is all set</p>
            </div>
            
            <div class="details">
              <h2>${booking.listing.title}</h2>
              <div class="detail-row">
                <span>Start Date:</span>
                <strong>${new Date(booking.start_date).toLocaleDateString()}</strong>
              </div>
              <div class="detail-row">
                <span>End Date:</span>
                <strong>${new Date(booking.end_date).toLocaleDateString()}</strong>
              </div>
              <div class="detail-row">
                <span>Total Amount:</span>
                <strong>₹${booking.total_price}</strong>
              </div>
              <div class="detail-row">
                <span>Booking ID:</span>
                <strong>${booking.id}</strong>
              </div>
            </div>
            
            <div style="text-align: center; padding: 20px;">
              <p>We'll send you a reminder 24 hours before pickup!</p>
            </div>
          </div>
        </body>
      </html>
    `;
  },

  generateRentalReminderHTML(booking: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 30px; text-align: center; border-radius: 10px; }
            .reminder { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📅 Pickup Reminder!</h1>
              <p>Your rental starts tomorrow</p>
            </div>
            
            <div class="reminder">
              <h2>${booking.listing.title}</h2>
              <p><strong>Pickup Location:</strong> ${booking.listing.pickup_location}</p>
              <p><strong>Date:</strong> ${new Date(booking.start_date).toLocaleDateString()}</p>
              <p><strong>Contact:</strong> ${booking.renter_phone}</p>
            </div>
            
            <div style="text-align: center; padding: 20px;">
              <p>Have a great rental experience! 🎉</p>
            </div>
          </div>
        </body>
      </html>
    `;
  },

  generateReviewRequestHTML(booking: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
            .stars { font-size: 40px; text-align: center; margin: 20px 0; }
            .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⭐ How Was Your Experience?</h1>
              <p>We'd love to hear your feedback!</p>
            </div>
            
            <div style="padding: 20px; text-align: center;">
              <h2>${booking.listing.title}</h2>
              <div class="stars">⭐⭐⭐⭐⭐</div>
              <p>Your review helps others make better decisions</p>
              <a href="https://neighbourfriendly.vercel.app/booking/${booking.id}/review" class="button">Leave a Review</a>
            </div>
          </div>
        </body>
      </html>
    `;
  },

  generatePremiumUpgradeHTML(name: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ffd700 0%, #ff8c00 100%); color: #333; padding: 40px; text-align: center; border-radius: 10px; }
            .benefit { background: #f8f9fa; border-left: 4px solid #ffd700; padding: 15px; margin: 10px 0; }
            .price { background: #ffd700; color: #333; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0; font-size: 24px; font-weight: bold; }
            .button { background: #ff8c00; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; font-size: 18px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>👑 Upgrade to Premium!</h1>
              <p>Hi ${name}, unlock unlimited potential</p>
            </div>
            
            <div style="padding: 20px;">
              <div class="benefit">✅ Unlimited Listings</div>
              <div class="benefit">✅ Featured Placement (2x visibility)</div>
              <div class="benefit">✅ Reduced Service Fee (8% instead of 10%)</div>
              <div class="benefit">✅ Priority Support</div>
              <div class="benefit">✅ Advanced Analytics</div>
              <div class="benefit">✅ Verified Badge</div>
              
              <div class="price">
                Only ₹299/month or ₹2,999/year
              </div>
              
              <div style="text-align: center;">
                <a href="https://neighbourfriendly.vercel.app/premium" class="button">Upgrade Now</a>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }
};

// Export for use in other services
export default emailAutomationService;
