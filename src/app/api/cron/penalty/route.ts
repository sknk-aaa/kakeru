import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toLocaleDateString("sv-SE"); // YYYY-MM-DD in local TZ (JST after TZ=Asia/Tokyo)

  const admin = createAdminClient();

  const { data: pendingInstances } = await admin
    .from("goal_instances")
    .select("id, goal_id, user_id, goals(penalty_amount, escalation_type, escalation_value, consecutive_failures)")
    .eq("scheduled_date", today)
    .eq("status", "pending") as {
      data: Array<{
        id: string;
        goal_id: string;
        user_id: string;
        goals: { penalty_amount: number; escalation_type: string | null; escalation_value: number | null; consecutive_failures: number } | null;
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
    const goalData = instance.goals as { penalty_amount: number; escalation_type: string | null; escalation_value: number | null; consecutive_failures: number } | null;
    const basePenalty = goalData?.penalty_amount ?? 0;
    const newConsecutive = (goalData?.consecutive_failures ?? 0) + 1;

    let chargeAmount = basePenalty;
    if (goalData?.escalation_type && goalData?.escalation_value) {
      if (goalData.escalation_type === "multiplier") {
        chargeAmount = Math.min(basePenalty * Math.pow(goalData.escalation_value, newConsecutive), basePenalty * 5);
      } else {
        chargeAmount = Math.min(basePenalty + goalData.escalation_value * newConsecutive, basePenalty * 5);
      }
    }
    chargeAmount = Math.round(chargeAmount);

    await admin.from("goal_instances").update({ status: "failed" }).eq("id", instance.id);
    await admin.from("goals").update({ consecutive_failures: newConsecutive }).eq("id", instance.goal_id);

    if (chargeAmount <= 0 || !stripe) {
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

    const { data: penaltyRecord } = await admin
      .from("penalties")
      .insert({
        user_id: instance.user_id,
        goal_instance_id: instance.id,
        amount: chargeAmount,
        status: "pending",
      })
      .select()
      .single();

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: chargeAmount,
        currency: "jpy",
        customer: userData.stripe_customer_id ?? undefined,
        payment_method: userData.stripe_payment_method_id,
        confirm: true,
        off_session: true,
      });

      await admin
        .from("penalties")
        .update({ stripe_payment_intent_id: paymentIntent.id })
        .eq("id", penaltyRecord?.id);

      charged++;
    } catch (err) {
      console.error("Stripe charge failed:", err);
      await admin
        .from("penalties")
        .update({ status: "failed" })
        .eq("id", penaltyRecord?.id);
    }
  }

  return NextResponse.json({ processed: pendingInstances.length, charged, skipped });
}
