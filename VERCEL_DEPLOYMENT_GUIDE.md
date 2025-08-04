# 🚀 ObjectionIQ Vercel Deployment Guide

## Quick Start

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy to Production
```bash
./scripts/deploy.sh --prod
```

## 📋 Prerequisites

### Required Accounts
- [ ] **Vercel Account**: Sign up at https://vercel.com
- [ ] **Anthropic Account**: Get API key at https://console.anthropic.com/
- [ ] **Supabase Account**: Create project at https://supabase.com/

### Required Environment Variables
```bash
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 🔧 Step-by-Step Deployment

### Step 1: Prepare Your Environment

1. **Clone the repository** (if not already done)
   ```bash
   git clone <your-repo-url>
   cd objectioniq
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables locally**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```

### Step 2: Test Locally

1. **Run type checking**
   ```bash
   npm run type-check
   ```

2. **Run linting**
   ```bash
   npm run lint
   ```

3. **Test build**
   ```bash
   npm run build
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Test functionality**
   - [ ] Homepage loads
   - [ ] Voice recognition works
   - [ ] AI responses are generated
   - [ ] User authentication works

### Step 3: Deploy to Vercel

#### Option A: Using the Deployment Script (Recommended)
```bash
# Deploy to preview
./scripts/deploy.sh

# Deploy to production
./scripts/deploy.sh --prod
```

#### Option B: Manual Deployment
```bash
# Initialize Vercel project (first time only)
vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Step 4: Configure Environment Variables in Vercel

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Go to Settings > Environment Variables

2. **Add Required Variables**
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

3. **Set Environment**
   - Set all variables to "Production"
   - Set all variables to "Preview" (for staging)

4. **Redeploy**
   ```bash
   vercel --prod
   ```

## 🔍 Post-Deployment Verification

### 1. Basic Functionality Tests
- [ ] **Homepage**: Loads without errors
- [ ] **Navigation**: All links work
- [ ] **Authentication**: Sign up/login works
- [ ] **Voice Training**: Voice recognition works
- [ ] **AI Responses**: Claude API responds
- [ ] **Session Management**: Sessions are saved

### 2. Performance Tests
- [ ] **Lighthouse Audit**: Score > 90
- [ ] **Mobile Responsiveness**: Works on mobile
- [ ] **Loading Speed**: Pages load quickly
- [ ] **Core Web Vitals**: Good scores

### 3. Error Handling
- [ ] **404 Pages**: Custom error pages
- [ ] **API Errors**: Graceful error handling
- [ ] **Network Errors**: Offline handling
- [ ] **Browser Compatibility**: Works in major browsers

## 🛠️ Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check for TypeScript errors
npm run type-check

# Check for linting issues
npm run lint

# Check build process
npm run build
```

#### Environment Variable Issues
```bash
# Verify environment variables are set
echo $OPENAI_API_KEY
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

#### API Issues
- Check Anthropic API key is valid
- Verify Supabase project is active
- Check API rate limits

#### Performance Issues
```bash
# Analyze bundle size
npm run build:analyze

# Check for large dependencies
npm ls --depth=0
```

### Debug Commands
```bash
# Local production build
npm run build:optimize

# Start production server locally
npm run start:prod

# Check deployment status
vercel ls

# View deployment logs
vercel logs
```

## 📊 Monitoring & Analytics

### 1. Vercel Analytics
- Enable Vercel Analytics in dashboard
- Monitor Core Web Vitals
- Track user behavior

### 2. Error Tracking
- Set up Sentry or similar service
- Monitor JavaScript errors
- Track API failures

### 3. Performance Monitoring
- Use Vercel Speed Insights
- Monitor API response times
- Track user experience metrics

## 🔒 Security Considerations

### 1. Environment Variables
- Never commit `.env.local` to git
- Use different keys for dev/prod
- Rotate API keys regularly

### 2. API Security
- Validate all API inputs
- Implement rate limiting
- Use HTTPS only

### 3. Data Protection
- Encrypt sensitive data
- Follow GDPR compliance
- Implement proper authentication

## 🚀 Production Optimizations

### 1. Performance
- Enable compression
- Optimize images
- Use CDN caching
- Implement lazy loading

### 2. SEO
- Add meta tags
- Implement structured data
- Create sitemap
- Optimize for Core Web Vitals

### 3. User Experience
- Add loading states
- Implement error boundaries
- Provide offline support
- Optimize for mobile

## 📈 Scaling Considerations

### 1. Infrastructure
- Monitor Vercel usage
- Consider Pro plan for higher limits
- Set up monitoring alerts

### 2. Database
- Monitor Supabase usage
- Optimize queries
- Set up backups

### 3. API Limits
- Monitor Anthropic API usage
- Implement caching
- Set up rate limiting

## 🎯 Success Metrics

### Deployment Success
- [ ] ✅ All pages load without errors
- [ ] ✅ Voice recognition works
- [ ] ✅ AI responses are generated
- [ ] ✅ User authentication works
- [ ] ✅ Sessions are saved correctly
- [ ] ✅ Mobile experience is smooth
- [ ] ✅ Performance scores are good (>90 Lighthouse)

### Production Readiness
- [ ] ✅ Environment variables are secure
- [ ] ✅ Error handling is comprehensive
- [ ] ✅ Monitoring is in place
- [ ] ✅ Backup and recovery procedures exist
- [ ] ✅ Documentation is complete

## 📞 Support

### Getting Help
- Check the troubleshooting section above
- Review Vercel documentation
- Check Supabase documentation
- Review Anthropic API documentation

### Useful Links
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Anthropic API Documentation](https://docs.anthropic.com/)

---

## 🎉 Congratulations!

Your ObjectionIQ application is now deployed and ready for production use!

**Next Steps:**
1. Test all functionality thoroughly
2. Set up monitoring and analytics
3. Share your application with users
4. Monitor performance and user feedback
5. Iterate and improve based on usage data

**Remember:** Always test in a staging environment before deploying to production! 