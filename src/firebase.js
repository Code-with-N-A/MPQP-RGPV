import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  TwitterAuthProvider   // ← Twitter import add kiya
} from "firebase/auth";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAb7s6CaCuTfHnmakQzQR6Z1-K5imcG6_Y",
  authDomain: "mpqp-ec693.firebaseapp.com",
  projectId: "mpqp-ec693",
  storageBucket: "mpqp-ec693.firebasestorage.app",
  messagingSenderId: "47943400682",
  appId: "1:47943400682:web:e5f887316ef6fcd7806b93"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth object
export const auth = getAuth(app);

// Providers
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
export const twitterProvider = new TwitterAuthProvider();  // ← Twitter provider export
