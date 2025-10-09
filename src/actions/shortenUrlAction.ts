
'use server';

import fetch from 'node-fetch';
import https from 'https';

// Agent to ignore SSL certificate errors
const agent = new https.Agent({
  rejectUnauthorized: false,
});

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Request timed out"));
    }, ms);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export async function shortenUrlAction(longUrl: string): Promise<{ success: boolean, shortUrl?: string, error?: string }> {
  if (!longUrl) {
    return { success: false, error: 'Missing URL to shorten.' };
  }

  let urlToShorten = longUrl.trim();
  if (!urlToShorten.startsWith('http://') && !urlToShorten.startsWith('https://')) {
      urlToShorten = `https://${urlToShorten}`;
  }

  const apiToken = '9879833b4eadc06c67574fad1eb6f6530fd22178';
  const encodedUrl = encodeURIComponent(urlToShorten);
  const apiUrl = `https://festive-bazaar.shop/api?api=${apiToken}&url=${encodedUrl}`;

  try {
    const fetchPromise = fetch(apiUrl, {
      // @ts-ignore - Using custom agent with node-fetch
      agent,
    });
    
    const res = await withTimeout(fetchPromise, 15000); // 15-second timeout
    
    if (!res.ok) {
        const errorText = await res.text();
        console.error(`Shortener API returned status ${res.status}: ${errorText}`);
        throw new Error(`The link shortener service returned an error: ${res.statusText}`);
    }
    
    const data: any = await res.json();

    if (data.status === 'success' && data.shortenedUrl) {
      return { success: true, shortUrl: data.shortenedUrl };
    } else {
      console.error('Shortener API failed with message:', data.message);
      return { success: false, error: data.message || 'Shortening failed due to an unknown API error.' };
    }
  } catch (err: any) {
    console.error('Shortener action error:', err.message);
    if (err.message === 'Request timed out') {
        return { success: false, error: 'Request to shortener API timed out.' };
    }
    return { success: false, error: err.message || 'An unknown error occurred during shortening.' };
  }
}
