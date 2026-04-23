import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
  const today = new Date().toLocaleDateString("sv-SE"); // YYYY-MM-DD in local TZ (JST after TZ=Asia/Tokyo)
  const hour = new Date().getHours(); // JST after TZ=Asia/Tokyo

  const { data: todayInstances } = await admin
    .from("goal_instances")
    .select("user_id, goals(distance_km, duration_minutes)")
    .eq("scheduled_date", today)
    .eq("status", "pending") as {
      data: Array<{
        user_id: string;
        goals: { distance_km: number | null; duration_minutes: number | null } | null;
      }> | null;
    };

  if (!todayInstances || todayInstances.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const userIds = [...new Set(todayInstances.map((i) => i.user_id))];
  const { data: users } = await admin
    .from("users")
    .select("id, email")
    .in("id", userIds) as { data: Array<{ id: string; email: string }> | null };

  let sent = 0;
  for (const user of users ?? []) {
    if (!user.email) continue;
    const instance = todayInstances.find((i) => i.user_id === user.id);
    const goal = instance?.goals as { distance_km: number | null; duration_minutes: number | null } | null;
    const goalStr = [
      goal?.distance_km && `${goal.distance_km}km`,
      goal?.duration_minutes && `${goal.duration_minutes}分`,
    ].filter(Boolean).join("・");

    let subject = "";
    let text = "";

    if (hour <= 10) {
      subject = `今日は${goalStr}走る日です`;
      text = `今日の目標: ${goalStr}\n頑張ってください！`;
    } else if (hour <= 21) {
      subject = `まだ達成していません — あと${24 - hour}時間`;
      text = `今日の目標 ${goalStr} がまだ未達成です。残り時間は約${24 - hour}時間です。`;
    } else {
      subject = `あと1時間で罰金が発生します`;
      text = `今日の目標 ${goalStr} が未達成です。残り約1時間で自動課金されます。`;
    }

    await resend.emails.send({
      from: "カケル <noreply@kakeruapp.com>",
      to: user.email,
      subject,
      text,
    });
    sent++;
  }

  return NextResponse.json({ sent });
}
