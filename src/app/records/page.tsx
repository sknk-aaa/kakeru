export const dynamic = "force-dynamic";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import RecordsClient from "./RecordsClient";

export default async function RecordsPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const nowJst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const startOfMonth = `${nowJst.getUTCFullYear()}-${String(nowJst.getUTCMonth() + 1).padStart(2, "0")}-01`;

  const [{ data: userProfile }, { data: allRuns }, { data: allPenalties }] = await Promise.all([
    supabase.from("users").select("monthly_distance_goal_km").eq("id", user.id).single(),
    supabase
      .from("runs")
      .select("*")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false }),
    supabase
      .from("penalties")
      .select("amount, status, charged_at")
      .eq("user_id", user.id)
      .eq("status", "charged"),
  ]);

  const monthGoal = userProfile?.monthly_distance_goal_km ?? 0;
  const monthDistanceKm = Math.round(
    (allRuns ?? [])
      .filter((r) => r.started_at >= `${startOfMonth}T00:00:00`)
      .reduce((sum, r) => sum + (r.distance_km ?? 0), 0) * 10
  ) / 10;

  const bestPace = (allRuns ?? []).reduce(
    (best, r) => (r.pace_seconds_per_km && r.pace_seconds_per_km < best ? r.pace_seconds_per_km : best),
    Infinity
  );
  const longestRun = (allRuns ?? []).reduce(
    (best, r) => (r.distance_km > best ? r.distance_km : best),
    0
  );
  const totalDurationSec = (allRuns ?? []).reduce((sum, r) => sum + (r.duration_seconds ?? 0), 0);
  const totalCalories = (allRuns ?? []).reduce((sum, r) => sum + (r.calories ?? 0), 0);

  return (
    <AppShell>
      <RecordsClient
        runs={allRuns ?? []}
        bestPaceSecPerKm={bestPace === Infinity ? null : bestPace}
        longestRunKm={longestRun}
        totalDurationSec={totalDurationSec}
        totalCalories={totalCalories}
        monthGoal={monthGoal}
        monthDistanceKm={monthDistanceKm}
      />
    </AppShell>
  );
}
