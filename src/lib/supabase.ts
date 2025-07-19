import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

// Server-side client
export const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase configuration missing - returning null');
    return null;
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

// Client-side browser client
export const createClientComponentClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase configuration missing - returning null');
    return null;
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

// Server-side client for API routes
export const createServerComponentClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase configuration missing - returning null');
    return null;
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          company: string | null;
          role: string | null;
          experience_years: number | null;
          subscription_tier: 'free' | 'pro' | 'enterprise';
          subscription_status: 'active' | 'inactive' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          company?: string | null;
          role?: string | null;
          experience_years?: number | null;
          subscription_tier?: 'free' | 'pro' | 'enterprise';
          subscription_status?: 'active' | 'inactive' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          company?: string | null;
          role?: string | null;
          experience_years?: number | null;
          subscription_tier?: 'free' | 'pro' | 'enterprise';
          subscription_status?: 'active' | 'inactive' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          persona_id: string;
          persona_name: string;
          persona_type: string;
          duration: number;
          objections_handled: number;
          confidence_score: number;
          conversation_history: any;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          persona_id: string;
          persona_name: string;
          persona_type: string;
          duration: number;
          objections_handled: number;
          confidence_score: number;
          conversation_history: any;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          persona_id?: string;
          persona_name?: string;
          persona_type?: string;
          duration?: number;
          objections_handled?: number;
          confidence_score?: number;
          conversation_history?: any;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          type: 'sessions' | 'objections' | 'success_rate' | 'duration';
          target_value: number;
          current_value: number;
          deadline: string | null;
          status: 'active' | 'completed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          type: 'sessions' | 'objections' | 'success_rate' | 'duration';
          target_value: number;
          current_value?: number;
          deadline?: string | null;
          status?: 'active' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          type?: 'sessions' | 'objections' | 'success_rate' | 'duration';
          target_value?: number;
          current_value?: number;
          deadline?: string | null;
          status?: 'active' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          theme: 'light' | 'dark' | 'auto';
          notifications_enabled: boolean;
          email_notifications: boolean;
          voice_settings: any;
          training_preferences: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          theme?: 'light' | 'dark' | 'auto';
          notifications_enabled?: boolean;
          email_notifications?: boolean;
          voice_settings?: any;
          training_preferences?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          theme?: 'light' | 'dark' | 'auto';
          notifications_enabled?: boolean;
          email_notifications?: boolean;
          voice_settings?: any;
          training_preferences?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      performance_metrics: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          total_sessions: number;
          total_duration: number;
          total_objections: number;
          average_success_rate: number;
          average_call_duration: number;
          objections_per_session: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          total_sessions: number;
          total_duration: number;
          total_objections: number;
          average_success_rate: number;
          average_call_duration: number;
          objections_per_session: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          total_sessions?: number;
          total_duration?: number;
          total_objections?: number;
          average_success_rate?: number;
          average_call_duration?: number;
          objections_per_session?: number;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
} 