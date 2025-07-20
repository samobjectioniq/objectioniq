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
      // For now, show onboarding for all users
      // In production, this would check user.onboarding_completed from database
      setShowOnboarding(true);
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

      {/* Hero Section - Lead Conversion Focus */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center animate-fade-in">
            {/* Urgency Badge */}
            <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-pulse">
              <AlertTriangle className="w-4 h-4" />
              Stop Wasting Money on Internet Leads
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 animate-slide-up">
              Stop Wasting Money on
              <span className="text-blue-600 block bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Internet Leads</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Insurance agents spend $3,500-$8,000 monthly on internet leads but only close 3-5%. 
              <span className="font-semibold text-blue-600"> Practice handling real objections to protect your lead investment.</span>
            </p>
            
            {/* Real Internet Lead Data */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 max-w-4xl mx-auto border border-gray-200">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Average Agent Reality Check</h3>
                <p className="text-gray-600">500+ leads/month × $7-15 each = $3,500-$8,000 spend, only 25% answer, 3-8% close rate</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-600">500+</div>
                  <div className="text-sm text-gray-600">Leads/Month</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-orange-600">$3.5K-$8K</div>
                  <div className="text-sm text-gray-600">Monthly Spend</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-600">25%</div>
                  <div className="text-sm text-gray-600">Answer Rate</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">3-8%</div>
                  <div className="text-sm text-gray-600">Close Rate</div>
                </div>
              </div>
            </div>
            
            {/* ROI Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-3">
                  <DollarSign className="w-6 h-6 text-red-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">$5,000</div>
                <div className="text-sm text-gray-600">Average Monthly Spend</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">5% → 8%</div>
                <div className="text-sm text-gray-600">Close Rate Improvement</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-3">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">$250</div>
                <div className="text-sm text-gray-600">Cost Per Sale Savings</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <Link href="/training" className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                <Shield className="w-5 h-5" />
                Protect My Lead Investment
              </Link>
              <Link href="/training" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                <Play className="w-5 h-5" />
                Practice Before I Dial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator Section */}
      <section id="roi" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Calculate Your Internet Lead Investment ROI
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See how much money you&apos;re losing on internet leads and how ObjectionIQ can protect your massive investment
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
              Protect Your Internet Lead Investment
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Less than the cost of 10 internet leads to protect your entire monthly budget
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Lead Guardian</h3>
                <div className="text-4xl font-bold text-blue-600 mb-2">$97<span className="text-lg text-gray-500">/month</span></div>
                <p className="text-gray-600">Less than 10 internet leads</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-700">Unlimited internet lead objection practice</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-700">5-minute warm-up sessions</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-700">ROI tracking & analytics</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-700">Cost per sale monitoring</span>
                </li>
              </ul>
              <Link href="/training" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors text-center block">
                Start Protecting My Leads
              </Link>
            </div>
            
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl shadow-xl p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Agency Protector</h3>
                <div className="text-4xl font-bold mb-2">$297<span className="text-lg text-blue-200">/month</span></div>
                <p className="text-blue-200">Protect your entire team&apos;s lead investment</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>Everything in Lead Guardian</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>Up to 10 team members</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>Team performance analytics</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>Custom objection scenarios</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>Priority support</span>
                </li>
              </ul>
              <Link href="/training" className="w-full bg-white text-blue-600 hover:bg-gray-100 py-3 px-6 rounded-lg font-semibold transition-colors text-center block">
                Protect My Agency
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Engagement Features for Logged-in Users */}
      {user && (
        <section className="py-12 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {user.email?.split('@')[0]}!</h2>
              <p className="text-gray-600">Ready to protect your lead investment?</p>
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

      {/* Lead-Focused Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              You&apos;re Spending $5,000+ Monthly on Internet Leads
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Here&apos;s what&apos;s really happening with your expensive web leads
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6 card hover:shadow-xl transition-all duration-300">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
                <Mic className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">75% Don&apos;t Answer</h3>
              <p className="text-gray-600">
                Only 25% of your expensive leads answer the phone. You&apos;re wasting thousands immediately.
              </p>
            </div>
            
            <div className="text-center p-6 card hover:shadow-xl transition-all duration-300">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-float" style={{ animationDelay: '0.2s' }}>
                <DollarSign className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">5% Close Rate</h3>
              <p className="text-gray-600">
                Of those conversations, you close maybe 5%. Industry top performers hit 8%.
              </p>
            </div>
            
            <div className="text-center p-6 card hover:shadow-xl transition-all duration-300">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-float" style={{ animationDelay: '0.4s' }}>
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">$750 Per Sale</h3>
              <p className="text-gray-600">
                At 5% close rate, each sale costs $750. Top performers get it down to $500.
              </p>
            </div>
            
            <div className="text-center p-6 card hover:shadow-xl transition-all duration-300">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-float" style={{ animationDelay: '0.6s' }}>
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">5-Minute Warm-ups</h3>
              <p className="text-gray-600">
                Practice before calling your expensive internet leads to protect your investment
              </p>
            </div>
            
            <div className="text-center p-6 card hover:shadow-xl transition-all duration-300">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-float" style={{ animationDelay: '0.8s' }}>
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real Internet Lead Objections</h3>
              <p className="text-gray-600">
                Practice the exact objections your web leads give: &quot;I&apos;m just comparing quotes&quot;
              </p>
            </div>
            
            <div className="text-center p-6 card hover:shadow-xl transition-all duration-300">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-float" style={{ animationDelay: '1s' }}>
                <BarChart3 className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Track Your ROI</h3>
              <p className="text-gray-600">
                Monitor your cost per sale improvement from $750 down to $500
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Updated Lead-Focused Personas Section */}
      <section id="personas" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Master Real Internet Lead Scenarios
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Practice with AI customers that mirror your actual expensive web leads
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-8 card hover:shadow-xl transition-all duration-300">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-glow">
                  <span className="text-2xl font-bold text-red-600">P</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Price Shopping Prospect</h3>
                <p className="text-red-600 font-medium">&quot;I&apos;m just comparing quotes&quot;</p>
              </div>
              <div className="space-y-3">
                <p className="text-gray-600 text-sm">
                  Filled out online form but only wants to see prices. Will compare every quote and demand the lowest rate.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">Price-focused</span>
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">Comparison shopping</span>
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">Rate-driven</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-8 card hover:shadow-xl transition-all duration-300">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-glow" style={{ animationDelay: '0.2s' }}>
                  <span className="text-2xl font-bold text-orange-600">S</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Skeptical Web Lead</h3>
                <p className="text-orange-600 font-medium">&quot;I already have insurance&quot;</p>
              </div>
              <div className="space-y-3">
                <p className="text-gray-600 text-sm">
                  Gave info online but having second thoughts. Loyal to current provider but open to better value.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">Provider-loyal</span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">Skeptical</span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">Value-seeking</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-8 card hover:shadow-xl transition-all duration-300">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-glow" style={{ animationDelay: '0.4s' }}>
                  <span className="text-2xl font-bold text-purple-600">B</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Busy Professional</h3>
                <p className="text-purple-600 font-medium">&quot;I&apos;ve been called 5 times today&quot;</p>
              </div>
              <div className="space-y-3">
                <p className="text-gray-600 text-sm">
                  Annoyed by multiple agent calls from internet leads. Wants you to get to the point quickly or hang up.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Impatient</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Overwhelmed</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Direct</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Urgency CTA Section */}
      <section className="py-24 bg-gradient-to-r from-red-600 to-red-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Stop Wasting $5,000 Per Month on Internet Leads
          </h2>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Every bad conversation costs you money. Start protecting your massive lead investment today.
          </p>
          
          {/* Social Proof */}
          <div className="grid md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
            <div className="bg-white/10 rounded-lg p-4 text-white">
              <div className="text-lg font-semibold mb-2">&quot;How I went from 5% to 8% close rate on internet leads&quot;</div>
              <div className="text-sm text-red-100">- Sarah M., P&C Agent</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-white">
              <div className="text-lg font-semibold mb-2">&quot;Saved $200 per sale by better objection handling&quot;</div>
              <div className="text-sm text-red-100">- Mike R., Agency Owner</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-white">
              <div className="text-lg font-semibold mb-2">&quot;Stopped wasting $5,000 monthly lead budgets&quot;</div>
              <div className="text-sm text-red-100">- Jennifer L., Team Leader</div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/training" className="bg-white text-red-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Protect My Lead Investment
            </Link>
            <Link href="/training" className="bg-red-500 text-white hover:bg-red-400 px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center gap-2">
              <Play className="w-5 h-5" />
              Practice Before I Dial
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-blue-400 mb-4">ObjectionIQ</h3>
              <p className="text-gray-400 text-sm">
                Protect your expensive internet lead investment with AI-powered objection training. Turn rejections into appointments.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Lead Protection</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#roi" className="hover:text-white transition-colors">ROI Calculator</a></li>
                <li><a href="#personas" className="hover:text-white transition-colors">Lead Scenarios</a></li>
                <li><a href="/dashboard" className="hover:text-white transition-colors">Conversion Tracking</a></li>
                <li><a href="/training" className="hover:text-white transition-colors">Practice Sessions</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Lead Training Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Newsletter</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 ObjectionIQ. All rights reserved. Protecting insurance agents&apos; lead investments with AI-powered training.
            </p>
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

