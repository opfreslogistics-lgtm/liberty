# Deployment Checklist - Liberty National Bank

## ✅ Pre-Deployment Checklist

### 1. Environment Variables
- [x] `.env.local` exists and is NOT committed to Git
- [ ] `.env.example` created with all required variables (template only, no real values)
- [ ] All sensitive data removed from source code
- [ ] Environment variables configured in Vercel project settings

### 2. Security Checks
- [x] No hardcoded API keys or secrets in source code
- [x] Supabase credentials use environment variables
- [x] `.gitignore` properly excludes `.env*.local` files
- [ ] All console.log statements removed or replaced with proper logging
- [ ] API routes have proper authentication checks
- [ ] RLS (Row Level Security) policies enabled in Supabase

### 3. Database Setup
- [ ] All SQL migration scripts documented
- [ ] Database schema is up to date
- [ ] Storage buckets created and configured
- [ ] RLS policies tested and working

### 4. Build Configuration
- [x] `package.json` has correct build scripts
- [x] `next.config.js` configured properly
- [ ] TypeScript compilation passes without errors
- [ ] No build warnings that could cause issues

### 5. Dependencies
- [x] All dependencies listed in `package.json`
- [x] No deprecated packages
- [ ] All packages are up to date (security audit)
- [ ] No unnecessary dependencies

### 6. Code Quality
- [ ] ESLint passes without errors
- [ ] No TypeScript errors
- [ ] All unused imports removed
- [ ] Code is properly formatted

### 7. Vercel Configuration
- [ ] Project created on Vercel
- [ ] Git repository connected
- [ ] Environment variables added to Vercel
- [ ] Build command: `npm run build`
- [ ] Output directory: `.next`
- [ ] Node.js version specified (if needed)

### 8. Testing
- [ ] Homepage loads correctly
- [ ] User registration/signup works
- [ ] User login works
- [ ] Admin dashboard accessible
- [ ] User dashboard accessible
- [ ] All forms submit correctly
- [ ] Email notifications working
- [ ] File uploads working (profile pictures, documents)
- [ ] Database operations working

### 9. Production Optimizations
- [ ] Images optimized
- [ ] Unused CSS removed
- [ ] Bundle size optimized
- [ ] Loading states implemented
- [ ] Error boundaries added

### 10. Documentation
- [ ] README.md updated with setup instructions
- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] API endpoints documented (if applicable)

---

## Required Environment Variables for Vercel

Add these in Vercel Project Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
NODE_ENV=production
```

---

## Quick Deployment Steps

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Create Vercel Project:**
   - Go to vercel.com
   - Import your GitHub repository
   - Configure environment variables
   - Deploy

3. **Verify Deployment:**
   - Check all pages load
   - Test user flows
   - Monitor for errors in Vercel logs

---

## Known Issues to Address Before Deployment

1. ⚠️ **MultiStepAddUserForm Component**: This component exists but may not be complete (only Steps 1 and 6 implemented). Consider removing or completing it.

2. ⚠️ **Unused State Variables**: The admin users page has unused state variables (`addUserForm`, `addUserStep`, etc.) that should be cleaned up.

3. ⚠️ **Console Logs**: Check for and remove any console.log statements in production code.

4. ⚠️ **Error Handling**: Ensure all API routes have proper error handling.

---

## Post-Deployment Tasks

- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure domain (if custom domain)
- [ ] Set up analytics
- [ ] Monitor performance
- [ ] Test email delivery
- [ ] Verify database connections
- [ ] Check storage bucket access

