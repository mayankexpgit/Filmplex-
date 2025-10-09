
'use server';

/**
 * THIS FILE IS DEPRECATED AND NO LONGER USED.
 * The URL shortening logic has been moved directly into the `upload-movie.tsx` component
 * to call the proxy API route `/api/test-shortener` directly.
 * This simplifies the architecture and avoids potential server-side execution context issues.
 */

export const shortenUrl = async (originalUrl: string): Promise<string> => {
  console.warn("DEPRECATED: shortenUrl from shortenerService.ts was called. This function is no longer in use.");
  // Return the original URL as a fallback to prevent breaking any unexpected calls.
  return originalUrl;
};
