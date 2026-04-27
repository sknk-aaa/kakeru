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
    .select("id, goal_id, user_id, goals(type, penalty_amount, distance_km, duration_minutes, escalation_type, escalation_value, consecutive_failures, challenge_start_date)")
    .eq("scheduled_date", today)
    .eq("status", "pending") as {
      data: Array<{
        id: string;
        goal_id: string;
        user_id: string;
        goals: { type: string; penalty_amount: number; distance_km: number | null; duration_minutes: number | null; escalation_type: string | null; escalation_value: number | null; consecutive_failures: number; challenge_start_date: string | null } | null;
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
    const goalData = instance.goals as { type: string; penalty_amount: number; distance_km: number | null; duration_minutes: number | null; escalation_type: string | null; escalation_value: number | null; consecutive_failures: number; challenge_start_date: string | null } | null;

    // チャレンジゴール：累積ランで達成判定
    if (goalData?.type === "challenge" && goalData.challenge_start_date) {
      const { data: cgRuns } = await admin
        .from("runs")
        .select("distance_km, duration_seconds")
        .eq("user_id", instance.user_id)
        .gte("started_at", goalData.challenge_start_date + "T00:00:00");
      const totalDist = (cgRuns ?? []).reduce((s, r) => s + (r.distance_km ?? 0), 0);
      const totalSec = (cgRuns ?? []).reduce((s, r) => s + (r.duration_seconds ?? 0), 0);
      const achieved =
        (!goalData.distance_km || totalDist >= goalData.distance_km) &&
        (!goalData.duration_minutes || totalSec >= goalData.duration_minutes * 60);
      if (achieved) {
        await admin.from("goal_instances").update({ status: "achieved" }).eq("id", instance.id);
        charged++;
        continue;
      }
      // 未達成 → status=failedにしてから通常の課金フローへ
      await admin.from("goal_instances").update({ status: "failed" }).eq("id", instance.id);
      const basePenalty = goalData.penalty_amount ?? 0;
      if (basePenalty <= 0 || !stripe) { skipped++; continue; }
      const { data: userData } = await admin.from("users").select("stripe_customer_id, stripe_payment_method_id").eq("id", instance.user_id).single();
      if (!userData?.stripe_payment_method_id) { skipped++; continue; }
      const { data: penaltyRecord } = await admin.from("penalties").insert({ user_id: instance.user_id, goal_instance_id: instance.id, amount: basePenalty, status: "pending" }).select().single();
      try {
        const pi = await stripe.paymentIntents.create({ amount: basePenalty, currency: "jpy", customer: userData.stripe_customer_id ?? undefined, payment_method: userData.stripe_payment_method_id, confirm: true, off_session: true });
        await admin.from("penalties").update({ stripe_payment_intent_id: pi.id }).eq("id", penaltyRecord?.id);
        charged++;
      } catch (err) {
        console.error("Stripe charge failed:", err);
        await admin.from("penalties").update({ status: "failed" }).eq("id", penaltyRecord?.id);
      }
      continue;
    }

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
