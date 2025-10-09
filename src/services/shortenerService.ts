
'use server';

import axios from 'axios';

const API_ENDPOINT = 'https://festive-bazaar.shop/api';

/**
 * Shortens a given URL using the festive-bazaar API, based on the provided PHP example.
 * This implementation uses a GET request with the API key in the query parameters.
 * @param longUrl The original, long URL to shorten.
 * @returns The shortened URL.
 * @throws Will throw an error if the API responds with a status of 'error'.
 */
export const shortenUrl = async (longUrl: string): Promise<string> => {
  const apiKey = process.env.LINK_SHORTENER_API_KEY;

  if (!apiKey) {
    console.error('Link shortener API key is not configured. Skipping shortening.');
    // In production, we fall back to the long URL to prevent data loss.
    return longUrl;
  }

  // Don't try to shorten invalid or empty URLs, or already shortened URLs.
  if (!longUrl || !longUrl.startsWith('http') || longUrl.includes('festive-bazaar.shop')) {
    return longUrl;
  }

  try {
    const response = await axios.get(
      API_ENDPOINT, 
      {
        params: {
          api: apiKey,
          url: longUrl, // axios automatically URL-encodes parameters
        },
        timeout: 10000, // 10-second timeout
      }
    );

    const result = response.data;

    if (result.status === 'error') {
      // The API returned a specific error message, throw it to be caught by the UI.
      throw new Error(result.message || 'Unknown API error');
    }

    if (result.status === 'success' && result.shortenedUrl) {
      return result.shortenedUrl;
    }

    // Fallback if the response is not in the expected format
    console.warn('API did not return a valid shortened URL. Response:', result);
    return longUrl;

  } catch (error: any) {
    // If axios throws an error (e.g., network issue) or we threw an error above,
    // re-throw it so the calling component can handle it.
    console.error('Error during URL shortening process:', error.message);
    throw error;
  }
};
