
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db, messaging } from '@/lib/firebase-admin';
import { collection } from 'firebase/firestore';

const FcmNotificationInputSchema = z.object({
  title: z.string().describe('The title of the notification.'),
  body: z.string().describe('The main text content of the notification.'),
  icon: z.string().optional().describe('The URL of a small icon for the notification.'),
  image: z.string().optional().describe('The URL of an image to display in the notification.'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = FcmNotificationInputSchema.parse(body);

    const tokensSnapshot = await db.collection('fcmTokens').get();
    if (tokensSnapshot.empty) {
        console.log('No FCM tokens found in the database.');
        return NextResponse.json({ successCount: 0, failureCount: 0, tokensRemoved: 0, totalSubscribers: 0 });
    }
    const totalSubscribers = tokensSnapshot.size;
    const tokens = tokensSnapshot.docs.map(doc => doc.id);

    const message = {
        notification: {
            title: input.title,
            body: input.body,
        },
        webpush: {
            notification: {
                icon: input.icon,
                image: input.image,
            },
            fcm_options: {
                link: '/',
            },
        },
        tokens: tokens,
    };
    
    const batchResponse = await messaging.sendEachForMulticast(message);
    
    let tokensToRemove: string[] = [];
    if (batchResponse.failureCount > 0) {
        batchResponse.responses.forEach((resp, idx) => {
            const error = resp.error;
            if (error) {
                console.error('Failure sending notification to', tokens[idx], error);
                if (
                    error.code === 'messaging/invalid-registration-token' ||
                    error.code === 'messaging/registration-token-not-registered'
                ) {
                    tokensToRemove.push(tokens[idx]);
                }
            }
        });
        
        if (tokensToRemove.length > 0) {
            const batch = db.batch();
            tokensToRemove.forEach(token => {
                const docRef = db.collection('fcmTokens').doc(token);
                batch.delete(docRef);
            });
            await batch.commit();
            console.log(`Removed ${tokensToRemove.length} invalid FCM tokens.`);
        }
    }

    console.log(`${batchResponse.successCount} messages were sent successfully`);
    
    const result = {
        successCount: batchResponse.successCount,
        failureCount: batchResponse.failureCount,
        tokensRemoved: tokensToRemove.length,
        totalSubscribers: totalSubscribers - tokensToRemove.length,
    };

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("API Error in /api/send-notification: ", error);
    let errorMessage = "An internal server error occurred.";
    if (error instanceof z.ZodError) {
      errorMessage = "Invalid request payload.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
