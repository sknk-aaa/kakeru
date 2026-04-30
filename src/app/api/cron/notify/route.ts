import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildEmailHtml, goalBox, ctaButton } from "@/lib/emails";

function goalDescription(goal: { distance_km: number | null; duration_minutes: number | null; penalty_amount: number | null } | null) {
  if (!goal) return "ランニング目標";
  if (goal.distance_km) return `${goal.distance_km}km`;
  if (goal.duration_minutes) return `${goal.duration_minutes}分`;
  return "フリーラン";
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  // Vercel サーバーは UTC 動作。JST = UTC+9 で today を計算
  const nowJst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const today = nowJst.toISOString().split("T")[0];
  const hour = nowJst.getUTCHours(); // JST の時刻

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
    return NextResponse.json({ emailSent: 0, pushSent: 0 });
  }

  const userIds = [...new Set(todayInstances.map((i) => i.user_id))];
  const isMorning = hour <= 10;

  // ── メール送信 ──────────────────────────────────────
  let emailSent = 0;
  if (process.env.RESEND_API_KEY) {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data: emailUsers } = await admin
      .from("users")
      .select("id, email, notify_morning, notify_evening")
      .in("id", userIds) as { data: Array<{ id: string; email: string; notify_morning: boolean; notify_evening: boolean }> | null };

    for (const user of emailUsers ?? []) {
      if (!user.email) continue;
      if (isMorning && !user.notify_morning) continue;
      if (!isMorning && !user.notify_evening) continue;
      const instance = todayInstances.find((i) => i.user_id === user.id);
      const goal = instance?.goals ?? null;

      let subject = "";
      let html = "";
      if (isMorning) {
        subject = "【カケル】今日は走る日です";
        html = buildEmailHtml(`
          <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#111111;">おはようございます。</p>
          <p style="margin:0 0 28px;font-size:15px;color:#555555;line-height:1.8;">
            本日、ランニング目標が設定されています。<br>
            達成できなかった場合、<strong style="color:#111111;">本日0時に自動的に課金が発生</strong>しますので、<br>
            ぜひ今日中に目標を達成しましょう！
          </p>
          ${goalBox({ distanceKm: goal?.distance_km ?? null, durationMinutes: goal?.duration_minutes ?? null, penaltyAmount: goal?.penalty_amount ?? null })}
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
          ${goalBox({ distanceKm: goal?.distance_km ?? null, durationMinutes: goal?.duration_minutes ?? null, penaltyAmount: goal?.penalty_amount ?? null, label: "未達成の目標", accentColor: "#EF4444" })}
          ${ctaButton("アプリを開いて走り始める", "https://www.kakeruapp.com")}
        `);
      }
      await resend.emails.send({ from: "カケル <noreply@kakeruapp.com>", to: user.email, subject, html });
      emailSent++;
    }
  }

  // ── プッシュ通知 ────────────────────────────────────
  let pushSent = 0;
  if (process.env.VAPID_PRIVATE_KEY && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_EMAIL) {
    const webpush = await import("web-push");
    webpush.default.setVapidDetails(
      process.env.VAPID_EMAIL,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY,
    );

    const { data: pushUsers } = await admin
      .from("users")
      .select("id, push_notify_morning, push_notify_evening")
      .in("id", userIds) as { data: Array<{ id: string; push_notify_morning: boolean; push_notify_evening: boolean }> | null };

    const pushUserIds = (pushUsers ?? [])
      .filter((u) => isMorning ? u.push_notify_morning : u.push_notify_evening)
      .map((u) => u.id);

    if (pushUserIds.length > 0) {
      const { data: subs } = await admin
        .from("push_subscriptions")
        .select("user_id, endpoint, p256dh, auth")
        .in("user_id", pushUserIds) as {
          data: Array<{ user_id: string; endpoint: string; p256dh: string; auth: string }> | null;
        };

      for (const sub of subs ?? []) {
        const instance = todayInstances.find((i) => i.user_id === sub.user_id);
        const goal = instance?.goals ?? null;
        const desc = goalDescription(goal);
        const penalty = goal?.penalty_amount;

        const payload = isMorning
          ? {
              title: "今日は走る日です 🏃",
              body: `${desc}${penalty ? `　設定ペナルティ額：¥${penalty.toLocaleString()}` : ""}`,
              url: "/",
            }
          : {
              title: "今日の目標がまだ完了していません！",
              body: `${desc} — このまま未達成だと0時に課金されます`,
              url: "/",
            };

        try {
          await webpush.default.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            JSON.stringify(payload),
          );
          pushSent++;
        } catch (err: unknown) {
          // 410 Gone = サブスクリプション期限切れ → 削除
          if (err && typeof err === "object" && "statusCode" in err && (err as { statusCode: number }).statusCode === 410) {
            await admin.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
          }
        }
      }
    }
  }

  return NextResponse.json({ emailSent, pushSent });
}
