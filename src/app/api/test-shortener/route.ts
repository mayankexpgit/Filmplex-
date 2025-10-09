
import { NextResponse } from "next/server";
import { shortenUrl } from "@/services/shortenerService";

export async function GET() {
  const short = await shortenUrl("https://example.com/very/long/link");
  return NextResponse.json({ short });
}
