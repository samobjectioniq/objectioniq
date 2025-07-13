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

// Update Anthropic API key
const newApiKey = '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';

// Replace the API key
if (envContent.includes('ANTHROPIC_API_KEY=')) {
  envContent = envContent.replace(
    /ANTHROPIC_API_KEY=.*/,
    `ANTHROPIC_API_KEY=${newApiKey}`
  );
  console.log('✅ Updated ANTHROPIC_API_KEY');
} else {
  envContent += `\nANTHROPIC_API_KEY=${newApiKey}`;
  console.log('✅ Added ANTHROPIC_API_KEY');
}

// Write back to file
fs.writeFileSync(envPath, envContent);

console.log('\n✨ Environment updated successfully!');
console.log('📝 Next steps:');
console.log('1. Restart your development server: npm run dev');
console.log('2. Test the API: npm run test:api');
console.log('3. Test Claude specifically: node scripts/test-claude.js'); 