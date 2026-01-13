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
    const url = new URL(req.url)
    const type = url.searchParams.get('type') // 'listing', 'service', 'property'
    const id = url.searchParams.get('id')

    if (!type || !id) {
      return new Response('Missing type or id parameters', { status: 400 })
    }

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

    let title = 'NeighbourFriendly Rentals'
    let description = 'Rent from people you can trust — right next door.'
    let image = 'https://neighbourfriendly.in/logo.png' // Fallback image
    let redirectUrl = 'https://neighbourfriendly.in'

    // Determine table and fields based on type
    let table = ''
    let titleField = 'title'
    let descField = 'description'
    let imageField = 'images'
    
    if (type === 'listing') {
      table = 'listings'
      redirectUrl = `https://neighbourfriendly.in/items/${id}`
    } else if (type === 'service') {
      table = 'service_providers'
      titleField = 'business_name'
      redirectUrl = `https://neighbourfriendly.in/services/${id}`
    } else if (type === 'property') {
      table = 'properties'
      redirectUrl = `https://neighbourfriendly.in/properties/${id}`
    } else {
       return new Response('Invalid type parameter', { status: 400 })
    }

    // Fetch details
    const { data, error } = await supabaseClient
      .from(table)
      .select(`${titleField}, ${descField}, ${imageField}`)
      .eq('id', id)
      .single()

    if (error || !data) {
      console.error('Error fetching details:', error)
      // Fallback or 404? Let's fallback to generic metadata so the link still works
    } else {
      title = data[titleField] || title
      description = data[descField] || description
      
      // Handle images (usually an array of strings)
      if (data[imageField] && Array.isArray(data[imageField]) && data[imageField].length > 0) {
        image = data[imageField][0]
      } else if (typeof data[imageField] === 'string') {
        image = data[imageField]
      }
    }
    
    // Ensure absolute URL for image if it's a relative path (though usually they are URLs in this DB)
    // If your image URLs are stored as filenames, you might need to prepend the storage bucket URL.
    // Assuming they are full URLs or you can handle that here.
    
    // Construct HTML response
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <meta name="description" content="${description}">
        
        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="${req.url}">
        <meta property="og:title" content="${title}">
        <meta property="og:description" content="${description}">
        <meta property="og:image" content="${image}">

        <!-- Twitter -->
        <meta property="twitter:card" content="summary_large_image">
        <meta property="twitter:url" content="${req.url}">
        <meta property="twitter:title" content="${title}">
        <meta property="twitter:description" content="${description}">
        <meta property="twitter:image" content="${image}">
        
        <script>
          window.location.href = "${redirectUrl}";
        </script>
      </head>
      <body>
        <p>Redirecting to <a href="${redirectUrl}">${title}</a>...</p>
      </body>
      </html>
    `

    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
      },
    })

  } catch (err: any) {
    const error = err as Error
    console.error('Error in share function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
