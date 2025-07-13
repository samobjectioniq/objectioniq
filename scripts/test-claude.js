#!/usr/bin/env node

const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.ANTHROPIC_API_KEY;

console.log('🔍 Testing Claude API\n');

if (!apiKey) {
  console.log('❌ Missing ANTHROPIC_API_KEY environment variable');
  process.exit(1);
}

// Check if API key looks valid (starts with sk-ant-)
if (!apiKey.startsWith('sk-ant-')) {
  console.log('❌ Invalid API key format');
  console.log('   API key should start with "sk-ant-"');
  process.exit(1);
}

const anthropic = new Anthropic({
  apiKey: apiKey,
});

async function testClaudeAPI() {
  console.log('🧪 Testing Claude API connection...');
  
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 50,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: 'Say "Hello from ObjectionIQ!" in a friendly way.',
        },
      ],
    });

    const response = message.content[0].type === 'text' ? message.content[0].text : '';
    
    console.log('✅ Claude API: SUCCESS');
    console.log(`   Response: "${response}"`);
    console.log(`   Model: claude-3-5-sonnet-20241022`);
    console.log(`   Tokens used: ${message.usage?.input_tokens || 'N/A'}`);
    
  } catch (error) {
    console.log('❌ Claude API: FAILED');
    console.log(`   Error: ${error.message}`);
    
    if (error.status === 401) {
      console.log('   This usually means your API key is invalid or expired');
      console.log('   Check your API key at: https://console.anthropic.com/');
    } else if (error.status === 404) {
      console.log('   Model not found - this should not happen with the current model');
    } else if (error.status === 429) {
      console.log('   Rate limit exceeded - try again later');
    } else {
      console.log(`   Status code: ${error.status}`);
    }
  }
}

async function testPersonaResponse() {
  console.log('\n🧪 Testing persona response...');
  
  try {
    const systemPrompt = `You are Sarah, a 28-year-old young professional. You are price-sensitive, have a busy lifestyle, and want to make quick decisions. You are skeptical of sales pitches and want to know if insurance is really worth it. Your objections often include: "It's too expensive", "I don't have time for this", "Do I really need this?", "Can you make this quick?"

Respond in a natural, conversational way. Use contractions and sound like a real person. Keep responses short (1-2 sentences). Stay in character and make objections realistic for your persona.`;

    const userPrompt = `Agent's latest message: "Hi Sarah, I understand you're busy, but I wanted to share how our insurance can protect your future. It's actually quite affordable at just $25/month."

Respond as Sarah:`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 100,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const response = message.content[0].type === 'text' ? message.content[0].text : '';
    
    console.log('✅ Persona Response: SUCCESS');
    console.log(`   Sarah says: "${response}"`);
    
  } catch (error) {
    console.log('❌ Persona Response: FAILED');
    console.log(`   Error: ${error.message}`);
  }
}

async function runTests() {
  await testClaudeAPI();
  await testPersonaResponse();
  
  console.log('\n✨ Claude API tests completed!');
  console.log('\n📝 Next steps:');
  console.log('1. If API key fails, check your key at https://console.anthropic.com/');
  console.log('2. If model fails, the issue might be with the model name');
  console.log('3. If rate limited, wait a moment and try again');
  console.log('4. Once Claude works, test the full app with: npm run test:api');
}

runTests().catch(console.error); 