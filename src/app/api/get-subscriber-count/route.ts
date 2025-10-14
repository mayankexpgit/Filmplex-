
import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Ensure Firebase Admin is initialized
if (!getApps().length) {
  try {
    const serviceAccount = JSON.parse(
      process.env.GOOGLE_APPLICATION_CREDENTIALS as string
    );
    initializeApp({
      credential: cert(serviceAccount),
    });
    console.log("Firebase Admin SDK initialized for get-subscriber-count.");
  } catch (e: any) {
    console.error("Firebase Admin SDK initialization error in get-subscriber-count:", e.message);
  }
}

export async function GET() {
  try {
    const db = getFirestore();
    const tokensCollection = collection(db, 'fcmTokens');
    const snapshot = await tokensCollection.count().get();
    const count = snapshot.data().count;
    
    return NextResponse.json({ count });

  } catch (error: any) {
    console.error("API Error in /api/get-subscriber-count: ", error);
    let errorMessage = "An internal server error occurred while fetching subscriber count.";
    if (error.message) {
      errorMessage = error.message;
    }
    // Check for specific Firebase errors
    if (error.code === 'permission-denied') {
        errorMessage = "Permission denied. Check your Firestore security rules.";
    } else if (error.code === 'unauthenticated') {
        errorMessage = "Authentication failed. Make sure server credentials are set up correctly.";
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

    