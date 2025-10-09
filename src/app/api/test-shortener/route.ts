'use server';

import { NextResponse } from 'next/server';
import fetch from 'node-fetch';
import https from 'https';

// ✅ Force Node.js runtime (not edge) and ignore SSL errors
export const runtime = 'nodejs';
const agent = new https.Agent({
  rejectUnauthorized: false,
});

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

    const res = await fetch(apiUrl, {
      // @ts-ignore - Using custom agent for fetch
      agent,
      signal: AbortSignal.timeout(15000), // 15-second timeout
    });

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
    // Differentiate between timeout and other errors
    if (err.name === 'AbortError') {
        return NextResponse.json({ error: 'Request to shortener API timed out.' }, { status: 504 });
    }
    return NextResponse.json({ error: err.message || 'An unknown error occurred' }, { status: 500 });
  }
}
