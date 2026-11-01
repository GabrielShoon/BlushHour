import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

/** Handles the link in Supabase confirmation / magic-link emails. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/saved";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/saved";

  if (code) {
    const supabase = await getServerSupabase();
    const { error } = (await supabase?.auth.exchangeCodeForSession(code)) ?? { error: true };
    if (!error) return NextResponse.redirect(`${origin}${safeNext}`);
  }
  return NextResponse.redirect(`${origin}/login?error=link`);
}
