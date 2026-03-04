import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDBn1C3WLJfVWFVk6eLJQ_QvlMCYd8BPv0",
    authDomain: "dj-bridash-elite-69.firebaseapp.com",
    projectId: "dj-bridash-elite-69",
    storageBucket: "dj-bridash-elite-69.firebasestorage.app",
    messagingSenderId: "882171456176",
    appId: "1:882171456176:web:94b58064d75f0d9e2ca975"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
