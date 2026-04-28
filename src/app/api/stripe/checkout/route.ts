import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_MONTHLY || !process.env.STRIPE_PRICE_YEARLY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const { data: userData } = await supabase
    .from("users")
    .select("stripe_customer_id, is_subscribed")
    .eq("id", user.id)
    .single();

  // すでに加入済みなら何もしない
  if (userData?.is_subscribed) {
    return NextResponse.json({ success: true });
  }

  const { plan } = await request.json() as { plan: "monthly" | "yearly" };
  const priceId = plan === "yearly" ? process.env.STRIPE_PRICE_YEARLY : process.env.STRIPE_PRICE_MONTHLY;

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const origin = request.headers.get("origin") ?? "https://www.kakeruapp.com";

  // stripe_customer_id を渡すと Stripe Checkout が既存カードを自動表示する
  const session = await stripe.checkout.sessions.create({
    client_reference_id: user.id,
    customer: userData?.stripe_customer_id ?? undefined,
    customer_email: userData?.stripe_customer_id ? undefined : user.email!,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/pro/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pro`,
    locale: "ja",
  });

  return NextResponse.json({ url: session.url });
}
