import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_MONTHLY || !process.env.STRIPE_PRICE_YEARLY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const { data: userData } = await supabase
    .from("users")
    .select("stripe_customer_id, stripe_payment_method_id, is_subscribed")
    .eq("id", user.id)
    .single();

  if (userData?.is_subscribed) return NextResponse.json({ success: true });

  if (!userData?.stripe_customer_id || !userData?.stripe_payment_method_id) {
    return NextResponse.json({ error: "No card registered" }, { status: 400 });
  }

  const { plan } = await request.json() as { plan: "monthly" | "yearly" };
  const priceId = plan === "yearly" ? process.env.STRIPE_PRICE_YEARLY : process.env.STRIPE_PRICE_MONTHLY;

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const subscription = await stripe.subscriptions.create({
    customer: userData.stripe_customer_id,
    items: [{ price: priceId }],
    default_payment_method: userData.stripe_payment_method_id,
  });

  if (subscription.status === "active" || subscription.status === "trialing") {
    const admin = createAdminClient();
    await admin.from("users").update({ is_subscribed: true }).eq("id", user.id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Subscription incomplete" }, { status: 400 });
}
