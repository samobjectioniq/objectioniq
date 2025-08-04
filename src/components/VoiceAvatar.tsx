'use client';

import { useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Phone, PhoneOff } from 'lucide-react';
import useVoiceChat from '@/hooks/useVoiceChat';

interface VoiceAvatarProps {
  persona: {
    id: string;
    name: string;
    age: number;
    type: string;
    characteristics: string[];
    description: string;
    voiceId?: string;
    systemPrompt?: string;
  };
  onEndCall: () => void;
}

export default function VoiceAvatar({ persona, onEndCall }: VoiceAvatarProps) {
  const [error, setError] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(false);

  const {
    isListening,
    isProcessing,
    isSpeaking,
    conversation,
    currentResponse,
    audioLevel,
    startListening,
    stopListening,
  } = useVoiceChat({
    persona: {
      name: persona.name,
      voiceId: persona.voiceId || '21m00Tcm4TlvDq8ikWAM', // Default to Sarah's voice
      systemPrompt: persona.systemPrompt || `You are ${persona.name}, a customer who recently requested insurance quotes online. You are receiving a phone call from an insurance agent about those quotes. Answer naturally and give realistic objections.`,
    },
    onError: setError,
  });

  // Start call
  const startCall = async () => {
    try {
      console.log('🚀 Starting call...');
      setIsCallActive(true);
      setError(null);
      
      // Check if microphone is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone not supported in this browser');
      }
      
      await startListening();
      
      // Start call timer
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      
      // Store timer for cleanup
      (window as any).callTimer = timer;
      
    } catch (error: any) {
      console.error('❌ Start call error:', error);
      setError(`Failed to start call: ${error.message}. Please check microphone permissions and try again.`);
    }
  };

  // End call
  const endCall = () => {
    try {
      stopListening();
      setIsCallActive(false);
      
      // Clear timer
      if ((window as any).callTimer) {
        clearInterval((window as any).callTimer);
      }
      
      onEndCall();
      
    } catch (error: any) {
      console.error('❌ End call error:', error);
      setError(`Failed to end call: ${error.message}`);
    }
  };

  // Format call duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">{persona.name.charAt(0)}</span>
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg">{persona.name}</h1>
            <p className="text-gray-300 text-sm">{persona.type}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {isCallActive && (
            <div className="text-center">
              <div className="text-white font-mono text-lg">{formatDuration(callDuration)}</div>
              <div className="text-gray-400 text-xs">Duration</div>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              isCallActive ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-gray-300 text-sm">
              {isCallActive ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Interface */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Persona Avatar */}
        <div className="mb-8">
          <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white font-bold text-4xl">{persona.name.charAt(0)}</span>
          </div>
          <h2 className="text-white text-2xl font-bold text-center">{persona.name}</h2>
          <p className="text-gray-400 text-center">{persona.description}</p>
        </div>

        {/* Status Indicators */}
        <div className="mb-8 text-center space-y-2">
          {isListening && (
            <div className="text-green-400 text-lg">Listening to you...</div>
          )}
          {isProcessing && (
            <div className="text-yellow-400 text-lg">Processing your speech...</div>
          )}
          {isSpeaking && (
            <div className="text-blue-400 text-lg">{persona.name} is speaking...</div>
          )}
          {error && (
            <div className="bg-red-900 p-4 rounded-lg max-w-2xl">
              <div className="text-red-400 text-lg mb-2">❌ {error}</div>
              <button
                onClick={() => {
                  setError(null);
                  setIsCallActive(false);
                  setCallDuration(0);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Current Response (Streaming) */}
        {currentResponse && (
          <div className="mb-8 max-w-2xl">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-white text-sm">
                <span className="font-semibold">{persona.name}: </span>
                {currentResponse}
                <span className="animate-pulse">|</span>
              </div>
            </div>
          </div>
        )}

        {/* Audio Level Indicator */}
        {isListening && (
          <div className="mb-8">
            <div className="flex justify-center items-center gap-1">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 rounded-full transition-all duration-100 ${
                    audioLevel > (i + 1) * 0.125 ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                  style={{
                    height: `${(i + 1) * 8}px`,
                    opacity: audioLevel > (i + 1) * 0.125 ? 1 : 0.3
                  }}
                />
              ))}
            </div>
            <div className="text-center mt-2">
              <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 text-sm font-medium">
                  {audioLevel > 0.1 ? 'Microphone active' : 'Waiting for speech...'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Call Controls */}
        <div className="flex items-center space-x-6">
          {!isCallActive ? (
            <button
              onClick={startCall}
              className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full transition-colors"
            >
              <Phone className="w-8 h-8" />
            </button>
          ) : (
            <>
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing || isSpeaking}
                className={`p-4 rounded-full transition-colors ${
                  isListening 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
                } ${(isProcessing || isSpeaking) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isListening ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />}
              </button>
              
              <button
                onClick={endCall}
                className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full transition-colors"
              >
                <PhoneOff className="w-8 h-8" />
              </button>
            </>
          )}
        </div>

        {/* Conversation History */}
        {conversation.length > 0 && (
          <div className="mt-8 w-full max-w-2xl">
            <h3 className="text-white font-semibold mb-4">Conversation</h3>
            <div className="bg-gray-800 rounded-lg p-4 max-h-64 overflow-y-auto">
              {conversation.map((message) => (
                <div
                  key={message.id}
                  className={`mb-3 p-3 rounded-lg ${
                    message.speaker === 'user' 
                      ? 'bg-blue-600 text-white ml-8' 
                      : 'bg-gray-700 text-white mr-8'
                  }`}
                >
                  <div className="font-semibold text-sm mb-1">
                    {message.speaker === 'user' ? 'You' : persona.name}
                  </div>
                  <div className="text-sm">{message.text}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-900 p-6 rounded-lg max-w-2xl">
          <h3 className="text-white font-semibold mb-2">Voice Training Instructions</h3>
          <div className="text-sm text-gray-300 space-y-1">
            <p>• Click the green phone button to start the call</p>
            <p>• Speak naturally when you see &quot;Listening to you...&quot;</p>
            <p>• {persona.name} will respond with realistic objections</p>
            <p>• Practice overcoming common sales objections</p>
            <p>• Try phrases like &quot;Why is your rate so high?&quot; or &quot;I already have coverage&quot;</p>
          </div>
        </div>
      </div>
    </div>
  );
} 