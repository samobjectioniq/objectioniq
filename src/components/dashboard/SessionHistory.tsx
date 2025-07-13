'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, Download, Play, Calendar, Clock, MessageSquare, User } from 'lucide-react';
import { format } from 'date-fns';

interface SessionHistoryProps {
  sessions: any[];
  onRefresh: () => void;
}

export default function SessionHistory({ sessions, onRefresh }: SessionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPersona, setSelectedPersona] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  // Filter and sort sessions
  const filteredSessions = useMemo(() => {
    let filtered = sessions.filter(session => {
      const matchesSearch = session.persona?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           session.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPersona = selectedPersona === 'all' || session.persona?.name === selectedPersona;
      
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const sessionDate = new Date(session.createdAt);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (dateFilter) {
          case 'today':
            matchesDate = daysDiff === 0;
            break;
          case 'week':
            matchesDate = daysDiff <= 7;
            break;
          case 'month':
            matchesDate = daysDiff <= 30;
            break;
        }
      }
      
      return matchesSearch && matchesPersona && matchesDate;
    });

    // Sort sessions
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'duration':
          return (b.duration || 0) - (a.duration || 0);
        case 'objections':
          return (b.objectionsHandled || 0) - (a.objectionsHandled || 0);
        case 'success':
          return (b.confidenceScore || 0) - (a.confidenceScore || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [sessions, searchTerm, selectedPersona, dateFilter, sortBy]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPersonas = () => {
    const personas = new Set(sessions.map(s => s.persona?.name).filter(Boolean));
    return Array.from(personas);
  };

  const exportSession = async (session: any) => {
    try {
      // In a real app, this would download the session recording
      const sessionData = {
        id: session.id,
        persona: session.persona?.name,
        duration: formatDuration(session.duration),
        objectionsHandled: session.objectionsHandled,
        confidenceScore: session.confidenceScore,
        date: format(new Date(session.createdAt), 'yyyy-MM-dd HH:mm:ss'),
        notes: session.notes
      };
      
      const blob = new Blob([JSON.stringify(sessionData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `session-${session.id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting session:', error);
    }
  };

  const exportAllSessions = async () => {
    try {
      const exportData = filteredSessions.map(session => ({
        id: session.id,
        persona: session.persona?.name,
        duration: session.duration,
        objectionsHandled: session.objectionsHandled,
        confidenceScore: session.confidenceScore,
        date: session.createdAt,
        notes: session.notes
      }));
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sessions-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting sessions:', error);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Session History</h2>
        <button
          onClick={exportAllSessions}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export All
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Persona Filter */}
          <select
            value={selectedPersona}
            onChange={(e) => setSelectedPersona(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Personas</option>
            {getPersonas().map(persona => (
              <option key={persona} value={persona}>{persona}</option>
            ))}
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="date">Sort by Date</option>
            <option value="duration">Sort by Duration</option>
            <option value="objections">Sort by Objections</option>
            <option value="success">Sort by Success</option>
          </select>
        </div>
      </div>

      {/* Sessions List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Session
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Persona
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Objections
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Success Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {format(new Date(session.createdAt), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(session.createdAt), 'HH:mm')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {session.persona?.name || 'Unknown'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {formatDuration(session.duration || 0)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MessageSquare className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {session.objectionsHandled || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConfidenceColor(session.confidenceScore || 0)}`}>
                      {session.confidenceScore ? `${session.confidenceScore}%` : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => exportSession(session)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="Export Session"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        className="text-green-600 hover:text-green-900 transition-colors"
                        title="Play Recording"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSessions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">No sessions found</div>
            <button
              onClick={onRefresh}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Refresh
            </button>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {filteredSessions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredSessions.length}</div>
              <div className="text-sm text-gray-600">Total Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatDuration(filteredSessions.reduce((sum, s) => sum + (s.duration || 0), 0))}
              </div>
              <div className="text-sm text-gray-600">Total Duration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {filteredSessions.reduce((sum, s) => sum + (s.objectionsHandled || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Objections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {filteredSessions.length > 0 
                  ? Math.round(filteredSessions.reduce((sum, s) => sum + (s.confidenceScore || 0), 0) / filteredSessions.length)
                  : 0}%
              </div>
              <div className="text-sm text-gray-600">Avg. Success Rate</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 