'use client';

import { useState } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Calendar, Filter } from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';

interface ProgressChartsProps {
  sessions: any[];
}

export default function ProgressCharts({ sessions }: ProgressChartsProps) {
  const [timeRange, setTimeRange] = useState('7d');
  const [chartType, setChartType] = useState('success');

  // Process session data for charts
  const processChartData = () => {
    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    
    const dateData = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(now, i);
      const dayStart = startOfDay(date);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const daySessions = sessions.filter(session => {
        const sessionDate = new Date(session.createdAt);
        return sessionDate >= dayStart && sessionDate < dayEnd;
      });
      
      dateData.push({
        date: format(date, 'MMM dd'),
        sessions: daySessions.length,
        objections: daySessions.reduce((sum: number, s: any) => sum + (s.objectionsHandled || 0), 0),
        successRate: daySessions.length > 0 
          ? (daySessions.filter((s: any) => s.confidenceScore > 70).length / daySessions.length) * 100 
          : 0,
        duration: daySessions.reduce((sum: number, s: any) => sum + (s.duration || 0), 0) / 60 // Convert to minutes
      });
    }
    
    return dateData;
  };

  // Process persona distribution data
  const processPersonaData = () => {
    const personaCounts: { [key: string]: number } = {};
    sessions.forEach(session => {
      const persona = session.persona?.name || 'Unknown';
      personaCounts[persona] = (personaCounts[persona] || 0) + 1;
    });
    
    return Object.entries(personaCounts).map(([name, value]) => ({
      name,
      value,
      fill: getPersonaColor(name)
    }));
  };

  const getPersonaColor = (name: string) => {
    const colors = {
      'Sarah': '#3B82F6',
      'Mike & Jennifer': '#10B981',
      'Robert': '#8B5CF6',
      'Unknown': '#6B7280'
    };
    return colors[name as keyof typeof colors] || '#6B7280';
  };

  const chartData = processChartData();
  const personaData = processPersonaData();

  const renderChart = () => {
    switch (chartType) {
      case 'success':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="successRate" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Success Rate (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'sessions':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sessions" fill="#10B981" name="Sessions" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'objections':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="objections" 
                stroke="#8B5CF6" 
                fill="#8B5CF6" 
                fillOpacity={0.3}
                name="Objections Handled"
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'duration':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="duration" 
                stroke="#F59E0B" 
                strokeWidth={2}
                name="Duration (minutes)"
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Rate Trend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Progress Trends</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-2 py-1"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select 
                value={chartType} 
                onChange={(e) => setChartType(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-2 py-1"
              >
                <option value="success">Success Rate</option>
                <option value="sessions">Sessions</option>
                <option value="objections">Objections</option>
                <option value="duration">Duration</option>
              </select>
            </div>
          </div>
        </div>
        
        {chartData.length > 0 ? (
          renderChart()
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            No data available for the selected time range
          </div>
        )}
      </div>

      {/* Persona Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Persona Distribution</h3>
          {personaData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={personaData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {personaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No session data available
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {sessions.slice(0, 5).map((session, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">
                    {session.persona?.name || 'Unknown Persona'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {format(new Date(session.createdAt), 'MMM dd, yyyy')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {Math.floor(session.duration / 60)}:{(session.duration % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-600">
                    {session.objectionsHandled || 0} objections
                  </div>
                </div>
              </div>
            ))}
            {sessions.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No recent sessions
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 