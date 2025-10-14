'use server';

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

let app: App;

if (!getApps().length) {
  try {
    const serviceAccountString = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!serviceAccountString) {
      throw new Error("The GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.");
    }
    const serviceAccount = JSON.parse(serviceAccountString);
    
    app = initializeApp({
      credential: cert(serviceAccount),
    });
    console.log("Firebase Admin SDK initialized successfully.");
  } catch (e: any) {
    console.error("Firebase Admin SDK initialization error:", e.message);
    // If initialization fails, you might want to throw the error
    // or handle it in a way that your app knows it can't use Firebase Admin services.
    throw new Error(`Firebase Admin SDK initialization failed: ${e.message}`);
  }
} else {
  app = getApps()[0];
}

const db = getFirestore(app);
const messaging = getMessaging(app);

export { db, messaging };
