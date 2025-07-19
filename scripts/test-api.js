#!/usr/bin/env node

const https = require('https');
const http = require('http');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

// Override API key for testing
process.env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || 'your-api-key-here';

// Test data
const testPersona = {
  id: 'sarah',
  name: 'Sarah',
  age: 28,
  type: 'young_professional',
  characteristics: ['price-sensitive', 'busy', 'skeptical'],
  description: 'A 28-year-old young professional'
};

const testAgentResponse = 'Hi Sarah, I understand you\'re busy, but I wanted to share how our insurance can protect your future. It\'s actually quite affordable at just $25/month.';

const testConversationHistory = [
  { speaker: 'agent', content: 'Hello Sarah, how are you today?' },
  { speaker: 'sarah', content: 'I\'m busy, can you make this quick?' }
];

const testSession = {
  persona_id: 'sarah',
  persona_name: 'Sarah',
  persona_type: 'young_professional',
  duration: 300,
  objections_handled: 2,
  confidence_score: 0.85,
  conversation_history: testConversationHistory,
  notes: 'Test session - handled price objections well'
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Test functions
async function testChatAPI() {
  console.log('🧪 Testing Chat API...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/chat`, {
      method: 'POST',
      body: {
        persona: testPersona,
        agentResponse: testAgentResponse,
        conversationHistory: testConversationHistory
      }
    });

    if (response.status === 200 && response.data.response) {
      console.log('✅ Chat API: SUCCESS');
      console.log(`   Response: "${response.data.response}"`);
    } else {
      console.log('❌ Chat API: FAILED');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${response.data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.log('❌ Chat API: ERROR');
    console.log(`   Error: ${error.message}`);
  }
}

async function testSessionsAPI() {
  console.log('\n🧪 Testing Sessions API...');
  
  try {
    // Test GET sessions
    const getResponse = await makeRequest(`${BASE_URL}/api/sessions`);
    
    if (getResponse.status === 200) {
      console.log('✅ Sessions GET: SUCCESS');
      console.log(`   Sessions count: ${getResponse.data.total || 0}`);
    } else {
      console.log('❌ Sessions GET: FAILED');
      console.log(`   Status: ${getResponse.status}`);
      console.log(`   Error: ${getResponse.data.error || 'Unknown error'}`);
    }

    // Test POST session
    const postResponse = await makeRequest(`${BASE_URL}/api/sessions`, {
      method: 'POST',
      body: testSession
    });

    if (postResponse.status === 200) {
      console.log('✅ Sessions POST: SUCCESS');
      console.log(`   Session ID: ${postResponse.data.session?.id || 'N/A'}`);
    } else {
      console.log('❌ Sessions POST: FAILED');
      console.log(`   Status: ${postResponse.status}`);
      console.log(`   Error: ${postResponse.data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.log('❌ Sessions API: ERROR');
    console.log(`   Error: ${error.message}`);
  }
}

async function testAnalyticsAPI() {
  console.log('\n🧪 Testing Analytics API...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/analytics`);
    
    if (response.status === 200 && response.data.overview) {
      console.log('✅ Analytics API: SUCCESS');
      console.log(`   Total sessions: ${response.data.overview.totalSessions}`);
      console.log(`   Average success rate: ${response.data.overview.averageSuccessRate}%`);
    } else {
      console.log('❌ Analytics API: FAILED');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${response.data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.log('❌ Analytics API: ERROR');
    console.log(`   Error: ${error.message}`);
  }
}

async function testHealthCheck() {
  console.log('\n🧪 Testing Health Check...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/`);
    
    if (response.status === 200) {
      console.log('✅ Health Check: SUCCESS');
      console.log('   Server is running');
    } else {
      console.log('❌ Health Check: FAILED');
      console.log(`   Status: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Health Check: ERROR');
    console.log(`   Error: ${error.message}`);
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 ObjectionIQ API Test Suite\n');
  console.log(`Testing against: ${BASE_URL}\n`);

  await testHealthCheck();
  await testChatAPI();
  await testSessionsAPI();
  await testAnalyticsAPI();

  console.log('\n✨ Test suite completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Check the results above for any failures');
  console.log('2. If Chat API fails, verify your ANTHROPIC_API_KEY');
  console.log('3. If Sessions/Analytics fail, verify your Supabase setup');
  console.log('4. Run the database setup: supabase/schema.sql');
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests }; 