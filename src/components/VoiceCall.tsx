'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX, Settings, Clock, Signal, AlertCircle, Keyboard } from 'lucide-react';
import { Persona } from '@/types/persona';
import { 
  getSpeechRecognition, 
  getSpeechSynthesis, 
  checkBrowserCompatibility,
  selectVoiceForPersona,
  enhanceTextForSpeech,
  getPersonaSpeechSettings,
  getErrorMessage
} from '@/utils/speechUtils';
import { useToast } from '@/contexts/ToastContext';
import { useKeyboardShortcuts, commonShortcuts } from '@/hooks/useKeyboardShortcuts';
import { playCallStart, playCallEnd, playMuteToggle, playSuccess, playError } from '@/utils/soundEffects';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface VoiceCallProps {
  persona: Persona;
  onAgentResponse: (transcript: string) => void;
  onCustomerResponse: (response: string) => void;
  onCallEnd: () => void;
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
  browserCompatibility: {
    speechRecognition: boolean;
    speechSynthesis: boolean;
    isSupported: boolean;
  };
}

export default function VoiceCall({ persona, onAgentResponse, onCustomerResponse, onCallEnd }: VoiceCallProps) {
  const { showSuccess, showError, showInfo } = useToast();
  const [callState, setCallState] = useState<CallState>({
    isConnected: false,
    isListening: false,
    isSpeaking: false,
    isMuted: false,
    hasPermission: false,
    audioLevel: 0,
    callDuration: 0,
    error: null,
    browserCompatibility: { speechRecognition: false, speechSynthesis: false, isSupported: false }
  });
  const [showShortcuts, setShowShortcuts] = useState(false);

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

  // Initialize speech recognition
  const initializeSpeechRecognition = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setCallState(prev => ({ 
        ...prev, 
        error: 'Speech recognition not supported in this browser. Please use text input instead.' 
      }));
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setCallState(prev => ({ ...prev, isListening: true, error: null }));
    };

    recognitionRef.current.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      
      if (event.results[event.results.length - 1].isFinal) {
        onAgentResponse(transcript);
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      const errorMessage = getErrorMessage(event.error);
      
      // Don't show error for no-speech, just restart
      if (event.error === 'no-speech') {
        setCallState(prev => ({ ...prev, isListening: false }));
        setTimeout(() => {
          if (callState.isConnected && !callState.isSpeaking) {
            // Use a direct call instead of the function reference
            if (recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (error) {
                console.error('Error starting speech recognition:', error);
              }
            }
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
      setCallState(prev => ({ ...prev, isListening: false }));
      // Restart listening if call is still connected and not speaking
      if (callState.isConnected && !callState.isSpeaking) {
        setTimeout(() => {
          if (callState.isConnected && !callState.isSpeaking) {
            // Use a direct call instead of the function reference
            if (recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (error) {
                console.error('Error starting speech recognition:', error);
              }
            }
          }
        }, 1000);
      }
    };
  }, [callState.isConnected, callState.isSpeaking, onAgentResponse]);

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
    const synthesis = getSpeechSynthesis();
    if (!synthesis) return null;
    
    synthesisRef.current = synthesis;
    
    // Get available voices and select appropriate one for persona
    const voices = synthesis.getVoices();
    const selectedVoice = selectVoiceForPersona(persona.id, voices);
    
    return selectedVoice;
  }, [persona.id]);

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

  // Speak text
  const speakText = useCallback((text: string) => {
    if (synthesisRef.current) {
      const selectedVoice = initializeSpeechSynthesis();
      const speechSettings = getPersonaSpeechSettings(persona.id);
      const enhancedText = enhanceTextForSpeech(text);

      const utterance = new SpeechSynthesisUtterance(enhancedText);
      
      // Apply persona-specific settings
      utterance.rate = speechSettings.rate;
      utterance.pitch = speechSettings.pitch;
      utterance.volume = callState.isMuted ? 0 : speechSettings.volume;
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      utterance.onstart = () => {
        setCallState(prev => ({ ...prev, isSpeaking: true }));
        stopListening();
      };
      
      utterance.onend = () => {
        setCallState(prev => ({ ...prev, isSpeaking: false }));
        // Resume listening after speaking
        setTimeout(() => {
          if (callState.isConnected) {
            startListening();
          }
        }, 500);
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setCallState(prev => ({ ...prev, isSpeaking: false }));
      };
      
      synthesisRef.current.speak(utterance);
    }
  }, [persona.id, callState.isMuted, callState.isConnected, initializeSpeechSynthesis, stopListening, startListening]);

  // Start call
  const startCall = useCallback(async () => {
    try {
      setCallState(prev => ({ ...prev, isConnected: true, error: null }));
      
      await initializeAudioAnalysis();
      initializeSpeechRecognition();
      
      // Start call timer
      callTimerRef.current = setInterval(() => {
        setCallState(prev => ({ ...prev, callDuration: prev.callDuration + 1 }));
      }, 1000);
      
      // Play call start sound and show success message
      await playCallStart();
      showSuccess('Call Started', `Connected with ${persona.name}`);
      
      // Initial greeting
      const greeting = getPersonaGreeting(persona);
      speakText(greeting);
    } catch (error) {
      showError('Call Failed', 'Unable to start call. Please check your microphone permissions.');
      await playError();
    }
  }, [persona, initializeAudioAnalysis, initializeSpeechRecognition, speakText, showSuccess, showError]);

  // End call
  const endCall = useCallback(async () => {
    setCallState(prev => ({ ...prev, isConnected: false }));
    
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
    
    onCallEnd();
  }, [stopListening, onCallEnd, callState.callDuration, showInfo]);

  // Toggle mute
  const toggleMute = useCallback(async () => {
    setCallState(prev => ({ ...prev, isMuted: !prev.isMuted }));
    await playMuteToggle();
  }, []);

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

  // Format call duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get audio quality indicator
  const getAudioQualityIndicator = (level: number) => {
    if (level < 10) return { color: 'bg-gray-400', text: 'No Signal' };
    if (level < 30) return { color: 'bg-red-500', text: 'Poor' };
    if (level < 60) return { color: 'bg-yellow-500', text: 'Fair' };
    if (level < 80) return { color: 'bg-green-500', text: 'Good' };
    return { color: 'bg-green-600', text: 'Excellent' };
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      if (audioLevelRef.current) clearTimeout(audioLevelRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'Enter',
      action: () => {
        if (!callState.isConnected) {
          startCall();
        }
      },
      description: 'Start call'
    },
    {
      key: 'Escape',
      action: () => {
        if (callState.isConnected) {
          endCall();
        }
      },
      description: 'End call'
    },
    {
      key: 'm',
      action: () => {
        if (callState.isConnected) {
          toggleMute();
        }
      },
      description: 'Toggle mute'
    },
    {
      key: '?',
      action: () => setShowShortcuts(!showShortcuts),
      description: 'Show shortcuts'
    }
  ]);

  // Expose speakText function to parent
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).speakText = speakText;
    }
  }, [speakText]);

  if (callState.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-800">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Error: {callState.error}</span>
        </div>
        <p className="text-red-600 mt-2 text-sm">
          Please check your microphone permissions and browser compatibility.
        </p>
        {!callState.browserCompatibility.isSupported && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-800 text-sm">
              <strong>Browser Compatibility:</strong><br/>
              Speech Recognition: {callState.browserCompatibility.speechRecognition ? '✅' : '❌'}<br/>
              Speech Synthesis: {callState.browserCompatibility.speechSynthesis ? '✅' : '❌'}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Call Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
              persona.color === 'blue' ? 'bg-blue-500' :
              persona.color === 'green' ? 'bg-green-500' :
              'bg-purple-500'
            }`}>
              {persona.avatar}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{persona.name}</h3>
              <p className="text-blue-100 text-sm">{persona.type}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100">Call Duration</div>
            <div className="text-xl font-mono font-semibold">{formatDuration(callState.callDuration)}</div>
          </div>
        </div>
      </div>

      {/* Call Status */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              callState.isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`} />
            <span className="text-sm font-medium text-gray-700">
              {callState.isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Signal className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500">AI Customer</span>
          </div>
        </div>
      </div>

      {/* Audio Level Indicator */}
      {callState.hasPermission && (
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-gray-700">Your Voice</div>
            <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-100 ease-out"
                style={{ width: `${callState.audioLevel}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 w-8 text-right">
              {Math.round(callState.audioLevel)}%
            </div>
          </div>
        </div>
      )}

      {/* Call Controls */}
      <div className="p-6">
        <div className="grid grid-cols-3 gap-4">
          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 ${
              callState.isMuted 
                ? 'bg-red-50 text-red-600 border-2 border-red-200' 
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
            }`}
          >
            {callState.isMuted ? (
              <VolumeX className="w-6 h-6" />
            ) : (
              <Volume2 className="w-6 h-6" />
            )}
            <span className="text-xs font-medium">
              {callState.isMuted ? 'Unmute' : 'Mute'}
            </span>
          </button>

          {/* Main Call Button */}
          <button
            onClick={callState.isConnected ? endCall : startCall}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 ${
              callState.isConnected
                ? 'bg-red-50 text-red-600 border-2 border-red-200 hover:bg-red-100'
                : 'bg-green-50 text-green-600 border-2 border-green-200 hover:bg-green-100'
            }`}
          >
            {callState.isConnected ? (
              <PhoneOff className="w-6 h-6" />
            ) : (
              <Phone className="w-6 h-6" />
            )}
            <span className="text-xs font-medium">
              {callState.isConnected ? 'End Call' : 'Start Call'}
            </span>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-gray-200 transition-all duration-200"
          >
            <Settings className="w-6 h-6" />
            <span className="text-xs font-medium">Settings</span>
          </button>
        </div>

        {/* Status Indicators */}
        <div className="mt-6 space-y-3">
          {callState.isListening && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
              <span className="text-sm text-blue-700 font-medium">Listening...</span>
            </div>
          )}
          
          {callState.isSpeaking && (
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
              <span className="text-sm text-green-700 font-medium">{persona.name} is speaking...</span>
            </div>
          )}

          {callState.error && (
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-700">{callState.error}</span>
            </div>
          )}
        </div>

        {/* Keyboard Shortcuts */}
        {showShortcuts && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              Keyboard Shortcuts
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Space</span>
                <span className="font-medium">Push to talk</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">M</span>
                <span className="font-medium">Toggle mute</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Esc</span>
                <span className="font-medium">End call</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">?</span>
                <span className="font-medium">Show shortcuts</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Optimizations */}
      <div className="md:hidden p-4 bg-gray-50 border-t border-gray-200">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-2">
            💡 Tip: Use headphones for better audio quality
          </p>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => window.open('/training', '_blank')}
              className="text-xs text-blue-600 hover:text-blue-700 underline"
            >
              Open in new tab
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 