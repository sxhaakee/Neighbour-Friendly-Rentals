// supabase/functions/send-email/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')

// Email templates
const getEmailTemplate = (type: string, data: any) => {
  const templates: Record<string, any> = {
    welcome: {
      subject: '🎉 Welcome to NeighbourFriendly Rentals - Start Earning & Saving Today!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #14b8a6 0%, #f59e0b 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .highlight-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
            .money-stat { font-size: 32px; font-weight: bold; color: #059669; text-align: center; margin: 10px 0; }
            .button { display: inline-block; background: #14b8a6; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 15px 0; font-weight: bold; }
            .feature { padding: 15px; margin: 10px 0; background: white; border-radius: 8px; border-left: 4px solid #14b8a6; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to NFRR!</h1>
              <p style="font-size: 18px; margin-top: 10px;">Your Journey to Smart Savings Starts Now</p>
            </div>
            
            <div class="content">
              <p>Hi ${data.userName},</p>
              <p><strong>Congratulations!</strong> You've just joined India's fastest-growing rental community where neighbors help neighbors save money and earn extra income!</p>

              <div class="highlight-box">
                <h2 style="margin-top: 0; color: #92400e;">💰 Did You Know?</h2>
                <p class="money-stat">₹15,000+</p>
                <p style="text-align: center; font-size: 16px;">Average annual savings for our active users!</p>
                <p style="text-align: center; margin-top: 15px;">Why buy when you can rent for 90% less?</p>
              </div>

              <h3>🚀 Start Making Money in 3 Simple Steps:</h3>
              <div class="feature">
                <strong>1. List Your Idle Items</strong><br>
                That camera gathering dust? List it for ₹500/day and earn ₹15,000/month!
              </div>
              <div class="feature">
                <strong>2. Rent What You Need</strong><br>
                Need a drill for 1 day? Pay ₹100 instead of buying for ₹5,000!
              </div>
              <div class="feature">
                <strong>3. Build Your Reputation</strong><br>
                Get verified, earn reviews, and watch your earnings grow!
              </div>

              <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
                <h3 style="margin-top: 0; color: #991b1b;">⚡ Limited Time Offer!</h3>
                <p><strong>List your first 3 items FREE!</strong> No commission for the first month. But hurry - this offer won't last!</p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.dashboardUrl}" class="button">Start Listing Now →</a>
              </div>

              <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                <strong>Pro Tip:</strong> Users who list items in their first week earn 3x more than those who wait!
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
              <p>Questions? Contact us at support@nfrr.com</p>
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
    })
  }
  
  return templates[type] || templates.welcome
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
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})