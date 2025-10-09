
import { NextResponse } from 'next/server';
import fetch from 'node-fetch';
import https from 'https';

export const runtime = 'nodejs';

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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const longUrl = searchParams.get('url');

    if (!longUrl) {
      return NextResponse.json({ error: 'Missing URL' }, { status: 400 });
    }

    const apiToken = '9879833b4eadc06c67574fad1eb6f6530fd22178';
    const encodedUrl = encodeURIComponent(longUrl);

    const apiUrl = `https://festive-bazaar.shop/api?api=${apiToken}&url=${encodedUrl}`;

    const fetchPromise = fetch(apiUrl, {
      // @ts-ignore - Using custom agent for fetch which is allowed in Node.js runtime
      agent,
    });

    const res = await withTimeout(fetchPromise, 15000); // 15-second timeout

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API returned ${res.status}: ${errorText}`);
    }
    
    const data = await res.json();

    if (data.status === 'success' && data.shortenedUrl) {
      return NextResponse.json({ short: data.shortenedUrl });
    } else {
      return NextResponse.json(
        { error: data.message || 'Shortening failed' },
        { status: 400 }
      );
    }
  } catch (err: any) {
    console.error('Shortener proxy error:', err.message);
    if (err.message === 'Request timed out') {
        return NextResponse.json({ error: 'Request to shortener API timed out.' }, { status: 504 });
    }
    return NextResponse.json({ error: err.message || 'An unknown error occurred' }, { status: 500 });
  }
}
