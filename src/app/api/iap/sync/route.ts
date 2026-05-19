export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const RC_API_KEY = process.env.REVENUECAT_SECRET_API_KEY;

export async function POST() {
  if (!RC_API_KEY) {
    return NextResponse.json({ error: "RevenueCat secret API key not configured" }, { status: 500 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = await fetch(`https://api.revenuecat.com/v1/subscribers/${user.id}`, {
    headers: {
      Authorization: `Bearer ${RC_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "RevenueCat fetch failed", status: res.status }, { status: 500 });
  }

  const body = (await res.json()) as {
    subscriber?: {
      entitlements?: Record<string, { expires_date: string | null }>;
    };
  };

  const proEntitlement = body.subscriber?.entitlements?.["KAKERU Pro"];
  const now = Date.now();
  const isActive = !!proEntitlement && (
    proEntitlement.expires_date === null ||
    new Date(proEntitlement.expires_date).getTime() > now
  );

  const admin = createAdminClient();
  await admin.from("users").update({ is_subscribed: isActive }).eq("id", user.id);

  return NextResponse.json({ is_subscribed: isActive });
}
