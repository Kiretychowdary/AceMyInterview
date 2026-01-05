// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDWyVS02psfJ6rSDywVnqTdciAa5-WCBDY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ksvid-e4f74.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ksvid-e4f74",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ksvid-e4f74.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "414346071335",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:414346071335:web:0f9bc3edcbb9125f24ed02",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-MZ632MF0RQ"
};

console.log('Firebase Config:', { 
  projectId: firebaseConfig.projectId,
  hasApiKey: !!firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  env: import.meta.env.MODE 
});

// Initialize Firebase
let app;
let auth;
let isFirebaseWorking = true;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error.message);
  isFirebaseWorking = false;
}

export { auth, isFirebaseWorking };
export default app;
