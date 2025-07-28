'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, RotateCcw, Save, Download, Keyboard, Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX, Settings, Clock, Signal, AlertCircle } from 'lucide-react';
import { Persona, SessionStats, ConversationMessage } from '@/types/persona';
import { useToast } from '@/contexts/ToastContext';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { playSuccess, playError, playSessionComplete, playCallStart, playCallEnd, playMuteToggle } from '@/utils/soundEffects';
import { 
  getSpeechRecognition, 
  getSpeechSynthesis, 
  checkBrowserCompatibility,
  selectVoiceForPersona,
  enhanceTextForSpeech,
  getPersonaSpeechSettings,
  getErrorMessage
} from '@/utils/speechUtils';
import { 
  generateElevenLabsSpeech, 
  fallbackToBrowserTTS, 
  playAudioBuffer 
} from '@/utils/voiceApi';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import VoiceCallInterface from '@/components/VoiceCallInterface';

interface VoiceInterfaceProps {
  persona: Persona;
  onSessionUpdate: (stats: SessionStats) => void;
  onEndSession: () => void;
  onConversationUpdate?: (conversation: ConversationMessage[]) => void;
}

interface CallState {
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isMuted: boolean;
  hasPermission: boolean;
  audioLevel: number;
  callDuration: number;
  error: string | null;
  showCallInterface: boolean;
  browserCompatibility: {
    speechRecognition: boolean;
    speechSynthesis: boolean;
    isSupported: boolean;
  };
}

