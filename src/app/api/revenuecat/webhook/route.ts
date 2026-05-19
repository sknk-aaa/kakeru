export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ACTIVE_EVENTS = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "PRODUCT_CHANGE",
  "UNCANCELLATION",
  "SUBSCRIPTION_EXTENDED",
]);

const INACTIVE_EVENTS = new Set([
  "EXPIRATION",
  "SUBSCRIPTION_PAUSED",
]);

interface RevenueCatEvent {
  type: string;
  app_user_id: string;
  entitlement_ids?: string[];
  entitlement_id?: string;
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expected = process.env.REVENUECAT_WEBHOOK_AUTH;
  if (!expected || authHeader !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { event?: RevenueCatEvent };
  const event = body.event;
  if (!event) return NextResponse.json({ error: "no event" }, { status: 400 });

  const entitlements = event.entitlement_ids ?? (event.entitlement_id ? [event.entitlement_id] : []);
  if (!entitlements.includes("pro")) {
    return NextResponse.json({ ignored: true });
  }

  const admin = createAdminClient();
  if (ACTIVE_EVENTS.has(event.type)) {
    await admin.from("users").update({ is_subscribed: true }).eq("id", event.app_user_id);
  } else if (INACTIVE_EVENTS.has(event.type)) {
    await admin.from("users").update({ is_subscribed: false }).eq("id", event.app_user_id);
  }

  return NextResponse.json({ received: true });
}
