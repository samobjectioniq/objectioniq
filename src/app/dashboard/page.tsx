'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Search, Filter, Download, Target, TrendingUp, Clock, MessageSquare, DollarSign, Shield, Zap, AlertTriangle } from 'lucide-react';
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
    // Lead conversion metrics
    leadConversionRate: number;
    averageLeadCost: number;
    totalLeadInvestment: number;
    potentialSavings: number;
    costPerSale: number;
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
      objectionsPerSession: 0,
      leadConversionRate: 0,
      averageLeadCost: 4.50,
      totalLeadInvestment: 0,
      potentialSavings: 0,
      costPerSale: 0
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

  const generateRecommendations = useCallback((sessions: any[], successRate: number, objectionsPerSession: number) => {
    const recommendations = [];
    
    if (successRate < 70) {
      recommendations.push({
        id: 1,
        type: 'conversion_rate',
        title: 'Improve Lead Conversion Rate',
        description: 'Your conversion rate is below target. Focus on handling objections more effectively to protect your lead investment.',
        priority: 'high',
        action: 'Practice with Skeptical Internet Shopper to improve price objection handling'
      });
    }
    
    if (objectionsPerSession < 3) {
      recommendations.push({
        id: 2,
        type: 'objections',
        title: 'Handle More Objections',
        description: 'You\'re handling fewer objections per session than average. Engage leads more deeply to improve conversion.',
        priority: 'medium',
        action: 'Practice with Price-Focused Bargain Hunter to experience more complex objections'
      });
    }
    
    if (sessions.length < 10) {
      recommendations.push({
        id: 3,
        type: 'practice',
        title: 'Increase Practice Sessions',
        description: 'More practice sessions will help you improve faster. Aim for at least 2-3 sessions per week to protect your lead investment.',
        priority: 'medium',
        action: 'Schedule regular training sessions with different lead scenarios'
      });
    }

    if (dashboardData.metrics.costPerSale > 100) {
      recommendations.push({
        id: 4,
        type: 'cost_per_sale',
        title: 'Reduce Cost Per Sale',
        description: 'Your cost per sale is high. Focus on improving conversion rates to reduce lead waste.',
        priority: 'high',
        action: 'Practice appointment setting techniques with Busy Professional persona'
      });
    }

    return recommendations;
  }, [dashboardData.metrics.costPerSale]);

  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
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

        // Lead conversion calculations
        const leadConversionRate = successRate; // Simplified for demo
        const totalLeadInvestment = totalSessions * 4.50; // Assuming $4.50 per lead
        const costPerSale = totalSessions > 0 ? totalLeadInvestment / totalSessions : 0;
        const potentialSavings = totalLeadInvestment * 0.3; // 30% improvement potential

        // Use aggregated metrics if available, otherwise use calculated metrics
        const metrics = aggregated ? {
          totalSessions: aggregated.totalSessions,
          totalDuration: aggregated.totalDuration,
          totalObjections: aggregated.totalObjections,
          successRate: aggregated.averageSuccessRate,
          averageCallDuration: aggregated.averageCallDuration,
          objectionsPerSession: aggregated.objectionsPerSession,
          leadConversionRate: aggregated.averageSuccessRate,
          averageLeadCost: 4.50,
          totalLeadInvestment: aggregated.totalSessions * 4.50,
          potentialSavings: (aggregated.totalSessions * 4.50) * 0.3,
          costPerSale: aggregated.totalSessions > 0 ? (aggregated.totalSessions * 4.50) / aggregated.totalSessions : 0
        } : {
          totalSessions,
          totalDuration,
          totalObjections,
          successRate,
          averageCallDuration,
          objectionsPerSession,
          leadConversionRate,
          averageLeadCost: 4.50,
          totalLeadInvestment,
          potentialSavings,
          costPerSale
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
  }, [user, generateRecommendations]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, loadDashboardData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your lead conversion dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to view your lead conversion dashboard.</p>
          <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-blue-600 hover:text-blue-700 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Lead Conversion Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/training" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Practice Before I Dial
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Lead Investment Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Lead Investment</p>
                <p className="text-2xl font-bold text-gray-900">${dashboardData.metrics.totalLeadInvestment.toFixed(0)}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.metrics.leadConversionRate.toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cost Per Sale</p>
                <p className="text-2xl font-bold text-gray-900">${dashboardData.metrics.costPerSale.toFixed(0)}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Potential Savings</p>
                <p className="text-2xl font-bold text-gray-900">${dashboardData.metrics.potentialSavings.toFixed(0)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: TrendingUp },
                { id: 'sessions', label: 'Training Sessions', icon: Clock },
                { id: 'goals', label: 'Goals', icon: Target },
                { id: 'recommendations', label: 'Recommendations', icon: MessageSquare }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
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

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  <PerformanceMetrics metrics={dashboardData.metrics} />
                  <ProgressCharts sessions={dashboardData.sessions} />
                </div>
              </div>
            )}

            {activeTab === 'sessions' && (
              <SessionHistory 
                sessions={dashboardData.sessions} 
                onRefresh={loadDashboardData}
              />
            )}

            {activeTab === 'goals' && (
              <GoalTracking 
                goals={dashboardData.goals} 
                onUpdate={loadDashboardData}
              />
            )}

            {activeTab === 'recommendations' && (
              <CoachingRecommendations 
                recommendations={dashboardData.recommendations} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 