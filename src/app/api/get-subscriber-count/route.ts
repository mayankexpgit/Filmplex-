
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { collection } from 'firebase/firestore';


export async function GET() {
  try {
    const tokensCollection = collection(db, 'fcmTokens');
    // Firestore admin SDK does not have a direct .count() on collections in the same way.
    // We need to get the snapshot and then the size.
    const snapshot = await tokensCollection.get();
    const count = snapshot.size;
    
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
