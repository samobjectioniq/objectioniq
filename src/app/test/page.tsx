'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Play, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message?: string;
}

export default function TestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([
    { name: 'Voice Recognition', status: 'pending' },
    { name: 'Speech Synthesis', status: 'pending' },
    { name: 'Claude API', status: 'pending' },
    { name: 'Persona Differentiation', status: 'pending' },
    { name: 'Mobile Responsiveness', status: 'pending' },
    { name: 'Error Handling', status: 'pending' },
    { name: 'Session Management', status: 'pending' },
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [overallScore, setOverallScore] = useState<number | null>(null);

  useEffect(() => {
    // Load test script
    const script = document.createElement('script');
    script.src = '/test-objectioniq.js';
    script.onload = () => {
      console.log('Test script loaded');
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const runTests = async () => {
    setIsRunning(true);
    setTestResults(prev => prev.map(test => ({ ...test, status: 'running' as const })));

    // Override console.log to capture test output
    const originalLog = console.log;
    const logs: string[] = [];
    console.log = (...args) => {
      logs.push(args.join(' '));
      originalLog(...args);
    };

    try {
      // Run tests one by one
      const tests = [
        { name: 'Voice Recognition', fn: 'testVoiceRecognition' },
        { name: 'Speech Synthesis', fn: 'testSpeechSynthesis' },
        { name: 'Claude API', fn: 'testClaudeAPI' },
        { name: 'Persona Differentiation', fn: 'testPersonaDifferentiation' },
        { name: 'Mobile Responsiveness', fn: 'testMobileResponsiveness' },
        { name: 'Error Handling', fn: 'testErrorHandling' },
        { name: 'Session Management', fn: 'testSessionManagement' },
      ];

      for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        
        if ((window as any).testObjectionIQ && (window as any).testObjectionIQ[test.fn]) {
          try {
            const result = await (window as any).testObjectionIQ[test.fn]();
            setTestResults(prev => prev.map((t, index) => 
              index === i ? { ...t, status: result ? 'passed' : 'failed' } : t
            ));
                     } catch (error: any) {
             setTestResults(prev => prev.map((t, index) => 
               index === i ? { ...t, status: 'failed', message: error?.message || 'Unknown error' } : t
             ));
           }
        } else {
          setTestResults(prev => prev.map((t, index) => 
            index === i ? { ...t, status: 'failed', message: 'Test function not found' } : t
          ));
        }

        // Wait between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Calculate overall score
      const passedTests = testResults.filter(t => t.status === 'passed').length;
      const score = (passedTests / testResults.length) * 100;
      setOverallScore(score);

    } catch (error) {
      console.error('Test execution error:', error);
    } finally {
      setIsRunning(false);
      console.log = originalLog;
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 bg-gray-300 rounded-full" />;
      case 'running':
        return <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" />;
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return 'text-gray-500';
      case 'running':
        return 'text-blue-500';
      case 'passed':
        return 'text-green-500';
      case 'failed':
        return 'text-red-500';
    }
  };

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
              <h1 className="text-xl font-bold text-gray-900">ObjectionIQ Test Suite</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Test Overview */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Comprehensive Testing</h2>
            <p className="text-gray-600 mb-6">
              This test suite validates all aspects of ObjectionIQ including voice recognition, 
              AI responses, persona differentiation, mobile responsiveness, error handling, and session management.
            </p>
            
            <button
              onClick={runTests}
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </button>
          </div>

          {/* Test Results */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h3>
            
            <div className="space-y-3">
              {testResults.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <span className={`font-medium ${getStatusColor(test.status)}`}>
                      {test.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {test.message && (
                      <span className="text-sm text-gray-500">{test.message}</span>
                    )}
                    <span className={`text-sm font-medium ${getStatusColor(test.status)}`}>
                      {test.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Overall Score */}
            {overallScore !== null && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">Overall Score</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${
                      overallScore >= 80 ? 'text-green-600' : 
                      overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {overallScore.toFixed(1)}%
                    </span>
                    {overallScore >= 80 ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : overallScore >= 60 ? (
                      <AlertCircle className="w-6 h-6 text-yellow-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                </div>
                
                <div className="mt-2">
                  {overallScore >= 80 ? (
                    <p className="text-green-600 font-medium">🎉 ObjectionIQ is ready for production!</p>
                  ) : overallScore >= 60 ? (
                    <p className="text-yellow-600 font-medium">⚠️ ObjectionIQ needs some improvements before production.</p>
                  ) : (
                    <p className="text-red-600 font-medium">🚨 ObjectionIQ needs significant work before production.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Test Instructions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Instructions</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>• <strong>Voice Recognition:</strong> Tests browser compatibility and microphone access</p>
              <p>• <strong>Speech Synthesis:</strong> Tests text-to-speech functionality</p>
              <p>• <strong>Claude API:</strong> Tests AI response generation and realism</p>
              <p>• <strong>Persona Differentiation:</strong> Tests unique responses for each customer persona</p>
              <p>• <strong>Mobile Responsiveness:</strong> Tests UI adaptation for mobile devices</p>
              <p>• <strong>Error Handling:</strong> Tests graceful handling of network and API errors</p>
              <p>• <strong>Session Management:</strong> Tests conversation history and session persistence</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 