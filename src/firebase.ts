import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
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

// Initialize Firestore targeting the specific named database 'mahdev-pvt-ldt'
const db = getFirestore(app, 'mahdev-pvt-ldt');

// Initialize Storage
const storage = getStorage(app);

// Initialize Auth
const auth = getAuth(app);

export { app, db, storage, auth };
