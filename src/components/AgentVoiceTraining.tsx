'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Persona } from '@/types/persona';

interface AgentVoiceTrainingProps {
  persona: Persona;
  onEndCall: () => void;
}

interface ConversationMessage {
  id: string;
  speaker: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

export default function AgentVoiceTraining({ persona, onEndCall }: AgentVoiceTrainingProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const sendMessageToAgentRef = useRef<((message: string) => Promise<void>) | null>(null);

  // Play agent's audio response
  const playAgentAudio = useCallback(async (audioBase64: string) => {
    try {
      const audioBuffer = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();

    } catch (error) {
      console.error('Audio playback error:', error);
      setIsSpeaking(false);
    }
  }, []);

  // Send message to agent
  const sendMessageToAgent = useCallback(async (message: string) => {
    if (!sessionId) {
      console.error('No agent session active');
      return;
    }

    try {
      setIsSpeaking(true);
      
      const response = await fetch('/api/elevenlabs-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send_message',
          sessionId: sessionId,
          message: message
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message to agent');
      }

      const data = await response.json();
      
      // Add agent message to conversation
      if (data.text) {
        const agentMessage: ConversationMessage = {
          id: (Date.now() + 1).toString(),
          speaker: 'agent',
          text: data.text,
          timestamp: new Date()
        };
        setConversation(prev => [...prev, agentMessage]);
      }

      // Play agent's audio response
      if (data.audio) {
        await playAgentAudio(data.audio);
      } else {
        setIsSpeaking(false);
      }

    } catch (error) {
      console.error('Agent message error:', error);
      setError('Failed to get agent response');
      setIsSpeaking(false);
    }
  }, [sessionId, playAgentAudio]);

  // Initialize speech recognition
  const initializeSpeechRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition not supported in this browser');
      return false;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognitionRef.current.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      
      // Add user message to conversation
      const userMessage: ConversationMessage = {
        id: Date.now().toString(),
        speaker: 'user',
        text: transcript,
        timestamp: new Date()
      };
      setConversation(prev => [...prev, userMessage]);

      // Send message to agent
      await sendMessageToAgentRef.current?.(transcript);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error !== 'no-speech') {
        setError(`Speech recognition error: ${event.error}`);
      }
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    return true;
  }, []);

  // Initialize audio analysis for visual feedback
  const initializeAudioAnalysis = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current.fftSize = 256;
      microphoneRef.current.connect(analyserRef.current);
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const updateAudioLevel = () => {
        if (analyserRef.current && isListening) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average / 255);
        }
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };
      
      updateAudioLevel();
    } catch (error) {
      console.error('Audio analysis error:', error);
    }
  }, [isListening]);

  // Create agent session
  const createAgentSession = async () => {
    try {
      console.log('🤖 Creating agent session...');
      
      const response = await fetch('/api/elevenlabs-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_session'
        }),
      });

      console.log('🤖 Agent session response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Agent session creation failed:', errorData);
        throw new Error(errorData.details || errorData.error || 'Failed to create agent session');
      }

      const data = await response.json();
      setSessionId(data.sessionId);
      console.log('🤖 Agent session created:', data.sessionId);

      // Get initial greeting from agent
      await sendMessageToAgentRef.current?.('Hello, I\'m calling about the insurance quote you requested.');

    } catch (error) {
      console.error('Agent session creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to agent';
      setError(errorMessage);
    }
  };

  // Start the call
  const startCall = async () => {
    setIsCallActive(true);
    setError(null);
    
    // Set the ref for sendMessageToAgent
    sendMessageToAgentRef.current = sendMessageToAgent;
    
    // Initialize speech recognition
    if (!initializeSpeechRecognition()) {
      return;
    }

    // Initialize audio analysis
    await initializeAudioAnalysis();

    // Create agent session
    await createAgentSession();

    // Start call timer
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  // End the call
  const endCall = async () => {
    setIsCallActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    setCallDuration(0);
    setError(null);

    // End agent session
    if (sessionId) {
      try {
        await fetch('/api/elevenlabs-agent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'end_session',
            sessionId: sessionId
          }),
        });
      } catch (error) {
        console.error('Session end error:', error);
      }
      setSessionId(null);
    }

    // Clean up
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    onEndCall();
  };

  // Toggle microphone
  const toggleMicrophone = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Format call duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  if (!isCallActive) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-blue-600 text-4xl font-bold">{persona.avatar}</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{persona.name}</h2>
          <p className="text-gray-600 mb-4">{persona.type}</p>
          <p className="text-gray-500 mb-8">{persona.description}</p>
          
          <div className="bg-blue-50 rounded-xl p-6 mb-8 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">🤖 AI Agent Conversation</h3>
            <p className="text-blue-700 mb-4">
              Connect with Sarah Mitchell, a real AI agent trained for insurance objection handling. 
              Have a natural conversation and practice your sales skills.
            </p>
            <div className="text-sm text-blue-600 space-y-1">
              <p>• Real AI agent conversation</p>
              <p>• Natural voice responses</p>
              <p>• Realistic objection scenarios</p>
              <p>• Professional training experience</p>
            </div>
          </div>
          
          <button
            onClick={startCall}
            className="bg-green-600 hover:bg-green-700 text-white px-12 py-4 rounded-full text-xl font-semibold transition-colors flex items-center gap-3 mx-auto"
          >
            <Phone className="w-6 h-6" />
            Call Sarah Mitchell
          </button>
          
          <p className="text-gray-500 mt-4">Connect with the AI agent for realistic practice</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      {/* iPhone-style Call Interface */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Call Header */}
        <div className="bg-gradient-to-b from-green-500 to-green-600 text-white p-8 text-center">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-3xl font-bold">{persona.avatar}</span>
          </div>
          <h2 className="text-xl font-bold mb-1">{persona.name}</h2>
          <p className="text-green-100 text-sm">AI Agent</p>
          
          {/* Call Status */}
          <div className="mt-4">
            {isSpeaking && (
              <div className="flex items-center justify-center gap-2 text-green-100">
                <div className="w-2 h-2 bg-green-100 rounded-full animate-pulse"></div>
                <span className="text-sm">Sarah is speaking...</span>
              </div>
            )}
            {isListening && (
              <div className="flex items-center justify-center gap-2 text-green-100">
                <Mic className="w-4 h-4" />
                <span className="text-sm">Listening...</span>
              </div>
            )}
            {!isSpeaking && !isListening && (
              <div className="text-green-100 text-sm">Connected to AI Agent</div>
            )}
          </div>

          {/* Call Duration */}
          <div className="text-2xl font-mono mt-4">
            {formatDuration(callDuration)}
          </div>
        </div>

        {/* Call Controls */}
        <div className="p-8 bg-gray-50">
          <div className="flex justify-center items-center gap-6 mb-6">
            {/* Mute Button */}
            <button
              onClick={toggleMute}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            {/* Main Microphone Button */}
            <button
              onClick={toggleMicrophone}
              disabled={isSpeaking}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                isListening 
                  ? 'bg-red-600 text-white scale-110' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } ${isSpeaking ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            {/* End Call Button */}
            <button
              onClick={endCall}
              className="w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>

          {/* Audio Level Indicator */}
          {isListening && (
            <div className="flex justify-center items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all ${
                    audioLevel > (i + 1) * 0.2 ? 'bg-red-500' : 'bg-gray-300'
                  }`}
                  style={{ height: `${(i + 1) * 8}px` }}
                />
              ))}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="text-center text-gray-500 text-sm">
            {isSpeaking ? "Sarah is responding..." : 
             isListening ? "Speak now..." : 
             "Tap microphone to speak to Sarah"}
          </div>
        </div>
      </div>
    </div>
  );
} 