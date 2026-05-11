export const dynamic = "force-dynamic";

import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { classifySource } from "@/lib/admin-helpers";
import AdminShell, { type AdminData, type RecentUser } from "@/components/admin/AdminShell";

function jstDateStr(date: Date = new Date()): string {
  const d = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return d.toISOString().split("T")[0];
}

function jstDateOffset(daysOffset: number): string {
  return jstDateStr(new Date(Date.now() + daysOffset * 24 * 60 * 60 * 1000));
}

function jstStartOfMonthStr(): string {
  const d = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

function bucketByDay(
  rows: Record<string, unknown>[],
  dateField: string,
  valueField: string | null,
  today: string,
  days = 7,
): number[] {
  const buckets = new Array(days).fill(0);
  const todayMs = Date.parse(today + "T00:00:00+09:00");
  for (const r of rows) {
    const t = r[dateField] as string | null;
    if (!t) continue;
    const dayJst = jstDateStr(new Date(t));
    const dayMs = Date.parse(dayJst + "T00:00:00+09:00");
    const daysAgo = Math.round((todayMs - dayMs) / 86400000);
    if (daysAgo >= 0 && daysAgo < days) {
      buckets[days - 1 - daysAgo] += valueField ? ((r[valueField] as number | null) ?? 0) : 1;
    }
  }
  return buckets;
}

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",").map((s) => s.trim()).filter(Boolean);
  if (!adminEmails.includes(user.email ?? "")) notFound();

  const admin = createAdminClient();
  const today = jstDateStr();
  const yesterday = jstDateOffset(-1);
  const sevenDaysAgo = jstDateOffset(-7);
  const startOfMonth = jstStartOfMonthStr();
  const dayAgoIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const weekAgoIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgoIso = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalUsers },
    { count: newToday },
    { count: newYesterday },
    { count: newWeek },
    { count: newMonth },
    { data: dauRuns },
    { count: proCount },
    { count: cardRegisteredCount },
    { data: goalUsersData },
    { data: runUsersData },
    { data: monthPenalty },
    { data: penaltyYesterday },
    { data: allPenalty },
    { count: goalsToday },
    { count: goalsYesterday },
    { count: runsToday },
    { count: runsYesterday },
    { count: achievedToday },
    { count: failedToday },
    { count: runsMonth },
    { count: pendingTodayCount },
    { data: failedPenaltiesRaw },
    { data: penaltiesLast7Days },
    { data: runsLast7Days },
    { data: usersLast30Days },
    { data: allUsersUtm },
    { data: recentUsersRaw },
  ] = await Promise.all([
    admin.from("users").select("*", { count: "exact", head: true }),
    admin.from("users").select("*", { count: "exact", head: true })
      .gte("created_at", `${today}T00:00:00+09:00`),
    admin.from("users").select("*", { count: "exact", head: true })
      .gte("created_at", `${yesterday}T00:00:00+09:00`)
      .lt("created_at", `${today}T00:00:00+09:00`),
    admin.from("users").select("*", { count: "exact", head: true })
      .gte("created_at", weekAgoIso),
    admin.from("users").select("*", { count: "exact", head: true })
      .gte("created_at", `${startOfMonth}T00:00:00+09:00`),
    admin.from("runs").select("user_id").gte("started_at", dayAgoIso),
    admin.from("users").select("*", { count: "exact", head: true })
      .eq("is_subscribed", true),
    admin.from("users").select("*", { count: "exact", head: true })
      .not("stripe_payment_method_id", "is", null),
    admin.from("goals").select("user_id"),
    admin.from("runs").select("user_id"),
    admin.from("penalties").select("amount")
      .eq("status", "charged")
      .gte("charged_at", `${startOfMonth}T00:00:00+09:00`),
    admin.from("penalties").select("amount")
      .eq("status", "charged")
      .gte("charged_at", `${yesterday}T00:00:00+09:00`)
      .lt("charged_at", `${today}T00:00:00+09:00`),
    admin.from("penalties").select("amount").eq("status", "charged"),
    admin.from("goals").select("*", { count: "exact", head: true })
      .gte("created_at", `${today}T00:00:00+09:00`),
    admin.from("goals").select("*", { count: "exact", head: true })
      .gte("created_at", `${yesterday}T00:00:00+09:00`)
      .lt("created_at", `${today}T00:00:00+09:00`),
    admin.from("runs").select("*", { count: "exact", head: true })
      .gte("started_at", `${today}T00:00:00+09:00`),
    admin.from("runs").select("*", { count: "exact", head: true })
      .gte("started_at", `${yesterday}T00:00:00+09:00`)
      .lt("started_at", `${today}T00:00:00+09:00`),
    admin.from("goal_instances").select("*", { count: "exact", head: true })
      .eq("status", "achieved").eq("scheduled_date", today),
    admin.from("goal_instances").select("*", { count: "exact", head: true })
      .eq("status", "failed").eq("scheduled_date", today),
    admin.from("runs").select("*", { count: "exact", head: true })
      .gte("started_at", `${startOfMonth}T00:00:00+09:00`),
    admin.from("goal_instances").select("*", { count: "exact", head: true })
      .eq("scheduled_date", today).eq("status", "pending"),
    admin.from("penalties").select("id, goal_instances(scheduled_date)").eq("status", "failed"),
    admin.from("penalties").select("amount, charged_at").eq("status", "charged")
      .gte("charged_at", `${sevenDaysAgo}T00:00:00+09:00`),
    admin.from("runs").select("started_at")
      .gte("started_at", `${sevenDaysAgo}T00:00:00+09:00`),
    admin.from("users").select("created_at").gte("created_at", thirtyDaysAgoIso),
    admin.from("users").select("utm_source, utm_medium, utm_campaign, referrer, utm_captured_at"),
    admin.from("users").select("id, email, created_at, stripe_payment_method_id, is_subscribed")
      .order("created_at", { ascending: false }).limit(20),
  ]);

  const dau = new Set((dauRuns ?? []).map((r) => r.user_id)).size;
  const mrrEstimate = (proCount ?? 0) * 480;
  const monthPenaltySum = (monthPenalty ?? []).reduce((s, p) => s + (p.amount ?? 0), 0);
  const penaltyYesterdaySum = (penaltyYesterday ?? []).reduce((s, p) => s + (p.amount ?? 0), 0);
  const allPenaltySum = (allPenalty ?? []).reduce((s, p) => s + (p.amount ?? 0), 0);
  const todayDone = (achievedToday ?? 0) + (failedToday ?? 0);
  const achieveRate = todayDone > 0 ? Math.round(((achievedToday ?? 0) / todayDone) * 100) : null;
  const goalCreatedCount = new Set((goalUsersData ?? []).map((g) => g.user_id)).size;
  const firstRunCount = new Set((runUsersData ?? []).map((r) => r.user_id)).size;

  const paymentFailuresLast7d = (failedPenaltiesRaw ?? []).filter((p) => {
    const gi = p.goal_instances as unknown as { scheduled_date: string } | { scheduled_date: string }[] | null;
    const sd = Array.isArray(gi) ? gi[0]?.scheduled_date : gi?.scheduled_date;
    return sd && sd >= sevenDaysAgo;
  }).length;

  const penaltyChart7 = bucketByDay(penaltiesLast7Days ?? [], "charged_at", "amount", today, 7);
  const runsChart7 = bucketByDay(runsLast7Days ?? [], "started_at", null, today, 7);
  const userChart30 = bucketByDay(usersLast30Days ?? [], "created_at", null, today, 30);

  const sourceCounts = new Map<string, number>();
  for (const u of allUsersUtm ?? []) {
    const key = classifySource(u as { utm_source: string | null; referrer: string | null; utm_captured_at: string | null });
    sourceCounts.set(key, (sourceCounts.get(key) ?? 0) + 1);
  }
  const sourcesSorted = [...sourceCounts.entries()].sort((a, b) => b[1] - a[1]);

  const recentUsers = (recentUsersRaw ?? []) as RecentUser[];
  const userIds = recentUsers.map((u) => u.id);
  const goalsByMap = new Map<string, number>();
  const runsByMap = new Map<string, number>();
  const penaltiesByMap = new Map<string, number>();
  if (userIds.length > 0) {
    const [{ data: g }, { data: r }, { data: p }] = await Promise.all([
      admin.from("goals").select("user_id").in("user_id", userIds),
      admin.from("runs").select("user_id").in("user_id", userIds),
      admin.from("penalties").select("user_id, amount").eq("status", "charged").in("user_id", userIds),
    ]);
    for (const x of g ?? []) goalsByMap.set(x.user_id, (goalsByMap.get(x.user_id) ?? 0) + 1);
    for (const x of r ?? []) runsByMap.set(x.user_id, (runsByMap.get(x.user_id) ?? 0) + 1);
    for (const x of p ?? []) penaltiesByMap.set(x.user_id, (penaltiesByMap.get(x.user_id) ?? 0) + (x.amount ?? 0));
  }

  const totalUsersNum = totalUsers ?? 0;
  const jstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const jstMonthLabel = `${jstNow.getUTCFullYear()}年${jstNow.getUTCMonth() + 1}月(MTD)`;
  const monthNum = String(parseInt(startOfMonth.slice(5, 7), 10));

  const data: AdminData = {
    today,
    jstMonthLabel,
    monthNum,
    totalUsersNum,
    newToday: newToday ?? null,
    newYesterday: newYesterday ?? null,
    newWeek: newWeek ?? null,
    newMonth: newMonth ?? null,
    dau,
    proCount: proCount ?? null,
    cardRegisteredCount: cardRegisteredCount ?? null,
    goalCreatedCount,
    firstRunCount,
    mrrEstimate,
    monthPenaltySum,
    penaltyYesterdaySum,
    allPenaltySum,
    goalsToday: goalsToday ?? null,
    goalsYesterday: goalsYesterday ?? null,
    runsToday: runsToday ?? null,
    runsYesterday: runsYesterday ?? null,
    achievedToday: achievedToday ?? null,
    todayDone,
    achieveRate,
    runsMonth: runsMonth ?? null,
    pendingTodayCount: pendingTodayCount ?? null,
    paymentFailuresLast7d,
    penaltyChart7,
    runsChart7,
    userChart30,
    sourcesSorted,
    recentUsers,
    goalsBy: Object.fromEntries(goalsByMap),
    runsBy: Object.fromEntries(runsByMap),
    penaltiesBy: Object.fromEntries(penaltiesByMap),
  };

  return <AdminShell data={data} />;
}
