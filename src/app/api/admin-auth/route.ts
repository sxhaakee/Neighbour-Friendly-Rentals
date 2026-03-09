import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side admin verification — cannot be spoofed from the client
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ isAdmin: false, error: 'No auth token' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ isAdmin: false, error: 'Server misconfigured' }, { status: 500 });
    }

    // Use service role to verify the token and check admin status
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ isAdmin: false, error: 'Invalid token' }, { status: 401 });
    }

    // Check admin status directly in the database (cannot be spoofed)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, is_admin, email')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ isAdmin: false, error: 'Profile not found' }, { status: 403 });
    }

    const isAdmin = profile.role === 'admin' || profile.is_admin === true;

    if (!isAdmin) {
      // Log unauthorized admin access attempt
      console.warn(`[SECURITY] Unauthorized admin access attempt by ${profile.email} (${user.id})`);
      return NextResponse.json({ isAdmin: false, error: 'Not authorized' }, { status: 403 });
    }

    return NextResponse.json({ 
      isAdmin: true, 
      email: profile.email 
    });

  } catch (error) {
    console.error('[Admin Auth] Error:', error);
    return NextResponse.json({ isAdmin: false, error: 'Server error' }, { status: 500 });
  }
}
