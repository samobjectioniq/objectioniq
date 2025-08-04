'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseRealtimeWebSocketProps {
  sessionId: string;
  onMessage: (message: any) => void;
  onError: (error: string) => void;
  onClose: () => void;
}

export default function useRealtimeWebSocket({ sessionId, onMessage, onError, onClose }: UseRealtimeWebSocketProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] => useState(false);
  const mounted = useRef(false);
  const conversationHistory = useRef<any[]>([]);

  const connect = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    try {
      setIsConnecting(true);
      console.log('🎙️ Connecting to OpenAI streaming API...');

      const response = await fetch('/api/realtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_websocket_url',
          sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get streaming URL: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get streaming URL');
      }

      console.log('✅ Connected to OpenAI streaming API');
      if (mounted.current) {
        setIsConnected(true);
        setIsConnecting(false);
      }

    } catch (error: any) {
      console.error('❌ Connection error:', error);
      if (mounted.current) {
        onError(`Connection failed: ${error.message}`);
        setIsConnecting(false);
      }
    }
  }, [sessionId, onError]);

  // Send text message using streaming API
  const sendText = useCallback(async (text: string) => {
    if (!isConnected) {
      console.warn('⚠️ Not connected, cannot send text');
      return;
    }

    try {
      console.log('🎙️ Sending text message:', text);
      
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
                
                // Send partial response to UI
                onMessage({
                  type: 'text',
                  content: content,
                  isPartial: true,
                });
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

      // Send complete response
      onMessage({
        type: 'text',
        content: fullResponse,
        isComplete: true,
      });

      console.log('🎙️ Received complete response:', fullResponse);

    } catch (error: any) {
      console.error('❌ Send text error:', error);
      onError(`Failed to send message: ${error.message}`);
    }
  }, [isConnected, onMessage, onError]);

  // Send audio data (placeholder for future implementation)
  const sendAudio = useCallback((audioData: ArrayBuffer) => {
    console.warn('⚠️ Audio sending not yet implemented');
    // TODO: Implement audio processing and speech-to-text
  }, []);

  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting from streaming API...');
    setIsConnected(false);
    setIsConnecting(false);
    conversationHistory.current = [];
  }, []);

  useEffect(() => {
    mounted.current = true;
    connect();
    
    return () => {
      mounted.current = false;
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    isConnecting,
    sendAudio,
    sendText,
    disconnect,
  };
} 