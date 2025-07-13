#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 ObjectionIQ Troubleshooting\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local not found!');
  console.log('Run: npm run setup');
  process.exit(1);
}

// Check environment variables
const envContent = fs.readFileSync(envPath, 'utf8');
const requiredVars = [
  'ANTHROPIC_API_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

console.log('📋 Environment Variables Check:');
let allGood = true;

requiredVars.forEach(varName => {
  if (envContent.includes(varName) && !envContent.includes(`${varName}=your_`)) {
    console.log(`✅ ${varName} - Set`);
  } else {
    console.log(`❌ ${varName} - Missing or not configured`);
    allGood = false;
  }
});

console.log('');

// Check if node_modules exists
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('❌ node_modules not found!');
  console.log('Run: npm install');
  process.exit(1);
}

// Check package.json
const packagePath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packagePath)) {
  console.log('❌ package.json not found!');
  process.exit(1);
}

console.log('📦 Dependencies Check:');
console.log('✅ node_modules exists');
console.log('✅ package.json exists');

// Check for common issues
console.log('\n🔧 Common Issues:');

if (!allGood) {
  console.log('❌ Environment variables not configured');
  console.log('   - Edit .env.local with your actual API keys');
  console.log('   - See SETUP_GUIDE.md for instructions');
} else {
  console.log('✅ Environment variables look good');
}

// Check for port conflicts
console.log('\n🌐 Port Check:');
console.log('   - If you see "Port X is in use", the app will automatically use the next available port');
console.log('   - Check the terminal output for the correct URL');

console.log('\n🚀 Ready to start!');
console.log('Run: npm run dev'); 