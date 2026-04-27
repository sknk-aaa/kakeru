import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const regenerate = body.regenerate === true;

  const { data: userData } = await supabase.from("users").select("calendar_token").eq("id", user.id).single();

  if (userData?.calendar_token && !regenerate) {
    return NextResponse.json({ token: userData.calendar_token });
  }

  const token = crypto.randomUUID();
  await supabase.from("users").update({ calendar_token: token }).eq("id", user.id);
  return NextResponse.json({ token });
}
