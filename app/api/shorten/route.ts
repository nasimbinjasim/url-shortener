import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Basic URL validation
    let validUrl: string;
    try {
      const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
      validUrl = parsed.toString();
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Generate short code (6 characters)
    const shortCode = nanoid(6);

    const { data, error } = await supabase
      .from("urls")
      .insert({
        short_code: shortCode,
        original_url: validUrl,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Failed to create short URL" },
        { status: 500 }
      );
    }

    // Always prefer https for the public short link
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://url.iamnasim.com";
    if (baseUrl.startsWith("http://")) {
      baseUrl = baseUrl.replace("http://", "https://");
    }

    const shortUrl = `${baseUrl}/${data.short_code}`;

    // Send to Google Sheet (fire-and-forget — does not block the response)
    const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shortCode: data.short_code,
          shortUrl: shortUrl,
          originalUrl: data.original_url,
          createdAt: data.created_at || new Date().toISOString(),
        }),
      }).catch((err) => {
        // Log but never fail the short-link creation
        console.error("Google Sheet webhook failed:", err);
      });
    }

    return NextResponse.json({
      shortUrl,
      shortCode: data.short_code,
      originalUrl: data.original_url,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}