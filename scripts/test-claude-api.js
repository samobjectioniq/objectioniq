#!/usr/bin/env node

const https = require('https');
const http = require('http');

console.log('🧪 Testing Claude API Integration...\n');

// Configuration
const BASE_URL = process.env.TEST_URL || 'https://objectioniq-k8vw-oeio72bfx-sam-barnes-projects-87580908.vercel.app';
const API_ENDPOINT = '/api/chat';

// Test personas
const testPersonas = [
  {
    id: 'sarah',
    name: 'Sarah',
    age: 28,
    type: 'Young Professional',
    characteristics: ['Price-conscious', 'Time-pressed'],
    description: 'Price-sensitive tech professional'
  },
  {
    id: 'mike-jennifer',
    name: 'Mike & Jennifer',
    age: 35,
    type: 'Family Focused',
    characteristics: ['Safety-concerned', 'Detail-oriented'],
    description: 'Family-focused couple'
  },
  {
    id: 'robert',
    name: 'Robert',
    age: 67,
    type: 'Skeptical Retiree',
    characteristics: ['Loyal', 'Suspicious'],
    description: 'Loyal retiree'
  }
];

// Test scenarios
const testScenarios = [
  {
    name: 'Initial Greeting',
    agentResponse: 'Hello! I\'m here to help you with your insurance needs. How can I assist you today?',
    conversationHistory: []
  },
  {
    name: 'Price Objection',
    agentResponse: 'Our premium plan costs $150 per month and includes comprehensive coverage.',
    conversationHistory: [
      { speaker: 'agent', content: 'Hello! I\'m here to help you with your insurance needs.' },
      { speaker: 'customer', content: 'Hi, I\'m interested in learning about your plans.' }
    ]
  },
  {
    name: 'Detailed Question',
    agentResponse: 'Let me explain the coverage details and what\'s included in our policy.',
    conversationHistory: [
      { speaker: 'agent', content: 'Our premium plan costs $150 per month.' },
      { speaker: 'customer', content: 'That sounds expensive. What exactly is covered?' }
    ]
  }
];

// Helper function to make HTTP requests
function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'ObjectionIQ-Test-Suite/1.0'
      }
    };

    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsedData,
            raw: responseData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: null,
            raw: responseData,
            parseError: error.message
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Test function
async function testPersona(persona, scenario) {
  const testData = {
    persona,
    agentResponse: scenario.agentResponse,
    conversationHistory: scenario.conversationHistory
  };

  console.log(`\n🧪 Testing ${persona.name} - ${scenario.name}...`);
  console.log(`📝 Agent: "${scenario.agentResponse}"`);

  try {
    const startTime = Date.now();
    const response = await makeRequest(`${BASE_URL}${API_ENDPOINT}`, testData);
    const duration = Date.now() - startTime;

    console.log(`⏱️  Response time: ${duration}ms`);
    console.log(`📊 Status: ${response.status}`);

    if (response.status === 200 && response.data) {
      console.log(`✅ Success! ${persona.name} responded:`);
      console.log(`💬 "${response.data.response}"`);
      
      if (response.data.fallback) {
        console.log(`⚠️  Using fallback response (API may be unavailable)`);
      }
      
      // Analyze response quality
      const responseLength = response.data.response.length;
      const hasPersonaKeywords = analyzePersonaResponse(persona.id, response.data.response);
      
      console.log(`📏 Response length: ${responseLength} characters`);
      console.log(`🎯 Persona accuracy: ${hasPersonaKeywords ? '✅ Good' : '⚠️ Could be better'}`);
      
      return {
        success: true,
        persona: persona.name,
        scenario: scenario.name,
        response: response.data.response,
        duration,
        fallback: response.data.fallback,
        personaAccuracy: hasPersonaKeywords
      };
    } else {
      console.log(`❌ Error: ${response.status}`);
      if (response.data && response.data.error) {
        console.log(`🔍 Error details: ${response.data.error}`);
      }
      return {
        success: false,
        persona: persona.name,
        scenario: scenario.name,
        error: response.data?.error || `HTTP ${response.status}`,
        duration
      };
    }
  } catch (error) {
    console.log(`❌ Network error: ${error.message}`);
    return {
      success: false,
      persona: persona.name,
      scenario: scenario.name,
      error: error.message,
      duration: 0
    };
  }
}

// Analyze if response matches persona characteristics
function analyzePersonaResponse(personaId, response) {
  const lowerResponse = response.toLowerCase();
  
  const personaKeywords = {
    sarah: ['cost', 'expensive', 'budget', 'time', 'busy', 'quick', 'price'],
    'mike-jennifer': ['family', 'children', 'safe', 'coverage', 'details', 'compare'],
    robert: ['years', 'current', 'provider', 'different', 'switch', 'loyal']
  };
  
  const keywords = personaKeywords[personaId] || [];
  return keywords.some(keyword => lowerResponse.includes(keyword));
}

// Run comprehensive tests
async function runAllTests() {
  console.log(`🚀 Starting Claude API tests against: ${BASE_URL}`);
  console.log(`⏰ Test started at: ${new Date().toISOString()}\n`);
  
  const results = [];
  let totalTests = 0;
  let passedTests = 0;
  let totalDuration = 0;
  
  // Test each persona with each scenario
  for (const persona of testPersonas) {
    for (const scenario of testScenarios) {
      totalTests++;
      const result = await testPersona(persona, scenario);
      results.push(result);
      
      if (result.success) {
        passedTests++;
        totalDuration += result.duration;
      }
      
      // Add delay between tests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Generate test report
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('========================');
  console.log(`✅ Passed: ${passedTests}/${totalTests} (${((passedTests/totalTests)*100).toFixed(1)}%)`);
  console.log(`⏱️  Average response time: ${totalDuration > 0 ? (totalDuration/passedTests).toFixed(0) : 0}ms`);
  console.log(`🌐 Base URL: ${BASE_URL}`);
  
  // Detailed results
  console.log('\n📋 DETAILED RESULTS:');
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${index + 1}. ${status} ${result.persona} - ${result.scenario}`);
    if (!result.success) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  // Check for common issues
  console.log('\n🔍 DIAGNOSTICS:');
  const fallbackCount = results.filter(r => r.fallback).length;
  if (fallbackCount > 0) {
    console.log(`⚠️  ${fallbackCount} tests used fallback responses (API may be unavailable)`);
  }
  
  const slowResponses = results.filter(r => r.success && r.duration > 5000).length;
  if (slowResponses > 0) {
    console.log(`🐌 ${slowResponses} responses were slow (>5s)`);
  }
  
  // Overall assessment
  console.log('\n🎯 OVERALL ASSESSMENT:');
  if (passedTests === totalTests) {
    console.log('🎉 EXCELLENT: All tests passed! Claude API is working perfectly.');
  } else if (passedTests >= totalTests * 0.8) {
    console.log('✅ GOOD: Most tests passed. Minor issues may need attention.');
  } else if (passedTests >= totalTests * 0.5) {
    console.log('⚠️  FAIR: Some tests failed. Check API configuration.');
  } else {
    console.log('❌ POOR: Many tests failed. Significant issues need to be addressed.');
  }
  
  console.log(`\n⏰ Test completed at: ${new Date().toISOString()}`);
  
  return {
    totalTests,
    passedTests,
    successRate: (passedTests/totalTests)*100,
    averageDuration: totalDuration > 0 ? totalDuration/passedTests : 0,
    results
  };
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests()
    .then((summary) => {
      console.log('\n🏁 Test suite completed!');
      process.exit(summary.successRate >= 80 ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = { runAllTests, testPersona }; 