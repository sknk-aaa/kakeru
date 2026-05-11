export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: existing } = await supabase
    .from("users")
    .select("utm_captured_at, utm_source")
    .eq("id", user.id)
    .single() as { data: { utm_captured_at: string | null; utm_source: string | null } | null };

  const body = await req.json().catch(() => ({}));
  const newHasUtm = !!(body.utm_source || body.utm_medium || body.utm_campaign);

  const shouldSave =
    !existing?.utm_captured_at ||
    (!existing?.utm_source && newHasUtm);

  if (!shouldSave) return NextResponse.json({ skipped: true });

  await supabase.from("users").update({
    utm_source: body.utm_source ?? null,
    utm_medium: body.utm_medium ?? null,
    utm_campaign: body.utm_campaign ?? null,
    referrer: body.referrer ?? null,
    landing_path: body.landing_path ?? null,
    utm_captured_at: new Date().toISOString(),
  }).eq("id", user.id);

  return NextResponse.json({ ok: true });
}
