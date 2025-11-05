
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig: FirebaseOptions = {
    projectId: "vexel-cinema",
    appId: "1:936879818073:web:0cb4d11556a047cc1b7848",
    storageBucket: "vexel-cinema.appspot.com",
    apiKey: "AIzaSyDBgesKMmtY5qmzV83LswRIcgGkZ5eGuPM",
    authDomain: "vexel-cinema.firebaseapp.com",
    messagingSenderId: "936879818073",
    measurementId: "G-8GKE6RR8J2"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);


export { db };
