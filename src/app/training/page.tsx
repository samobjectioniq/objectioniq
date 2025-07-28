'use client';

import { useState, useEffect, Suspense } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';
import { Persona } from '@/types/persona';
import VoiceTraining from '@/components/VoiceTraining';

const personas: Persona[] = [
  {
    id: 'sarah',
    name: 'Sarah Mitchell',
    age: 28,
    type: 'Young Professional',
    description: 'Price-conscious tech worker',
    characteristics: ['Price-conscious', 'Time-pressed', 'Skeptical'],
    color: 'blue',
    avatar: 'SM'
  },
  {
    id: 'robert',
    name: 'Robert Chen',
    age: 45,
    type: 'Small Business Owner',
    description: 'Detail-oriented entrepreneur',
    characteristics: ['Detail-oriented', 'Risk-averse', 'Relationship-focused'],
    color: 'green',
    avatar: 'RC'
  },
  {
    id: 'linda',
    name: 'Linda Rodriguez',
    age: 32,
    type: 'Budget-Conscious Teacher',
    description: 'Family-focused educator',
    characteristics: ['Budget-focused', 'Family-oriented', 'Value-conscious'],
    color: 'purple',
    avatar: 'LR'
  }
];

function TrainingContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [showVoiceTraining, setShowVoiceTraining] = useState(false);

  useEffect(() => {
    const personaId = searchParams.get('persona');
    if (personaId) {
      const persona = personas.find(p => p.id === personaId);
      if (persona) {
        setSelectedPersona(persona);
      }
    }
  }, [searchParams]);

  const handleEndCall = () => {
    setShowVoiceTraining(false);
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

  if (!selectedPersona) {
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
              <span className="text-gray-400 text-3xl">?</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No customer selected</h2>
            <p className="text-gray-600 mb-8">Please select a customer to practice with.</p>
            <Link 
              href="/dashboard" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
            >
              Choose Customer
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Show voice training interface
  if (showVoiceTraining) {
    return (
      <VoiceTraining 
        persona={selectedPersona} 
        onEndCall={handleEndCall}
      />
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-blue-600 text-3xl font-bold">{selectedPersona.avatar}</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedPersona.name}</h2>
            <p className="text-gray-600 mb-4">{selectedPersona.type}</p>
            <p className="text-gray-500">{selectedPersona.description}</p>
          </div>

          {/* Voice Training Info */}
          <div className="bg-blue-50 rounded-xl p-6 mb-8 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Real Voice Training</h3>
            <p className="text-blue-700 mb-4">
              Practice with realistic voice conversations using advanced AI technology. 
              Speak naturally and receive AI responses in real-time.
            </p>
            <div className="text-sm text-blue-600 space-y-1">
              <p>• Real speech recognition</p>
              <p>• Natural AI voice responses</p>
              <p>• iPhone-style call interface</p>
              <p>• Professional objection scenarios</p>
            </div>
          </div>

          {/* Start Call Button */}
          <button
            onClick={() => setShowVoiceTraining(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-12 py-4 rounded-full text-xl font-semibold transition-colors flex items-center gap-3 mx-auto"
          >
            Start Voice Call
          </button>

          <p className="text-gray-500 mt-4">Click to begin your realistic voice practice session</p>
        </div>
      </main>
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