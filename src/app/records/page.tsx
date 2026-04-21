import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import RecordsClient from "./RecordsClient";

export default async function RecordsPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const [{ data: allRuns }, { data: allPenalties }] = await Promise.all([
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
      />
    </AppShell>
  );
}
