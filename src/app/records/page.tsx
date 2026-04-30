export const dynamic = "force-dynamic";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import RecordsClient from "./RecordsClient";

export default async function RecordsPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const [{ data: userProfile }, { data: allRuns }] = await Promise.all([
    supabase.from("users").select("monthly_distance_goal_km").eq("id", user.id).single(),
    supabase
      .from("runs")
      .select("id, distance_km, duration_seconds, pace_seconds_per_km, calories, started_at")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false }),
  ]);

  const monthGoal = userProfile?.monthly_distance_goal_km ?? 0;
  const runs = allRuns ?? [];

  const JST_OFFSET = 9 * 60 * 60 * 1000;
  // eslint-disable-next-line react-hooks/purity -- This dynamic server page needs the request-time month boundary.
  const nowJst = new Date(Date.now() + JST_OFFSET);
  const thisYear = nowJst.getUTCFullYear();
  const thisMonth = nowJst.getUTCMonth();
  const prevYear = thisMonth === 0 ? thisYear - 1 : thisYear;
  const prevMonth = thisMonth === 0 ? 11 : thisMonth - 1;

  const monthStartUtc = new Date(Date.UTC(thisYear, thisMonth, 1)).getTime() - JST_OFFSET;
  const prevMonthStartUtc = new Date(Date.UTC(prevYear, prevMonth, 1)).getTime() - JST_OFFSET;

  let bestPace = Infinity, longestRun = 0, totalDurationSec = 0, totalCalories = 0;
  let allTimeDistanceRaw = 0, monthDistanceRaw = 0, prevMonthDistanceRaw = 0;
  let prevMonthRunCount = 0;

  for (const r of runs) {
    const t = new Date(r.started_at).getTime();
    allTimeDistanceRaw += r.distance_km ?? 0;
    if (r.pace_seconds_per_km && r.pace_seconds_per_km < bestPace) bestPace = r.pace_seconds_per_km;
    if ((r.distance_km ?? 0) > longestRun) longestRun = r.distance_km ?? 0;
    totalDurationSec += r.duration_seconds ?? 0;
    totalCalories += r.calories ?? 0;
    if (t >= monthStartUtc) {
      monthDistanceRaw += r.distance_km ?? 0;
    } else if (t >= prevMonthStartUtc) {
      prevMonthDistanceRaw += r.distance_km ?? 0;
      prevMonthRunCount++;
    }
  }

  const allTimeDistanceKm = Math.round(allTimeDistanceRaw * 10) / 10;
  const allTimeRunCount = runs.length;
  const monthDistanceKm = Math.round(monthDistanceRaw * 10) / 10;
  const prevMonthDistanceKm = Math.round(prevMonthDistanceRaw * 10) / 10;

  const recentRuns = runs.filter(r => new Date(r.started_at).getTime() >= prevMonthStartUtc);

  const dayOfWeekJst = nowJst.getUTCDay();
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const weekStartJst = new Date(nowJst);
    weekStartJst.setUTCDate(nowJst.getUTCDate() - dayOfWeekJst - i * 7);
    weekStartJst.setUTCHours(0, 0, 0, 0);
    const weekEndJst = new Date(weekStartJst);
    weekEndJst.setUTCDate(weekStartJst.getUTCDate() + 6);
    weekEndJst.setUTCHours(23, 59, 59, 999);
    const startUtc = weekStartJst.getTime() - JST_OFFSET;
    const endUtc = weekEndJst.getTime() - JST_OFFSET;
    const total = runs.filter(r => {
      const t = new Date(r.started_at).getTime();
      return t >= startUtc && t <= endUtc;
    }).reduce((s, r) => s + r.distance_km, 0);
    return {
      label: `${weekStartJst.getUTCMonth() + 1}/${weekStartJst.getUTCDate()}`,
      total: Math.round(total * 10) / 10,
    };
  }).reverse();

  return (
    <AppShell>
      <RecordsClient
        runs={recentRuns}
        weeklyData={weeklyData}
        allTimeDistanceKm={allTimeDistanceKm}
        allTimeRunCount={allTimeRunCount}
        prevMonthDistanceKm={prevMonthDistanceKm}
        prevMonthRunCount={prevMonthRunCount}
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
