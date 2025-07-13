// src/lib/firebase.js

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Check if we're in development and provide helpful error messages
const isDevelopment = process.env.NODE_ENV === 'development';

// Validate required environment variables
const requiredEnvVars = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  const errorMessage = `Missing Firebase environment variables: ${missingVars.join(', ')}`;

  if (isDevelopment) {
    console.error('🔥 Firebase Configuration Error:', errorMessage);
    console.error('📝 Please create a .env file in the root directory with the following variables:');
    console.error('   REACT_APP_FIREBASE_API_KEY=your_api_key');
    console.error('   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com');
    console.error('   REACT_APP_FIREBASE_PROJECT_ID=your_project_id');
    console.error('   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com');
    console.error('   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id');
    console.error('   REACT_APP_FIREBASE_APP_ID=your_app_id');
    console.error('📖 See env.example for a template');

    // In development, we'll create a mock Firebase instance to prevent crashes
    console.warn('⚠️  Using mock Firebase configuration for development');
  } else {
    throw new Error(errorMessage);
  }
}

// Initialize Firebase
let app, auth, db, storage;

try {
  if (missingVars.length > 0 && isDevelopment) {
    // Mock Firebase for development when env vars are missing
    console.warn('🔧 Using mock Firebase services - features will be limited');

    // Create mock objects
    auth = {
      onAuthStateChanged: (callback) => {
        console.warn('Mock auth: No authentication available');
        callback(null);
        return () => { };
      },
      signOut: () => Promise.resolve(),
      currentUser: null
    };

    db = {
      collection: () => ({
        add: () => Promise.reject(new Error('Firebase not configured')),
        get: () => Promise.reject(new Error('Firebase not configured')),
        onSnapshot: () => () => { }
      }),
      doc: () => ({
        set: () => Promise.reject(new Error('Firebase not configured')),
        get: () => Promise.reject(new Error('Firebase not configured')),
        update: () => Promise.reject(new Error('Firebase not configured'))
      })
    };

    storage = {
      ref: () => ({
        put: () => Promise.reject(new Error('Firebase not configured')),
        getDownloadURL: () => Promise.reject(new Error('Firebase not configured'))
      })
    };
  } else {
    // Real Firebase initialization
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    // Note: Firestore persistence disabled to prevent React 19 strict mode conflicts

    // Connect to emulators in development
    if (isDevelopment && process.env.REACT_APP_USE_EMULATORS === 'true') {
      try {
        connectAuthEmulator(auth, 'http://localhost:9099');
        connectFirestoreEmulator(db, 'localhost', 8080);
        connectStorageEmulator(storage, 'localhost', 9199);
        console.log('🔗 Connected to Firebase emulators');
      } catch (emulatorError) {
        console.warn('⚠️  Failed to connect to emulators:', emulatorError);
      }
    }

    console.log('✅ Firebase initialized successfully');
  }
} catch (error) {
  console.error("❌ Firebase initialization error:", error);

  if (isDevelopment) {
    console.warn('🔧 Creating fallback mock services');
    // Create basic mock services to prevent app crashes
    auth = { onAuthStateChanged: () => () => { }, signOut: () => Promise.resolve(), currentUser: null };
    db = { collection: () => ({ add: () => Promise.reject(error), get: () => Promise.reject(error) }) };
    storage = { ref: () => ({ put: () => Promise.reject(error) }) };
  } else {
    throw error;
  }
}

export { auth, db, storage };
