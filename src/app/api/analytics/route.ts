import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthenticatedUser, getMockUser } from '@/lib/auth';

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

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    let user = await getAuthenticatedUser(request);
    
    // For development, fall back to mock user if no auth
    if (!user) {
      user = getMockUser();
    }

    // Create Supabase admin client
    const supabaseAdmin = createSupabaseAdmin();

    // Fetch sessions for the user with optimized query
    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from('sessions')
      .select('persona_id, duration, objections_handled, confidence_score, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (sessionsError) {
      console.error('Supabase error fetching sessions:', sessionsError);
      return NextResponse.json(
        { error: 'Failed to fetch analytics' },
        { status: 500 }
      );
    }

    const sessionsList = sessions || [];

    // Calculate analytics from sessions data
    const totalSessions = sessionsList.length;
    const totalDuration = sessionsList.reduce((sum, session) => sum + (session.duration || 0), 0);
    const totalObjections = sessionsList.reduce((sum, session) => sum + (session.objections_handled || 0), 0);
    const averageSuccessRate = totalSessions > 0 
      ? sessionsList.reduce((sum, session) => sum + (session.confidence_score || 0), 0) / totalSessions
      : 0;
    const averageCallDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;
    const objectionsPerSession = totalSessions > 0 ? totalObjections / totalSessions : 0;

    // Calculate persona performance
    const personaPerformance: Record<string, any> = {};
    const personaGroups = sessionsList.reduce((groups: any, session) => {
      const personaId = session.persona_id;
      if (!groups[personaId]) {
        groups[personaId] = [];
      }
      groups[personaId].push(session);
      return groups;
    }, {});

    Object.entries(personaGroups).forEach(([personaId, personaSessions]: [string, any]) => {
      const sessions = personaSessions as any[];
      personaPerformance[personaId] = {
        sessions: sessions.length,
        averageSuccessRate: sessions.reduce((sum: number, session: any) => sum + (session.confidence_score || 0), 0) / sessions.length,
        averageObjections: sessions.reduce((sum: number, session: any) => sum + (session.objections_handled || 0), 0) / sessions.length,
        averageDuration: sessions.reduce((sum: number, session: any) => sum + (session.duration || 0), 0) / sessions.length
      };
    });

    // Generate weekly trends (last 7 days)
    const weeklySessions = [];
    const weeklySuccessRates = [];
    const weeklyObjections = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
      
      const daySessions = sessionsList.filter(session => {
        const sessionDate = new Date(session.created_at);
        return sessionDate >= dayStart && sessionDate < dayEnd;
      });
      
      weeklySessions.push(daySessions.length);
      weeklySuccessRates.push(daySessions.length > 0 
        ? daySessions.reduce((sum, session) => sum + (session.confidence_score || 0), 0) / daySessions.length
        : 0);
      weeklyObjections.push(daySessions.reduce((sum, session) => sum + (session.objections_handled || 0), 0));
    }

    // Mock top objections (in a real app, this would be calculated from conversation history)
    const topObjections = [
      { objection: 'Price is too high', frequency: Math.floor(totalObjections * 0.3), successRate: 75 },
      { objection: 'Need to think about it', frequency: Math.floor(totalObjections * 0.2), successRate: 62 },
      { objection: 'Already have coverage', frequency: Math.floor(totalObjections * 0.15), successRate: 83 },
      { objection: 'Not interested', frequency: Math.floor(totalObjections * 0.1), successRate: 40 },
      { objection: 'Need to discuss with family', frequency: Math.floor(totalObjections * 0.1), successRate: 75 }
    ];

    // Calculate improvement areas based on performance
    const improvementAreas = [
      {
        area: 'Price Objection Handling',
        currentScore: Math.min(75, averageSuccessRate),
        targetScore: 85,
        priority: averageSuccessRate < 80 ? 'high' : 'medium'
      },
      {
        area: 'Building Rapport',
        currentScore: Math.min(82, averageSuccessRate + 5),
        targetScore: 90,
        priority: averageSuccessRate < 85 ? 'medium' : 'low'
      },
      {
        area: 'Closing Techniques',
        currentScore: Math.min(68, averageSuccessRate - 5),
        targetScore: 80,
        priority: averageSuccessRate < 75 ? 'high' : 'medium'
      }
    ];

    const analytics = {
      overview: {
        totalSessions,
        totalDuration,
        totalObjections,
        averageSuccessRate: Math.round(averageSuccessRate * 100) / 100,
        averageCallDuration: Math.round(averageCallDuration),
        objectionsPerSession: Math.round(objectionsPerSession * 100) / 100
      },
      trends: {
        weeklySessions,
        weeklySuccessRates: weeklySuccessRates.map(rate => Math.round(rate * 100) / 100),
        weeklyObjections
      },
      personaPerformance,
      topObjections,
      improvementAreas
    };

    return NextResponse.json(analytics, {
      headers: {
        'Cache-Control': 's-maxage=30, stale-while-revalidate',
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
} 