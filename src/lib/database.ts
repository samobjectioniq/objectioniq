import { createClientComponentClient } from '@/lib/supabase';
import { Database } from '@/lib/supabase';

type Session = Database['public']['Tables']['sessions']['Row'];
type SessionInsert = Database['public']['Tables']['sessions']['Insert'];
type SessionUpdate = Database['public']['Tables']['sessions']['Update'];

type Goal = Database['public']['Tables']['goals']['Row'];
type GoalInsert = Database['public']['Tables']['goals']['Insert'];
type GoalUpdate = Database['public']['Tables']['goals']['Update'];

type UserPreferences = Database['public']['Tables']['user_preferences']['Row'];
type UserPreferencesInsert = Database['public']['Tables']['user_preferences']['Insert'];
type UserPreferencesUpdate = Database['public']['Tables']['user_preferences']['Update'];

type PerformanceMetrics = Database['public']['Tables']['performance_metrics']['Row'];

// Get Supabase client with error handling
const getSupabaseClient = () => {
  const client = createClientComponentClient();
  if (!client) {
    throw new Error('Supabase client not available - check environment variables');
  }
  return client;
};

// Session operations
export const sessionService = {
  // Get all sessions for a user
  async getSessions(userId: string, options?: {
    limit?: number;
    offset?: number;
    personaType?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const supabase = getSupabaseClient();
    
    let query = supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options?.personaType) {
      query = query.eq('persona_type', options.personaType);
    }

    if (options?.dateFrom) {
      query = query.gte('created_at', options.dateFrom);
    }

    if (options?.dateTo) {
      query = query.lte('created_at', options.dateTo);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;
    return { sessions: data || [], error };
  },

  // Get a single session
  async getSession(sessionId: string) {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();
    return { session: data, error };
  },

  // Create a new session
  async createSession(session: SessionInsert) {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('sessions')
      .insert(session)
      .select()
      .single();
    return { session: data, error };
  },

  // Update a session
  async updateSession(sessionId: string, updates: SessionUpdate) {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();
    return { session: data, error };
  },

  // Delete a session
  async deleteSession(sessionId: string) {
    const supabase = getSupabaseClient();
    
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId);
    return { error };
  },

  // Get session statistics
  async getSessionStats(userId: string) {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('sessions')
      .select('duration, objections_handled, confidence_score')
      .eq('user_id', userId);

    if (error) return { stats: null, error };

    const stats = {
      totalSessions: data.length,
      totalDuration: data.reduce((sum, session) => sum + (session.duration || 0), 0),
      totalObjections: data.reduce((sum, session) => sum + (session.objections_handled || 0), 0),
      averageSuccessRate: data.length > 0 
        ? data.reduce((sum, session) => sum + (session.confidence_score || 0), 0) / data.length 
        : 0,
      averageCallDuration: data.length > 0 
        ? data.reduce((sum, session) => sum + (session.duration || 0), 0) / data.length 
        : 0,
      objectionsPerSession: data.length > 0 
        ? data.reduce((sum, session) => sum + (session.objections_handled || 0), 0) / data.length 
        : 0
    };

    return { stats, error: null };
  }
};

// Goal operations
export const goalService = {
  // Get all goals for a user
  async getGoals(userId: string) {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { goals: data || [], error };
  },

  // Get a single goal
  async getGoal(goalId: string) {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('id', goalId)
      .single();
    return { goal: data, error };
  },

  // Create a new goal
  async createGoal(goal: GoalInsert) {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('goals')
      .insert(goal)
      .select()
      .single();
    return { goal: data, error };
  },

  // Update a goal
  async updateGoal(goalId: string, updates: GoalUpdate) {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', goalId)
      .select()
      .single();
    return { goal: data, error };
  },

  // Delete a goal
  async deleteGoal(goalId: string) {
    const supabase = getSupabaseClient();
    
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId);
    return { error };
  },

  // Update goal progress
  async updateGoalProgress(goalId: string, currentValue: number) {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('goals')
      .update({ current_value: currentValue })
      .eq('id', goalId)
      .select()
      .single();
    return { goal: data, error };
  }
};

// User preferences operations
export const userPreferencesService = {
  // Get user preferences
  async getUserPreferences(userId: string) {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { preferences: data, error };
  },

  // Create user preferences
  async createUserPreferences(preferences: UserPreferencesInsert) {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('user_preferences')
      .insert(preferences)
      .select()
      .single();
    return { preferences: data, error };
  },

  // Update user preferences
  async updateUserPreferences(userId: string, updates: UserPreferencesUpdate) {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('user_preferences')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    return { preferences: data, error };
  }
};

// Performance metrics operations
export const performanceMetricsService = {
  // Get performance metrics for a user
  async getPerformanceMetrics(userId: string, options?: {
    days?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const supabase = getSupabaseClient();
    
    let query = supabase
      .from('performance_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (options?.days) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - options.days);
      query = query.gte('date', startDate.toISOString().split('T')[0]);
    }

    if (options?.startDate) {
      query = query.gte('date', options.startDate);
    }

    if (options?.endDate) {
      query = query.lte('date', options.endDate);
    }

    const { data, error } = await query;
    return { metrics: data || [], error };
  },

  // Get aggregated performance metrics
  async getAggregatedMetrics(userId: string) {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('performance_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(30);

    if (error) return { aggregated: null, error };

    const aggregated = {
      totalSessions: data.reduce((sum, metric) => sum + metric.total_sessions, 0),
      totalDuration: data.reduce((sum, metric) => sum + metric.total_duration, 0),
      totalObjections: data.reduce((sum, metric) => sum + metric.total_objections, 0),
      averageSuccessRate: data.length > 0 
        ? data.reduce((sum, metric) => sum + metric.average_success_rate, 0) / data.length 
        : 0,
      averageCallDuration: data.length > 0 
        ? data.reduce((sum, metric) => sum + metric.average_call_duration, 0) / data.length 
        : 0,
      objectionsPerSession: data.length > 0 
        ? data.reduce((sum, metric) => sum + metric.objections_per_session, 0) / data.length 
        : 0
    };

    return { aggregated, error: null };
  }
};

// Export types for use in components
export type { Session, SessionInsert, SessionUpdate };
export type { Goal, GoalInsert, GoalUpdate };
export type { UserPreferences, UserPreferencesInsert, UserPreferencesUpdate };
export type { PerformanceMetrics }; 