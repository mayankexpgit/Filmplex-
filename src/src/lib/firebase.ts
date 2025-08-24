
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "vexel-cinema",
  appId: "1:936879818073:web:0cb4d11556a047cc1b7848",
  storageBucket: "vexel-cinema.appspot.com",
  apiKey: "AIzaSyDBgesKMmtY5qmzV83LswRIcgGkZ5eGuPM",
  authDomain: "vexel-cinema.firebaseapp.com",
  messagingSenderId: "936879818073"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };

    