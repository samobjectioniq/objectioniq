'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
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
      id: 'sarah',
      name: 'Sarah',
      age: 28,
      type: 'Young Professional',
      description: 'Price-sensitive tech professional with a busy lifestyle',
      characteristics: ['Price-conscious', 'Time-pressed', 'Tech-savvy', 'Skeptical of sales pitches'],
      color: 'blue',
      avatar: 'S'
    },
    {
      id: 'mike-jennifer',
      name: 'Mike & Jennifer',
      age: 35,
      type: 'Family Focused',
      description: 'Safety-conscious parents who want comprehensive coverage',
      characteristics: ['Safety-focused', 'Detail-oriented', 'Family priorities', 'Research-driven'],
      color: 'green',
      avatar: 'M&J'
    },
    {
      id: 'robert',
      name: 'Robert',
      age: 67,
      type: 'Skeptical Retiree',
      description: 'Loyal to current provider but open to better value',
      characteristics: ['Provider-loyal', 'Question-heavy', 'Value-focused', 'Experience-based'],
      color: 'purple',
      avatar: 'R'
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
          notes: `Training session with ${selectedPersona.name}`
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
              <h1 className="text-xl font-bold text-gray-900">ObjectionIQ Training</h1>
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
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Choose Your Training Partner
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Select a customer persona to practice with. Each persona has unique characteristics 
                and will present different types of objections to help you improve your sales skills.
              </p>
            </div>

            {/* Persona Selection */}
            <PersonaSelector 
              personas={personas} 
              onSelectPersona={startSession} 
            />

            {/* Quick Tips */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Training Tips</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-800">Before You Start:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Find a quiet environment</li>
                    <li>• Allow microphone access</li>
                    <li>• Speak clearly and naturally</li>
                    <li>• Listen to the AI customer&apos;s responses</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-800">During Training:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Address objections directly</li>
                    <li>• Ask clarifying questions</li>
                    <li>• Provide specific examples</li>
                    <li>• Build rapport naturally</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active Session */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-${selectedPersona?.color}-100 rounded-full flex items-center justify-center`}>
                    <span className={`text-xl font-bold text-${selectedPersona?.color}-600`}>
                      {selectedPersona?.avatar}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Training with {selectedPersona?.name}
                    </h2>
                    <p className="text-gray-600">{selectedPersona?.type}</p>
                  </div>
                </div>
                <SessionStats stats={sessionStats} />
              </div>
              
              <VoiceInterface 
                persona={selectedPersona!}
                onSessionUpdate={setSessionStats}
                onEndSession={endSession}
                onConversationUpdate={setConversationHistory}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 