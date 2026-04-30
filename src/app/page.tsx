export const dynamic = "force-dynamic";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import HomeClient from "./HomeClient";

type HomeClientProps = Parameters<typeof HomeClient>[0];

export default async function HomePage() {
  const user = await requireUser();
  const supabase = await createClient();

  // JSTで日付を計算（サーバーはUTCで動くため+9時間補正）
  const nowJst = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
  const todayStr = nowJst.toISOString().split("T")[0];
  const startOfWeek = new Date(nowJst);
  startOfWeek.setUTCDate(nowJst.getUTCDate() - nowJst.getUTCDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6);

  const startOfMonth = `${nowJst.getUTCFullYear()}-${String(nowJst.getUTCMonth() + 1).padStart(2, "0")}-01`;

  const [{ data: userProfile }, { data: weekInstances }, { data: monthRuns }, { data: monthPenalties }, { count: achievedCount }, { count: failedCount }] =
    await Promise.all([
      supabase
        .from("users")
        .select("skip_count_this_month")
        .eq("id", user.id)
        .single(),
      supabase
        .from("goal_instances")
        .select("id, scheduled_date, status, goals(id, type, distance_km, duration_minutes, penalty_amount)")
        .eq("user_id", user.id)
        .gte("scheduled_date", startOfWeek.toISOString().split("T")[0])
        .lte("scheduled_date", endOfWeek.toISOString().split("T")[0])
        .order("scheduled_date"),
      supabase
        .from("runs")
        .select("distance_km, duration_seconds, started_at")
        .eq("user_id", user.id)
        .gte("started_at", `${startOfMonth}T00:00:00`),
      supabase
        .from("penalties")
        .select("amount")
        .eq("user_id", user.id)
        .gte("charged_at", `${startOfMonth}T00:00:00`)
        .eq("status", "charged"),
      supabase
        .from("goal_instances")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "achieved"),
      supabase
        .from("goal_instances")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "failed"),
    ]);

  const todayRuns = (monthRuns ?? []).filter(r => r.started_at >= `${todayStr}T00:00:00`);

  const totalDistanceMonth = (monthRuns ?? []).reduce(
    (acc, r) => acc + (r.distance_km ?? 0),
    0
  );
  const totalPenaltyMonth = (monthPenalties ?? []).reduce(
    (acc, p) => acc + (p.amount ?? 0),
    0
  );
  const allInstances = (weekInstances ?? []).map((instance) => ({
    ...instance,
    goals: Array.isArray(instance.goals) ? instance.goals[0] ?? null : instance.goals,
  })) as unknown as HomeClientProps["weekInstances"];
  const achieveRate = (achievedCount ?? 0) + (failedCount ?? 0) > 0
    ? Math.round(((achievedCount ?? 0) / ((achievedCount ?? 0) + (failedCount ?? 0))) * 100)
    : 0;

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
