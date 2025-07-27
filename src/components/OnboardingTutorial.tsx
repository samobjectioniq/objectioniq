'use client';

import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Mic, Users, Brain, BarChart3, Play } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: string;
  position: 'center' | 'top' | 'bottom';
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to ObjectionIQ',
    description: 'Your AI-powered insurance sales training platform. Let\'s get you started with a quick tour.',
    icon: <Play className="w-8 h-8 text-blue-600" />,
    position: 'center'
  },
  {
    id: 'voice-training',
    title: 'Voice-First Training',
    description: 'Practice real conversations using your voice. Our AI customers respond naturally to help you improve.',
    icon: <Mic className="w-8 h-8 text-blue-600" />,
    action: 'Try voice training',
    position: 'top'
  },
  {
    id: 'personas',
    title: 'Realistic Customer Personas',
    description: 'Train with different customer types: young professionals, families, and retirees. Each has unique objections.',
    icon: <Users className="w-8 h-8 text-blue-600" />,
    action: 'Meet the personas',
    position: 'center'
  },
  {
    id: 'ai-responses',
    title: 'AI-Powered Responses',
    description: 'Our Claude AI generates realistic objections and responses based on each customer\'s personality.',
    icon: <Brain className="w-8 h-8 text-blue-600" />,
    position: 'center'
  },
  {
    id: 'analytics',
    title: 'Track Your Progress',
    description: 'Monitor your performance with detailed analytics and get personalized improvement recommendations.',
    icon: <BarChart3 className="w-8 h-8 text-blue-600" />,
    action: 'View dashboard',
    position: 'bottom'
  }
];

interface OnboardingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function OnboardingTutorial({ isOpen, onClose, onComplete }: OnboardingTutorialProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setCurrentStep(0);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handleDontShowAgain = () => {
    // Save to localStorage
    localStorage.setItem('objectioniq_tutorial_completed', 'true');
    if (user) {
      localStorage.setItem(`objectioniq_tutorial_completed_${user.id}`, 'true');
    }
    onComplete();
  };

  if (!isVisible) return null;

  const step = onboardingSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === onboardingSteps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 animate-scale-in">
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step content */}
        <div className="text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {step.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
            <p className="text-gray-600 leading-relaxed">{step.description}</p>
          </div>

          {/* Progress indicator */}
          <div className="flex justify-center mb-6">
            <div className="flex space-x-2">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={isFirstStep}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isFirstStep
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            <button
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              {isLastStep ? 'Get Started' : 'Next'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Skip options */}
          <div className="mt-4 space-y-2">
            <button
              onClick={handleSkip}
              className="block w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Skip tutorial
            </button>
            <button
              onClick={handleDontShowAgain}
              className="block w-full text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Don&apos;t show again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 