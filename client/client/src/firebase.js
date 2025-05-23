// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCcdqscVdGtVV5BdHPJuiile7HTS29aGrE",
    authDomain: "tesseract-flex-fuel-accounts.firebaseapp.com",
    projectId: "tesseract-flex-fuel-accounts",
    storageBucket: "tesseract-flex-fuel-accounts.firebasestorage.app",
    messagingSenderId: "215365723420",
    appId: "1:215365723420:web:a646845d2ae6bbaef086d9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
