# Environment Variables for Production Deployment

## Required Environment Variables

### Anthropic API Configuration
```bash
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```
- **Description**: Your Anthropic API key for Claude AI integration
- **How to get**: Sign up at https://console.anthropic.com/
- **Required**: Yes

### Supabase Configuration
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```
- **Description**: Supabase project configuration for authentication and database
- **How to get**: Create a project at https://supabase.com/
- **Required**: Yes (for full functionality)

## Optional Environment Variables

### Application Configuration
```bash
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NODE_ENV=production
```
- **Description**: Application URL and environment
- **Required**: No (auto-detected by Vercel)

### Analytics (Optional)
```bash
NEXT_PUBLIC_GA_ID=your_google_analytics_id
NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token
```
- **Description**: Analytics tracking IDs
- **Required**: No

### Error Tracking (Optional)
```bash
NEXT_PUBLIC_SENTRY_DSN=your_sentrry_dsn
```
- **Description**: Error tracking service
- **Required**: No

### Feature Flags (Optional)
```bash
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_ERROR_TRACKING=true
```
- **Description**: Feature toggle flags
- **Required**: No

## Vercel Deployment Setup

1. **Go to your Vercel project dashboard**
2. **Navigate to Settings > Environment Variables**
3. **Add each required variable**:
   - `ANTHROPIC_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

4. **Set environment** to "Production" for all variables
5. **Redeploy** your application

## Local Development Setup

Create a `.env.local` file in your project root:

```bash
# Copy this template and fill in your values
ANTHROPIC_API_KEY=your_anthropic_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## Security Notes

- **Never commit** `.env.local` to version control
- **Use different API keys** for development and production
- **Rotate API keys** regularly
- **Monitor API usage** to prevent unexpected charges 