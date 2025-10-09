
'use server';

import axios from 'axios';

const API_ENDPOINT = 'https://festive-bazaar.shop/api';

/**
 * Shortens a given URL using the festive-bazaar API.
 * This implementation is based on the user-provided PHP snippet and cURL command.
 * @param originalUrl The original, long URL to shorten.
 * @returns The shortened URL.
 * @throws Will throw an error if the API responds with a status of 'error'.
 */
export const shortenUrl = async (originalUrl: string): Promise<string> => {
  const apiKey = process.env.LINK_SHORTENER_API_KEY;

  if (!apiKey) {
    console.error('Link shortener API key is not configured. Skipping shortening.');
    throw new Error('Link shortener API key is not configured.');
  }
  
  // Automatically prepend 'https://' if the URL doesn't have a protocol.
  let longUrl = originalUrl.trim();
  if (!longUrl) {
    return originalUrl; // Don't process empty URLs
  }
  if (!longUrl.startsWith('http://') && !longUrl.startsWith('https://')) {
    longUrl = `https://` + longUrl;
  }

  // Don't try to shorten already shortened URLs.
  if (longUrl.includes('festive-bazaar.shop')) {
    return originalUrl;
  }

  try {
    // Generate a unique alias to avoid API errors for shortening the same link.
    const uniqueAlias = `filmplex${Date.now()}${Math.floor(Math.random() * 100)}`;
    const encodedUrl = encodeURIComponent(longUrl);
    
    const apiUrl = `${API_ENDPOINT}?api=${apiKey}&url=${encodedUrl}&alias=${uniqueAlias}`;

    const response = await axios.get(apiUrl, { timeout: 10000 });
    const result = response.data;

    if (result.status === 'error') {
      // The API returned a specific error message, throw it to be caught by the UI.
      console.error('Shortener API Error:', result.message);
      throw new Error(result.message || 'The API returned an unknown error.');
    }

    if (result.status === 'success' && result.shortenedUrl) {
      return result.shortenedUrl;
    }

    // Fallback if the response is not in the expected format
    console.warn('API did not return a valid shortened URL. Response:', result);
    throw new Error('API response was not in the expected format.');

  } catch (error: any) {
    // If axios throws an error or we threw an error above, re-throw it.
    // The calling component can then display the specific error message from the API.
    const errorMessage = error?.response?.data?.message || error.message || 'Could not shorten the URL.';
    console.error('Error during URL shortening process:', errorMessage);
    throw new Error(errorMessage);
  }
};
