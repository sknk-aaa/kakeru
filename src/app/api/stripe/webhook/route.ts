import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Missing configuration" }, { status: 400 });
  }

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  let event: import("stripe").Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as import("stripe").Stripe.PaymentIntent;

    await admin
      .from("penalties")
      .update({ status: "charged", charged_at: new Date().toISOString() })
      .eq("stripe_payment_intent_id", pi.id)
      .eq("status", "pending");

    // 課金成功メール
    const { data: penalty } = await admin
      .from("penalties")
      .select("user_id, amount")
      .eq("stripe_payment_intent_id", pi.id)
      .single();

    if (penalty && process.env.RESEND_API_KEY) {
      const { data: userData } = await admin
        .from("users")
        .select("email")
        .eq("id", penalty.user_id)
        .single();

      if (userData?.email) {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: "カケル <noreply@kakeruapp.com>",
          to: userData.email,
          subject: `¥${penalty.amount.toLocaleString()}が課金されました`,
          text: `目標が未達成のため、¥${penalty.amount.toLocaleString()}が課金されました。\n\n引き続きランニングを頑張りましょう！\nhttps://www.kakeruapp.com`,
        });
      }
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object as import("stripe").Stripe.PaymentIntent;

    await admin
      .from("penalties")
      .update({ status: "failed" })
      .eq("stripe_payment_intent_id", pi.id);

    // 課金失敗メール
    const { data: penalty } = await admin
      .from("penalties")
      .select("user_id, amount")
      .eq("stripe_payment_intent_id", pi.id)
      .single();

    if (penalty && process.env.RESEND_API_KEY) {
      const { data: userData } = await admin
        .from("users")
        .select("email")
        .eq("id", penalty.user_id)
        .single();

      if (userData?.email) {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: "カケル <noreply@kakeruapp.com>",
          to: userData.email,
          subject: "【重要】課金処理に失敗しました",
          text: `¥${penalty.amount.toLocaleString()}の課金処理に失敗しました。\n\nクレジットカード情報を更新してください。\nhttps://www.kakeruapp.com/settings`,
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
