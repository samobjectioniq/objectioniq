'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, RotateCcw, Save, Download, Keyboard } from 'lucide-react';
import { Persona, SessionStats, ConversationMessage } from '@/types/persona';
import VoiceCall from './VoiceCall';
import { useToast } from '@/contexts/ToastContext';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { playSuccess, playError, playSessionComplete } from '@/utils/soundEffects';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface VoiceInterfaceProps {
  persona: Persona;
  onSessionUpdate: (stats: SessionStats) => void;
  onEndSession: () => void;
  onConversationUpdate?: (conversation: ConversationMessage[]) => void;
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

  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Start session timer
  useEffect(() => {
    sessionTimerRef.current = setInterval(() => {
      setSessionStats(prev => ({
        ...prev,
        duration: prev.duration + 1
      }));
    }, 1000);

    // Initialize conversation with customer greeting
    const initialMessage: ConversationMessage = {
      id: '1',
      speaker: 'customer',
      content: generateCustomerGreeting(persona),
      timestamp: new Date()
    };
    setConversation([initialMessage]);

    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    };
  }, [persona]);

  // Update parent component with session stats
  useEffect(() => {
    onSessionUpdate(sessionStats);
  }, [sessionStats, onSessionUpdate]);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'r',
      ctrl: true,
      action: () => {
        resetSession();
        showInfo('Session Reset', 'Training session has been reset');
      },
      description: 'Reset session'
    },
    {
      key: 's',
      ctrl: true,
      action: () => {
        exportConversation();
      },
      description: 'Save conversation'
    },
    {
      key: '?',
      action: () => setShowShortcuts(!showShortcuts),
      description: 'Show shortcuts'
    }
  ]);

  // Update parent component with conversation history
  useEffect(() => {
    if (onConversationUpdate) {
      onConversationUpdate(conversation);
    }
  }, [conversation, onConversationUpdate]);

  const generateCustomerGreeting = (persona: Persona): string => {
    const greetings = {
      sarah: "Hi, I'm Sarah. I'm looking for insurance but honestly, I'm pretty busy and not sure I need this right now. What can you tell me?",
      'mike-jennifer': "Hello, we're Mike and Jennifer. We have two kids and want to make sure we have the right coverage. We've been doing some research but it's overwhelming.",
      robert: "Good afternoon. I've been with my current insurance company for 15 years. They've been good to me, but I'm curious what you have to offer. What makes you different?"
    };
    return greetings[persona.id as keyof typeof greetings] || "Hello, I'm interested in learning about insurance options.";
  };

  const handleAgentResponse = async (transcript: string) => {
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
  };

  const generateCustomerResponse = async (agentResponse: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          persona: persona,
          agentResponse: agentResponse,
          conversationHistory: conversation
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const customerMessage: ConversationMessage = {
          id: (Date.now() + 1).toString(),
          speaker: 'customer',
          content: data.response,
          timestamp: new Date()
        };

        setConversation(prev => [...prev, customerMessage]);
        
        // Speak the response using the VoiceCall component
        if (typeof window !== 'undefined' && (window as any).speakText) {
          (window as any).speakText(data.response);
        }
        
        // Update stats
        setSessionStats(prev => ({
          ...prev,
          objectionsHandled: prev.objectionsHandled + (data.response.toLowerCase().includes('objection') ? 1 : 0),
          confidenceScore: Math.min(100, prev.confidenceScore + 5)
        }));

        // Show success feedback
        showSuccess('Response Generated', `${persona.name} responded to your message`);
        playSuccess();
      } else {
        throw new Error('Failed to generate response');
      }
    } catch (error) {
      console.error('Error generating customer response:', error);
      showError('Response Failed', 'Unable to generate customer response. Please try again.');
      playError();
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentInput.trim()) {
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
    
    // Restart with new greeting
    const initialMessage: ConversationMessage = {
      id: '1',
      speaker: 'customer',
      content: generateCustomerGreeting(persona),
      timestamp: new Date()
    };
    setConversation([initialMessage]);
  };

  const exportConversation = () => {
    try {
      const data = {
        persona: persona.name,
        date: new Date().toISOString(),
        duration: sessionStats.duration,
        conversation: conversation,
        stats: sessionStats
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation-${persona.name}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showSuccess('Conversation Exported', 'Your conversation has been saved');
      playSuccess();
    } catch (error) {
      showError('Export Failed', 'Unable to export conversation');
      playError();
    }
  };

  const handleCallEnd = () => {
    onEndSession();
  };

  return (
    <div className="space-y-6">
      {/* Voice Call Interface */}
      <VoiceCall 
        persona={persona}
        onAgentResponse={handleAgentResponse}
        onCustomerResponse={(response) => {
          const customerMessage: ConversationMessage = {
            id: Date.now().toString(),
            speaker: 'customer',
            content: response,
            timestamp: new Date()
          };
          setConversation(prev => [...prev, customerMessage]);
        }}
        onCallEnd={handleCallEnd}
      />

      {/* Conversation Display */}
      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 h-64 sm:h-96 overflow-y-auto" data-conversation="display">
        <div className="space-y-3 sm:space-y-4">
          {conversation.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.speaker === 'agent' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-lg ${
                  message.speaker === 'agent'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}
              >
                <div className="text-xs sm:text-sm font-medium mb-1">
                  {message.speaker === 'agent' ? 'You' : persona.name}
                </div>
                <div className="text-xs sm:text-sm">{message.content}</div>
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Text Input Fallback */}
      <form onSubmit={handleTextSubmit} className="flex gap-2">
        <input
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          placeholder="Type your response here..."
          className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          disabled={isLoading}
        />
        <Button
          type="submit"
          disabled={!currentInput.trim() || isLoading}
          loading={isLoading}
          icon={<Send className="w-4 h-4" />}
        >
          Send
        </Button>
      </form>

      {/* Session Controls */}
      <div className="flex items-center justify-center gap-4" data-session="controls">
        <Button
          onClick={resetSession}
          variant="outline"
          icon={<RotateCcw className="w-4 h-4" />}
        >
          Reset Session
        </Button>
        
        <Button
          onClick={exportConversation}
          variant="outline"
          icon={<Download className="w-4 h-4" />}
          disabled={conversation.length === 0}
        >
          Export
        </Button>
        
        <Button
          onClick={() => setShowShortcuts(!showShortcuts)}
          variant="ghost"
          icon={<Keyboard className="w-4 h-4" />}
        >
          Shortcuts
        </Button>
      </div>

      {/* Keyboard Shortcuts Help */}
      {showShortcuts && (
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              Keyboard Shortcuts
            </h3>
            <button
              onClick={() => setShowShortcuts(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Reset Session:</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-700">Ctrl+R</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Export Conversation:</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-700">Ctrl+S</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Show Help:</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-700">?</kbd>
            </div>
          </div>
        </div>
      )}

      {/* Session Info */}
      <div className="text-center text-sm text-gray-600" data-session="info">
        <p>Training with {persona.name} - {persona.type}</p>
        <p>Session duration: {Math.floor(sessionStats.duration / 60)}:{(sessionStats.duration % 60).toString().padStart(2, '0')}</p>
      </div>
    </div>
  );
} 