
import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const longUrl = searchParams.get("url");

  if (!longUrl) {
    return NextResponse.json({ error: "Missing URL" }, { status: 400 });
  }

  try {
    const apiToken = "9879833b4eadc06c67574fad1eb6f6530fd22178";
    const encodedUrl = encodeURIComponent(longUrl);

    const apiUrl = `https://festive-bazaar.shop/api?api=${apiToken}&url=${encodedUrl}&format=json`;

    const res = await axios.get(apiUrl, {
      headers: { Accept: "application/json" },
      timeout: 10000,
    });

    const data = res.data;

    if (data.status === "success" && data.shortenedUrl) {
      return NextResponse.json({ short: data.shortenedUrl });
    } else {
      return NextResponse.json({ error: data.message || "Failed to shorten" }, { status: 400 });
    }
  } catch (err: any) {
    console.error("Shortener API error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
