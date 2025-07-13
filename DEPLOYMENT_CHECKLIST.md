# ObjectionIQ Vercel Deployment Checklist

## 🚀 Pre-Deployment Checklist

### 1. Environment Variables Setup
- [ ] **Anthropic API Key**
  - [ ] Get API key from https://console.anthropic.com/
  - [ ] Add `ANTHROPIC_API_KEY` to Vercel environment variables
  - [ ] Test API key locally

- [ ] **Supabase Configuration**
  - [ ] Create Supabase project at https://supabase.com/
  - [ ] Add `NEXT_PUBLIC_SUPABASE_URL` to Vercel
  - [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel
  - [ ] Add `SUPABASE_SERVICE_ROLE_KEY` to Vercel (optional)
  - [ ] Run database migrations

### 2. Code Quality Checks
- [ ] **TypeScript**
  - [ ] Run `npm run type-check`
  - [ ] Fix any TypeScript errors

- [ ] **Linting**
  - [ ] Run `npm run lint`
  - [ ] Fix any linting issues
  - [ ] Run `npm run lint:fix` if needed

- [ ] **Build Test**
  - [ ] Run `npm run build` locally
  - [ ] Verify no build errors
  - [ ] Check bundle size

### 3. Local Testing
- [ ] **Functionality**
  - [ ] Test voice recognition
  - [ ] Test Claude API responses
  - [ ] Test Supabase authentication
  - [ ] Test session management
  - [ ] Test mobile responsiveness

- [ ] **Performance**
  - [ ] Run Lighthouse audit
  - [ ] Check Core Web Vitals
  - [ ] Test loading times

## 🚀 Deployment Steps

### 1. Vercel Setup
- [ ] **Install Vercel CLI**
  ```bash
  npm i -g vercel
  ```

- [ ] **Login to Vercel**
  ```bash
  vercel login
  ```

- [ ] **Initialize Project** (if not already done)
  ```bash
  vercel
  ```

### 2. Environment Variables in Vercel
- [ ] **Go to Vercel Dashboard**
  - [ ] Navigate to your project
  - [ ] Go to Settings > Environment Variables

- [ ] **Add Required Variables**
  ```
  ANTHROPIC_API_KEY=your_api_key_here
  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
  ```

- [ ] **Set Environment**
  - [ ] Set all variables to "Production"
  - [ ] Set all variables to "Preview" (for staging)

### 3. Deploy to Production
- [ ] **Deploy Command**
  ```bash
  vercel --prod
  ```

- [ ] **Or Deploy via Git**
  - [ ] Push to main branch
  - [ ] Vercel will auto-deploy

### 4. Post-Deployment Verification
- [ ] **Check Deployment**
  - [ ] Verify deployment URL works
  - [ ] Check all pages load correctly
  - [ ] Test API endpoints

- [ ] **Functionality Tests**
  - [ ] Test user registration/login
  - [ ] Test voice training interface
  - [ ] Test AI responses
  - [ ] Test session saving

- [ ] **Performance Tests**
  - [ ] Run Lighthouse audit on production
  - [ ] Check Core Web Vitals
  - [ ] Test on mobile devices

## 🔧 Production Optimizations

### 1. Performance
- [ ] **Enable Compression**
  - [ ] Verify gzip compression is working
  - [ ] Check bundle sizes

- [ ] **Caching**
  - [ ] Set up CDN caching
  - [ ] Configure browser caching

- [ ] **Images**
  - [ ] Optimize images with Next.js Image component
  - [ ] Use WebP format where possible

### 2. Security
- [ ] **Headers**
  - [ ] Verify security headers are set
  - [ ] Check CSP headers

- [ ] **Environment**
  - [ ] Ensure no sensitive data in client-side code
  - [ ] Verify API keys are server-side only

### 3. Monitoring
- [ ] **Error Tracking**
  - [ ] Set up error monitoring (Sentry, etc.)
  - [ ] Configure error alerts

- [ ] **Analytics**
  - [ ] Set up Google Analytics
  - [ ] Configure conversion tracking

## 🚨 Troubleshooting

### Common Issues
- [ ] **Build Failures**
  - [ ] Check environment variables
  - [ ] Verify all dependencies are in `dependencies` not `devDependencies`
  - [ ] Check TypeScript errors

- [ ] **Runtime Errors**
  - [ ] Check browser console for errors
  - [ ] Verify API endpoints are working
  - [ ] Check Supabase connection

- [ ] **Performance Issues**
  - [ ] Analyze bundle size
  - [ ] Check for memory leaks
  - [ ] Optimize images and assets

### Debug Commands
```bash
# Local build test
npm run build:optimize

# Type checking
npm run type-check

# Linting
npm run lint

# Production start
npm run start:prod
```

## 📊 Post-Deployment Monitoring

### 1. Performance Monitoring
- [ ] **Core Web Vitals**
  - [ ] Monitor LCP (Largest Contentful Paint)
  - [ ] Monitor FID (First Input Delay)
  - [ ] Monitor CLS (Cumulative Layout Shift)

- [ ] **User Experience**
  - [ ] Track session duration
  - [ ] Monitor bounce rate
  - [ ] Track conversion rates

### 2. Error Monitoring
- [ ] **Set up alerts**
  - [ ] Error rate thresholds
  - [ ] Performance degradation alerts
  - [ ] API failure notifications

### 3. Usage Analytics
- [ ] **Track key metrics**
  - [ ] Number of training sessions
  - [ ] Voice recognition success rate
  - [ ] AI response quality

## 🎯 Success Criteria

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

---

**🎉 Congratulations! ObjectionIQ is now deployed and ready for production use!** 