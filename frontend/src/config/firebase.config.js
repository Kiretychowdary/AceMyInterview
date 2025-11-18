 
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
 
const firebaseConfig = {
  apiKey: "AIzaSyC0LQ1jO9hwW0vsVds8KT7YkdKZNTr-BT0",
  authDomain: "radhakrishna-8d46e.firebaseapp.com",
  projectId: "radhakrishna-8d46e",
  storageBucket: "radhakrishna-8d46e.firebasestorage.app",
  messagingSenderId: "47405760273",
  appId: "1:47405760273:web:89932df2777cc9eb6ed6b0",
  measurementId: "G-L8KM16YFFL"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
