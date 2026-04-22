import { createClient, ensureUserProfile } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const origin = url.origin;

  if (code) {
    try {
      const supabase = await createClient();
      await supabase.auth.exchangeCodeForSession(code);
      await ensureUserProfile(supabase);
    } catch (error) {
      console.error("Auth callback error:", error);
      return NextResponse.redirect(`${origin}/sign-in?error=auth_failed`);
    }
  }

  return NextResponse.redirect(`${origin}/protected/dashboard`);
}