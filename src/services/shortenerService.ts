
'use server';

/**
 * Shortens a given URL by calling our internal proxy API route.
 * This avoids CORS issues by having the server make the call to the external shortener.
 * @param originalUrl The original, long URL to shorten.
 * @returns The shortened URL.
 * @throws Will throw an error if the internal proxy API responds with an error.
 */
export const shortenUrl = async (originalUrl: string): Promise<string> => {
  let longUrl = originalUrl.trim();
  if (!longUrl) {
    return originalUrl; // Do not process empty URLs
  }
  // Automatically prepend 'https://' if the URL doesn't have a protocol.
  if (!longUrl.startsWith('http://') && !longUrl.startsWith('https://')) {
    longUrl = `https://` + longUrl;
  }
  
  // Don't try to shorten already shortened URLs from this service.
  if (longUrl.includes('festive-bazaar.shop')) {
    return originalUrl;
  }

  try {
    // We get the full URL of the currently deployed app.
    // This is important for making absolute fetch requests from the server-side.
    const host = process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : 'http://localhost:3000';
      
    const encodedUrl = encodeURIComponent(longUrl);
    const proxyApiUrl = `${host}/api/test-shortener?url=${encodedUrl}`;

    const response = await fetch(proxyApiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store', // Ensure we always get a fresh response
    });
    
    const result = await response.json();

    if (!response.ok) {
        // If response is not OK, throw the error message from the proxy.
        throw new Error(result.error || `Proxy API failed with status: ${response.status}`);
    }

    if (result.short) {
      return result.short;
    }

    // Fallback for unexpected response structure from our own proxy
    throw new Error('Proxy response was successful but not in the expected format.');

  } catch (error: any) {
    console.error('Error during URL shortening process:', error.message);
    // Re-throw the error so the frontend component can catch it and display it in a toast.
    throw new Error(error.message || 'Could not shorten the URL due to an unexpected error.');
  }
};
