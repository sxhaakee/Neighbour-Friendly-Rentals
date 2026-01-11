// supabase/functions/send-email/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')

// Email templates
const getEmailTemplate = (type: string, data: any) => {
  const templates: Record<string, any> = {
    welcome: {
      subject: '🎉 Welcome to NeighbourFriendly Rentals - Your Quick Start Guide',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 40px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { background: #ffffff; padding: 40px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none; }
            .welcome-card { background: #f0f9ff; border-left: 4px solid #0284c7; padding: 20px; margin: 25px 0; border-radius: 4px; }
            .step-grid { display: grid; grid-template-columns: 1fr; gap: 20px; margin: 30px 0; }
            .step-item { background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; }
            .step-title { color: #111827; font-weight: bold; margin-bottom: 8px; display: flex; align-items: center; }
            .step-icon { background: #000; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 14px; }
            .divider { height: 1px; background: #e5e7eb; margin: 30px 0; }
            .section-title { color: #111827; font-size: 18px; font-weight: bold; margin-bottom: 15px; }
            .info-box { background: #fffbeb; border: 1px solid #fcd34d; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; text-align: center; }
            .button-container { text-align: center; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">Welcome to the Neighborhood! 🏡</h1>
              <p style="margin: 10px 0 0; opacity: 0.9;">You've joined India's smartest rental community.</p>
            </div>
            
            <div class="content">
              <p>Hi ${data.userName},</p>
              <p>We're thrilled to have you! NFR isn't just a marketplace; it's a community where you can <strong>earn from things you own</strong> and <strong>save on things you need</strong>.</p>

              <div class="welcome-card">
                <h3 style="margin: 0 0 10px 0; color: #0369a1;">🚀 Get Started in 2 Minutes</h3>
                <p style="margin: 0; font-size: 14px; color: #0c4a6e;">
                  Complete your profile and verify your ID to unlock full access to renting and listing. Verified users get 5x more responses!
                </p>
              </div>

              <div class="divider"></div>

              <div class="section-title">✨ How It Works</div>
              
              <div class="step-grid">
                <div class="step-item">
                  <div class="step-title"><span class="step-icon">1</span> List & Earn</div>
                  <p style="font-size: 14px; margin: 0; color: #4b5563;">
                    Post your idle items (cameras, tools, gear). Set your price and terms. It's free to list!
                  </p>
                </div>
                <div class="step-item">
                  <div class="step-title"><span class="step-icon">2</span> Secure Agreements</div>
                  <p style="font-size: 14px; margin: 0; color: #4b5563;">
                    Every booking automatically generates a <strong>Rental Agreement</strong> protecting both parties. No paperwork headaches.
                  </p>
                </div>
                <div class="step-item">
                  <div class="step-title"><span class="step-icon">3</span> Safe Payments</div>
                  <p style="font-size: 14px; margin: 0; color: #4b5563;">
                    We hold payments securely until the item is handed over. Payouts are instant upon completion.
                  </p>
                </div>
              </div>

              <div class="info-box">
                <strong>💡 Your Dashboard Control Center</strong><br>
                <span style="font-size: 14px; color: #b45309;">
                  Visit your <strong>Dashboard</strong> to track earnings, manage listings, view messages, and download agreement PDFs anytime.
                </span>
              </div>

              <div class="button-container">
                <a href="${data.dashboardUrl}" class="button">Go to My Dashboard</a>
              </div>
              
              <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 30px;">
                Need help? Reply to this email or visit our Help Center.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    },
    verification: {
      subject: 'Verify your email for NeighbourFriendly Rentals',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #111827; color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { background: #ffffff; padding: 40px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">Verify Your Email 📧</h1>
            </div>
            <div class="content">
              <p>Hi ${data.userName || 'Neighbor'},</p>
              <p>Thanks for joining NeighbourFriendly Rentals! Please click the button below to verify your email address and activate your account.</p>
              
              <div style="text-align: center;">
                <a href="${data.url}" class="button">Verify Email Address</a>
              </div>
              
              <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
                If you didn't create an account, you can safely ignore this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    },
    bookingConfirmation: {
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
              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <p style="margin: 0; font-weight: bold; color: #92400e;">💡 Smart Saver Tip</p>
                <p style="margin: 5px 0; color: #78350f;">You just saved ₹${Math.round(data.totalPrice * 10)} by renting instead of buying!</p>
              </div>
              <p>© 2025 Neighbour Friendly Rentals. All rights reserved.</p>
              <p>Questions? Contact us at support@neighbourfriendly.in</p>
            </div>
          </div>
        </body>
        </html>
      `
    },
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
      `
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
                <a href="${data.verifyUrl || data.dashboardUrl}" class="button">Upload Again</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    }),

    rentalAgreement: (data: any) => ({
      subject: `Rental Agreement - ${data.itemTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #111827; color: white; padding: 40px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { background: #ffffff; padding: 40px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none; }
            .agreement-box { background: #f3f4f6; border: 1px solid #d1d5db; padding: 20px; border-radius: 8px; margin: 20px 0; font-family: monospace; font-size: 14px; color: #374151; }
            .button { display: inline-block; background: #000000; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
            .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .details-table td { padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
            .label { font-weight: 600; color: #6b7280; width: 40%; }
            .value { font-weight: 500; color: #111827; text-align: right; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">Rental Agreement</h1>
              <p style="margin: 10px 0 0; opacity: 0.8; font-size: 14px;">Official Contract Document</p>
            </div>
            <div class="content">
              <p>Dear ${data.renterName} & ${data.ownerName},</p>
              <p>This email confirms that a rental agreement has been successfully created for <strong>${data.itemTitle}</strong>.</p>
              
              <div class="agreement-box">
                <strong>Agreement ID:</strong> ${data.agreementId}<br>
                <strong>Date:</strong> ${new Date().toLocaleDateString()}<br>
                <strong>Status:</strong> ACTIVE
              </div>

              <h3>📝 Key Terms</h3>
              <table class="details-table">
                <tr><td class="label">Item</td><td class="value">${data.itemTitle}</td></tr>
                <tr><td class="label">Start Date</td><td class="value">${data.startDate}</td></tr>
                <tr><td class="label">End Date</td><td class="value">${data.endDate}</td></tr>
                <tr><td class="label">Total Value</td><td class="value">₹${data.totalPrice}</td></tr>
              </table>

              <p style="font-size: 14px; color: #4b5563;">
                By proceeding with this rental, both parties agree to the NeighbourFriendly terms of service. The renter agrees to return the item in the same condition as received.
              </p>

              <div style="text-align: center;">
                <a href="${data.dashboardUrl}" class="button">View Full Agreement</a>
              </div>
              
              <p style="margin-top: 30px; font-size: 12px; color: #9ca3af; text-align: center;">
                Please keep this email for your records. In case of disputes, this agreement will serve as the primary reference.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    }),

    listingCreated: (data: any) => ({
      subject: `Your Listing is Live! 🚀 - ${data.itemTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 40px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { background: #ffffff; padding: 40px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none; }
            .tip-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 4px; }
            .button { display: inline-block; background: #4f46e5; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; }
            .stat-grid { display: flex; margin: 20px 0; gap: 10px; }
            .stat-card { flex: 1; background: #f9fafb; padding: 15px; text-align: center; border-radius: 8px; border: 1px solid #e5e7eb; }
            .stat-val { font-size: 24px; font-weight: 800; color: #111827; }
            .stat-label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">You're in Business! 🚀</h1>
              <p style="margin: 10px 0 0; opacity: 0.9; font-size: 16px;">Your listing is now visible to thousands of neighbors.</p>
            </div>
            <div class="content">
              <p>Hi ${data.userName},</p>
              <p>Great news! Your <strong>${data.itemType}</strong> listing for "<strong>${data.itemTitle}</strong>" has been successfully created.</p>
 
              <div class="stat-grid">
                <div class="stat-card">
                  <div class="stat-val">₹${data.price}</div>
                  <div class="stat-label">Daily Earnings</div>
                </div>
                <div class="stat-card">
                  <div class="stat-val">0%</div>
                  <div class="stat-label">Commission (Limited Time)</div>
                </div>
              </div>
 
              <div class="tip-box">
                <h3 style="margin: 0 0 10px 0; color: #1e40af;">💡 Pro Tip for Fast Rentals</h3>
                <p style="margin: 0; font-size: 14px; color: #1e3a8a;">
                  Listings with clear photos and detailed descriptions get booked <strong>3x faster</strong>. Consider adding a quick video walkthrough!
                </p>
              </div>
 
              <h3>What happens next?</h3>
              <ul style="padding-left: 20px; color: #4b5563;">
                <li style="margin-bottom: 10px;">Neighbors will see your listing in search results.</li>
                <li style="margin-bottom: 10px;">You'll get a notification when someone requests to book.</li>
                <li style="margin-bottom: 10px;">Chat with them, approve the request, and get paid!</li>
              </ul>
 
              <div style="text-align: center; margin-top: 30px;">
                <a href="${data.listingUrl}" class="button">View My Listing</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    }),
 
    premiumPaymentSuccess: (data: any) => ({
      subject: '🌟 Premium Membership Activated!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 40px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { background: #ffffff; padding: 40px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none; }
            .benefit-card { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .button { display: inline-block; background: #d97706; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">You're Now Premium! 👑</h1>
              <p style="margin: 10px 0 0; opacity: 0.9;">Welcome to the elite neighborhood circle.</p>
            </div>
            <div class="content">
              <p>Hi ${data.userName},</p>
              <p>Your premium membership has been successfully activated. You've officially unlocked the full power of NeighbourFriendly Rentals!</p>
 
              <div class="benefit-card">
                <h3 style="margin: 0 0 10px 0; color: #92400e;">🚀 Your New Superpowers:</h3>
                <ul style="padding-left: 20px; color: #92400e;">
                  <li><strong>Unlimited Listings:</strong> Post as many items, properties, and services as you want!</li>
                  <li><strong>Lower Commission:</strong> Keep more of your earnings with reduced platform fees.</li>
                  <li><strong>Premium Badge:</strong> Stand out to renters with your gold crown badge.</li>
                  <li><strong>Priority Support:</strong> Your queries go to the front of the queue.</li>
                </ul>
              </div>
 
              <p><strong>Expiry Date:</strong> ${data.expiryDate}</p>
 
              <div style="text-align: center; margin-top: 30px;">
                <a href="${data.dashboardUrl}" class="button">Go to Dashboard</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    }),
 
    premiumExpiryReminder: (data: any) => ({
      subject: '⏰ Action Required: Your Premium Membership Expires Soon',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1e293b; color: white; padding: 40px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { background: #ffffff; padding: 40px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none; }
            .warning-box { background: #fff7ed; border: 1px solid #fdba74; padding: 20px; margin: 20px 0; border-radius: 8px; color: #9a3412; }
            .button { display: inline-block; background: #f59e0b; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">Don't Lose Your Benefits! ⏰</h1>
            </div>
            <div class="content">
              <p>Hi ${data.userName},</p>
              <p>Your premium membership is set to expire in <strong>3 days</strong> on <strong>${data.expiryDate}</strong>.</p>
 
              <div class="warning-box">
                <h3 style="margin-top: 0;">⚠️ What happens if it expires?</h3>
                <p>If your membership lapses, any active listings beyond the free limit (3) will be automatically hidden from the public.</p>
              </div>
 
              <p>Renew now to keep your unlimited listings and priority status active without any interruption.</p>
 
              <div style="text-align: center; margin-top: 30px;">
                <a href="${data.premiumUrl}" class="button">Renew Now</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    }),
 
    premiumExpired: (data: any) => ({
      subject: 'Your Premium Membership Has Expired 🛑',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ef4444; color: white; padding: 40px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { background: #ffffff; padding: 40px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none; }
            .limit-box { background: #fef2f2; border: 1px solid #fecaca; padding: 20px; margin: 20px 0; border-radius: 8px; color: #b91c1c; }
            .button { display: inline-block; background: #111827; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">Membership Expired</h1>
            </div>
            <div class="content">
              <p>Hi ${data.userName},</p>
              <p>Your premium membership has expired. As a result, your account has been reverted to the free plan.</p>
 
              <div class="limit-box">
                <h3 style="margin-top: 0;">📉 Listing Update</h3>
                <p>You currently have more than 3 active listings. To comply with the free plan limits, some of your listings have been <strong>hidden</strong>. They will not be visible to other users until you renew or remove other listings.</p>
              </div>
 
              <p>Don't worry! All your data is safe. Renew your premium membership today to restore all your listings instantly.</p>
 
              <div style="text-align: center; margin-top: 30px;">
                <a href="${data.premiumUrl}" class="button">Renew Premium Now</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    })
  }
  
  const template = templates[type] || templates.welcome;
  if (typeof template === 'function') {
    return template(data);
  }
  return template;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    console.log('Received request:', JSON.stringify(body))
    
    const { email, type, data } = body
    
    // Validate inputs
    if (!email || !type) {
      console.error('Validation failed:', { email, type })
      return new Response(
        JSON.stringify({ 
          error: 'Email and type are required',
          received: { email: !!email, type: !!type }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.error('Invalid email format:', email)
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check API key
    if (!BREVO_API_KEY) {
      console.error('BREVO_API_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get email template
    const template = getEmailTemplate(type, data)
    
    // Send email via Brevo
    // API Docs: https://developers.brevo.com/reference/sendtransacemail
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'NeighbourFriendly Rentals',
          email: 'noreply@neighbourfriendly.in'
        },
        to: [{ email: email, name: data.userName || 'User' }],
        subject: template.subject,
        htmlContent: template.html,
      }),
    })

    const result = await response.json()
    
    if (!response.ok) {
      console.error('Brevo API error:', result)
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: result }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Email sent successfully:', result)
    return new Response(
      JSON.stringify({ success: true, id: result.messageId || 'sent' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})