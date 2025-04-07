// Firebase configuration
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase configuration from Breek
const firebaseConfig = {
  apiKey: "AIzaSyDxb5pPwKHG5E_M0n_qnLR4Cma01iFyyws",
  authDomain: "breekdotnews.firebaseapp.com",
  projectId: "breekdotnews",
  storageBucket: "breekdotnews.firebasestorage.app",
  messagingSenderId: "249967282692",
  appId: "1:249967282692:web:018a63ce8c7ef5014f0351",
  measurementId: "G-RW6RWPZEDL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
