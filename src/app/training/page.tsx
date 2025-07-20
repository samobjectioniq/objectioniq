'use client';

import { useState } from 'react';
import { ArrowLeft, Clock, Target, DollarSign, Shield, Zap } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { sessionService } from '@/lib/database';
import VoiceInterface from '@/components/VoiceInterface';
import PersonaSelector from '@/components/PersonaSelector';
import SessionStats from '@/components/SessionStats';
import { Persona } from '@/types/persona';

export default function TrainingPage() {
  const { user, loading } = useAuth();
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    duration: 0,
    objectionsHandled: 0,
    responsesCount: 0,
    confidenceScore: 0
  });
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);

  const personas: Persona[] = [
    {
      id: 'skeptical-shopper',
      name: 'Skeptical Internet Shopper',
      age: 32,
      type: 'Price Comparison',
      description: 'Filled out a lead form but wasn\'t serious. Just wanted to see what\'s out there.',
      characteristics: ['Price-focused', 'Not serious', 'Comparison shopping', 'Time-waster'],
      color: 'red',
      avatar: 'S',
      objections: [
        "I was just comparing prices online",
        "I'm not really looking to buy right now",
        "I was just curious about rates",
        "Can you just send me a quote?"
      ]
    },
    {
      id: 'busy-professional',
      name: 'Busy Professional',
      age: 28,
      type: 'Interrupted',
      description: 'Annoyed by the sales call interruption. Wants you to get to the point quickly.',
      characteristics: ['Time-pressed', 'Interrupted', 'Direct', 'Impatient'],
      color: 'orange',
      avatar: 'B',
      objections: [
        "I'm in a meeting right now",
        "I don't have time for this",
        "Can you just get to the point?",
        "I'm not interested"
      ]
    },
    {
      id: 'price-hunter',
      name: 'Price-Focused Bargain Hunter',
      age: 45,
      type: 'Cost Obsessed',
      description: 'Only cares about cost. Will compare every quote and demand the lowest price.',
      characteristics: ['Price-obsessed', 'Comparison-driven', 'Value-blind', 'Aggressive negotiator'],
      color: 'purple',
      avatar: 'P',
      objections: [
        "What's your best price?",
        "I can get it cheaper elsewhere",
        "That's too expensive",
        "I only care about the bottom line"
      ]
    }
  ];

  const startSession = (persona: Persona) => {
    setSelectedPersona(persona);
    setIsSessionActive(true);
    setSessionStats({
      duration: 0,
      objectionsHandled: 0,
      responsesCount: 0,
      confidenceScore: 0
    });
  };

  const endSession = async () => {
    if (user && selectedPersona && sessionStats.duration > 0) {
      try {
        // Save session to database
        await sessionService.createSession({
          user_id: user.id,
          persona_id: selectedPersona.id,
          persona_name: selectedPersona.name,
          persona_type: selectedPersona.type,
          duration: sessionStats.duration,
          objections_handled: sessionStats.objectionsHandled,
          confidence_score: sessionStats.confidenceScore,
          conversation_history: conversationHistory,
          notes: `Lead conversion training with ${selectedPersona.name}`
        });
      } catch (error) {
        console.error('Error saving session:', error);
      }
    }

    setIsSessionActive(false);
    setSelectedPersona(null);
    setSessionStats({
      duration: 0,
      objectionsHandled: 0,
      responsesCount: 0,
      confidenceScore: 0
    });
    setConversationHistory([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to access training sessions.</p>
          <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-blue-600 hover:text-blue-700 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Lead Conversion Training</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors">
                View Dashboard
              </Link>
            </div>
            {isSessionActive && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Session: {Math.floor(sessionStats.duration / 60)}:{(sessionStats.duration % 60).toString().padStart(2, '0')}
                </span>
                <button
                  onClick={endSession}
                  className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                >
                  End Session
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isSessionActive ? (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Shield className="w-4 h-4" />
                Protect Your Lead Investment
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Practice Before You Dial
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Master real internet lead objections before you waste another $4.50 lead. 
                Choose a scenario to practice with AI customers that mirror your actual expensive leads.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-200">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-6 h-6 text-red-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">$4.50</div>
                <div className="text-sm text-gray-600">Average Lead Cost</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-200">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">85%</div>
                <div className="text-sm text-gray-600">Wasted on Bad Calls</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-200">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">5 min</div>
                <div className="text-sm text-gray-600">Daily Practice</div>
              </div>
            </div>

            {/* Persona Selection */}
            <PersonaSelector 
              personas={personas} 
              onSelectPersona={startSession} 
            />

            {/* Lead-Focused Training Tips */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Conversion Training Tips</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Before You Start:
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Review the lead's objection patterns</li>
                    <li>• Prepare your value proposition</li>
                    <li>• Have appointment-setting scripts ready</li>
                    <li>• Practice your opening hook</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800 flex items-center gap-2">
                    <Target className="w-4 h-4 text-green-600" />
                    During Training:
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Address objections immediately</li>
                    <li>• Focus on value over price</li>
                    <li>• Ask qualifying questions</li>
                    <li>• Practice closing techniques</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Quick Warm-up Sessions */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Quick 5-Minute Warm-ups</h3>
              <p className="text-blue-100 mb-4">
                Need a quick confidence boost before your calling block? Try these focused sessions:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <button className="bg-white/20 hover:bg-white/30 text-white p-4 rounded-lg transition-colors text-left">
                  <div className="font-medium">Price Objections</div>
                  <div className="text-sm text-blue-100">Master "too expensive" responses</div>
                </button>
                <button className="bg-white/20 hover:bg-white/30 text-white p-4 rounded-lg transition-colors text-left">
                  <div className="font-medium">Time Objections</div>
                  <div className="text-sm text-blue-100">Handle "I'm busy" scenarios</div>
                </button>
                <button className="bg-white/20 hover:bg-white/30 text-white p-4 rounded-lg transition-colors text-left">
                  <div className="font-medium">Appointment Setting</div>
                  <div className="text-sm text-blue-100">Practice closing techniques</div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Session Header */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                    selectedPersona?.color === 'red' ? 'bg-red-500' :
                    selectedPersona?.color === 'orange' ? 'bg-orange-500' :
                    'bg-purple-500'
                  }`}>
                    {selectedPersona?.avatar}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedPersona?.name}</h3>
                    <p className="text-sm text-gray-600">{selectedPersona?.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Lead Cost</div>
                  <div className="text-lg font-bold text-red-600">$4.50</div>
                </div>
              </div>
            </div>

            {/* Voice Interface */}
            <VoiceInterface
              persona={selectedPersona!}
              onSessionUpdate={setSessionStats}
              onEndSession={endSession}
              onConversationUpdate={setConversationHistory}
            />

            {/* Session Stats */}
            <SessionStats stats={sessionStats} />
          </div>
        )}
      </div>
    </div>
  );
} 