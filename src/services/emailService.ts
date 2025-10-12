import { supabase } from '../lib/supabase';
import { Resend } from 'resend';
// Email templates
const EMAIL_TEMPLATES = {
  bookingConfirmation: (data: any) => ({
    subject: `Booking Confirmation - ${data.itemTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #14b8a6 0%, #f59e0b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .section { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #14b8a6; }
          .highlight { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #f59e0b; }
          .warning { background: #fee2e2; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ef4444; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          .button { display: inline-block; background: #14b8a6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
          .label { font-weight: bold; color: #6b7280; }
          .value { text-align: right; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Booking Confirmed!</h1>
            <p>Order ID: ${data.orderId}</p>
          </div>
          
          <div class="content">
            <div class="section">
              <h2>📦 Item Details</h2>
              <table>
                <tr><td class="label">Item:</td><td class="value">${data.itemTitle}</td></tr>
                <tr><td class="label">Start Date:</td><td class="value">${data.startDate}</td></tr>
                <tr><td class="label">End Date:</td><td class="value">${data.endDate}</td></tr>
                <tr><td class="label">Duration:</td><td class="value">${data.totalDays} days</td></tr>
              </table>
            </div>

            <div class="section">
              <h2>💰 Payment Details</h2>
              <table>
                <tr><td class="label">Item Price:</td><td class="value">₹${data.itemPrice}</td></tr>
                <tr><td class="label">Service Charge (10%):</td><td class="value">₹${data.serviceCharge}</td></tr>
                ${data.deliveryCharge > 0 ? `<tr><td class="label">Delivery & Pickup:</td><td class="value">₹${data.deliveryCharge}</td></tr>` : ''}
                <tr><td class="label">Security Deposit (20%):</td><td class="value">₹${data.securityDeposit}</td></tr>
                <tr style="font-weight: bold; font-size: 18px; color: #14b8a6;">
                  <td class="label">TOTAL:</td><td class="value">₹${data.totalPrice}</td>
                </tr>
              </table>
              <p style="font-size: 12px; color: #6b7280; margin-top: 10px;">
                *Security deposit will be refunded after item return<br>
                *Service charge is for safe renting and trust
              </p>
            </div>

            <div class="highlight">
              <h3>💳 Payment Method</h3>
              <p><strong>${data.paymentMethod === 'cash' ? 'Cash' : 'UPI'} on Delivery</strong></p>
              <p>Please pay ₹${data.totalPrice} to the owner when you receive the item.</p>
            </div>

            <div class="warning">
              <h3>📹 IMPORTANT: Video Recording Required</h3>
              <p><strong>You MUST record a video of the item during:</strong></p>
              <ul>
                <li>Handover (when you receive the item)</li>
                <li>Return (when you give it back)</li>
              </ul>
              <p>Show all sides, accessories, and condition clearly. This is mandatory for dispute resolution.</p>
            </div>

            <div class="section">
              <h2>👤 ${data.isRenter ? 'Owner' : 'Renter'} Contact</h2>
              <table>
                <tr><td class="label">Name:</td><td class="value">${data.contactName}</td></tr>
                <tr><td class="label">Phone:</td><td class="value">${data.contactPhone}</td></tr>
                <tr><td class="label">Address:</td><td class="value">${data.contactAddress}</td></tr>
              </table>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.dashboardUrl}" class="button">View Booking Details</a>
            </div>
          </div>

          <div class="footer">
            <p>© 2025 Neighbour Friendly Rentals. All rights reserved.</p>
            <p>Questions? Contact us at support@nfrr.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  idVerificationApproved: (data: any) => ({
    subject: '✅ ID Verification Approved',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #14b8a6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ ID Verified!</h1>
          </div>
          <div class="content">
            <p>Hi ${data.userName},</p>
            <p>Great news! Your ID has been verified successfully.</p>
            <p>You can now book items on Neighbour Friendly Rentals.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.dashboardUrl}" class="button">Start Booking</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  idVerificationRejected: (data: any) => ({
    subject: '❌ ID Verification Rejected',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .reason { background: #fee2e2; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ef4444; }
          .button { display: inline-block; background: #14b8a6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ ID Verification Rejected</h1>
          </div>
          <div class="content">
            <p>Hi ${data.userName},</p>
            <p>Unfortunately, your ID verification was rejected.</p>
            <div class="reason">
              <strong>Reason:</strong> ${data.reason}
            </div>
            <p>Please upload a clear, valid ID document and try again.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.verifyUrl}" class="button">Upload Again</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  paymentReminder: (data: any) => ({
    subject: `Payment Reminder - Order ${data.orderId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💳 Payment Reminder</h1>
          </div>
          <div class="content">
            <p>Hi ${data.userName},</p>
            <p>This is a reminder to pay ₹${data.amount} via ${data.paymentMethod} when you receive the item.</p>
            <p><strong>Pickup Date:</strong> ${data.startDate}</p>
            <p>Please ensure you have the payment ready.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};

export const emailService = {
  /**
   * Send booking confirmation email
   */
  async sendBookingConfirmation(bookingData: any) {
    try {
      // For now, log the email (in production, use Resend/SendGrid)
      console.log('📧 Booking Confirmation Email:', bookingData);
      

      const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);
      
      const response = await resend.emails.send({
        from: 'NFRR <noreply@yourdomain.com>', // Change after domain setup
        to: bookingData.email,
        cc: 'friendlyrentals.mlr@gmail.com', // Admin gets copy
        ...EMAIL_TEMPLATES.bookingConfirmation(bookingData),
      });
      
      return { success: true, data: response };

      // For manual testing, you can copy the HTML and send manually
      const template = EMAIL_TEMPLATES.bookingConfirmation(bookingData);
      console.log('Email Subject:', template.subject);
      console.log('Email HTML:', template.html);
      
      return { success: true, message: 'Email logged (implement actual sending)' };
    } catch (error) {
      console.error('Error sending booking confirmation:', error);
      throw error;
    }
  },

  /**
   * Send ID verification status email
   */
  async sendIDVerificationStatus(userData: any, status: 'approved' | 'rejected', reason?: string) {
    try {
      const template = status === 'approved' 
        ? EMAIL_TEMPLATES.idVerificationApproved(userData)
        : EMAIL_TEMPLATES.idVerificationRejected({ ...userData, reason });
      
      console.log('📧 ID Verification Email:', template.subject);
      console.log('Email HTML:', template.html);
      
      return { success: true };
    } catch (error) {
      console.error('Error sending ID verification email:', error);
      throw error;
    }
  },

  /**
   * Send payment reminder
   */
  async sendPaymentReminder(bookingData: any) {
    try {
      const template = EMAIL_TEMPLATES.paymentReminder(bookingData);
      
      console.log('📧 Payment Reminder:', template.subject);
      console.log('Email HTML:', template.html);
      
      return { success: true };
    } catch (error) {
      console.error('Error sending payment reminder:', error);
      throw error;
    }
  },

  /**
   * Get email template HTML (for manual sending)
   */
  getEmailTemplate(type: string, data: any) {
    const templates: any = EMAIL_TEMPLATES;
    if (templates[type]) {
      return templates[type](data);
    }
    throw new Error(`Template ${type} not found`);
  },
};

// Export templates for manual use
export { EMAIL_TEMPLATES };
