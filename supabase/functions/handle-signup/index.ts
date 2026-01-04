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
      console.log(`Processing RESEND/FORCE VERIFY for: ${email}`)
      // Fetch user to get ID
      const { data: userList, error: listError } = await supabaseAdmin.auth.admin.listUsers()
      if (listError) throw listError
      
      const existingUser = userList.users.find(u => u.email === email)
      if (existingUser) {
          // Force confirm the user
           const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            existingUser.id,
            { email_confirm: true }
          )
          if (updateError) throw updateError
          userData = { user: existingUser }
      } else {
           return new Response(
            JSON.stringify({ error: 'User not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
      }
    } else {
      if (!password) {
        return new Response(
          JSON.stringify({ error: 'Password is required for signup' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // 1. Create User (AUTO CONFIRMED)
      console.log(`Step 1: Creating user (Auto-Verified): ${email}`)
      const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // AUTO CONFIRM ON
        user_metadata: { full_name: fullName }
      })
      userData = data;

      if (createError) {
        console.error('Error creating user:', createError)
        const status = createError.message.includes('already registered') ? 400 : 500
        return new Response(
          JSON.stringify({ error: `Step 1 Failed: ${createError.message}` }),
          { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Return success
    console.log('Signup/Verification process completed successfully')
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Account created and verified successfully.',
        user: typeof userData !== 'undefined' ? userData.user : { email }
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
