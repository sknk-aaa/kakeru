import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  const user = await requireUser();
  const supabase = await createClient();

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const [{ data: userProfile }, { data: weekInstances }, { data: monthRuns }, { data: monthPenalties }] =
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

  return (
    <AppShell>
      <HomeClient
        userProfile={userProfile}
        weekInstances={allInstances}
        todayStr={todayStr}
        totalDistanceMonth={Math.round(totalDistanceMonth * 10) / 10}
        monthGoal={monthGoal}
        progressPct={Math.round(progressPct)}
        totalPenaltyMonth={totalPenaltyMonth}
        achieveRate={achieveRate}
      />
    </AppShell>
  );
}
