// supabase/functions/send-email/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

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
            .button { display: inline-block; background: #14b8a6; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 15px 0; font-weight: bold; }
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
              <p><strong>Congratulations!</strong> You've just joined India's fastest-growing rental community!</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.dashboardUrl}" class="button">Start Listing Now →</a>
              </div>
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
                <p><strong>Item:</strong> ${data.itemTitle}</p>
                <p><strong>Start Date:</strong> ${data.startDate}</p>
                <p><strong>End Date:</strong> ${data.endDate}</p>
                <p><strong>Total:</strong> ₹${data.totalPrice}</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    },
    idVerificationApproved: {
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
            </div>
          </div>
        </body>
        </html>
      `
    },
    idVerificationRejected: {
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
              <p><strong>Reason:</strong> ${data.reason}</p>
              <p>Please upload a clear, valid ID document and try again.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }
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
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get email template
    const template = getEmailTemplate(type, data)
    
    // Send email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'NeighbourFriendly Rentals <noreply@neighbourfriendly.in>',
        to: email,
        subject: template.subject,
        html: template.html,
      }),
    })

    const result = await response.json()
    
    if (!response.ok) {
      console.error('Resend API error:', result)
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: result }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Email sent successfully:', result)
    return new Response(
      JSON.stringify({ success: true, id: result.id }),
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