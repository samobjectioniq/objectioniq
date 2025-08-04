#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');

console.log('🔧 Updating environment variables...\n');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local not found!');
  console.log('Run: npm run setup');
  process.exit(1);
}

// Read current env file
let envContent = fs.readFileSync(envPath, 'utf8');

// Update OpenAI API key
const newApiKey = process.env.OPENAI_API_KEY || 'your-api-key-here';

// Replace the API key
if (envContent.includes('OPENAI_API_KEY=')) {
  envContent = envContent.replace(
    /OPENAI_API_KEY=.*/,
    `OPENAI_API_KEY=${newApiKey}`
  );
  console.log('✅ Updated OPENAI_API_KEY');
} else {
  envContent += `\nOPENAI_API_KEY=${newApiKey}`;
  console.log('✅ Added OPENAI_API_KEY');
}

// Write back to file
fs.writeFileSync(envPath, envContent);

console.log('\n✨ Environment updated successfully!');
console.log('📝 Next steps:');
console.log('1. Restart your development server: npm run dev');
console.log('2. Test the API: npm run test:api');
console.log('3. Test OpenAI specifically: node scripts/test-openai-api.js'); 