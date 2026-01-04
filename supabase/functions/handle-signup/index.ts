// supabase/functions/handle-signup/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"
import { corsHeaders } from "../_shared/cors.ts"

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('--- handle-signup processing request ---')
    const { email, password, options, resend } = await req.json()
    const { emailRedirectTo, data } = options || {}
    const fullName = data?.full_name || 'User'

    if (!email) {
      console.error('Missing email')
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing configuration: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase Admin client
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    let userId = '';
    let userData: any = undefined;

    if (resend) {
      console.log(`Processing RESEND verification for: ${email}`)
      // For resend, we just need the email. We can get the user ID if needed, 
      // but generateLink works with email too.
      // However, to be safe and consistent with previous logs, let's just proceed to generate link.
    } else {
      if (!password) {
        return new Response(
          JSON.stringify({ error: 'Password is required for signup' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // 1. Create User
      console.log(`Step 1: Creating user: ${email}`)
      const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: false, 
        user_metadata: { full_name: fullName }
      })
      userData = data;

      if (createError) {
        console.error('Error creating user:', createError)
        // Check if user already exists
        if (createError.message.includes('already registered')) {
           // If user exists, we SHOULD fail signup, frontend handles 'User exists'.
           // Frontend can then offer 'Resend Verification' button which calls this func with resend: true
           return new Response(
            JSON.stringify({ error: `Step 1 Failed: ${createError.message}` }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        return new Response(
          JSON.stringify({ error: `Step 1 Failed: ${createError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      userId = userData.user.id
    }

    // 2. Generate Email Verification Link
    // Use type 'signup' which is for email verification of new users
    console.log(`Step 2: Generating verification link for: ${email}`)
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email: email,
      password: password, // Password not strictly needed for link generation by admin usually, but good practice if updating
      options: {
        redirectTo: emailRedirectTo
      }
    })

    if (linkError) {
      console.error('Error generating link:', linkError)
      return new Response(
        JSON.stringify({ error: `Step 2 Failed (Generate Link): ${linkError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const verificationUrl = linkData.user?.action_link || linkData.properties?.action_link
    if (!verificationUrl) {
       console.error('Verification URL not found in response', linkData)
       return new Response(
        JSON.stringify({ error: 'Step 2 Failed: Verification URL missing from response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Send Email via send-email Function
    console.log(`Step 3: Invoking send-email function from ${SUPABASE_URL}/functions/v1/send-email`)
    
    try {
      const sendEmailResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({
          email: email,
          type: 'verification',
          data: {
            userName: fullName,
            url: verificationUrl
          }
        })
      })

      if (!sendEmailResponse.ok) {
          const errorText = await sendEmailResponse.text()
          console.error('Failed to send email. Status:', sendEmailResponse.status, 'Response:', errorText)
          return new Response(
              JSON.stringify({ error: `Step 3 Failed (Send Email): ${sendEmailResponse.status} - ${errorText}` }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
      }
      
      console.log('Email sent successfully via send-email function')
      
    } catch (fetchError: any) {
      console.error('Exception calling send-email:', fetchError)
      return new Response(
          JSON.stringify({ error: `Step 3 Exception: ${fetchError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Return success
    console.log('Signup process completed successfully')
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Verification email sent',
        user: typeof userData !== 'undefined' ? userData.user : { email } // Return explicit user only if we have it
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Unexpected error in handle-signup:', error)
    return new Response(
      JSON.stringify({ error: `Unexpected Error: ${error.message || 'Unknown'}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
