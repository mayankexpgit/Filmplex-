import { NextResponse } from 'next/server';
import https from "https";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Correct API token and URL structure
    const apiToken = '9879833b4eadc06c67574fad1eb6f6530fd22178';
    const apiUrl = `https://festive-bazaar.shop/api?api=${apiToken}&url=${encodeURIComponent(url)}`;

    // Custom agent to bypass SSL verification in development environments
    const agent = new https.Agent({ rejectUnauthorized: false });

    const res = await fetch(apiUrl, { 
      cache: "no-store",
      // @ts-expect-error In Node.js fetch, you can pass a custom agent.
      agent,
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error(`Shortener API returned status ${res.status}: ${errorText}`);
        throw new Error(`Shortener API returned an error. Please try again.`);
    }

    const data = await res.json();
    
    if (data.status === 'success' && data.shortenedUrl) {
      return NextResponse.json({ shortUrl: data.shortenedUrl });
    } else {
      console.error("Shortener API Error:", data.message || 'Unknown API error');
      throw new Error(data.message || 'Shortening failed due to an unknown API error.');
    }

  } catch (err: any) {
    console.error("Error in /api/shorten route:", err.message);
    return NextResponse.json(
      { error: err.message || "An unknown server error occurred" },
      { status: 500 }
    );
  }
}
