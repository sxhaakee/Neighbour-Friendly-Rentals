import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with automatically provided env vars
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get all premium users
    const { data: premiumUsers, error } = await supabaseClient
      .from('profiles')
      .select('id, email, full_name, premium_expires_at')
      .eq('is_premium', true)
      .not('premium_expires_at', 'is', null)

    if (error) throw error

    let expiredCount = 0
    const now = new Date()

    // Check each user
    for (const user of premiumUsers || []) {
      const expiryDate = new Date(user.premium_expires_at)
      
      if (expiryDate < now) {
        // Premium has expired - revoke access
        await supabaseClient
          .from('profiles')
          .update({
            is_premium: false,
            premium_expires_at: null,
            premium_payment_id: null,
            premium_plan: null,
          })
          .eq('id', user.id)

        // Send notification
        await supabaseClient.from('notifications').insert({
          user_id: user.id,
          type: 'system',
          title: '⏰ Premium Membership Expired',
          message: 'Your premium membership has expired. Renew now to continue enjoying unlimited listings!',
          link: '/premium',
          read: false,
        })

        expiredCount++
        console.log(`Revoked premium for user: ${user.email}`)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Checked ${premiumUsers?.length || 0} premium users, revoked ${expiredCount} expired memberships`,
        checked: premiumUsers?.length || 0,
        revoked: expiredCount,
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error in check-premium-expiry:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})