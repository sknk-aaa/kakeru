import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // JSTで「今日」を計算（Vercel サーバーは UTC）
  const nowJst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const today = nowJst.toISOString().split("T")[0];

  const admin = createAdminClient();

  const { data: pendingInstances } = await admin
    .from("goal_instances")
    .select("id, user_id, goals(penalty_amount)")
    .eq("scheduled_date", today)
    .eq("status", "pending") as {
      data: Array<{
        id: string;
        user_id: string;
        goals: { penalty_amount: number } | null;
      }> | null;
    };

  if (!pendingInstances || pendingInstances.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  const Stripe = process.env.STRIPE_SECRET_KEY
    ? (await import("stripe")).default
    : null;
  const stripe = Stripe ? new Stripe(process.env.STRIPE_SECRET_KEY!) : null;

  let charged = 0;
  let skipped = 0;

  for (const instance of pendingInstances) {
    const penaltyAmount = (instance.goals as { penalty_amount: number } | null)?.penalty_amount ?? 0;

    // インスタンスを失敗に更新
    await admin
      .from("goal_instances")
      .update({ status: "failed" })
      .eq("id", instance.id);

    if (penaltyAmount <= 0 || !stripe) {
      skipped++;
      continue;
    }

    const { data: userData } = await admin
      .from("users")
      .select("stripe_customer_id, stripe_payment_method_id")
      .eq("id", instance.user_id)
      .single();

    if (!userData?.stripe_payment_method_id) {
      skipped++;
      continue;
    }

    // penaltyレコードを作成（statusはpending、Webhookが charged/failed に更新する）
    const { data: penaltyRecord } = await admin
      .from("penalties")
      .insert({
        user_id: instance.user_id,
        goal_instance_id: instance.id,
        amount: penaltyAmount,
        status: "pending",
      })
      .select()
      .single();

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: penaltyAmount,
        currency: "jpy",
        customer: userData.stripe_customer_id ?? undefined,
        payment_method: userData.stripe_payment_method_id,
        confirm: true,
        off_session: true,
      });

      // payment_intent_idを保存（ステータス更新はWebhookが行う）
      await admin
        .from("penalties")
        .update({ stripe_payment_intent_id: paymentIntent.id })
        .eq("id", penaltyRecord?.id);

      charged++;
    } catch (err) {
      console.error("Stripe charge failed:", err);
      // Stripeが同期エラーを返した場合はWebhookが来ないので直接failedに
      await admin
        .from("penalties")
        .update({ status: "failed" })
        .eq("id", penaltyRecord?.id);
    }
  }

  return NextResponse.json({ processed: pendingInstances.length, charged, skipped });
}
