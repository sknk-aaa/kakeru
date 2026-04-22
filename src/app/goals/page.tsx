export const dynamic = "force-dynamic";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import GoalsClient from "./GoalsClient";

export default async function GoalsPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  // JSTで日付を計算（サーバーはUTCで動くため+9時間補正）
  const nowJst = new Date(Date.now() + 9 * 60 * 60 * 1000);
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
  const { data: instances } = goalIds.length > 0
    ? await supabase
        .from("goal_instances")
        .select("goal_id, scheduled_date, status")
        .in("goal_id", goalIds)
        .gte("scheduled_date", weekStartStr)
        .lte("scheduled_date", weekEndStr)
    : { data: [] };

  return (
    <AppShell>
      <GoalsClient
        goals={goals ?? []}
        instances={instances ?? []}
        todayStr={todayStr}
      />
    </AppShell>
  );
}
