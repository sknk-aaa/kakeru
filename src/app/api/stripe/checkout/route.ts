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

  // すでに加入済みなら何もしない
  if (userData?.is_subscribed) {
    return NextResponse.json({ success: true });
  }

  const { plan } = await request.json() as { plan: "monthly" | "yearly" };
  const priceId = plan === "yearly" ? process.env.STRIPE_PRICE_YEARLY : process.env.STRIPE_PRICE_MONTHLY;

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const admin = createAdminClient();

  if (userData?.stripe_customer_id) {
    // Stripe 上にアクティブなサブスクが既に存在する場合は新規作成しない
    const existingSubs = await stripe.subscriptions.list({
      customer: userData.stripe_customer_id,
      status: "active",
      limit: 1,
    });
    if (existingSubs.data.length > 0) {
      await admin.from("users").update({ is_subscribed: true }).eq("id", user.id);
      return NextResponse.json({ success: true });
    }

    // 既存カードで直接サブスク作成
    if (userData.stripe_payment_method_id) {
      try {
        const subscription = await stripe.subscriptions.create({
          customer: userData.stripe_customer_id,
          items: [{ price: priceId }],
          default_payment_method: userData.stripe_payment_method_id,
        });
        if (subscription.status === "active" || subscription.status === "trialing") {
          await admin.from("users").update({ is_subscribed: true }).eq("id", user.id);
          return NextResponse.json({ success: true });
        }
      } catch {
        // 失敗した場合は Checkout にフォールバック
      }
    }
  }

  const origin = request.headers.get("origin") ?? "https://www.kakeruapp.com";

  const session = await stripe.checkout.sessions.create({
    client_reference_id: user.id,
    customer: userData?.stripe_customer_id ?? undefined,
    customer_email: userData?.stripe_customer_id ? undefined : user.email!,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/pro/success`,
    cancel_url: `${origin}/pro`,
    locale: "ja",
  });

  return NextResponse.json({ url: session.url });
}
