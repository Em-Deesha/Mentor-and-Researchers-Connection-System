// Real Firebase Configuration for Production Academic Matchmaker
// This file provides the actual Firebase configuration for real data storage

export const realFirebaseConfig = {
  apiKey: "AIzaSyBXdC23TpcXdS2FCrwejDHkmbcQafmBq50",
  authDomain: "academic-matchmaker-prod.firebaseapp.com",
  projectId: "academic-matchmaker-prod",
  storageBucket: "academic-matchmaker-prod.firebasestorage.app",
  messagingSenderId: "967137857941",
  appId: "1:967137857941:web:d27ed1253edb32bd2ee69c",
  measurementId: "G-SPZGHFKQT3"
};

// Get Firebase config from environment variables or use real config
export const getRealFirebaseConfig = () => {
  // Check for environment variables first
  if (process.env.VITE_FIREBASE_API_KEY) {
    return {
      apiKey: process.env.VITE_FIREBASE_API_KEY,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.VITE_FIREBASE_APP_ID
    };
  }

  // Use real configuration
  return realFirebaseConfig;
};

// Get app ID for Firestore collections
export const getRealAppId = () => {
  return process.env.VITE_APP_ID || 'academic-match-production';
};

// Get initial auth token from environment
export const getRealInitialAuthToken = () => {
  return process.env.VITE_INITIAL_AUTH_TOKEN || null;
};
