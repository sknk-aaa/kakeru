export const dynamic = "force-dynamic";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import GoalsClient from "./GoalsClient";

const GOAL_SELECT = "id, type, days_of_week, scheduled_date, challenge_start_date, distance_km, duration_minutes, penalty_amount, is_active, created_at";

export default async function GoalsPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: goals } = await supabase
    .from("goals")
    .select(GOAL_SELECT)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  // JSTで日付を計算（サーバーはUTCで動くため+9時間補正）
  const nowJst = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
  const todayStr = nowJst.toISOString().split("T")[0];
  const dayOfWeek = nowJst.getUTCDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(nowJst);
  weekStart.setUTCDate(nowJst.getUTCDate() + mondayOffset);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
  const weekStartStr = weekStart.toISOString().split("T")[0];
  const weekEndStr = weekEnd.toISOString().split("T")[0];

  const goalIds = (goals ?? []).map((g) => g.id);
  const pastOneoffGoalIds = (goals ?? [])
    .filter((g) => g.type === "oneoff" && g.scheduled_date && g.scheduled_date < todayStr)
    .map((g) => g.id);

  const [{ data: instances }, { data: pastOneoffInstances }, { data: inactiveRecurring }] = await Promise.all([
    goalIds.length > 0
      ? supabase
          .from("goal_instances")
          .select("id, goal_id, scheduled_date, status")
          .in("goal_id", goalIds)
          .gte("scheduled_date", weekStartStr)
          .lte("scheduled_date", weekEndStr)
      : Promise.resolve({ data: [] }),
    pastOneoffGoalIds.length > 0
      ? supabase
          .from("goal_instances")
          .select("id, goal_id, scheduled_date, status")
          .in("goal_id", pastOneoffGoalIds)
      : Promise.resolve({ data: [] }),
    supabase
      .from("goals")
      .select(GOAL_SELECT)
      .eq("user_id", user.id)
      .eq("is_active", false)
      .eq("type", "recurring")
      .order("created_at", { ascending: false }),
  ]);

  const inactiveIds = (inactiveRecurring ?? []).map((g) => g.id);
  const { data: inactiveAchieved } = inactiveIds.length > 0
    ? await supabase
        .from("goal_instances")
        .select("goal_id")
        .in("goal_id", inactiveIds)
        .eq("status", "achieved")
    : { data: [] };

  const pastRecurringGoals = (inactiveRecurring ?? [])
    .map((g) => ({
      ...g,
      achievedCount: (inactiveAchieved ?? []).filter((i) => i.goal_id === g.id).length,
    }))
    .filter((g) => g.achievedCount > 0);

  // チャレンジゴールの進捗fetch（N+1解消: 1クエリで全ラン取得してJSで集計）
  const challengeGoals = (goals ?? []).filter((g) => g.type === "challenge" && g.challenge_start_date);
  const challengeProgress: Record<string, { totalDistKm: number; totalSec: number }> = {};
  if (challengeGoals.length > 0) {
    const minDate = challengeGoals.reduce((m, g) => (g.challenge_start_date! < m ? g.challenge_start_date! : m), challengeGoals[0].challenge_start_date!);
    const { data: allChallengeRuns } = await supabase
      .from("runs")
      .select("distance_km, duration_seconds, started_at")
      .eq("user_id", user.id)
      .gte("started_at", minDate + "T00:00:00");
    for (const cg of challengeGoals) {
      const runs = (allChallengeRuns ?? []).filter((r) => r.started_at >= cg.challenge_start_date! + "T00:00:00");
      const totalDistKm = runs.reduce((s, r) => s + (r.distance_km ?? 0), 0);
      const totalSec = runs.reduce((s, r) => s + (r.duration_seconds ?? 0), 0);
      challengeProgress[cg.id] = { totalDistKm: Math.round(totalDistKm * 10) / 10, totalSec };
    }
  }

  return (
    <AppShell>
      <GoalsClient
        goals={goals ?? []}
        instances={instances ?? []}
        todayStr={todayStr}
        pastOneoffInstances={pastOneoffInstances ?? []}
        pastRecurringGoals={pastRecurringGoals}
        initialIsRainy={false}
        challengeProgress={challengeProgress}
      />
    </AppShell>
  );
}
