'use client';

import { useState, useEffect } from 'react';
import { Loader2, Mic, Users, Brain, BarChart3 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  type?: 'default' | 'voice' | 'ai' | 'analytics';
  showProgress?: boolean;
  progress?: number;
}

const loadingMessages = {
  voice: [
    'Initializing voice recognition...',
    'Calibrating microphone...',
    'Setting up audio processing...',
    'Ready for voice training!'
  ],
  ai: [
    'Connecting to AI assistant...',
    'Loading customer personas...',
    'Preparing realistic responses...',
    'AI ready for conversation!'
  ],
  analytics: [
    'Analyzing your performance...',
    'Calculating improvement areas...',
    'Generating recommendations...',
    'Insights ready!'
  ],
  default: [
    'Loading ObjectionIQ...',
    'Preparing your training environment...',
    'Setting up your session...',
    'Almost ready!'
  ]
};

export default function LoadingSpinner({ 
  size = 'md', 
  message, 
  type = 'default',
  showProgress = false,
  progress = 0 
}: LoadingSpinnerProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const messages = loadingMessages[type];

  useEffect(() => {
    if (!message && messages.length > 1) {
      const interval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [message, messages.length]);

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const getIcon = () => {
    switch (type) {
      case 'voice':
        return <Mic className={iconSize[size]} />;
      case 'ai':
        return <Brain className={iconSize[size]} />;
      case 'analytics':
        return <BarChart3 className={iconSize[size]} />;
      default:
        return <Users className={iconSize[size]} />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Animated Icon */}
      <div className="relative">
        <div className={`${sizeClasses[size]} rounded-full border-2 border-gray-200 flex items-center justify-center`}>
          <div className={`${sizeClasses[size]} rounded-full border-2 border-blue-600 border-t-transparent animate-spin flex items-center justify-center`}>
            <div className="text-blue-600">
              {getIcon()}
            </div>
          </div>
        </div>
        
        {/* Pulse ring effect */}
        <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-2 border-blue-200 animate-ping`} />
      </div>

      {/* Loading Message */}
      <div className="text-center">
        <p className="text-gray-600 font-medium">
          {message || messages[currentMessageIndex]}
        </p>
        
        {/* Progress Bar */}
        {showProgress && (
          <div className="mt-4 w-48 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Dots Animation */}
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
} 