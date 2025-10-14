
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig: FirebaseOptions = {
  apiKey: "YOUR_API_KEY",
  projectId: "vexel-cinema",
  appId: "1:936879818073:web:0cb4d11556a047cc1b7848",
  storageBucket: "vexel-cinema.appspot.com",
  authDomain: "vexel-cinema.firebaseapp.com",
  messagingSenderId: "936879818073"
};

// VAPID key for web push notifications
const VAPID_KEY = 'BKanWzFG6j_3mLa-j9mQJmGr3S6M9Z6mZ-Y_4d2b2z-M1X8sQ4g6c3C5j2r1R3oF4A2Z7r7W0A0J8K9l4c1R9jA';


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

const saveFCMToken = async (token: string): Promise<void> => {
    try {
        // Use the token as the document ID to prevent duplicates
        const tokenDocRef = doc(db, 'fcmTokens', token);
        await setDoc(tokenDocRef, { 
            token: token,
            createdAt: new Date().toISOString() 
        });
        console.log('FCM token saved to Firestore.');
    } catch (error) {
        console.error('Error saving FCM token to Firestore:', error);
    }
}

const getMessagingToken = async () => {
    let messaging;
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        messaging = getMessaging(app);
        try {
            const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
            if (currentToken) {
                console.log('FCM Token:', currentToken);
                await saveFCMToken(currentToken);
            } else {
                console.log('No registration token available. Request permission to generate one.');
            }
        } catch (err) {
            console.error('An error occurred while retrieving token. ', err);
        }
    }
};

const onMessageListener = () => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        const messaging = getMessaging(app);
        return new Promise((resolve) => {
            onMessage(messaging, (payload) => {
                console.log('Message received. ', payload);
                resolve(payload);
            });
        });
    }
    // Return a promise that never resolves if not in a browser environment
    return new Promise(()=>{});
};


export { db, getMessagingToken, onMessageListener };
