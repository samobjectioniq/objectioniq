'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Clock, Signal, AlertCircle, X } from 'lucide-react';
import { Persona } from '@/types/persona';
import { useToast } from '@/contexts/ToastContext';

interface VoiceCallInterfaceProps {
  persona: Persona;
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isMuted: boolean;
  audioLevel: number;
  callDuration: number;
  error: string | null;
  onStartCall: () => void;
  onEndCall: () => void;
  onToggleMute: () => void;
  onClose: () => void;
  onStartListening?: () => void; // Add manual listening control
}

export default function VoiceCallInterface({
  persona,
  isConnected,
  isListening,
  isSpeaking,
  isMuted,
  audioLevel,
  callDuration,
  error,
  onStartCall,
  onEndCall,
  onToggleMute,
  onClose
}: VoiceCallInterfaceProps) {
  const { showError } = useToast();
  const [isMinimized, setIsMinimized] = useState(false);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    if (error) return 'Call Error';
    if (isSpeaking) return 'Speaking...';
    if (isListening) return 'Listening...';
    if (isConnected) return 'Connected';
    return 'Ready to Call';
  };

  const getStatusColor = () => {
    if (error) return 'text-red-500';
    if (isSpeaking) return 'text-blue-500';
    if (isListening) return 'text-green-500';
    if (isConnected) return 'text-gray-600';
    return 'text-gray-500';
  };

  // Show error toast when error changes
  useEffect(() => {
    if (error) {
      showError('Call Error', error);
    }
  }, [error, showError]);

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-white rounded-full shadow-lg border border-gray-200 p-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-sm">
              {persona.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-sm font-medium text-gray-700">{persona.name}</span>
          </div>
          <button
            onClick={() => setIsMinimized(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
        {/* Call Header */}
        <div className="bg-gradient-to-b from-blue-600 to-blue-700 text-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Contact Photo/Avatar */}
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-bold text-white">
              {persona.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          
          {/* Contact Info */}
          <h2 className="text-xl font-semibold mb-1">{persona.name}</h2>
          <p className="text-blue-100 text-sm mb-2">{persona.description}</p>
          
          {/* Call Status */}
          <div className="flex items-center justify-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-yellow-400'}`} />
            <span className={`text-sm ${getStatusColor()}`}>{getStatusText()}</span>
          </div>
        </div>

        {/* Call Content */}
        <div className="p-6">
          {/* Call Timer */}
          {isConnected && (
            <div className="flex items-center justify-center gap-2 mb-6">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-lg font-mono text-gray-700">{formatDuration(callDuration)}</span>
            </div>
          )}

          {/* Audio Level Indicator */}
          {isConnected && (
            <div className="mb-6">
              <div className="flex items-center justify-center gap-1 mb-2">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 h-8 rounded-full transition-all duration-100 ${
                      i < Math.floor(audioLevel / 10) 
                        ? (isListening ? 'bg-green-500' : 'bg-blue-500')
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-center text-sm text-gray-500">
                {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Audio Level'}
              </p>
            </div>
          )}

          {/* Call Controls */}
          <div className="flex justify-center items-center gap-6">
            {/* Mute Button */}
            <button
              onClick={onToggleMute}
              disabled={!isConnected}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                isConnected
                  ? isMuted
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>

            {/* Main Call Button */}
            {!isConnected ? (
              <button
                onClick={onStartCall}
                className="w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-all shadow-lg"
              >
                <Phone className="w-8 h-8" />
              </button>
            ) : (
              <button
                onClick={onEndCall}
                className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all shadow-lg"
              >
                <PhoneOff className="w-8 h-8" />
              </button>
            )}

            {/* Microphone Status */}
            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isConnected
                ? isListening
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700'
                : 'bg-gray-100 text-gray-400'
            }`}>
              {isListening ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Minimize Button */}
          {isConnected && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setIsMinimized(true)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Minimize Call
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 