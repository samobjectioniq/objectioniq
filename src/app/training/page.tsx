'use client';

import { useState, useEffect, Suspense } from 'react';
import { ArrowLeft, Clock, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';
import VoiceInterface from '@/components/VoiceInterface';
import { Persona } from '@/types/persona';

const personas: Persona[] = [
  {
    id: 'sarah',
    name: 'Sarah Mitchell',
    age: 28,
    type: 'Young Professional',
    description: 'Price-conscious tech worker who wants quick solutions',
    characteristics: ['Price-conscious', 'Time-pressed', 'Skeptical'],
    color: 'blue',
    avatar: 'SM'
  },
  {
    id: 'robert',
    name: 'Robert Chen',
    age: 45,
    type: 'Small Business Owner',
    description: 'Detail-oriented entrepreneur who values relationships',
    characteristics: ['Detail-oriented', 'Risk-averse', 'Relationship-focused'],
    color: 'green',
    avatar: 'RC'
  },
  {
    id: 'linda',
    name: 'Linda Rodriguez',
    age: 32,
    type: 'Budget-Conscious Teacher',
    description: 'Family-focused educator on a tight budget',
    characteristics: ['Budget-focused', 'Family-oriented', 'Value-conscious'],
    color: 'purple',
    avatar: 'LR'
  }
];

function TrainingContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    duration: 0,
    objectionsHandled: 0,
    responsesCount: 0,
    confidenceScore: 0
  });

  useEffect(() => {
    const personaId = searchParams.get('persona');
    if (personaId) {
      const persona = personas.find(p => p.id === personaId);
      if (persona) {
        setSelectedPersona(persona);
        setIsSessionActive(true);
      }
    }
  }, [searchParams]);

  const handleSessionUpdate = (stats: any) => {
    setSessionStats(stats);
  };

  const handleEndSession = () => {
    setIsSessionActive(false);
    setSelectedPersona(null);
  };

  const handleConversationUpdate = (conversation: any[]) => {
    // Handle conversation updates if needed
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
          <p className="text-gray-600 mb-6">You need to be signed in to practice.</p>
          <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!selectedPersona || !isSessionActive) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-6">
                <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-xl font-bold text-gray-900">Practice Session</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No customer selected</h2>
            <p className="text-gray-600 mb-8">Please select a customer to practice with.</p>
            <Link 
              href="/dashboard" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
            >
              <MessageSquare className="w-5 h-5" />
              Choose Customer
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Practice with {selectedPersona.name}</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Session Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Voice Interface */}
      <VoiceInterface
        persona={selectedPersona}
        onSessionUpdate={handleSessionUpdate}
        onEndSession={handleEndSession}
        onConversationUpdate={handleConversationUpdate}
      />
    </div>
  );
}

export default function TrainingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading practice session...</p>
        </div>
      </div>
    }>
      <TrainingContent />
    </Suspense>
  );
} 