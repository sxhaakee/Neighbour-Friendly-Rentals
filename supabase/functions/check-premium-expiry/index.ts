import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
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

    // 1. Find all expired premium users
    const now = new Date().toISOString()
    const { data: expiredUsers, error: usersError } = await supabaseClient
      .from('profiles')
      .select('id, email, full_name')
      .eq('is_premium', true)
      .lt('premium_expires_at', now)

    if (usersError) throw usersError

    if (!expiredUsers || expiredUsers.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No expired memberships found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const results = []

    for (const user of expiredUsers) {
      // a. Revoke premium status
      await supabaseClient
        .from('profiles')
        .update({
          is_premium: false,
          premium_expires_at: null,
          premium_payment_id: null,
          premium_plan: null,
        })
        .eq('id', user.id)

      // b. Fetch all listings across all 3 tables
      const [itemsRes, propertiesRes, servicesRes] = await Promise.all([
        supabaseClient.from('listings').select('id, created_at, title, status').eq('owner_id', user.id),
        supabaseClient.from('properties').select('id, created_at, title, status').eq('owner_id', user.id),
        supabaseClient.from('service_providers').select('id, created_at, business_name, status').eq('owner_id', user.id)
      ])

      // c. Combine and sort by creation date (oldest first)
      const allListings = [
        ...(itemsRes.data || []).map((l: any) => ({ ...l, type: 'listings' })),
        ...(propertiesRes.data || []).map((l: any) => ({ ...l, type: 'properties' })),
        ...(servicesRes.data || []).map((l: any) => ({ ...l, type: 'service_providers', title: l.business_name }))
      ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

      // d. Identify listings to hide
      const activeListings = allListings.filter(l => l.status === 'approved')
      
      let hiddenCount = 0
      if (activeListings.length > 3) {
        // Keep the first 3 active ones, hide the rest
        const toHide = activeListings.slice(3)
        
        for (const listing of toHide) {
          await supabaseClient
            .from(listing.type)
            .update({ status: 'hidden' })
            .eq('id', listing.id)
          hiddenCount++
        }
      }

      // e. Send notification
      let message = 'Your premium membership has expired. Your listings have been adjusted to the free limit (3).'
      if (hiddenCount > 0) {
        message = `Your premium membership has expired. ${hiddenCount} of your listings have been hidden because you've reached the free limit of 3. Upgrade to Premium to show them again!`
      }

      await supabaseClient.from('notifications').insert({
        user_id: user.id,
        type: 'system',
        title: '⏰ Premium Membership Expired',
        message: message,
        link: '/premium',
        read: false,
      })

      results.push({ email: user.email, hidden: hiddenCount })
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err: any) {
    const error = err as Error
    console.error('Error in check-premium-expiry:', error)
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})