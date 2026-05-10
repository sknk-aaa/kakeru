import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildEmailHtml, ctaButton } from "@/lib/emails";
import { sendPenaltyChargedEmail } from "@/lib/penalty-notify";

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

    const { data: updated } = await admin
      .from("penalties")
      .update({ status: "charged", charged_at: new Date().toISOString() })
      .eq("stripe_payment_intent_id", pi.id)
      .eq("status", "pending")
      .select("id");

    // pending → charged に実際に遷移した行が無ければ、cron が既に処理済 → メール送らない
    if (!updated || updated.length === 0) {
      return NextResponse.json({ received: true, alreadyHandled: true });
    }

    await sendPenaltyChargedEmail(admin, { penaltyId: updated[0].id });
  }

  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object as import("stripe").Stripe.PaymentIntent;

    await admin
      .from("penalties")
      .update({ status: "failed" })
      .eq("stripe_payment_intent_id", pi.id);

    if (!process.env.RESEND_API_KEY) return NextResponse.json({ received: true });

    const { data: penalty } = await admin
      .from("penalties")
      .select("user_id, amount, goal_instance_id")
      .eq("stripe_payment_intent_id", pi.id)
      .single() as { data: { user_id: string; amount: number; goal_instance_id: string | null } | null };

    if (!penalty) return NextResponse.json({ received: true });

    const { data: userData } = await admin
      .from("users")
      .select("email")
      .eq("id", penalty.user_id)
      .single() as { data: { email: string } | null };

    if (!userData?.email) return NextResponse.json({ received: true });

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "カケル <noreply@kakeruapp.com>",
      to: userData.email,
      subject: "【カケル】お支払い処理ができませんでした",
      html: buildEmailHtml(`
        <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#111111;">お支払い処理が完了できませんでした。</p>
        <p style="margin:0 0 28px;font-size:15px;color:#555555;line-height:1.8;">
          いつもカケルをご利用いただきありがとうございます。<br>
          誠に恐れ入りますが、下記の課金処理が完了できませんでした。<br>
          登録されているクレジットカード情報をご確認のうえ、更新してください。
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fff5f5;border-radius:10px;border-left:4px solid #EF4444;margin-bottom:28px;">
          <tr><td style="padding:20px 24px;">
            <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#EF4444;letter-spacing:0.1em;">課金エラー</p>
            <p style="margin:4px 0;font-size:14px;color:#333333;">💳 課金予定額：<strong>¥${penalty.amount.toLocaleString()}</strong></p>
          </td></tr>
        </table>
        <p style="margin:0 0 28px;font-size:15px;color:#555555;line-height:1.8;">
          お手続きが完了しない場合、次回以降の目標管理に影響が出る可能性がございます。<br>
          お早めにご対応いただけますようお願いいたします。
        </p>
        ${ctaButton("カード情報を更新する", "https://www.kakeruapp.com/settings")}
      `),
    });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as import("stripe").Stripe.Checkout.Session;
    if (session.mode === "subscription" && session.client_reference_id && session.customer) {
      await admin
        .from("users")
        .update({ stripe_customer_id: session.customer as string, is_subscribed: true })
        .eq("id", session.client_reference_id);
    }
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated"
  ) {
    const sub = event.data.object as import("stripe").Stripe.Subscription;
    const isActive = sub.status === "active" || sub.status === "trialing";
    await admin
      .from("users")
      .update({ is_subscribed: isActive })
      .eq("stripe_customer_id", sub.customer as string);
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as import("stripe").Stripe.Subscription;
    await admin
      .from("users")
      .update({ is_subscribed: false })
      .eq("stripe_customer_id", sub.customer as string);
  }

  return NextResponse.json({ received: true });
}
