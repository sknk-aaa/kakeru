import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  // 今日のpending goal_instancesを取得
  const { data: pendingInstances } = await admin
    .from("goal_instances")
    .select("id, user_id, goal_id, goals(penalty_amount)")
    .eq("scheduled_date", today)
    .eq("status", "pending") as {
      data: Array<{
        id: string;
        user_id: string;
        goal_id: string;
        goals: { penalty_amount: number } | null;
      }> | null;
    };

  if (!pendingInstances || pendingInstances.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  let charged = 0;
  let failed = 0;

  for (const instance of pendingInstances) {
    const goal = instance.goals as { penalty_amount: number } | null;
    const penaltyAmount = goal?.penalty_amount ?? 0;

    await admin
      .from("goal_instances")
      .update({ status: "failed" })
      .eq("id", instance.id);

    if (penaltyAmount > 0) {
      const { data: userData } = await admin
        .from("users")
        .select("stripe_customer_id, stripe_payment_method_id, email")
        .eq("id", instance.user_id)
        .single();

      const penaltyRecord = await admin.from("penalties").insert({
        user_id: instance.user_id,
        goal_instance_id: instance.id,
        amount: penaltyAmount,
        status: "pending",
      }).select().single();

      if (userData?.stripe_payment_method_id && process.env.STRIPE_SECRET_KEY) {
        try {
          const Stripe = (await import("stripe")).default;
          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

          const paymentIntent = await stripe.paymentIntents.create({
            amount: penaltyAmount,
            currency: "jpy",
            customer: userData.stripe_customer_id ?? undefined,
            payment_method: userData.stripe_payment_method_id,
            confirm: true,
            off_session: true,
          });

          await admin
            .from("penalties")
            .update({
              stripe_payment_intent_id: paymentIntent.id,
              status: "charged",
              charged_at: new Date().toISOString(),
            })
            .eq("id", penaltyRecord.data?.id);

          // 課金通知メール
          if (userData.email && process.env.RESEND_API_KEY) {
            const { Resend } = await import("resend");
            const resend = new Resend(process.env.RESEND_API_KEY);
            await resend.emails.send({
              from: "カケル <noreply@kakeru-project.vercel.app>",
              to: userData.email,
              subject: `¥${penaltyAmount.toLocaleString()}が課金されました`,
              text: `${today}の目標が未達成のため、¥${penaltyAmount.toLocaleString()}が課金されました。`,
            });
          }
          charged++;
        } catch (err) {
          console.error("Stripe charge failed:", err);
          await admin
            .from("penalties")
            .update({ status: "failed" })
            .eq("id", penaltyRecord.data?.id);
          failed++;
        }
      }
    }
  }

  return NextResponse.json({ processed: pendingInstances.length, charged, failed });
}
