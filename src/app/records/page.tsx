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
  const monthPrefix = `${startOfMonth}T00:00:00`;

  let monthDistanceRaw = 0, bestPace = Infinity, longestRun = 0, totalDurationSec = 0, totalCalories = 0;
  for (const r of allRuns ?? []) {
    if (r.started_at >= monthPrefix) monthDistanceRaw += r.distance_km ?? 0;
    if (r.pace_seconds_per_km && r.pace_seconds_per_km < bestPace) bestPace = r.pace_seconds_per_km;
    if ((r.distance_km ?? 0) > longestRun) longestRun = r.distance_km ?? 0;
    totalDurationSec += r.duration_seconds ?? 0;
    totalCalories += r.calories ?? 0;
  }
  const monthDistanceKm = Math.round(monthDistanceRaw * 10) / 10;

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
