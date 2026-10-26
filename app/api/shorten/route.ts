import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { supabase } from "@/lib/supabase";

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
      return NextResponse.json({ error: "Failed to create short URL" }, { status: 500 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://url.iamnasim.com";

    return NextResponse.json({
      shortUrl: `${baseUrl}/${data.short_code}`,
      shortCode: data.short_code,
      originalUrl: data.original_url,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}