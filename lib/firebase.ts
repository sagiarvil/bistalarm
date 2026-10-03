import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAc2rfJ1MfkPTfg-yonWjn1RBNj-6O9RU4",
  authDomain: "bistalarm-web.firebaseapp.com",
  projectId: "bistalarm-web",
  storageBucket: "bistalarm-web.firebasestorage.app",
  messagingSenderId: "657016672612",
  appId: "1:657016672612:web:aad33826b31e26e7cbaa71"
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider, signInWithPopup, signOut };
