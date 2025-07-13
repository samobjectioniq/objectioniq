#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envTemplate = `# Anthropic API Key - Get from https://console.anthropic.com/
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Supabase Configuration - Get from your Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Next.js Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your_google_analytics_id_here
`;

const envPath = path.join(process.cwd(), '.env.local');

console.log('🚀 ObjectionIQ Environment Setup\n');

if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists!');
  console.log('Please check SETUP_GUIDE.md for instructions on updating your environment variables.\n');
} else {
  try {
    fs.writeFileSync(envPath, envTemplate);
    console.log('✅ Created .env.local file');
    console.log('📝 Please edit .env.local and add your actual API keys:');
    console.log('   - ANTHROPIC_API_KEY from https://console.anthropic.com/');
    console.log('   - Supabase credentials from your Supabase project\n');
    console.log('🔗 For detailed instructions, see SETUP_GUIDE.md\n');
  } catch (error) {
    console.error('❌ Error creating .env.local:', error.message);
    process.exit(1);
  }
}

console.log('📚 Next steps:');
console.log('1. Edit .env.local with your API keys');
console.log('2. Run: npm run dev');
console.log('3. Open the URL shown in the terminal\n'); 