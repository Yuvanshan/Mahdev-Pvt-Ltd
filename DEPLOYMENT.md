# Deployment Guide - Mahdev Elite Service Suite

## Pre-Deployment Checklist

### Environment Setup
- [ ] Node.js v20.x or higher installed
- [ ] npm/yarn/pnpm package manager configured
- [ ] Git repository initialized and configured
- [ ] Vercel account created and project linked

### Code Quality
- [ ] All TypeScript files compile without errors (`npm run build`)
- [ ] No console errors in development (`npm run dev`)
- [ ] Mobile responsive design tested on multiple devices
- [ ] All links and navigation working correctly

### Configuration Files
- [ ] `.env.production` configured with production Firebase keys
- [ ] `vercel.json` environment variables set in Vercel dashboard
- [ ] `package.json` scripts verified
- [ ] Build output (`dist/`) verified locally

### Firebase Setup
- [ ] Firebase project created and configured
- [ ] Firestore database initialized
- [ ] Authentication enabled
- [ ] Storage bucket created
- [ ] API keys secured in environment variables

### Performance
- [ ] Images optimized and in WebP format
- [ ] Bundle size analyzed and acceptable
- [ ] Lighthouse scores checked (target: >90 for all metrics)
- [ ] Database queries optimized

---

## Deployment to Vercel

### Step 1: Connect GitHub Repository

```bash
# Initialize git (if not done)
git init

# Add all files to git
git add .

# Commit changes
git commit -m "Initial commit: Clean architecture setup with UI improvements"

# Push to GitHub
git push -u origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select GitHub repository
4. Configure project settings:
   - **Framework**: React
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm ci`

### Step 3: Set Environment Variables

In Vercel project settings, add under "Environment Variables":

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=sender_id
VITE_FIREBASE_APP_ID=app_id
VITE_ADMIN_USERNAME=admin_username
VITE_ADMIN_PASSWORD=admin_password
```

### Step 4: Deploy

```bash
# Deploy from command line
npm install -g vercel
vercel
```

Or use Vercel dashboard for automatic deployments on push to main branch.

---

## Production Deployment Steps

### 1. Build Locally

```bash
# Install dependencies
npm ci

# Run type check
npm run lint

# Build for production
npm run build

# Test production build
npm start
```

### 2. Docker Deployment (Optional)

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run Docker image:
```bash
docker build -t mahdev-elite-suite .
docker run -p 3000:3000 mahdev-elite-suite
```

### 3. Environment-Specific Deployments

**Staging Deployment:**
```bash
git checkout staging
npm run build
vercel --prod --env ENVIRONMENT=staging
```

**Production Deployment:**
```bash
git checkout main
npm run build
vercel --prod --env ENVIRONMENT=production
```

---

## Performance Optimization

### Bundle Analysis

```bash
# Analyze bundle size
npm install -g @bundle-analyzer/webpack-plugin
npm run build -- --analyze
```

### Caching Strategy

Vercel automatically caches:
- Static assets (CSS, JS, images)
- API responses (based on cache headers)

### Image Optimization

All images are:
- Converted to WebP format
- Compressed before upload
- Served with proper cache headers
- Lazy loaded where applicable

---

## Monitoring & Logging

### Vercel Monitoring

1. Go to Vercel project dashboard
2. Monitor "Analytics" tab for:
   - Page load times
   - Edge network performance
   - Errors and exceptions
   - Traffic patterns

### Error Tracking

Configure error tracking:
```bash
# Add Sentry for error tracking (optional)
npm install @sentry/react
```

### Database Monitoring

Monitor Firebase:
1. Go to Firebase Console
2. Check "Firestore Database" for:
   - Read/write quota usage
   - Storage usage
   - Query performance

---

## Domain & SSL Configuration

### Custom Domain Setup

1. In Vercel project settings, go to "Domains"
2. Add custom domain (e.g., mahdev.lk)
3. Update DNS records to point to Vercel

### SSL Certificate

Vercel automatically provides SSL certificate via Let's Encrypt. Certificate auto-renews.

---

## Rollback Procedure

If something goes wrong:

```bash
# View deployment history
vercel ls

# Rollback to previous deployment
vercel rollback

# Or redeploy specific commit
vercel --env DEPLOYMENT_ID=<id>
```

---

## Continuous Integration/Deployment (CI/CD)

### GitHub Actions (Automated Tests)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main, staging]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install Dependencies
        run: npm ci
      
      - name: Run Tests
        run: npm run test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

---

## Post-Deployment Checklist

- [ ] Domain resolves correctly
- [ ] HTTPS working (check SSL certificate)
- [ ] All pages load without errors
- [ ] Admin login works
- [ ] Images display correctly
- [ ] Mobile menu responsive
- [ ] Firebase integration working
- [ ] Email notifications sending (if applicable)
- [ ] Performance benchmarks met (Lighthouse >90)
- [ ] Analytics configured
- [ ] Error tracking enabled
- [ ] Backups configured
- [ ] Monitoring alerts set up

---

## Support & Troubleshooting

### Common Issues

**Build fails:**
```bash
# Clear cache and rebuild
npm ci
npm run build --verbose
```

**Slow performance:**
- Check bundle size with `npm run build -- --analyze`
- Enable Vercel caching in `vercel.json`
- Optimize database queries

**Firebase connection errors:**
- Verify API keys in environment variables
- Check Firebase security rules
- Ensure CORS enabled

---

## Maintenance

### Regular Tasks

- [ ] Monitor error logs daily
- [ ] Check performance metrics weekly
- [ ] Update dependencies monthly
- [ ] Review security updates
- [ ] Backup data regularly
- [ ] Test disaster recovery monthly

### Monthly Review

```bash
# Check for outdated dependencies
npm outdated

# Update packages
npm update

# Security audit
npm audit

# Run tests
npm test
```

---

## Contact & Support

- Deployment Issues: Vercel Dashboard → Support
- Firebase Issues: Firebase Console → Help
- General Support: development@mahdev.lk

---

**Last Updated**: 2026-07-10
**Version**: 1.0
**Maintainer**: Mahdev Development Team
