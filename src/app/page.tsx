export const dynamic = "force-dynamic";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  const user = await requireUser();
  const supabase = await createClient();

  // JSTで日付を計算（サーバーはUTCで動くため+9時間補正）
  const nowJst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const todayStr = nowJst.toISOString().split("T")[0];
  const startOfWeek = new Date(nowJst);
  startOfWeek.setUTCDate(nowJst.getUTCDate() - nowJst.getUTCDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6);

  const startOfMonth = `${nowJst.getUTCFullYear()}-${String(nowJst.getUTCMonth() + 1).padStart(2, "0")}-01`;

  const [{ data: userProfile }, { data: weekInstances }, { data: monthRuns }, { data: monthPenalties }, { data: todayRuns }] =
    await Promise.all([
      supabase.from("users").select("*").eq("id", user.id).single(),
      supabase
        .from("goal_instances")
        .select("*, goals(*)")
        .eq("user_id", user.id)
        .gte("scheduled_date", startOfWeek.toISOString().split("T")[0])
        .lte("scheduled_date", endOfWeek.toISOString().split("T")[0])
        .order("scheduled_date"),
      supabase
        .from("runs")
        .select("distance_km")
        .eq("user_id", user.id)
        .gte("started_at", `${startOfMonth}T00:00:00`),
      supabase
        .from("penalties")
        .select("amount, status")
        .eq("user_id", user.id)
        .gte("charged_at", `${startOfMonth}T00:00:00`)
        .eq("status", "charged"),
      supabase
        .from("runs")
        .select("distance_km, duration_seconds")
        .eq("user_id", user.id)
        .gte("started_at", `${todayStr}T00:00:00`),
    ]);

  const totalDistanceMonth = (monthRuns ?? []).reduce(
    (acc, r) => acc + (r.distance_km ?? 0),
    0
  );
  const totalPenaltyMonth = (monthPenalties ?? []).reduce(
    (acc, p) => acc + (p.amount ?? 0),
    0
  );
  const monthGoal = userProfile?.monthly_distance_goal_km ?? 0;
  const progressPct = monthGoal > 0 ? Math.min((totalDistanceMonth / monthGoal) * 100, 100) : 0;

  const allInstances = weekInstances ?? [];
  const achievedCount = allInstances.filter((i) => i.status === "achieved").length;
  const totalCount = allInstances.filter((i) => i.status !== "cancelled").length;
  const achieveRate = totalCount > 0 ? Math.round((achievedCount / totalCount) * 100) : 0;

  const todayGoalInstances = allInstances.filter(
    (i) => i.scheduled_date === todayStr && i.status === "pending" && i.goals
  );
  const todayRunDistanceKm = Math.round(
    (todayRuns ?? []).reduce((sum, r) => sum + (r.distance_km ?? 0), 0) * 100
  ) / 100;
  const todayRunDurationSec = (todayRuns ?? []).reduce((sum, r) => sum + (r.duration_seconds ?? 0), 0);

  return (
    <AppShell>
      <HomeClient
        userProfile={userProfile}
        weekInstances={allInstances}
        todayStr={todayStr}
        totalDistanceMonth={Math.round(totalDistanceMonth * 10) / 10}
        totalPenaltyMonth={totalPenaltyMonth}
        achieveRate={achieveRate}
        todayGoalInstances={todayGoalInstances}
        todayRunDistanceKm={todayRunDistanceKm}
        todayRunDurationSec={todayRunDurationSec}
      />
    </AppShell>
  );
}