export default function VoiceInterface({ persona, onSessionUpdate, onEndSession, onConversationUpdate }: VoiceInterfaceProps) {
  const { showSuccess, showError, showInfo } = useToast();
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    duration: 0,
    objectionsHandled: 0,
    responsesCount: 0,
    confidenceScore: 0
  });

  // Voice call state
  const [callState, setCallState] = useState<CallState>({
    isConnected: false,
    isListening: false,
    isSpeaking: false,
    isMuted: false,
    hasPermission: false,
    audioLevel: 0,
    callDuration: 0,
    error: null,
    showCallInterface: false,
    browserCompatibility: { speechRecognition: false, speechSynthesis: false, isSupported: false }
  });

  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioLevelRef = useRef<NodeJS.Timeout | null>(null);

  // Check browser compatibility on mount
  useEffect(() => {
    const compatibility = checkBrowserCompatibility();
    setCallState(prev => ({ ...prev, browserCompatibility: compatibility }));
    
    if (!compatibility.isSupported) {
      setCallState(prev => ({ 
        ...prev, 
        error: 'Speech recognition or synthesis not supported in this browser. Please use Chrome, Edge, or Safari.' 
      }));
    }
  }, []);

  // Start listening
  const startListening = useCallback(() => {
    if (recognitionRef.current && callState.isConnected && !callState.isSpeaking) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  }, [callState.isConnected, callState.isSpeaking]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const handleAgentResponse = useCallback(async (transcript: string) => {
    const agentMessage: ConversationMessage = {
      id: Date.now().toString(),
      speaker: 'agent',
      content: transcript,
      timestamp: new Date()
    };

    setConversation(prev => [...prev, agentMessage]);
    setSessionStats(prev => ({
      ...prev,
      responsesCount: prev.responsesCount + 1
    }));

    // Generate AI customer response
    await generateCustomerResponse(transcript);
  }, []);

  // Initialize speech recognition
  const initializeSpeechRecognition = useCallback(() => {
    console.log('🎧 Initializing speech recognition...');
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      console.error('🎧 Speech recognition not supported');
      setCallState(prev => ({ 
        ...prev, 
        error: 'Speech recognition not supported in this browser. Please use text input instead.' 
      }));
      return;
    }

    console.log('🎧 Creating speech recognition instance...');
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      console.log('🎧 Speech recognition started');
      setCallState(prev => ({ ...prev, isListening: true, error: null }));
    };

    recognitionRef.current.onresult = (event: any) => {
      console.log('🎧 Speech recognition result:', event.results);
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      
      console.log('🎧 Transcript:', transcript);
      
      if (event.results[event.results.length - 1].isFinal) {
        console.log('🎧 Final transcript:', transcript);
        handleAgentResponse(transcript);
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('🎧 Speech recognition error:', event.error);
      const errorMessage = getErrorMessage(event.error);
      
      // Don't show error for no-speech, just restart
      if (event.error === 'no-speech') {
        console.log('🎧 No speech detected, restarting...');
        setCallState(prev => ({ ...prev, isListening: false }));
        setTimeout(() => {
          if (callState.isConnected && !callState.isSpeaking) {
            startListening();
          }
        }, 1000);
        return;
      }
      
      setCallState(prev => ({ 
        ...prev, 
        isListening: false, 
        error: errorMessage 
      }));
    };

    recognitionRef.current.onend = () => {
      console.log('🎧 Speech recognition ended');
      setCallState(prev => ({ ...prev, isListening: false }));
      // Restart listening if call is still connected and not speaking
      if (callState.isConnected && !callState.isSpeaking) {
        setTimeout(() => {
          if (callState.isConnected && !callState.isSpeaking) {
            console.log('🎧 Restarting speech recognition...');
            startListening();
          }
        }, 1000);
      }
    };
    
    console.log('🎧 Speech recognition initialized successfully');
  }, [callState.isConnected, callState.isSpeaking, handleAgentResponse, startListening]);

  // Initialize audio analysis for voice activity detection
  const initializeAudioAnalysis = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;
      microphoneRef.current.connect(analyserRef.current);
      
      setCallState(prev => ({ ...prev, hasPermission: true }));
      
      // Start audio level monitoring
      const updateAudioLevel = () => {
        if (analyserRef.current && callState.isConnected) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          const normalizedLevel = Math.min(100, (average / 128) * 100);
          
          setCallState(prev => ({ ...prev, audioLevel: normalizedLevel }));
        }
        audioLevelRef.current = setTimeout(updateAudioLevel, 100);
      };
      
      updateAudioLevel();
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setCallState(prev => ({ 
        ...prev, 
        error: 'Microphone permission required for voice call. Please allow microphone access.' 
      }));
    }
  }, [callState.isConnected]);

  // Initialize text-to-speech
  const initializeSpeechSynthesis = useCallback(() => {
    console.log('🔊 Initializing speech synthesis...');
    const synthesis = getSpeechSynthesis();
    if (!synthesis) {
      console.error('🔊 Speech synthesis not available');
      return null;
    }
    
    synthesisRef.current = synthesis;
    
    // Wait for voices to load if they're not available yet
    const voices = synthesis.getVoices();
    console.log('🔊 Available voices:', voices.length);
    
    if (voices.length === 0) {
      console.log('🔊 No voices available, waiting for voices to load...');
      synthesis.onvoiceschanged = () => {
        console.log('🔊 Voices loaded:', synthesis.getVoices().length);
      };
    }
    
    // Get available voices and select appropriate one for persona
    const selectedVoice = selectVoiceForPersona(persona.id, voices);
    console.log('🔊 Selected voice:', selectedVoice?.name);
    
    return selectedVoice;
  }, [persona.id]);

  // Speak text (make AI customer speak) - Updated to use ElevenLabs
  const speakText = useCallback(async (text: string) => {
    console.log('🔊 speakText called with:', text);
    
    // Try ElevenLabs first for high-quality voice
    const audioBuffer = await generateElevenLabsSpeech(text, persona.id);
    
    if (audioBuffer) {
      console.log('🎙️ Playing ElevenLabs audio...');
      setCallState(prev => ({ ...prev, isSpeaking: true }));
      stopListening();
      
      try {
        await playAudioBuffer(audioBuffer);
        console.log('🎙️ ElevenLabs audio finished');
        setCallState(prev => ({ ...prev, isSpeaking: false }));
        
        // Resume listening after speaking
        setTimeout(() => {
          if (callState.isConnected) {
            console.log('🔊 Resuming listening after ElevenLabs speech');
            startListening();
          }
        }, 500);
      } catch (error) {
        console.error('🎙️ Error playing ElevenLabs audio:', error);
        setCallState(prev => ({ ...prev, isSpeaking: false }));
      }
    } else {
      // Fallback to browser TTS
      console.log('🔊 Using browser TTS fallback');
      if (synthesisRef.current) {
        fallbackToBrowserTTS(text, persona.id, synthesisRef.current);
        
        // Set up event handlers for browser TTS
        const utterance = new SpeechSynthesisUtterance(text);
        
        utterance.onstart = () => {
          console.log('🔊 Browser TTS started');
          setCallState(prev => ({ ...prev, isSpeaking: true }));
          stopListening();
        };
        
        utterance.onend = () => {
          console.log('🔊 Browser TTS ended');
          setCallState(prev => ({ ...prev, isSpeaking: false }));
          // Resume listening after speaking
          setTimeout(() => {
            if (callState.isConnected) {
              console.log('🔊 Resuming listening after browser TTS');
              startListening();
            }
          }, 500);
        };
        
        utterance.onerror = (event) => {
          console.error('🔊 Browser TTS error:', event);
          setCallState(prev => ({ ...prev, isSpeaking: false }));
        };
        
        synthesisRef.current.speak(utterance);
      } else {
        console.error('🔊 No speech synthesis available');
        setCallState(prev => ({ 
          ...prev, 
          error: 'Speech synthesis not available in this browser' 
        }));
      }
    }
  }, [persona.id, callState.isConnected, stopListening, startListening]);

  // Start call
  const startCall = useCallback(async () => {
    try {
      console.log('🚀 Starting voice call...');
      setCallState(prev => ({ ...prev, isConnected: true, error: null, showCallInterface: true }));
      
      // Initialize audio analysis first
      console.log('🎤 Initializing audio analysis...');
      await initializeAudioAnalysis();
      
      // Initialize speech recognition
      console.log('🎧 Initializing speech recognition...');
      initializeSpeechRecognition();
      
      // Initialize speech synthesis
      console.log('🔊 Initializing speech synthesis...');
      initializeSpeechSynthesis();
      
      // Start call timer
      callTimerRef.current = setInterval(() => {
        setCallState(prev => ({ ...prev, callDuration: prev.callDuration + 1 }));
      }, 1000);
      
      // Play call start sound and show success message
      await playCallStart();
      showSuccess('Call Started', `Connected with ${persona.name}`);
      
      // Initial greeting
      console.log('👋 Playing initial greeting...');
      const greeting = getPersonaGreeting(persona);
      console.log('Greeting text:', greeting);
      
      // Play greeting and then start listening
      await speakText(greeting);
      
      // Start listening after greeting (with delay to ensure greeting finishes)
      setTimeout(() => {
        if (callState.isConnected && !callState.isSpeaking) {
          console.log('🎧 Starting speech recognition after greeting...');
          startListening();
        }
      }, 2000); // Wait 2 seconds for greeting to finish
      
    } catch (error) {
      console.error('❌ Error starting call:', error);
      showError('Call Failed', 'Unable to start call. Please check your microphone permissions.');
      await playError();
    }
  }, [persona, initializeAudioAnalysis, initializeSpeechRecognition, initializeSpeechSynthesis, speakText, startListening, callState.isConnected, callState.isSpeaking, showSuccess, showError]);

  // End call
  const endCall = useCallback(async () => {
    setCallState(prev => ({ ...prev, isConnected: false, showCallInterface: false }));
    
    stopListening();
    
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
    
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }
    
    if (audioLevelRef.current) {
      clearTimeout(audioLevelRef.current);
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    // Play call end sound and show info
    await playCallEnd();
    showInfo('Call Ended', `Session duration: ${formatDuration(callState.callDuration)}`);
    
    onEndSession();
  }, [stopListening, onEndSession, callState.callDuration, showInfo]);

  // Toggle mute
  const toggleMute = useCallback(async () => {
    setCallState(prev => ({ ...prev, isMuted: !prev.isMuted }));
    await playMuteToggle();
  }, []);

  // Close call interface
  const closeCallInterface = useCallback(() => {
    if (callState.isConnected) {
      endCall();
    } else {
      setCallState(prev => ({ ...prev, showCallInterface: false }));
    }
  }, [callState.isConnected, endCall]);

  // Get persona greeting
  const getPersonaGreeting = (persona: Persona): string => {
    const greetings = {
      'skeptical-shopper': "Hi, I filled out a form online but I'm not really serious about buying. I was just comparing prices and wanted to see what's out there. What can you tell me?",
      'busy-professional': "Hello? I'm in the middle of something. I got a call from you guys but I'm really busy right now. What do you need?",
      'price-hunter': "Hi, I'm looking for the best deal on insurance. I've been comparing quotes and I want to know what your best price is. What can you offer me?",
      sarah: "Hi, I'm Sarah. I'm looking for insurance but honestly, I'm pretty busy and not sure I need this right now. What can you tell me?",
      'mike-jennifer': "Hello, we're Mike and Jennifer. We have two kids and want to make sure we have the right coverage. We've been doing some research but it's overwhelming.",
      robert: "Good afternoon. I've been with my current insurance company for 15 years. They've been good to me, but I'm curious what you have to offer. What makes you different?"
    };
    return greetings[persona.id as keyof typeof greetings] || "Hello, I'm interested in learning about insurance options.";
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Update conversation when it changes
  useEffect(() => {
    if (onConversationUpdate) {
      onConversationUpdate(conversation);
    }
  }, [conversation, onConversationUpdate]);

  const generateCustomerResponse = async (agentResponse: string) => {
    try {
      console.log('🤖 Generating customer response for:', agentResponse);
      setIsLoading(true);
      
      const requestBody = {
        message: agentResponse,
        personaId: persona.id,
        conversationHistory: conversation.slice(-10) // Last 10 messages for context
      };
      
      console.log('🤖 API request body:', requestBody);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('🤖 API response status:', response.status);

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('🤖 API response data:', data);
      
      const customerMessage: ConversationMessage = {
        id: Date.now().toString(),
        speaker: 'customer',
        content: data.response,
        timestamp: new Date()
      };

      setConversation(prev => [...prev, customerMessage]);
      
      // Make AI customer speak the response
      if (callState.isConnected) {
        console.log('🤖 Making AI customer speak response:', data.response);
        speakText(data.response);
      } else {
        console.log('🤖 Call not connected, skipping speech');
      }
      
    } catch (error) {
      console.error('🤖 Error generating customer response:', error);
      showError('Response Failed', 'Unable to generate customer response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentInput.trim() && !isLoading) {
      handleAgentResponse(currentInput.trim());
      setCurrentInput('');
    }
  };

  const resetSession = () => {
    setConversation([]);
    setSessionStats({
      duration: 0,
      objectionsHandled: 0,
      responsesCount: 0,
      confidenceScore: 0
    });
    setCallState(prev => ({ 
      ...prev, 
      callDuration: 0,
      error: null 
    }));
  };

  const exportConversation = () => {
    const conversationText = conversation
      .map(msg => `${msg.speaker === 'agent' ? 'You' : persona.name}: ${msg.content}`)
      .join('\n\n');
    
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${persona.name}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      if (audioLevelRef.current) clearTimeout(audioLevelRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      if (synthesisRef.current) synthesisRef.current.cancel();
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Session Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold">
                {persona.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{persona.name}</h2>
              <p className="text-gray-600 text-sm">{persona.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCallState(prev => ({ ...prev, showCallInterface: true }))}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Phone className="w-4 h-4" />
              Start Voice Call
            </button>
            
            <button
              onClick={() => setShowShortcuts(!showShortcuts)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Keyboard className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Call Status */}
        {callState.isConnected && (
          <div className="flex items-center gap-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-700 font-medium">Voice Call Active</span>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <Clock className="w-4 h-4" />
              <span className="font-mono">{formatDuration(callState.callDuration)}</span>
            </div>
            {callState.isListening && (
              <div className="flex items-center gap-2 text-green-600">
                <Mic className="w-4 h-4" />
                <span>Listening...</span>
              </div>
            )}
            {callState.isSpeaking && (
              <div className="flex items-center gap-2 text-blue-600">
                <Volume2 className="w-4 h-4" />
                <span>Speaking...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Voice Call Interface */}
      {callState.showCallInterface && (
        <VoiceCallInterface
          persona={persona}
          isConnected={callState.isConnected}
          isListening={callState.isListening}
          isSpeaking={callState.isSpeaking}
          isMuted={callState.isMuted}
          audioLevel={callState.audioLevel}
          callDuration={callState.callDuration}
          error={callState.error}
          onStartCall={startCall}
          onEndCall={endCall}
          onToggleMute={toggleMute}
          onClose={closeCallInterface}
        />
      )}

      {/* Debug Controls - Only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">🔧 Debug Controls</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                console.log('🔧 Manual start listening');
                startListening();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              Start Listening
            </button>
            <button
              onClick={() => {
                console.log('🔧 Manual stop listening');
                stopListening();
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              Stop Listening
            </button>
            <button
              onClick={() => {
                console.log('🔧 Test speech synthesis');
                speakText('This is a test of the speech synthesis system.');
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              Test Speech
            </button>
            <button
              onClick={() => {
                console.log('🔧 Test API call');
                generateCustomerResponse('Hello, this is a test message.');
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              Test API
            </button>
          </div>
          <div className="mt-3 text-sm text-yellow-700">
            <p><strong>Status:</strong> {callState.isConnected ? 'Connected' : 'Disconnected'} | {callState.isListening ? 'Listening' : 'Not Listening'} | {callState.isSpeaking ? 'Speaking' : 'Not Speaking'}</p>
            <p><strong>Error:</strong> {callState.error || 'None'}</p>
            <p><strong>Audio Level:</strong> {callState.audioLevel.toFixed(1)}%</p>
          </div>
        </div>
      )}

      {/* Text Input Fallback */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Text Conversation (Fallback)</h3>
        
        <form onSubmit={handleTextSubmit} className="flex gap-3">
          <input
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            placeholder="Type your response..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!currentInput.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : <Send className="w-4 h-4" />}
            Send
          </button>
        </form>
      </div>

      {/* Conversation History */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Conversation History</h3>
          <div className="flex gap-2">
            <button
              onClick={resetSession}
              className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={exportConversation}
              className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {conversation.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {callState.isConnected 
                ? "Start talking to begin the conversation..." 
                : "Click 'Start Voice Call' or type a message to begin..."
              }
            </p>
          ) : (
            conversation.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.speaker === 'agent' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.speaker === 'agent'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      {showShortcuts && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Keyboard Shortcuts</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Space</strong> - Hold to talk (when call is active)</p>
              <p><strong>M</strong> - Toggle mute</p>
              <p><strong>Escape</strong> - End call</p>
            </div>
            <div>
              <p><strong>Enter</strong> - Send text message</p>
              <p><strong>R</strong> - Reset session</p>
              <p><strong>H</strong> - Toggle shortcuts</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 