import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/";

  const supabase = await createClient();

  if (code) {
    // Google OAuth フロー
    await supabase.auth.exchangeCodeForSession(code);
  } else if (tokenHash && type) {
    // メール確認リンクのフロー
    await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as "email" });
  }

  return NextResponse.redirect(`${origin}${next}`);
}
