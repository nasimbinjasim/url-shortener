import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: { shortCode: string } }
) {
  const { shortCode } = params;

  // Ignore favicon and other static requests
  if (shortCode.includes(".") || shortCode === "favicon.ico") {
    return NextResponse.next();
  }

  const { data, error } = await supabase
    .from("urls")
    .select("original_url")
    .eq("short_code", shortCode)
    .single();

  if (error || !data) {
    // Redirect to homepage if not found
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.redirect(data.original_url, 301);
}