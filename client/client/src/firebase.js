// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA8LHd8xS6gz5n0OF9qAojyR696tI41hxE",
  authDomain: "new-accounts-7651d.firebaseapp.com",
  projectId: "new-accounts-7651d",
  storageBucket: "new-accounts-7651d.firebasestorage.app",
  messagingSenderId: "428758227316",
  appId: "1:428758227316:web:d4880f4b64725e30b07421",
  measurementId: "G-6P36DLD1J9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
