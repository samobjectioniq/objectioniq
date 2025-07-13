'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, Download, Target, TrendingUp, Clock, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { sessionService, goalService, performanceMetricsService } from '@/lib/database';
import SessionHistory from '@/components/dashboard/SessionHistory';
import PerformanceMetrics from '@/components/dashboard/PerformanceMetrics';
import ProgressCharts from '@/components/dashboard/ProgressCharts';
import CoachingRecommendations from '@/components/dashboard/CoachingRecommendations';
import GoalTracking from '@/components/dashboard/GoalTracking';

interface DashboardData {
  sessions: any[];
  metrics: {
    totalSessions: number;
    totalDuration: number;
    totalObjections: number;
    successRate: number;
    averageCallDuration: number;
    objectionsPerSession: number;
  };
  goals: any[];
  recommendations: any[];
}

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    sessions: [],
    metrics: {
      totalSessions: 0,
      totalDuration: 0,
      totalObjections: 0,
      successRate: 0,
      averageCallDuration: 0,
      objectionsPerSession: 0
    },
    goals: [],
    recommendations: []
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState({
    sessions: true,
    metrics: true,
    goals: true
  });

  // Load dashboard data with parallel fetching
  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      // Load all data in parallel for better performance
      const [sessionsResult, goalsResult, metricsResult] = await Promise.allSettled([
        sessionService.getSessions(user.id),
        goalService.getGoals(user.id),
        performanceMetricsService.getAggregatedMetrics(user.id)
      ]);

      // Handle sessions
      if (sessionsResult.status === 'fulfilled') {
        const { sessions, error: sessionsError } = sessionsResult.value;
        if (sessionsError) {
          console.error('Error loading sessions:', sessionsError);
        }
        
        setDashboardData(prev => ({
          ...prev,
          sessions: (sessions || []).map(session => ({
            id: session.id,
            persona: { name: session.persona_name, type: session.persona_type },
            duration: session.duration,
            objectionsHandled: session.objections_handled,
            confidenceScore: session.confidence_score,
            createdAt: session.created_at,
            notes: session.notes
          }))
        }));
      }
      setLoadingStates(prev => ({ ...prev, sessions: false }));

      // Handle goals
      if (goalsResult.status === 'fulfilled') {
        const { goals, error: goalsError } = goalsResult.value;
        if (goalsError) {
          console.error('Error loading goals:', goalsError);
        }
        
        setDashboardData(prev => ({
          ...prev,
          goals: (goals || []).map(goal => ({
            id: goal.id,
            title: goal.title,
            current: goal.current_value,
            target: goal.target_value,
            type: goal.type,
            description: goal.description,
            deadline: goal.deadline,
            status: goal.status
          }))
        }));
      }
      setLoadingStates(prev => ({ ...prev, goals: false }));

      // Handle metrics
      if (metricsResult.status === 'fulfilled') {
        const { aggregated, error: metricsError } = metricsResult.value;
        if (metricsError) {
          console.error('Error loading metrics:', metricsError);
        }

        // Calculate metrics from sessions if no aggregated data
        const sessions = sessionsResult.status === 'fulfilled' ? sessionsResult.value.sessions || [] : [];
        const totalSessions = sessions.length;
        const totalDuration = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
        const totalObjections = sessions.reduce((sum, session) => sum + (session.objections_handled || 0), 0);
        const successRate = totalSessions > 0 ? (sessions.filter(s => s.confidence_score > 70).length / totalSessions) * 100 : 0;
        const averageCallDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;
        const objectionsPerSession = totalSessions > 0 ? totalObjections / totalSessions : 0;

        // Use aggregated metrics if available, otherwise use calculated metrics
        const metrics = aggregated ? {
          totalSessions: aggregated.totalSessions,
          totalDuration: aggregated.totalDuration,
          totalObjections: aggregated.totalObjections,
          successRate: aggregated.averageSuccessRate,
          averageCallDuration: aggregated.averageCallDuration,
          objectionsPerSession: aggregated.objectionsPerSession
        } : {
          totalSessions,
          totalDuration,
          totalObjections,
          successRate,
          averageCallDuration,
          objectionsPerSession
        };

        const recommendations = generateRecommendations(sessions, metrics.successRate, metrics.objectionsPerSession);

        setDashboardData(prev => ({
          ...prev,
          metrics,
          recommendations
        }));
      }
      setLoadingStates(prev => ({ ...prev, metrics: false }));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateRecommendations = (sessions: any[], successRate: number, objectionsPerSession: number) => {
    const recommendations = [];
    
    if (successRate < 70) {
      recommendations.push({
        id: 1,
        type: 'success_rate',
        title: 'Improve Success Rate',
        description: 'Your success rate is below target. Focus on building rapport and addressing objections more effectively.',
        priority: 'high',
        action: 'Practice with Sarah persona to improve price objection handling'
      });
    }
    
    if (objectionsPerSession < 3) {
      recommendations.push({
        id: 2,
        type: 'objections',
        title: 'Handle More Objections',
        description: 'You\'re handling fewer objections per session than average. Try to engage customers more deeply.',
        priority: 'medium',
        action: 'Practice with Robert persona to experience more complex objections'
      });
    }
    
    if (sessions.length < 10) {
      recommendations.push({
        id: 3,
        type: 'practice',
        title: 'Increase Practice Sessions',
        description: 'More practice sessions will help you improve faster. Aim for at least 2-3 sessions per week.',
        priority: 'medium',
        action: 'Schedule regular training sessions with different personas'
      });
    }

    return recommendations;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'sessions', label: 'Session History', icon: Clock },
    { id: 'performance', label: 'Performance', icon: Target },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'coaching', label: 'Coaching', icon: MessageSquare }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to access your dashboard.</p>
          <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-blue-600 hover:text-blue-700 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Training Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-sm text-gray-600 hover:text-gray-800 transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Key Metrics */}
              <PerformanceMetrics metrics={dashboardData.metrics} />
              
              {/* Progress Charts */}
              <ProgressCharts sessions={dashboardData.sessions} />
              
              {/* Quick Actions */}
              <div className="grid md:grid-cols-3 gap-6">
                <Link href="/training" className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Start New Session</h3>
                    <p className="text-sm text-gray-600">Begin a new training session with any persona</p>
                  </div>
                </Link>
                
                <button className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Set Goals</h3>
                    <p className="text-sm text-gray-600">Define your training objectives and targets</p>
                  </div>
                </button>
                
                <button className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Download className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Export Data</h3>
                    <p className="text-sm text-gray-600">Download your training reports and analytics</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'sessions' && (
            <SessionHistory sessions={dashboardData.sessions} onRefresh={loadDashboardData} />
          )}

          {activeTab === 'performance' && (
            <div className="space-y-8">
              <PerformanceMetrics metrics={dashboardData.metrics} />
              <ProgressCharts sessions={dashboardData.sessions} />
            </div>
          )}

          {activeTab === 'goals' && (
            <GoalTracking goals={dashboardData.goals} onUpdate={loadDashboardData} />
          )}

          {activeTab === 'coaching' && (
            <CoachingRecommendations recommendations={dashboardData.recommendations} />
          )}
        </div>
      </div>
    </div>
  );
} 