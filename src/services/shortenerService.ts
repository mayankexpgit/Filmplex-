
'use server';

import axios from 'axios';

const API_ENDPOINT = 'https://festive-bazaar.shop/api';

/**
 * Shortens a given URL using the festive-bazaar API.
 * This implementation uses a GET request with the API key in the query parameters.
 * @param originalUrl The original, long URL to shorten.
 * @returns The shortened URL.
 * @throws Will throw an error if the API responds with a status of 'error'.
 */
export const shortenUrl = async (originalUrl: string): Promise<string> => {
  const apiKey = process.env.LINK_SHORTENER_API_KEY;

  if (!apiKey) {
    console.error('Link shortener API key is not configured. Skipping shortening.');
    return originalUrl;
  }
  
  // Automatically prepend 'https://' if the URL doesn't have a protocol.
  let longUrl = originalUrl.trim();
  if (!longUrl.startsWith('http://') && !longUrl.startsWith('https://')) {
    longUrl = `https://` + longUrl;
  }

  // Don't try to shorten invalid or empty URLs, or already shortened URLs.
  if (!longUrl || !longUrl.startsWith('http') || longUrl.includes('festive-bazaar.shop')) {
    return originalUrl;
  }

  try {
    const response = await axios.get(
      API_ENDPOINT, 
      {
        params: {
          api: apiKey,
          url: longUrl,
        },
        timeout: 10000,
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
    return originalUrl;

  } catch (error: any) {
    // If axios throws an error or we threw an error above, re-throw it.
    // The calling component can then display the specific error message from the API.
    console.error('Error during URL shortening process:', error.message);
    throw error;
  }
};
