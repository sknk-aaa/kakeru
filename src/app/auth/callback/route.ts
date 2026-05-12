import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const AUTH_HISTORY_KEY = "kakeru_auth_logged_in";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/";

  const supabase = await createClient();
  let authenticated = false;

  if (code) {
    // Google OAuth フロー
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    authenticated = !error;
  } else if (tokenHash && type) {
    // メール確認リンクのフロー
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as "email" });
    authenticated = !error;
  }

  const response = NextResponse.redirect(`${origin}${next}`);
  if (authenticated) {
    response.cookies.set(AUTH_HISTORY_KEY, "1", {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
    });
  }
  return response;
}
