import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Force this route to always run fresh (no caching)
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("urls")
      .select("id, short_code, original_url, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Failed to fetch history" },
        { status: 500 }
      );
    }

    const response = NextResponse.json(data || []);

    // Extra safety: tell browsers and CDN never to cache this
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}