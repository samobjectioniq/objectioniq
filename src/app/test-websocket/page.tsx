'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// Simplified streaming hook for testing
function useSimpleStreaming() {
  const [messages, setMessages] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentResponse, setCurrentResponse] = useState('');
  const mounted = useRef(false);
  const conversationHistory = useRef<any[]>([]);

  const connect = useCallback(async () => {
    if (typeof window === 'undefined') return;

    try {
      setConnecting(true);
      setError(null);
      console.log('🎙️ Connecting to OpenAI streaming API...');

      // Get streaming endpoint from our API
      const response = await fetch('/api/realtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_websocket_url',
          sessionId: 'test-session-' + Math.random().toString(36).substr(2, 9),
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
        setConnected(true);
        setConnecting(false);
        setMessages(prev => [...prev, 'Connected to streaming API']);
      }

    } catch (error: any) {
      console.error('❌ Connection error:', error);
      if (mounted.current) {
        setError(`Connection failed: ${error.message}`);
        setConnecting(false);
      }
    }
  }, []);

  const sendMessage = useCallback(async (message: string) => {
    if (!connected) {
      setError('Not connected to streaming API');
      return;
    }

    try {
      console.log('🎙️ Sending message:', message);
      setMessages(prev => [...prev, `Sent: ${message}`]);
      setCurrentResponse('');
      
      const response = await fetch('/api/realtime/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
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
        { role: 'user', content: message },
        { role: 'assistant', content: fullResponse }
      );

      setMessages(prev => [...prev, `Received: ${fullResponse}`]);
      setCurrentResponse('');

      console.log('🎙️ Received complete response:', fullResponse);

    } catch (error: any) {
      console.error('❌ Send message error:', error);
      setError(`Failed to send message: ${error.message}`);
    }
  }, [connected]);

  const disconnect = useCallback(() => {
    setConnected(false);
    setConnecting(false);
    setCurrentResponse('');
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

  return { messages, connected, connecting, error, sendMessage, disconnect, currentResponse };
}

export default function TestWebSocket() {
  const [isClient, setIsClient] = useState(false);
  const { messages, connected, connecting, error, sendMessage, disconnect, currentResponse } = useSimpleStreaming();

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  const sendSampleMessage = () => {
    sendMessage("Hello, I'm calling about the insurance quote I requested online.");
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">GPT-4o Streaming API Test</h1>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="mt-4">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">GPT-4o Streaming API Test</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Connection Status */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : connecting ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                <span>Status: {connecting ? 'Connecting...' : connected ? 'Connected' : 'Disconnected'}</span>
              </div>
              
              {error && (
                <div className="text-red-400 text-sm">
                  Error: {error}
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={disconnect}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </div>

          {/* Message Testing */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Send Test Message</h2>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={sendSampleMessage}
                  disabled={!connected}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded"
                >
                  Send Sample
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Current Response */}
        {currentResponse && (
          <div className="mt-8 bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Current Response (Streaming)</h2>
            <div className="bg-gray-900 p-4 rounded">
              <div className="text-sm font-mono">
                {currentResponse}
                <span className="animate-pulse">|</span>
              </div>
            </div>
          </div>
        )}

        {/* Message Log */}
        <div className="mt-8 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Message Log</h2>
          
          <div className="bg-gray-900 p-4 rounded max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-gray-400">No messages yet...</div>
            ) : (
              <div className="space-y-2">
                {messages.map((message, index) => (
                  <div key={index} className="text-sm font-mono">
                    {message}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm"
          >
            Clear & Restart
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-900 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Test Instructions</h2>
          <div className="space-y-2 text-sm">
            <p>1. Wait for streaming API connection to establish (green status)</p>
            <p>2. Try sending a sample message using the &quot;Send Sample&quot; button</p>
            <p>3. Watch the current response area for real-time streaming</p>
            <p>4. Check the message log for complete conversation history</p>
            <p>5. Check browser console for detailed API communication</p>
          </div>
        </div>
      </div>
    </div>
  );
} 