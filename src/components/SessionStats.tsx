'use client';

import { SessionStats as SessionStatsType } from '@/types/persona';
import { Clock, MessageSquare, Target, TrendingUp } from 'lucide-react';

interface SessionStatsProps {
  stats: SessionStatsType;
}

export default function SessionStats({ stats }: SessionStatsProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-700">
          {formatTime(stats.duration)}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-700">
          {stats.responsesCount} responses
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <Target className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-700">
          {stats.objectionsHandled} objections
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-700">
          {stats.confidenceScore}% confidence
        </span>
      </div>
    </div>
  );
} 