'use client';

import { Mic, Users, Brain, BarChart3, Play, ArrowRight, Shield, Clock, Target, LogIn, DollarSign, TrendingUp, Zap, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/auth/AuthModal';
import UserProfile from '@/components/auth/UserProfile';
import OnboardingTutorial from '@/components/OnboardingTutorial';
import EngagementFeatures from '@/components/EngagementFeatures';
import ROICalculator from '@/components/ROICalculator';
import { useState, useEffect } from 'react';

export default function Home() {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showEngagement, setShowEngagement] = useState(false);

  const handleAuthClick = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  // Check if user is new and show onboarding
  useEffect(() => {
    if (user) {
      // Check if tutorial has been completed
      const tutorialCompleted = localStorage.getItem('objectioniq_tutorial_completed') === 'true' ||
                               localStorage.getItem(`objectioniq_tutorial_completed_${user.id}`) === 'true';
      
      // Only show onboarding if tutorial hasn't been completed
      if (!tutorialCompleted) {
        setShowOnboarding(true);
      }
    }
  }, [user]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Mark onboarding as completed in user profile
    // This would typically update the user's profile in the database
  };

  const handleShowAchievements = () => {
    // Navigate to achievements page or show modal
    console.log('Show achievements');
  };

  const handleShowGoals = () => {
    // Navigate to goals page or show modal
    console.log('Show goals');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 animate-pulse">Loading ObjectionIQ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-600">ObjectionIQ</h1>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#roi" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  ROI Calculator
                </a>
                <a href="#personas" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Lead Scenarios
                </a>
                {user ? (
                  <>
                    <Link href="/training" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                      Practice Before I Dial
                    </Link>
                    <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                      Dashboard
                    </Link>
                    <UserProfile />
                  </>
                ) : (
                  <button
                    onClick={() => handleAuthClick('signin')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Professional Focus */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Internet Lead Conversion Training
              <span className="text-blue-600 block">for Insurance Professionals</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Practice handling common objections with AI-powered customer simulations. 
              Improve your confidence and conversion rates on actual prospects.
            </p>
            
            {/* Professional Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 max-w-4xl mx-auto border border-gray-200">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Industry Benchmarks</h3>
                <p className="text-gray-600">Average performance metrics for insurance agents working with internet leads</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">500+</div>
                  <div className="text-sm text-gray-600">Leads/Month</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-600">$3.5K-$8K</div>
                  <div className="text-sm text-gray-600">Monthly Investment</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-orange-600">25%</div>
                  <div className="text-sm text-gray-600">Answer Rate</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">3-8%</div>
                  <div className="text-sm text-gray-600">Close Rate</div>
                </div>
              </div>
            </div>
            
            {/* Professional Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-2">Improved Confidence</div>
                <div className="text-sm text-gray-600">Practice handling objections before live calls</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-2">Better Conversion</div>
                <div className="text-sm text-gray-600">Increase close rates through practice</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-3">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-2">Performance Tracking</div>
                <div className="text-sm text-gray-600">Monitor improvement over time</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/training" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors flex items-center justify-center gap-2">
                <Play className="w-5 h-5" />
                Start Training
              </Link>
              <button
                onClick={() => handleAuthClick('signup')}
                className="bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg text-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                Sign Up Free
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator Section */}
      <section id="roi" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Calculate Your Training ROI
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See how improved objection handling can impact your conversion rates and cost per sale
            </p>
          </div>
          <ROICalculator />
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Training Plans
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that fits your training needs and team size
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional</h3>
                <div className="text-4xl font-bold text-blue-600 mb-2">$97<span className="text-lg text-gray-500">/month</span></div>
                <p className="text-gray-600">For individual agents</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-700">Unlimited practice sessions</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-700">Realistic customer scenarios</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-700">Performance analytics</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-700">Session recording & review</span>
                </li>
              </ul>
              <button
                onClick={() => handleAuthClick('signup')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors text-center block"
              >
                Start Free Trial
              </button>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-200 p-8 relative">
              <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Agency</h3>
                <div className="text-4xl font-bold text-blue-600 mb-2">$297<span className="text-lg text-gray-500">/month</span></div>
                <p className="text-gray-600">For teams and agencies</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-700">Everything in Professional</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-700">Up to 10 team members</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-700">Team performance analytics</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-700">Custom training scenarios</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-700">Priority support</span>
                </li>
              </ul>
              <button
                onClick={() => handleAuthClick('signup')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors text-center block"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Personas Section */}
      <section id="personas" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Practice with Realistic Customer Scenarios
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Train with AI customers based on common prospect profiles and objections
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-semibold text-blue-600">SM</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Sarah Mitchell</h3>
                <p className="text-sm text-gray-600">Marketing Manager, 32</p>
                <p className="text-blue-600 font-medium text-sm mt-1">&quot;I&apos;m just comparing quotes&quot;</p>
              </div>
              <div className="space-y-2">
                <p className="text-gray-600 text-sm">
                  Price-conscious professional who researches thoroughly before making decisions.
                </p>
                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Price-focused</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Time-pressed</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-semibold text-green-600">RC</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Robert Chen</h3>
                <p className="text-sm text-gray-600">Small Business Owner, 45</p>
                <p className="text-green-600 font-medium text-sm mt-1">&quot;I already have insurance&quot;</p>
              </div>
              <div className="space-y-2">
                <p className="text-gray-600 text-sm">
                  Detail-oriented entrepreneur who values relationships and thorough coverage.
                </p>
                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Detail-oriented</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Risk-averse</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-semibold text-purple-600">LR</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Linda Rodriguez</h3>
                <p className="text-sm text-gray-600">Teacher, 28</p>
                <p className="text-purple-600 font-medium text-sm mt-1">&quot;I&apos;m on a tight budget&quot;</p>
              </div>
              <div className="space-y-2">
                <p className="text-gray-600 text-sm">
                  Budget-conscious educator focused on family needs and financial security.
                </p>
                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Budget-focused</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Family-oriented</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-semibold text-orange-600">DT</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">David Thompson</h3>
                <p className="text-sm text-gray-600">Retired Engineer, 58</p>
                <p className="text-orange-600 font-medium text-sm mt-1">&quot;I&apos;ve been with them 15 years&quot;</p>
              </div>
              <div className="space-y-2">
                <p className="text-gray-600 text-sm">
                  Skeptical retiree loyal to current provider but open to better value propositions.
                </p>
                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">Skeptical</span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">Provider-loyal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Back Section for Logged-in Users */}
      {user && (
        <section className="py-12 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {user.email?.split('@')[0]}!</h2>
              <p className="text-gray-600">Continue your training and track your progress</p>
            </div>
            <div className="max-w-4xl mx-auto">
              <EngagementFeatures 
                onShowAchievements={handleShowAchievements}
                onShowGoals={handleShowGoals}
              />
            </div>
          </div>
        </section>
      )}

      {/* Professional Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Professional Training Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to improve your objection handling skills
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Realistic Conversation Practice</h3>
              <p className="text-gray-600">
                Practice with AI customers that respond like real prospects with common objections
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Common Objection Scenarios</h3>
              <p className="text-gray-600">
                Master responses to typical objections like price concerns and time constraints
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Performance Analytics</h3>
              <p className="text-gray-600">
                Track your improvement over time with detailed session analytics
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Flexible Training Sessions</h3>
              <p className="text-gray-600">
                Practice for 5 minutes or longer sessions based on your schedule
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Responses</h3>
              <p className="text-gray-600">
                Advanced AI generates realistic customer responses and objections
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Team Management</h3>
              <p className="text-gray-600">
                Manage multiple agents and track team performance (Agency plan)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">ObjectionIQ</h3>
              <p className="text-gray-400 mb-4">
                Professional training platform for insurance agents to improve objection handling skills and conversion rates.
              </p>
              <p className="text-gray-400">
                Contact: <a href="mailto:info@objectioniq.com" className="text-blue-400 hover:text-blue-300 transition-colors">info@objectioniq.com</a>
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="/training" className="text-gray-400 hover:text-white transition-colors">Training</a></li>
                <li><a href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</a></li>
                <li><button onClick={() => handleAuthClick('signin')} className="text-gray-400 hover:text-white transition-colors">Login</button></li>
                <li><button onClick={() => handleAuthClick('signup')} className="text-gray-400 hover:text-white transition-colors">Sign Up</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">&copy; 2024 ObjectionIQ. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        defaultMode={authMode}
      />
      
      <OnboardingTutorial
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}

