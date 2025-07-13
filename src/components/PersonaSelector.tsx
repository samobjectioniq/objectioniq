'use client';

import { Persona } from '@/types/persona';
import { Users, Clock, Shield, Brain, Target } from 'lucide-react';

interface PersonaSelectorProps {
  personas: Persona[];
  onSelectPersona: (persona: Persona) => void;
}

export default function PersonaSelector({ personas, onSelectPersona }: PersonaSelectorProps) {
  const getCharacteristicIcon = (characteristic: string) => {
    if (characteristic.toLowerCase().includes('time') || characteristic.toLowerCase().includes('busy')) {
      return <Clock className="w-4 h-4" />;
    }
    if (characteristic.toLowerCase().includes('safety') || characteristic.toLowerCase().includes('loyal')) {
      return <Shield className="w-4 h-4" />;
    }
    if (characteristic.toLowerCase().includes('tech') || characteristic.toLowerCase().includes('question')) {
      return <Brain className="w-4 h-4" />;
    }
    if (characteristic.toLowerCase().includes('price') || characteristic.toLowerCase().includes('value')) {
      return <Target className="w-4 h-4" />;
    }
    return <Users className="w-4 h-4" />;
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {personas.map((persona) => (
        <div
          key={persona.id}
          className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-200"
          onClick={() => onSelectPersona(persona)}
        >
          <div className="text-center mb-6">
            <div className={`w-20 h-20 bg-${persona.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
              <span className={`text-2xl font-bold text-${persona.color}-600`}>
                {persona.avatar}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              {persona.name}, {persona.age}
            </h3>
            <p className={`text-${persona.color}-600 font-medium mb-2`}>
              {persona.type}
            </p>
            <p className="text-sm text-gray-600">
              {persona.description}
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800 text-sm">Key Characteristics:</h4>
            <div className="space-y-2">
              {persona.characteristics.map((characteristic, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="text-gray-400">
                    {getCharacteristicIcon(characteristic)}
                  </div>
                  <span className="text-sm text-gray-600">{characteristic}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              className={`w-full bg-${persona.color}-600 hover:bg-${persona.color}-700 text-white py-2 px-4 rounded-md font-medium transition-colors`}
            >
              Start Training with {persona.name}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
} 