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
    const { email, password, options } = await req.json()
    const { emailRedirectTo, data } = options || {}
    const fullName = data?.full_name || 'User'

    if (!email || !password) {
      console.error('Missing email or password')
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
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

    // 1. Create User
    console.log(`Step 1: Creating user: ${email}`)
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, 
      user_metadata: { full_name: fullName }
    })

    if (createError) {
      console.error('Error creating user:', createError)
      const status = createError.message.includes('already registered') ? 400 : 500
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const user = userData.user

    // 2. Generate Email Verification Link
    console.log(`Step 2: Generating verification link for: ${user.id}`)
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
      return new Response(
        JSON.stringify({ error: 'Account created but failed to generate verification link' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const verificationUrl = linkData.user?.action_link || linkData.properties?.action_link
    if (!verificationUrl) {
       console.error('Verification URL not found in response', linkData)
       return new Response(
        JSON.stringify({ error: 'Failed to retrieve verification URL' }),
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
          // Don't fail the signup completely if email fails, but warn.
          // Actually we MUST fail or tell user, otherwise they can't verify.
          return new Response(
              JSON.stringify({ error: 'Account created but failed to send verification email.' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
      }
      
      console.log('Email sent successfully via send-email function')
      
    } catch (fetchError) {
      console.error('Exception calling send-email:', fetchError)
      return new Response(
          JSON.stringify({ error: 'Internal error sending verification email' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Return success
    console.log('Signup process completed successfully')
    return new Response(
      JSON.stringify({ 
        user: userData.user, 
        session: null 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error in handle-signup:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
