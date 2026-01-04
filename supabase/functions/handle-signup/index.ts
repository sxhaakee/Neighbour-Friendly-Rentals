// supabase/functions/handle-signup/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0"
import { corsHeaders } from "../_shared/cors.ts"

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, password, options } = await req.json()
    const { emailRedirectTo, data } = options || {}
    const fullName = data?.full_name || 'User'

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase Admin client
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // 1. Create User (without sending default email)
    // Note: 'email_confirm: false' is default, and automatic email sending usually only happens
    // if calling auth.api.signUp, but admin.createUser does NOT send emails by default.
    console.log(`Creating user: ${email}`)
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // User is NOT confirmed yet
      user_metadata: { full_name: fullName }
    })

    if (createError) {
      console.error('Error creating user:', createError)
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const user = userData.user

    // 2. Generate Email Verification Link
    console.log(`Generating verification link for: ${user.id}`)
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email: email,
      password: password,
      options: {
        redirectTo: emailRedirectTo
      }
    })

    if (linkError) {
      console.error('Error generating link:', linkError)
      // Rollback? No, user is created. We can just return error and let user retry "resend".
      return new Response(
        JSON.stringify({ error: 'Account created but failed to generate verification link' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const verificationUrl = linkData.properties?.action_link
    if (!verificationUrl) {
      return new Response(
        JSON.stringify({ error: 'Failed to retrieve verification URL' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Send Email via send-email Function
    // We call our own send-email function to handle the actual delivery via Brevo
    console.log(`Sending email to: ${email}`)
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
        console.error('Failed to send email:', errorText)
        return new Response(
            JSON.stringify({ error: 'Account created but failed to send verification email' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    // Return success
    return new Response(
      JSON.stringify({ 
        user: userData.user, 
        session: null // No session created for unverified user
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
