import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

// Create admin client for server-side operations
function createSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase configuration missing');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  full_name?: string;
  subscription_tier: 'free' | 'pro' | 'enterprise';
}

export async function getAuthenticatedUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    // Check if Supabase is properly configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.log('Supabase not configured, using mock user');
      return null;
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return null;
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return null;
    }

    // Create Supabase admin client
    const supabaseAdmin = createSupabaseAdmin();

    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      console.error('Auth error:', error);
      return null;
    }

    // Get user profile from profiles table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
      // Return basic user info if profile not found
      return {
        id: user.id,
        email: user.email || '',
        subscription_tier: 'free'
      };
    }

    return {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      subscription_tier: profile.subscription_tier
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export async function requireAuth(request: NextRequest): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

// For development/testing purposes - create a mock user
export function getMockUser(): AuthenticatedUser {
  return {
    id: '123e4567-e89b-12d3-a456-426614174000', // Valid UUID format
    email: 'test@example.com',
    full_name: 'Test User',
    subscription_tier: 'pro'
  };
} 