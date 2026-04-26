import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildEmailHtml, goalBox, ctaButton } from "@/lib/emails";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ skipped: "RESEND_API_KEY not set" });
  }

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  const admin = createAdminClient();
  const today = new Date().toLocaleDateString("sv-SE");
  const hour = new Date().getHours();

  const { data: todayInstances } = await admin
    .from("goal_instances")
    .select("user_id, goals(distance_km, duration_minutes, penalty_amount)")
    .eq("scheduled_date", today)
    .eq("status", "pending") as {
      data: Array<{
        user_id: string;
        goals: { distance_km: number | null; duration_minutes: number | null; penalty_amount: number | null } | null;
      }> | null;
    };

  if (!todayInstances || todayInstances.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const userIds = [...new Set(todayInstances.map((i) => i.user_id))];
  const { data: users } = await admin
    .from("users")
    .select("id, email, notify_morning, notify_evening")
    .in("id", userIds) as { data: Array<{ id: string; email: string; notify_morning: boolean; notify_evening: boolean }> | null };

  let sent = 0;
  for (const user of users ?? []) {
    if (!user.email) continue;
    if (hour <= 10 && !user.notify_morning) continue;
    if (hour > 10 && !user.notify_evening) continue;
    const instance = todayInstances.find((i) => i.user_id === user.id);
    const goal = instance?.goals ?? null;

    let subject = "";
    let html = "";

    if (hour <= 10) {
      subject = "【カケル】今日は走る日です";
      html = buildEmailHtml(`
        <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#111111;">おはようございます。</p>
        <p style="margin:0 0 28px;font-size:15px;color:#555555;line-height:1.8;">
          本日、ランニング目標が設定されています。<br>
          達成できなかった場合、<strong style="color:#111111;">本日0時に自動的に課金が発生</strong>しますので、<br>
          ぜひ今日中に目標を達成しましょう！
        </p>
        ${goalBox({
          distanceKm: goal?.distance_km ?? null,
          durationMinutes: goal?.duration_minutes ?? null,
          penaltyAmount: goal?.penalty_amount ?? null,
        })}
        ${ctaButton("アプリを開いて走り始める", "https://www.kakeruapp.com")}
      `);
    } else {
      subject = "【カケル】本日の目標が未達成です — 0時に課金が発生します";
      html = buildEmailHtml(`
        <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#111111;">本日の目標がまだ達成されていません。</p>
        <p style="margin:0 0 28px;font-size:15px;color:#555555;line-height:1.8;">
          このまま未達成の場合、<strong style="color:#EF4444;">本日0時をもって自動的に課金が発生</strong>します。<br>
          まだ間に合います。今すぐ走り始めましょう！
        </p>
        ${goalBox({
          distanceKm: goal?.distance_km ?? null,
          durationMinutes: goal?.duration_minutes ?? null,
          penaltyAmount: goal?.penalty_amount ?? null,
          label: "未達成の目標",
          accentColor: "#EF4444",
        })}
        ${ctaButton("アプリを開いて走り始める", "https://www.kakeruapp.com")}
      `);
    }

    await resend.emails.send({
      from: "カケル <noreply@kakeruapp.com>",
      to: user.email,
      subject,
      html,
    });
    sent++;
  }

  return NextResponse.json({ sent });
}
