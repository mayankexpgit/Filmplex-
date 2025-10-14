
import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

// This is a server-side only file.

const FcmNotificationInputSchema = z.object({
  title: z.string().describe('The title of the notification.'),
  body: z.string().describe('The main text content of the notification.'),
  icon: z.string().optional().describe('The URL of a small icon for the notification.'),
  image: z.string().optional().describe('The URL of an image to display in the notification.'),
});

const FcmNotificationOutputSchema = z.object({
  successCount: z.number().describe('The number of messages that were sent successfully.'),
  failureCount: z.number().describe('The number of messages that failed to be sent.'),
  tokensRemoved: z.number().describe('The number of invalid tokens that were removed.'),
});

const sendFcmNotificationFlow = ai.defineFlow(
  {
    name: 'sendFcmNotificationFlow',
    inputSchema: FcmNotificationInputSchema,
    outputSchema: FcmNotificationOutputSchema,
  },
  async (input) => {
    return ai.run('send-fcm-notification', async () => {
        const db = getFirestore();
        const messaging = getMessaging();

        const tokensSnapshot = await db.collection('fcmTokens').get();
        if (tokensSnapshot.empty) {
            console.log('No FCM tokens found in the database.');
            return { successCount: 0, failureCount: 0, tokensRemoved: 0 };
        }
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
        return {
            successCount: batchResponse.successCount,
            failureCount: batchResponse.failureCount,
            tokensRemoved: tokensToRemove.length,
        };
    });
  }
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = FcmNotificationInputSchema.parse(body);

    const result = await sendFcmNotificationFlow(input);

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
