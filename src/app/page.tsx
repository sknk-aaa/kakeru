export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import HomeClient from "./HomeClient";

type HomeClientProps = Parameters<typeof HomeClient>[0];

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/lp");

  // JSTで日付を計算（サーバーはUTCで動くため+9時間補正）
  const nowJst = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
  const todayStr = nowJst.toISOString().split("T")[0];
  const startOfWeek = new Date(nowJst);
  startOfWeek.setUTCDate(nowJst.getUTCDate() - nowJst.getUTCDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6);

  const startOfMonth = `${nowJst.getUTCFullYear()}-${String(nowJst.getUTCMonth() + 1).padStart(2, "0")}-01`;

  const [
    { data: userProfile },
    { data: weekInstances },
    { data: monthRuns },
    { data: monthPenalties },
    { count: achievedCount },
    { count: failedCount },
    { data: streakInstances },
    { data: monthAchieved },
    { data: latestPenaltyRaw },
  ] = await Promise.all([
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
    supabase
      .from("goal_instances")
      .select("status")
      .eq("user_id", user.id)
      .in("status", ["achieved", "failed", "skipped"])
      .order("scheduled_date", { ascending: false })
      .limit(50),
    supabase
      .from("goal_instances")
      .select("goals(penalty_amount)")
      .eq("user_id", user.id)
      .eq("status", "achieved")
      .gte("scheduled_date", startOfMonth),
    supabase
      .from("penalties")
      .select("id, amount, goal_instances(goals(type, distance_km, duration_minutes))")
      .eq("user_id", user.id)
      .eq("status", "charged")
      .order("charged_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

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

  let streak = 0;
  for (const inst of (streakInstances ?? [])) {
    if (inst.status === "achieved") streak++;
    else if (inst.status === "skipped") continue;
    else break;
  }

  const savedPenaltyMonth = (monthAchieved ?? []).reduce((sum, i) => {
    const g = Array.isArray(i.goals) ? i.goals[0] : i.goals as { penalty_amount: number } | null;
    return sum + (g?.penalty_amount ?? 0);
  }, 0);

  function formatGoalSummary(goal: { type: string; distance_km: number | null; duration_minutes: number | null } | null) {
    if (!goal) return null;

    const parts: string[] = [];
    if (goal.distance_km) parts.push(`${goal.distance_km}km`);
    if (goal.duration_minutes) parts.push(`${goal.duration_minutes}分`);

    const summary = parts.join("・") || "フリーラン";
    return goal.type === "challenge" ? `${summary}チャレンジ` : summary;
  }

  const latestPenalty = latestPenaltyRaw ? (() => {
    const raw = latestPenaltyRaw as unknown as {
      id: string;
      amount: number;
      goal_instances: { goals: { type: string; distance_km: number | null; duration_minutes: number | null } | null } | null;
    };
    return {
      id: raw.id,
      amount: raw.amount,
      goalSummary: formatGoalSummary(raw.goal_instances?.goals ?? null),
    };
  })() : null;

  const todayGoalInstances = allInstances.filter(
    (i) => i.scheduled_date === todayStr && i.status === "pending" && i.goals
  );

  return (
    <AppShell>
      <HomeClient
        userProfile={userProfile}
        weekInstances={allInstances}
        todayStr={todayStr}
        totalDistanceMonth={Math.round(totalDistanceMonth * 10) / 10}
        totalPenaltyMonth={totalPenaltyMonth}
        savedPenaltyMonth={savedPenaltyMonth}
        achieveRate={achieveRate}
        streak={streak}
        todayGoalInstances={todayGoalInstances}
        latestPenalty={latestPenalty}
      />
    </AppShell>
  );
}
