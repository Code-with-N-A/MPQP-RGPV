import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB8nnkTuJn7GcD9jrWLXcgU7Nb0qKmt9Q4",
  authDomain: "amulestack.firebaseapp.com",
  projectId: "amulestack",
  storageBucket: "amulestack.firebasestorage.app",
  messagingSenderId: "784935604190",
  appId: "1:784935604190:web:cd69e6968005d64555174f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth object
export const auth = getAuth(app);

// Google provider
export const googleProvider = new GoogleAuthProvider();

// GitHub provider
export const githubProvider = new GithubAuthProvider();
