# TuiTrade Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory with your Firebase configuration:

```env
# Firebase Configuration (Required)
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Stripe Configuration (Optional for development)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Development Settings
REACT_APP_USE_EMULATORS=false
NODE_ENV=development
```

### 3. Start Development Server
```bash
npm start
```

## Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password and Google)
4. Create Firestore database
5. Enable Storage
6. Get your configuration from Project Settings

### 2. Firestore Rules
Update your Firestore rules to allow read/write access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow users to read/write their own watchlist
    match /users/{userId}/watchlist/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read/write listings
    match /listings/{listingId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Allow authenticated users to read/write auctions
    match /auctions/{auctionId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Allow authenticated users to read/write conversations
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants;
    }
    
    // Allow authenticated users to read/write messages
    match /conversations/{conversationId}/messages/{messageId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. Storage Rules
Update your Storage rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Stripe Setup (Optional)

### 1. Create Stripe Account
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create an account
3. Get your publishable key from the Dashboard

### 2. Test Mode
For development, use Stripe test keys:
- Test publishable key starts with `pk_test_`
- Test secret key starts with `sk_test_`

## Development Features

### Mock Mode
When Firebase is not configured, the app runs in mock mode:
- Authentication is simulated
- Database operations return mock data
- Payment processing is simulated
- All features work but with mock data

### Error Handling
The app includes comprehensive error handling:
- Graceful degradation when services are unavailable
- Helpful error messages in development
- Fallback UI for missing features

## Common Issues

### 1. Firebase Not Configured
**Error**: "Missing Firebase environment variables"
**Solution**: Create a `.env` file with your Firebase configuration

### 2. Service Worker Issues
**Error**: "Failed to cache files"
**Solution**: The service worker now handles missing files gracefully

### 3. Payment Processing Errors
**Error**: "API endpoint not available"
**Solution**: In development, payment processing uses mock data

### 4. React Version Issues
**Error**: Compatibility issues with React 19
**Solution**: Downgraded to React 18.3.1 for better stability

## Production Deployment

### 1. Build the App
```bash
npm run build
```

### 2. Deploy to Firebase
```bash
npm run deploy
```

### 3. Environment Variables
Make sure to set production environment variables in your hosting platform.

## Features Status

### ✅ Working
- User authentication (Firebase)
- Item listings and browsing
- Watchlist functionality
- Search and filtering
- Responsive design
- Dark mode toggle
- Service worker (offline support)

### 🔧 Development Mode (Mock)
- Payment processing
- Real-time messaging
- File uploads
- Analytics

### 🚧 Coming Soon
- Real payment processing
- Advanced search
- User reviews
- Advanced analytics

## Support

For issues or questions:
1. Check the browser console for error messages
2. Ensure all environment variables are set
3. Verify Firebase project configuration
4. Check network connectivity

## Development Tips

1. **Use Browser DevTools**: Check console for helpful error messages
2. **Mock Mode**: Perfect for UI development without backend setup
3. **Hot Reload**: Changes reflect immediately in development
4. **Error Boundaries**: App won't crash on component errors
5. **Service Worker**: Test offline functionality 