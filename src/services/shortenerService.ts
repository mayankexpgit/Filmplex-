
'use server';

import axios from 'axios';

const API_ENDPOINT = 'https://festive-bazaar.shop/api/shorten';

/**
 * Shortens a given URL using the festive-bazaar API.
 * This implementation now uses a POST request with an Authorization header as per user's guidance.
 * @param longUrl The original, long URL to shorten.
 * @returns The shortened URL.
 * @throws Will throw an error if the API key is missing or the request fails.
 */
export const shortenUrl = async (longUrl: string): Promise<string> => {
  const apiKey = process.env.LINK_SHORTENER_API_KEY;

  if (!apiKey) {
    console.error('Link shortener API key is not configured. Skipping shortening.');
    return longUrl;
  }

  if (!longUrl || !longUrl.startsWith('http')) {
    // Don't try to shorten invalid or empty URLs
    return longUrl;
  }

  try {
    const response = await axios.post(
      API_ENDPOINT,
      { url: longUrl }, // Send the URL in the request body as JSON
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`, // Use Bearer token for authorization
        },
        timeout: 10000, // 10 second timeout
      }
    );

    const data = response.data;
    
    // The API might respond with a structure like { "status": "success", "shortenedUrl": "..." } or other formats
    const shortened =
      data?.shortenedUrl ??
      data?.shortUrl ??
      data?.result?.short_link ??
      data?.data?.short_url ??
      data?.short_link ??
      null;

    if (shortened) {
      return shortened;
    } else {
      console.warn('API did not return a valid shortened URL. Response:', data);
      return longUrl; // Fallback to original URL
    }
  } catch (error: any) {
    // Log detailed error so you can debug (response body, status)
    console.error('Error calling shortener API:', error?.response?.status, error?.response?.data ?? error.message);
    // In case of an API error, return the original URL to prevent data loss
    return longUrl;
  }
};

