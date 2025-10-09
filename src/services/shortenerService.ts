'use server';

import { URLSearchParams } from 'url';

/**
 * Shortens a given URL using the festive-bazaar API.
 * This implementation is based on the user-provided PHP snippet and uses node-fetch.
 * @param originalUrl The original, long URL to shorten.
 * @returns The shortened URL.
 * @throws Will throw an error if the API responds with a status of 'error'.
 */
export const shortenUrl = async (originalUrl: string): Promise<string> => {
  const apiKey = process.env.LINK_SHORTENER_API_KEY;

  if (!apiKey) {
    const errorMessage = 'Link shortener API key is not configured.';
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  // Automatically prepend 'https://' if the URL doesn't have a protocol.
  let longUrl = originalUrl.trim();
  if (!longUrl) {
    return originalUrl; // Do not process empty URLs
  }
  if (!longUrl.startsWith('http://') && !longUrl.startsWith('https://')) {
    longUrl = `https://` + longUrl;
  }

  // Don't try to shorten already shortened URLs from this service.
  if (longUrl.includes('festive-bazaar.shop')) {
    return originalUrl;
  }

  try {
    const fetch = (await import('node-fetch')).default;
    
    const params = new URLSearchParams({
      api: apiKey,
      url: longUrl,
      format: 'json',
    });

    const apiUrl = `https://festive-bazaar.shop/api?${params.toString()}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      timeout: 10000,
    });

    if (!response.ok) {
       const errorData: any = await response.json().catch(() => ({ message: 'API returned a non-JSON error response.' }));
       const errorMessage = errorData.message || `API request failed with status: ${response.status}`;
       console.error('Shortener API Error:', errorMessage);
       throw new Error(errorMessage);
    }
    
    const result: any = await response.json();

    if (result.status === 'error') {
      const errorMessage = result.message || 'The API returned an unknown error.';
      console.error('Shortener API Error:', errorMessage);
      throw new Error(errorMessage);
    }

    if (result.status === 'success' && result.shortenedUrl) {
      return result.shortenedUrl;
    }

    // Fallback for unexpected response structure
    const fallbackMessage = 'API response was successful but not in the expected format.';
    console.warn(fallbackMessage, 'Response:', result);
    throw new Error(fallbackMessage);

  } catch (error: any) {
    const errorMessage = error.message || 'Could not shorten the URL due to an unexpected error.';
    console.error('Error during URL shortening process:', errorMessage);
    throw new Error(errorMessage);
  }
};
