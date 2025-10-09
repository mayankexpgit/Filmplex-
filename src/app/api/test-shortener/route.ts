import { NextResponse } from "next/server";
import axios from "axios";
import https from "https";

// ✅ Force Node.js runtime (not edge)
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const longUrl = searchParams.get("url");

    if (!longUrl) {
      return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }

    const apiToken = "9879833b4eadc06c67574fad1eb6f6530fd22178";
    const encodedUrl = encodeURIComponent(longUrl);

    const apiUrl = `https://festive-bazaar.shop/api?api=${apiToken}&url=${encodedUrl}`;

    const res = await axios.get(apiUrl, {
      httpsAgent: new https.Agent({ rejectUnauthorized: false }), // 🔧 ignore SSL
      timeout: 15000,
    });

    const data = res.data;

    if (data.status === "success" && data.shortenedUrl) {
      return NextResponse.json({ short: data.shortenedUrl });
    } else {
      return NextResponse.json({ error: data.message || "Shortening failed" }, { status: 400 });
    }
  } catch (err: any) {
    console.error("Shortener error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
