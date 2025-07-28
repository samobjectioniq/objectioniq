'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Persona } from '@/types/persona';

interface VoiceTrainingProps {
  persona: Persona;
  onEndCall: () => void;
}

interface ConversationMessage {
  id: string;
  speaker: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export default function VoiceTraining({ persona, onEndCall }: VoiceTrainingProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [showSessionSummary, setShowSessionSummary] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const speakTextRef = useRef<((text: string) => Promise<void>) | null>(null);
  const generateAIResponseRef = useRef<((transcript: string) => Promise<void>) | null>(null);

  // Initialize speech recognition
  const initializeSpeechRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser');
      return false;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false; // Keep false for better control
    recognitionRef.current.interimResults = true; // Enable interim results for better feedback
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setError(null);
      console.log('🎤 Speech recognition started');
    };

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log('🎤 Speech recognized:', transcript);
      
      // Show interim results for better feedback
      if (event.results[0].isFinal) {
        // Add user message to conversation
        const userMessage: ConversationMessage = {
          id: Date.now().toString(),
          speaker: 'user',
          text: transcript,
          timestamp: new Date()
        };
        setConversation(prev => [...prev, userMessage]);
        
        // Generate AI response
        generateAIResponseRef.current?.(transcript);
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('🎤 Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        setError('Speech recognition error: ' + event.error);
      }
      setIsListening(false);
      
      // Restart listening after error (except for no-speech)
      if (event.error !== 'no-speech' && isCallActive) {
        setTimeout(() => {
          if (recognitionRef.current && isCallActive) {
            recognitionRef.current.start();
          }
        }, 1000);
      }
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      console.log('🎤 Speech recognition ended');
      
      // Automatically restart listening if call is still active
      if (isCallActive && !isSpeaking) {
        setTimeout(() => {
          if (recognitionRef.current && isCallActive && !isSpeaking) {
            recognitionRef.current.start();
          }
        }, 500);
      }
    };

