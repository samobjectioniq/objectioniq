'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import VoiceTraining from '@/components/VoiceTraining';
import { Persona } from '@/types/persona';

const personas: Persona[] = [
  {
    id: 'sarah',
    name: 'Sarah Mitchell',
    age: 28,
    type: 'Young Professional',
    description: '28-year-old Marketing Manager, price-conscious and time-pressed',
    characteristics: ['Price-conscious', 'Time-pressed', 'Skeptical'],
    color: 'blue',
    avatar: 'SM'
  },
  {
    id: 'robert',
    name: 'Robert Chen',
    age: 45,
    type: 'Small Business Owner',
    description: '45-year-old entrepreneur, detail-oriented and risk-averse',
    characteristics: ['Detail-oriented', 'Risk-averse', 'Relationship-focused'],
    color: 'green',
    avatar: 'RC'
  },
  {
    id: 'linda',
    name: 'Linda Rodriguez',
    age: 28,
    type: 'Budget-Conscious Teacher',
    description: '28-year-old teacher, family-oriented and budget-focused',
    characteristics: ['Budget-focused', 'Family-oriented', 'Value-conscious'],
    color: 'purple',
    avatar: 'LR'
  }
];

function TrainingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [showVoiceTraining, setShowVoiceTraining] = useState(false);

  useEffect(() => {
    const personaId = searchParams.get('persona');
    if (personaId) {
      const persona = personas.find(p => p.id === personaId);
      if (persona) {
        setSelectedPersona(persona);
        setShowVoiceTraining(true);
      }
    }
  }, [searchParams]);

  const handleEndCall = () => {
    // Redirect back to dashboard instead of showing "No customer selected"
    router.push('/dashboard');
  };

  if (!selectedPersona) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No customer selected</h1>
          <p className="text-gray-600 mb-6">Please select a customer from the dashboard to start training.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Show voice training interface for all personas
  if (showVoiceTraining) {
    return (
      <VoiceTraining
        persona={selectedPersona}
        onEndCall={handleEndCall}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Training session ready</h1>
        <p className="text-gray-600">Click to start your call with {selectedPersona.name}</p>
      </div>
    </div>
  );
}

export default function TrainingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h1>
          <p className="text-gray-600">Preparing your training session</p>
        </div>
      </div>
    }>
      <TrainingContent />
    </Suspense>
  );
} 