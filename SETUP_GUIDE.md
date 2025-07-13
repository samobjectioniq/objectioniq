# ObjectionIQ Setup Guide

## Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```bash
# Anthropic API Key - Get from https://console.anthropic.com/
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
```

## Getting API Keys

### 1. Anthropic API Key
1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy the key to `ANTHROPIC_API_KEY`

### 2. Supabase Setup
1. Go to https://supabase.com/
2. Create a new project
3. Go to Settings > API
4. Copy the URL to `NEXT_PUBLIC_SUPABASE_URL`
5. Copy the anon key to `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Copy the service role key to `SUPABASE_SERVICE_ROLE_KEY`

## Troubleshooting

### Common Issues

1. **"supabaseUrl is required" error**
   - Make sure you have created `.env.local` with Supabase credentials
   - Restart the development server after adding environment variables

2. **"invalid x-api-key" error**
   - Check that your Anthropic API key is correct
   - Ensure the key has proper permissions

3. **"model not found" error**
   - The app now uses `claude-3-5-sonnet-20241022` (updated from deprecated model)
   - This should be resolved automatically

4. **Port already in use**
   - The app will automatically use the next available port
   - Check the terminal output for the correct URL

## Quick Start

1. Copy the environment variables above to `.env.local`
2. Fill in your actual API keys
3. Run `npm run dev`
4. Open the URL shown in the terminal (usually http://localhost:3000)

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test
``` 