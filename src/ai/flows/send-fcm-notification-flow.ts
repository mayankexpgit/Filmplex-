
'use server';

/**
 * @fileOverview An AI flow to send FCM push notifications.
 * This flow retrieves all FCM tokens from Firestore and sends a multicast message.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';


// --- Zod Schemas for Input and Output ---

const FcmNotificationInputSchema = z.object({
  title: z.string().describe('The title of the notification.'),
  body: z.string().describe('The main text content of the notification.'),
  icon: z.string().optional().describe('The URL of a small icon for the notification.'),
  image: z.string().optional().describe('The URL of an image to display in the notification.'),
});
export type FcmNotificationInput = z.infer<typeof FcmNotificationInputSchema>;

const FcmNotificationOutputSchema = z.object({
  successCount: z.number().describe('The number of messages that were sent successfully.'),
  failureCount: z.number().describe('The number of messages that failed to be sent.'),
  tokensRemoved: z.number().describe('The number of invalid tokens that were removed.'),
});
export type FcmNotificationOutput = z.infer<typeof FcmNotificationOutputSchema>;


// --- Genkit Flow Definition ---

const sendFcmNotificationFlow = ai.defineFlow(
  {
    name: 'sendFcmNotificationFlow',
    inputSchema: FcmNotificationInputSchema,
    outputSchema: FcmNotificationOutputSchema,
  },
  async (input) => {
    // Initialize Admin SDK services inside the flow execution.
    // This ensures they are only initialized when the flow is called on the server,
    // after Genkit has configured the environment.
    const db = getFirestore();
    const messaging = getMessaging();

    // 1. Fetch all FCM tokens from the 'fcmTokens' collection in Firestore.
    const tokensSnapshot = await db.collection('fcmTokens').get();
    if (tokensSnapshot.empty) {
        console.log('No FCM tokens found in the database.');
        return { successCount: 0, failureCount: 0, tokensRemoved: 0 };
    }
    const tokens = tokensSnapshot.docs.map(doc => doc.id);

    // 2. Construct the FCM message payload.
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
                // A default link to open when the notification is clicked.
                link: '/',
            },
        },
        tokens: tokens,
    };

    // 3. Send the multicast message.
    const batchResponse = await messaging.sendEachForMulticast(message);
    
    // 4. Handle responses and remove invalid tokens.
    let tokensToRemove: string[] = [];
    if (batchResponse.failureCount > 0) {
        batchResponse.responses.forEach((resp, idx) => {
            const error = resp.error;
            if (error) {
                console.error('Failure sending notification to', tokens[idx], error);
                // Check for errors indicating an invalid or unregistered token.
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

    // 5. Return the result.
    console.log(`${batchResponse.successCount} messages were sent successfully`);
    return {
        successCount: batchResponse.successCount,
        failureCount: batchResponse.failureCount,
        tokensRemoved: tokensToRemove.length,
    };
  }
);


// --- Exported Wrapper Function ---

/**
 * Sends a push notification to all subscribed users by calling the Genkit flow directly.
 * @param input The notification payload.
 * @returns An object with the counts of successful and failed sends.
 */
export async function sendNotification(input: FcmNotificationInput): Promise<FcmNotificationOutput> {
  // This function now directly invokes the server-side Genkit flow.
  return await sendFcmNotificationFlow(input);
}
