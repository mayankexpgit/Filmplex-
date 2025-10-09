
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const apiToken = '9879833b4eadc06c67574fad1eb6f6530fd22178';
    const apiUrl = `https://festive-bazaar.shop/api?api=${apiToken}&url=${encodeURIComponent(
      url
    )}`;

    // Using a timeout to prevent long-running requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const res = await fetch(apiUrl, { 
      cache: "no-store",
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Shortener API returned status ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    
    if (data.status === 'success' && data.shortenedUrl) {
      return NextResponse.json({ shortUrl: data.shortenedUrl });
    } else {
      throw new Error(data.message || 'Shortening failed due to an unknown API error.');
    }

  } catch (err: any) {
    console.error("Shortener API Error:", err.message);
    if (err.name === 'AbortError') {
      return NextResponse.json({ error: 'Request to shortener API timed out.' }, { status: 504 });
    }
    return NextResponse.json(
      { error: err.message || "An unknown error occurred" },
      { status: 500 }
    );
  }
}
