# TuiTrade Deployment Guide

## 🚀 Production Deployment Instructions

### Prerequisites
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] Firebase project created
- [ ] Stripe account (with live keys for production)
- [ ] Domain name (optional but recommended)

## Step 1: Firebase Setup

### 1.1 Login to Firebase
```bash
firebase login
```

### 1.2 Initialize Firebase in your project
```bash
firebase init
```
Select:
- [x] Firestore
- [x] Functions
- [x] Hosting
- [x] Storage

### 1.3 Configure Firebase project
```bash
firebase use --add your-project-id
firebase use your-project-id
```

## Step 2: Environment Configuration

### 2.1 Set up production environment variables
Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

### 2.2 Configure Firebase Functions environment
```bash
# Set Stripe keys
firebase functions:config:set stripe.secret_key="sk_live_your_live_secret_key"
firebase functions:config:set stripe.webhook_secret="whsec_your_webhook_secret"

# Verify configuration
firebase functions:config:get
```

### 2.3 Update environment variables in `.env`
```env
# Production Firebase config
REACT_APP_API_KEY=your_production_api_key
REACT_APP_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_PROJECT_ID=your-project-id
REACT_APP_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_APP_ID=your_app_id

# Production Stripe
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key

# Production Functions URL
REACT_APP_FUNCTIONS_URL=https://us-central1-your-project-id.cloudfunctions.net

REACT_APP_ENVIRONMENT=production
```

## Step 3: Deploy Backend (Cloud Functions)

### 3.1 Install Function dependencies
```bash
cd functions
npm install
cd ..
```

### 3.2 Deploy Functions
```bash
firebase deploy --only functions
```

### 3.3 Verify Functions are deployed
Check the Firebase Console → Functions section.

## Step 4: Deploy Database Rules

### 4.1 Deploy Firestore rules
```bash
firebase deploy --only firestore:rules
```

### 4.2 Deploy Firestore indexes
```bash
firebase deploy --only firestore:indexes
```

### 4.3 Deploy Storage rules
```bash
firebase deploy --only storage
```

## Step 5: Deploy Frontend

### 5.1 Build the production app
```bash
npm run build
```

### 5.2 Deploy to Firebase Hosting
```bash
firebase deploy --only hosting
```

### 5.3 Get your live URL
Your app will be live at: `https://your-project-id.web.app`

## Step 6: Stripe Webhook Configuration

### 6.1 Add webhook endpoint in Stripe Dashboard
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. URL: `https://us-central1-your-project-id.cloudfunctions.net/stripeWebhook`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

### 6.2 Update webhook secret
```bash
firebase functions:config:set stripe.webhook_secret="whsec_your_new_webhook_secret"
firebase deploy --only functions
```

## Step 7: Custom Domain (Optional)

### 7.1 Add custom domain in Firebase Console
1. Go to Hosting → Custom domain
2. Add your domain
3. Verify ownership
4. Configure DNS

### 7.2 Update environment variables for custom domain
```env
REACT_APP_FUNCTIONS_URL=https://us-central1-your-project-id.cloudfunctions.net
# Functions URL stays the same even with custom domain
```

## Step 8: Testing & Verification

### 8.1 Test critical flows
- [ ] User registration/login
- [ ] Item listing creation
- [ ] Search functionality
- [ ] Payment processing (with test cards first)
- [ ] Order management

### 8.2 Test with Stripe test cards
```
Test Card Numbers:
- Success: 4242424242424242
- Decline: 4000000000000002
- Authentication: 4000002500003155
```

### 8.3 Switch to live Stripe keys
Only after thorough testing with test keys.

## Step 9: Monitoring Setup

### 9.1 Enable Firebase Analytics
```bash
firebase init analytics
firebase deploy
```

### 9.2 Set up error monitoring
Consider integrating:
- Sentry for error tracking
- LogRocket for user session recording
- Google Analytics for user behavior

### 9.3 Monitor Cloud Functions logs
```bash
firebase functions:log
```

## Step 10: Go Live! 🎉

### 10.1 Final checks
- [ ] All environment variables are production values
- [ ] Stripe is in live mode
- [ ] SSL certificate is active
- [ ] All tests pass
- [ ] Error monitoring is working
- [ ] Backup procedures are in place

### 10.2 Announce your launch
- Update your domain in marketing materials
- Test from different devices/browsers
- Monitor initial user feedback

## 🔄 Ongoing Maintenance

### Regular Deployments
```bash
# Deploy everything
firebase deploy

# Deploy only specific parts
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
```

### Rollback if needed
```bash
# List previous deployments
firebase hosting:channel:list

# Rollback to previous version
firebase hosting:rollback
```

### Monitor and Update
- Check Firebase Console daily
- Monitor Stripe Dashboard for payments
- Review error logs weekly
- Update dependencies monthly

## 🚨 Emergency Procedures

### If something breaks
1. **Immediate:** Rollback deployment
2. **Investigate:** Check logs and errors
3. **Fix:** Address the issue
4. **Test:** Verify fix in staging
5. **Redeploy:** Push the fix

### Emergency contacts
- Firebase Support: Firebase Console
- Stripe Support: Stripe Dashboard  
- Your development team

## 📱 Multi-Environment Setup (Advanced)

### Development
```bash
firebase use development-project-id
```

### Staging
```bash
firebase use staging-project-id
```

### Production
```bash
firebase use production-project-id
```

Each environment should have its own:
- Firebase project
- Stripe account (test/live)
- Environment variables
- Domain (if applicable)

## 🎯 Performance Optimization

### Before going live
- [ ] Run `npm run build` and check bundle size
- [ ] Optimize images
- [ ] Enable Firebase Performance Monitoring
- [ ] Test on slow networks
- [ ] Check Lighthouse scores

### Ongoing optimization
- Monitor Core Web Vitals
- Optimize database queries
- Review and optimize Cloud Functions
- Regular performance audits

---

**Congratulations! Your TuiTrade marketplace is now live and secure! 🚀**