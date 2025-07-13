import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthenticatedUser, getMockUser } from '@/lib/auth';

// Create admin client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    let user = await getAuthenticatedUser(request);
    
    // For development, fall back to mock user if no auth
    if (!user) {
      user = getMockUser();
    }

    // Add caching for better performance
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 's-maxage=10, stale-while-revalidate');

    const { data: sessions, error } = await supabaseAdmin
      .from('sessions')
      .select('id, persona_id, persona_name, persona_type, duration, objections_handled, confidence_score, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sessions: sessions || [],
      total: sessions?.length || 0
    }, {
      headers: {
        'Cache-Control': 's-maxage=10, stale-while-revalidate',
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.persona_id || !body.persona_name || !body.persona_type) {
      return NextResponse.json(
        { error: 'Missing required fields: persona_id, persona_name, persona_type' },
        { status: 400 }
      );
    }

    // Get authenticated user
    let user = await getAuthenticatedUser(request);
    
    // For development, fall back to mock user if no auth
    if (!user) {
      user = getMockUser();
    }

    const sessionData = {
      user_id: user.id,
      persona_id: body.persona_id,
      persona_name: body.persona_name,
      persona_type: body.persona_type,
      duration: body.duration || 0,
      objections_handled: body.objections_handled || 0,
      confidence_score: body.confidence_score || 0.0,
      conversation_history: body.conversation_history || [],
      notes: body.notes || null
    };

    const { data: session, error } = await supabaseAdmin
      .from('sessions')
      .insert(sessionData)
      .select('id, persona_id, persona_name, persona_type, duration, objections_handled, confidence_score, created_at')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      session,
      message: 'Session saved successfully'
    });
  } catch (error) {
    console.error('Error saving session:', error);
    return NextResponse.json(
      { error: 'Failed to save session' },
      { status: 500 }
    );
  }
} 