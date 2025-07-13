'use client';

import { Clock, Target, TrendingUp, MessageSquare, Users, Award } from 'lucide-react';

interface PerformanceMetricsProps {
  metrics: {
    totalSessions: number;
    totalDuration: number;
    totalObjections: number;
    successRate: number;
    averageCallDuration: number;
    objectionsPerSession: number;
  };
}

export default function PerformanceMetrics({ metrics }: PerformanceMetricsProps) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const metricCards = [
    {
      title: 'Total Sessions',
      value: metrics.totalSessions,
      icon: Users,
      color: 'blue',
      description: 'Training sessions completed'
    },
    {
      title: 'Total Duration',
      value: formatDuration(metrics.totalDuration),
      icon: Clock,
      color: 'green',
      description: 'Time spent training'
    },
    {
      title: 'Objections Handled',
      value: metrics.totalObjections,
      icon: MessageSquare,
      color: 'purple',
      description: 'Customer objections addressed'
    },
    {
      title: 'Success Rate',
      value: `${metrics.successRate.toFixed(1)}%`,
      icon: Award,
      color: 'yellow',
      description: 'High-confidence responses'
    },
    {
      title: 'Avg. Call Duration',
      value: formatTime(metrics.averageCallDuration),
      icon: Clock,
      color: 'indigo',
      description: 'Average session length'
    },
    {
      title: 'Objections/Session',
      value: metrics.objectionsPerSession.toFixed(1),
      icon: Target,
      color: 'red',
      description: 'Objections per training session'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      indigo: 'bg-indigo-100 text-indigo-600',
      red: 'bg-red-100 text-red-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Performance Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricCards.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getColorClasses(metric.color)}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                  <div className="text-sm text-gray-600">{metric.title}</div>
                </div>
              </div>
              <p className="text-xs text-gray-500">{metric.description}</p>
            </div>
          );
        })}
      </div>

      {/* Performance Summary */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {metrics.totalSessions > 0 ? Math.round(metrics.successRate) : 0}%
            </div>
            <div className="text-sm text-gray-600">Overall Success Rate</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatDuration(metrics.totalDuration)}
            </div>
            <div className="text-sm text-gray-600">Total Training Time</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {metrics.totalObjections}
            </div>
            <div className="text-sm text-gray-600">Objections Mastered</div>
          </div>
        </div>
      </div>
    </div>
  );
} 