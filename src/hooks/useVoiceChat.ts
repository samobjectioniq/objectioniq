'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { splitIntoSentences } from '@/lib/audio';

interface UseVoiceChatProps {
  persona: {
    name: string;
    voiceId: string;
    systemPrompt: string;
  };
  onError: (error: string) => void;
}

interface ConversationMessage {
  id: string;
  speaker: 'user' | 'ai';
  text: string;
  timestamp: Date;
  audioUrl?: string;
}

export default function useVoiceChat({ persona, onError }: UseVoiceChatProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [currentResponse, setCurrentResponse] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);

  // Audio refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const conversationHistoryRef = useRef<any[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const processUserSpeechRef = useRef<((audioBlob: Blob) => Promise<void>) | null>(null);

  // Get AI response with streaming
  const getAIResponse = useCallback(async (userMessage: string) => {
    try {
      console.log('🧠 Getting AI response...');
      setCurrentResponse('');
      
      const response = await fetch('/api/voice/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: conversationHistoryRef.current,
          persona: persona,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let fullResponse = '';
      let currentSentence = '';
      const sentenceQueue: string[] = [];
      let isProcessingSentence = false;

      // Process streaming response
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.choices?.[0]?.delta?.content) {
                const content = parsed.choices[0].delta.content;
                fullResponse += content;
                currentSentence += content;
                setCurrentResponse(fullResponse);

                // Check if we have a complete sentence
                const sentences = splitIntoSentences(currentSentence);
                if (sentences.length > 1) {
                  // We have a complete sentence
                  const completeSentence = sentences[0];
                  sentenceQueue.push(completeSentence);
                  currentSentence = sentences.slice(1).join(' ');
                  
                  // Process sentence queue
                  if (!isProcessingSentence) {
                    processSentenceQueue(sentenceQueue);
                  }
                }
              }
            } catch (e) {
              // Ignore parsing errors for partial chunks
            }
          }
        }
      }

      // Process any remaining text
      if (currentSentence.trim()) {
        sentenceQueue.push(currentSentence.trim());
        if (!isProcessingSentence) {
          processSentenceQueue(sentenceQueue);
        }
      }

      // Add AI response to conversation
      const aiMessage: ConversationMessage = {
        id: Date.now().toString(),
        speaker: 'ai',
        text: fullResponse,
        timestamp: new Date(),
      };
      
      setConversation(prev => [...prev, aiMessage]);
      conversationHistoryRef.current.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: fullResponse }
      );

      setCurrentResponse('');

      console.log('🧠 AI response complete:', fullResponse);

    } catch (error: any) {
      console.error('❌ Get AI response error:', error);
      onError(`Failed to get AI response: ${error.message}`);
    }
  }, [persona, onError, processSentenceQueue]);

  // Initialize audio context and microphone
  const initializeAudio = useCallback(async () => {
    try {
      console.log('🎙️ Initializing audio...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 24000,
        } 
      });

      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      const audioContext = audioContextRef.current;

      analyserRef.current = audioContext.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;

      microphoneRef.current = audioContext.createMediaStreamSource(stream);
      microphoneRef.current.connect(analyserRef.current);

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
        
        if (audioBlob.size > 0 && processUserSpeechRef.current) {
          await processUserSpeechRef.current(audioBlob);
        }
      };

      console.log('✅ Audio initialized successfully');
      return true;

    } catch (error: any) {
      console.error('❌ Audio initialization error:', error);
      onError(`Microphone access failed: ${error.message}`);
      return false;
    }
  }, [onError]);

  // Process user speech through the full pipeline
  const processUserSpeech = useCallback(async (audioBlob: Blob) => {
    try {
      setIsProcessing(true);
      setIsListening(false);
      
      console.log('🎤 Processing user speech...');

      // Step 1: Speech to Text (Whisper)
      const response = await fetch('/api/voice/speech-to-text', {
        method: 'POST',
        body: audioBlob,
      });

      if (!response.ok) {
        throw new Error('Failed to transcribe speech');
      }

      const { transcript } = await response.json();
      
      if (!transcript || transcript.trim().length === 0) {
        console.log('No speech detected');
        setIsProcessing(false);
        setIsListening(true);
        return;
      }

      // Add user message to conversation
      const userMessage: ConversationMessage = {
        id: Date.now().toString(),
        speaker: 'user',
        text: transcript,
        timestamp: new Date(),
      };
      
      setConversation(prev => [...prev, userMessage]);

      // Step 2: Get AI response (GPT-4o streaming)
      await getAIResponse(transcript);

    } catch (error: any) {
      console.error('❌ Process user speech error:', error);
      onError(`Failed to process speech: ${error.message}`);
    } finally {
      setIsProcessing(false);
      setIsListening(true);
    }
  }, [onError, getAIResponse]);

  // Assign processUserSpeech to ref
  useEffect(() => {
    processUserSpeechRef.current = processUserSpeech;
  }, [processUserSpeech]);

  // Monitor audio levels
  const updateAudioLevel = useCallback(() => {
    if (analyserRef.current && isListening) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      setAudioLevel(average / 255);
      
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    }
  }, [isListening]);





  // Process sentence queue for TTS
  const processSentenceQueue = useCallback(async (queue: string[]) => {
    if (queue.length === 0) return;
    
    const sentence = queue.shift()!;
    if (!sentence.trim()) return;

    try {
      setIsSpeaking(true);
      
      console.log('🔊 Converting sentence to speech:', sentence);
      
      // Convert sentence to speech
      const audioResponse = await fetch('/api/voice/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sentence,
          voiceId: persona.voiceId,
        }),
      });

      if (!audioResponse.ok) {
        throw new Error('Failed to convert text to speech');
      }

      const audioBlob = await audioResponse.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Play audio
      const audio = new Audio(audioUrl);
      await audio.play();
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setIsSpeaking(false);
        
        // Process next sentence if available
        if (queue.length > 0) {
          processSentenceQueue(queue);
        }
      };

    } catch (error: any) {
      console.error('❌ Process sentence error:', error);
      setIsSpeaking(false);
      
      // Continue with next sentence
      if (queue.length > 0) {
        processSentenceQueue(queue);
      }
    }
  }, [persona.voiceId]);

  // Start listening
  const startListening = useCallback(async () => {
    try {
      const audioReady = await initializeAudio();
      if (!audioReady) return;

      setIsListening(true);
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
        mediaRecorderRef.current.start();
      }
      
      updateAudioLevel();
      
    } catch (error: any) {
      console.error('❌ Start listening error:', error);
      onError(`Failed to start listening: ${error.message}`);
    }
  }, [initializeAudio, updateAudioLevel, onError]);

  // Stop listening
  const stopListening = useCallback(() => {
    setIsListening(false);
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    isListening,
    isProcessing,
    isSpeaking,
    conversation,
    currentResponse,
    audioLevel,
    startListening,
    stopListening,
  };
} 