    return true;
  }, [isCallActive, isSpeaking]);

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
          const normalizedLevel = Math.min(1, average / 128);
          setAudioLevel(normalizedLevel);
        }
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };
      
      updateAudioLevel();
    } catch (error) {
      console.error('Audio analysis error:', error);
    }
  }, [isListening]);

  // Generate AI response using Claude API
  const generateAIResponse = useCallback(async (userMessage: string) => {
    try {
      setIsSpeaking(true);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          personaId: persona.id,
          conversationHistory: conversation.slice(-10).map(msg => ({
            role: msg.speaker === 'user' ? 'user' : 'assistant',
            content: msg.text
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      const aiResponse = data.response;

      // Add AI message to conversation
      const aiMessage: ConversationMessage = {
        id: (Date.now() + 1).toString(),
        speaker: 'ai',
        text: aiResponse,
        timestamp: new Date()
      };
      setConversation(prev => [...prev, aiMessage]);

      // Convert AI response to speech
      await speakTextRef.current?.(aiResponse);

    } catch (error) {
      console.error('AI response error:', error);
      setError('Failed to get AI response');
      setIsSpeaking(false);
    }
  }, [persona.id, conversation]);

  // Assign function to ref
  useEffect(() => {
    generateAIResponseRef.current = generateAIResponse;
  }, [generateAIResponse]);

  // Speak text using ElevenLabs
  const speakText = useCallback(async (text: string) => {
    try {
      const response = await fetch('/api/elevenlabs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          personaId: persona.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const audioBuffer = await response.arrayBuffer();
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        
        // Restart listening after Sarah finishes speaking
        if (isCallActive && recognitionRef.current) {
          setTimeout(() => {
            if (isCallActive && recognitionRef.current) {
              recognitionRef.current.start();
            }
          }, 500);
        }
      };
      
      await audio.play();

    } catch (error) {
      console.error('Speech generation error:', error);
      // Fallback to browser TTS
      if (synthesisRef.current) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => {
          setIsSpeaking(false);
          
          // Restart listening after Sarah finishes speaking
          if (isCallActive && recognitionRef.current) {
            setTimeout(() => {
              if (isCallActive && recognitionRef.current) {
                recognitionRef.current.start();
              }
            }, 500);
          }
        };
        synthesisRef.current.speak(utterance);
      } else {
        setIsSpeaking(false);
      }
    }
  }, [persona.id, isCallActive]);

  // Start the call
  const startCall = async () => {
    setIsCallActive(true);
    setError(null);
    
    // Initialize speech recognition
    if (!initializeSpeechRecognition()) {
      return;
    }

    // Initialize audio analysis
    await initializeAudioAnalysis();

    // Initialize speech synthesis
    synthesisRef.current = window.speechSynthesis;
    speakTextRef.current = speakText;
    generateAIResponseRef.current = generateAIResponse;

    // Start call timer
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    // AI speaks first greeting
    const greeting = getPersonaGreeting(persona);
    await speakText(greeting);

    // Add AI greeting to conversation
    const greetingMessage: ConversationMessage = {
      id: Date.now().toString(),
      speaker: 'ai',
      text: greeting,
      timestamp: new Date()
    };
    setConversation([greetingMessage]);

    // Automatically start listening after greeting
    setTimeout(() => {
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    }, 1000); // Wait 1 second after greeting to start listening
  };

  // End the call
  const endCall = () => {
    setIsCallActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    setError(null);

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
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }

    // Show session summary before redirecting
    setShowSessionSummary(true);
  };

  // Handle session summary close
  const handleSessionSummaryClose = () => {
    setShowSessionSummary(false);
    setCallDuration(0);
    setConversation([]);
    onEndCall();
  };

  // Auto-redirect after showing summary
  useEffect(() => {
    if (showSessionSummary) {
      const timer = setTimeout(() => {
        handleSessionSummaryClose();
      }, 3000); // Show summary for 3 seconds then auto-redirect

      return () => clearTimeout(timer);
    }
  }, [showSessionSummary, handleSessionSummaryClose]);

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

  // Get persona-specific greeting
  const getPersonaGreeting = (persona: Persona): string => {
    const greetings = {
      sarah: "Hello?",
      robert: "Hello, this is Robert Chen. I received your request for insurance information. I'd like to understand your business needs better. What specific coverage are you looking for?",
      linda: "Hi there, this is Linda. I'm calling about your insurance quote. I understand budget is important, so I want to make sure we find the right coverage for your family. What's your biggest concern right now?"
    };
    return greetings[persona.id as keyof typeof greetings] || greetings.sarah;
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
          
          <button
            onClick={startCall}
            className="bg-green-600 hover:bg-green-700 text-white px-12 py-4 rounded-full text-xl font-semibold transition-colors flex items-center gap-3 mx-auto"
          >
            <Phone className="w-6 h-6" />
            Start Call
          </button>
          
          <p className="text-gray-500 mt-4">Click to begin your practice session</p>
        </div>
      </div>
    );
  }

  // Show session summary
  if (showSessionSummary) {
    const userMessages = conversation.filter(msg => msg.speaker === 'user').length;
    const aiMessages = conversation.filter(msg => msg.speaker === 'ai').length;
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 text-2xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Complete!</h2>
            <p className="text-gray-600">Great practice with {persona.name}</p>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Call Duration:</span>
              <span className="font-semibold">{formatDuration(callDuration)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Your Responses:</span>
              <span className="font-semibold">{userMessages}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Customer Responses:</span>
              <span className="font-semibold">{aiMessages}</span>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              Returning to practice screen in a few seconds...
            </p>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
            </div>
          </div>
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
          <p className="text-green-100 text-sm">{persona.type}</p>
          
          {/* Call Status */}
          <div className="mt-4">
            {isSpeaking && (
              <div className="flex items-center justify-center gap-2 text-green-100">
                <div className="w-2 h-2 bg-green-100 rounded-full animate-pulse"></div>
                <span className="text-sm">Speaking...</span>
              </div>
            )}
            {isListening && (
              <div className="flex items-center justify-center gap-2 text-green-100">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <Mic className="w-4 h-4" />
                <span className="text-sm">Listening...</span>
              </div>
            )}
            {!isSpeaking && !isListening && (
              <div className="text-green-100 text-sm">Ready to listen</div>
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
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-100 ${
                    audioLevel > (i + 1) * 0.125 ? 'bg-red-500' : 'bg-gray-300'
                  }`}
                  style={{ 
                    height: `${(i + 1) * 6}px`,
                    opacity: audioLevel > (i + 1) * 0.125 ? 1 : 0.3
                  }}
                />
              ))}
            </div>
          )}

          {/* Microphone Status */}
          {isListening && (
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-3 py-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-700 text-sm font-medium">
                  {audioLevel > 0.1 ? 'Microphone active' : 'Waiting for speech...'}
                </span>
              </div>
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
            {isSpeaking ? "AI customer is speaking..." : 
             isListening ? "Speak naturally..." : 
             "Call in progress..."}
          </div>
        </div>
      </div>
    </div>
  );
} 