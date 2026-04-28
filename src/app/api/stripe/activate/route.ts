import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // すでに加入済みならそのまま返す
  const { data: userData } = await supabase
    .from("users")
    .select("is_subscribed")
    .eq("id", user.id)
    .single();
  if (userData?.is_subscribed) return NextResponse.json({ activated: true });

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const { sessionId } = await request.json() as { sessionId?: string };
  if (!sessionId) return NextResponse.json({ activated: false });

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  // client_reference_id がログイン中ユーザーと一致し、支払い完了していることを確認
  if (
    session.client_reference_id !== user.id ||
    session.payment_status !== "paid" ||
    !session.customer
  ) {
    return NextResponse.json({ activated: false });
  }

  const admin = createAdminClient();
  await admin
    .from("users")
    .update({ is_subscribed: true, stripe_customer_id: session.customer as string })
    .eq("id", user.id);

  return NextResponse.json({ activated: true });
}
