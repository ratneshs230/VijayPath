import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCoReqbX_NkY3NRilNYUFqjqkNBRq0LLUM",
  authDomain: "shreehari-58f50.firebaseapp.com",
  projectId: "shreehari-58f50",
  storageBucket: "shreehari-58f50.firebasestorage.app",
  messagingSenderId: "183958588531",
  appId: "1:183958588531:web:4a41feef01b2fb72916e06",
  measurementId: "G-5JP6C0N06Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
