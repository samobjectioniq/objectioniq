'use client';

import { useState, useEffect, Suspense } from 'react';
import { ArrowLeft, Phone, PhoneOff, Mic, MicOff } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';
import { Persona } from '@/types/persona';

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
  const [isCallActive, setIsCallActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const personaId = searchParams.get('persona');
    if (personaId) {
      const persona = personas.find(p => p.id === personaId);
      if (persona) {
        setSelectedPersona(persona);
      }
    }
  }, [searchParams]);

  const startCall = () => {
    setIsCallActive(true);
    setError(null);
    // Start call timer
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    // Simulate AI greeting after 1 second
    setTimeout(() => {
      setIsSpeaking(true);
      // Simulate speaking for 3 seconds
      setTimeout(() => {
        setIsSpeaking(false);
        setIsListening(true);
      }, 3000);
    }, 1000);
  };

  const endCall = () => {
    setIsCallActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    setCallDuration(0);
    setError(null);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
              <Phone className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No customer selected</h2>
            <p className="text-gray-600 mb-8">Please select a customer to practice with.</p>
            <Link 
              href="/dashboard" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
            >
              <Phone className="w-5 h-5" />
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
            {isCallActive && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{formatDuration(callDuration)}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!isCallActive ? (
          /* Pre-Call Screen */
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

            {/* Start Call Button */}
            <button
              onClick={startCall}
              className="bg-green-600 hover:bg-green-700 text-white px-12 py-4 rounded-full text-xl font-semibold transition-colors flex items-center gap-3 mx-auto"
            >
              <Phone className="w-6 h-6" />
              Start Call
            </button>

            <p className="text-gray-500 mt-4">Click to begin your practice session</p>
          </div>
        ) : (
          /* Active Call Screen */
          <div className="text-center">
            {/* Call Interface */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-blue-600 text-4xl font-bold">{selectedPersona.avatar}</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedPersona.name}</h2>
              
              {/* Call Status */}
              <div className="mb-6">
                {isSpeaking && (
                  <div className="flex items-center justify-center gap-2 text-blue-600">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    <span className="font-medium">Speaking...</span>
                  </div>
                )}
                {isListening && (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <Mic className="w-4 h-4" />
                    <span className="font-medium">Listening...</span>
                  </div>
                )}
                {!isSpeaking && !isListening && (
                  <div className="text-gray-500">
                    <span>Call Active</span>
                  </div>
                )}
              </div>

              {/* Call Duration */}
              <div className="text-3xl font-mono text-gray-900 mb-6">
                {formatDuration(callDuration)}
              </div>

              {/* End Call Button */}
              <button
                onClick={endCall}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 mx-auto"
              >
                <PhoneOff className="w-5 h-5" />
                End Call
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            <p className="text-gray-500">
              {isSpeaking ? "AI customer is speaking..." : 
               isListening ? "Speak now..." : 
               "Call in progress..."}
            </p>
          </div>
        )}
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