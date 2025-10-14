
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

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

const getMessagingToken = async () => {
    let messaging;
    if (typeof window !== 'undefined') {
        messaging = getMessaging(app);
        try {
            const currentToken = await getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY_HERE' }); // Replace with your VAPID key
            if (currentToken) {
                console.log('FCM Token:', currentToken);
                // You would typically send this token to your server to store it.
            } else {
                console.log('No registration token available. Request permission to generate one.');
            }
        } catch (err) {
            console.error('An error occurred while retrieving token. ', err);
        }
    }
};

const onMessageListener = () => {
    if (typeof window !== 'undefined') {
        const messaging = getMessaging(app);
        return new Promise((resolve) => {
            onMessage(messaging, (payload) => {
                console.log('Message received. ', payload);
                resolve(payload);
            });
        });
    }
    return new Promise(()=>{});
};


export { db, getMessagingToken, onMessageListener };
