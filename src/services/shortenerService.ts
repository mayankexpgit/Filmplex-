
'use server';

import axios from 'axios';

const API_ENDPOINT = 'https://festive-bazaar.shop/api';

/**
 * Shortens a given URL using the festive-bazaar API.
 * @param longUrl The original, long URL to shorten.
 * @returns The shortened URL.
 * @throws Will throw an error if the API key is missing or the request fails.
 */
export const shortenUrl = async (longUrl: string): Promise<string> => {
  const apiKey = process.env.LINK_SHORTENER_API_KEY;

  if (!apiKey) {
    console.error('Link shortener API key is not configured. Skipping shortening.');
    // Return original URL if API key is not available to avoid breaking the flow.
    return longUrl;
  }

  if (!longUrl || !longUrl.startsWith('http')) {
      // Don't try to shorten invalid or empty URLs
      return longUrl;
  }

  try {
    const response = await axios.get(API_ENDPOINT, {
      params: {
        api: apiKey,
        url: longUrl,
      },
    });

    if (response.data?.status === 'success' && response.data?.shortenedUrl) {
      return response.data.shortenedUrl;
    } else {
      // If API gives a success status but no URL, or a failed status
      console.warn('API did not return a valid shortened URL. Response:', response.data);
      return longUrl;
    }
  } catch (error) {
    console.error('Error shortening URL:', error);
    // In case of an API error, return the original URL to prevent data loss
    return longUrl;
  }
};
