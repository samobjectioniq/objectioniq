'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, RotateCcw } from 'lucide-react';

interface RealtimeVoiceTrainingProps {
  persona: {
    id: string;
    name: string;
    age: number;
    type: string;
    characteristics: string[];
    description: string;
  };
  onEndCall: () => void;
}

interface ConversationMessage {
  id: string;
  speaker: 'user' | 'ai';
  text: string;
  timestamp: Date;
  audioData?: string;
}

export default function RealtimeVoiceTraining({ persona, onEndCall }: RealtimeVoiceTrainingProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [sessionId, setSessionId] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [currentResponse, setCurrentResponse] = useState('');

  // Audio refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const conversationHistory = useRef<any[]>([]);
  const processAudioInputRef = useRef<((audioBlob: Blob) => Promise<void>) | null>(null);
  const updateAudioLevelRef = useRef<(() => void) | null>(null);

  // Generate unique session ID
  useEffect(() => {
    setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  }, []);

  // Initialize audio context and microphone
  const initializeAudio = useCallback(async () => {
    try {
      console.log('🎙️ Initializing audio...');
      
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 24000,
        } 
      });

      // Create audio context
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      const audioContext = audioContextRef.current;

      // Create analyser for audio level monitoring
      analyserRef.current = audioContext.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;

      // Connect microphone to analyser
      microphoneRef.current = audioContext.createMediaStreamSource(stream);
      microphoneRef.current.connect(analyserRef.current);

      // Set up MediaRecorder for audio capture
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];
        
        if (audioBlob.size > 0 && processAudioInputRef.current) {
          await processAudioInputRef.current(audioBlob);
        }
      };

      // Start audio level monitoring
      if (updateAudioLevelRef.current) {
        updateAudioLevelRef.current();
      }

      console.log('✅ Audio initialized successfully');
      return true;

    } catch (error: any) {
      console.error('❌ Audio initialization error:', error);
      setError(`Microphone access failed: ${error.message}`);
      return false;
    }
  }, []);

  // Monitor audio levels
  const updateAudioLevel = useCallback(() => {
    if (analyserRef.current && isListening) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      setAudioLevel(average / 255);
      
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    }
  }, [isListening, setAudioLevel]);

  // Process audio input (placeholder - would need speech-to-text)
  const processAudioInput = useCallback(async (audioBlob: Blob) => {
    try {
      setIsListening(false);
      setIsSpeaking(true);
      
      console.log('🎙️ Processing audio input...');
      
      // For now, we'll use a placeholder text input
      // In a real implementation, this would use speech-to-text
      const placeholderText = "Hello, I'm calling about the insurance quote I requested online.";
      
      // Add user message to conversation
      const userMessage: ConversationMessage = {
        id: Date.now().toString(),
        speaker: 'user',
        text: placeholderText,
        timestamp: new Date(),
      };
      
      setConversation(prev => [...prev, userMessage]);
      
      // Send to streaming API
      await sendTextMessage(placeholderText);
      
    } catch (error: any) {
      console.error('❌ Process audio error:', error);
      setError(`Failed to process audio: ${error.message}`);
    } finally {
      setIsSpeaking(false);
      setIsListening(true);
    }
  }, [sendTextMessage]);

  // Assign functions to refs
  useEffect(() => {
    processAudioInputRef.current = processAudioInput;
    updateAudioLevelRef.current = updateAudioLevel;
  }, [processAudioInput, updateAudioLevel]);



  // Send text message using streaming API
  const sendTextMessage = async (text: string) => {
    try {
      console.log('🎙️ Sending text message:', text);
      setCurrentResponse('');
      
      const response = await fetch('/api/realtime/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationHistory: conversationHistory.current,
        }),
      });

      if (!response.ok) {
        throw new Error(`Streaming API error: ${response.statusText}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let fullResponse = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        // Parse streaming response
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              // Stream complete
              break;
            }
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.choices?.[0]?.delta?.content) {
                const content = parsed.choices[0].delta.content;
                fullResponse += content;
                setCurrentResponse(fullResponse);
              }
            } catch (e) {
              // Ignore parsing errors for partial chunks
            }
          }
        }
      }

      // Add to conversation history
      conversationHistory.current.push(
        { role: 'user', content: text },
        { role: 'assistant', content: fullResponse }
      );

      // Add AI response to conversation
      const aiMessage: ConversationMessage = {
        id: Date.now().toString(),
        speaker: 'ai',
        text: fullResponse,
        timestamp: new Date(),
      };
      
      setConversation(prev => [...prev, aiMessage]);
      setCurrentResponse('');

      console.log('🎙️ Received complete response:', fullResponse);

    } catch (error: any) {
      console.error('❌ Send text error:', error);
      setError(`Failed to send message: ${error.message}`);
    }
  };

  // Start realtime session
  const startCall = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      setConnectionStatus('connecting');

      console.log('🎙️ Starting streaming call with', persona.name);

      // Initialize audio
      const audioReady = await initializeAudio();
      if (!audioReady) {
        setIsConnecting(false);
        return;
      }

      // Test connection to streaming API
      const response = await fetch('/api/realtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_websocket_url',
          sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to connect to streaming API');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to connect to streaming API');
      }
      
      setIsCallActive(true);
      setConnectionStatus('connected');
      setIsListening(true);
      
      // Start call timer
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      
      console.log('✅ Streaming call started successfully');
      setIsConnecting(false);

    } catch (error: any) {
      console.error('❌ Start call error:', error);
      setError(`Failed to start call: ${error.message}`);
      setConnectionStatus('disconnected');
      setIsConnecting(false);
    }
  };

  // End call
  const endCall = async () => {
    try {
      console.log('🎙️ Ending streaming call...');
      
      // Stop recording and timers
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Clean up audio context
      if (audioContextRef.current) {
        await audioContextRef.current.close();
      }
      
      setIsCallActive(false);
      setIsListening(false);
      setIsSpeaking(false);
      setConnectionStatus('disconnected');
      setCurrentResponse('');
      conversationHistory.current = [];
      
      console.log('✅ Call ended successfully');
      
      // Call parent handler
      onEndCall();
      
    } catch (error: any) {
      console.error('❌ End call error:', error);
      setError(`Failed to end call: ${error.message}`);
    }
  };

  // Toggle microphone
  const toggleMicrophone = () => {
    if (isListening) {
      setIsListening(false);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    } else {
      setIsListening(true);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
        mediaRecorderRef.current.start();
      }
    }
  };

  // Format call duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

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
          <div className="text-center">
            <div className="text-white font-mono text-lg">{formatDuration(callDuration)}</div>
            <div className="text-gray-400 text-xs">Duration</div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' :
              connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-gray-300 text-sm capitalize">{connectionStatus}</span>
          </div>
        </div>
      </div>

      {/* Main Call Interface */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Persona Photo */}
        <div className="mb-8">
          <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white font-bold text-4xl">{persona.name.charAt(0)}</span>
          </div>
          <h2 className="text-white text-2xl font-bold text-center">{persona.name}</h2>
          <p className="text-gray-400 text-center">{persona.description}</p>
        </div>

        {/* Call Status */}
        <div className="mb-8 text-center">
          {isConnecting && (
            <div className="text-yellow-400 text-lg">Connecting to {persona.name}...</div>
          )}
          {isCallActive && isListening && (
            <div className="text-green-400 text-lg">Listening to you...</div>
          )}
          {isCallActive && isSpeaking && (
            <div className="text-blue-400 text-lg">{persona.name} is speaking...</div>
          )}
          {error && (
            <div className="text-red-400 text-lg">{error}</div>
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
              disabled={isConnecting}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white p-4 rounded-full transition-colors"
            >
              <Phone className="w-8 h-8" />
            </button>
          ) : (
            <>
              <button
                onClick={toggleMicrophone}
                disabled={isSpeaking}
                className={`p-4 rounded-full transition-colors ${
                  isListening 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
                }`}
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
      </div>
    </div>
  );
}