import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAB05TE4Fx9C89tcfUNVGVcIEWw4CVDhJ0",
  authDomain: "for-her-33ea9.firebaseapp.com",
  projectId: "for-her-33ea9",
  storageBucket: "for-her-33ea9.firebasestorage.app",
  messagingSenderId: "1062826041810",
  appId: "1:1062826041810:web:2905a8e9f7bc3243dfa80b"
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific database ID from public/firebase-applet-config.json
const db = initializeFirestore(app, {}, "ai-studio-mahadeveliteserv-2f36f4fc-e0aa-4704-9de8-e9a8b723fc8a");

// Initialize Storage
const storage = getStorage(app);

// Initialize Auth
const auth = getAuth(app);

export { app, db, storage, auth };
