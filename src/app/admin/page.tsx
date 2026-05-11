export const dynamic = "force-dynamic";

import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function jstDateStr(): string {
  const d = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return d.toISOString().split("T")[0];
}

function jstStartOfMonthStr(): string {
  const d = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",").map((s) => s.trim()).filter(Boolean);
  if (!adminEmails.includes(user.email ?? "")) {
    notFound();
  }

  const admin = createAdminClient();
  const today = jstDateStr();
  const startOfMonth = jstStartOfMonthStr();
  const dayAgoIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const weekAgoIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalUsers },
    { count: newToday },
    { count: newWeek },
    { count: newMonth },
    { data: dauRuns },
    { count: proCount },
    { data: monthPenalty },
    { data: allPenalty },
    { count: goalsToday },
    { count: runsToday },
    { count: achievedToday },
    { count: failedToday },
    { count: runsMonth },
  ] = await Promise.all([
    admin.from("users").select("*", { count: "exact", head: true }),
    admin.from("users").select("*", { count: "exact", head: true })
      .gte("created_at", `${today}T00:00:00+09:00`),
    admin.from("users").select("*", { count: "exact", head: true })
      .gte("created_at", weekAgoIso),
    admin.from("users").select("*", { count: "exact", head: true })
      .gte("created_at", `${startOfMonth}T00:00:00+09:00`),
    admin.from("runs").select("user_id").gte("started_at", dayAgoIso),
    admin.from("users").select("*", { count: "exact", head: true })
      .eq("is_subscribed", true),
    admin.from("penalties").select("amount")
      .eq("status", "charged")
      .gte("charged_at", `${startOfMonth}T00:00:00+09:00`),
    admin.from("penalties").select("amount").eq("status", "charged"),
    admin.from("goals").select("*", { count: "exact", head: true })
      .gte("created_at", `${today}T00:00:00+09:00`),
    admin.from("runs").select("*", { count: "exact", head: true })
      .gte("started_at", `${today}T00:00:00+09:00`),
    admin.from("goal_instances").select("*", { count: "exact", head: true })
      .eq("status", "achieved").eq("scheduled_date", today),
    admin.from("goal_instances").select("*", { count: "exact", head: true })
      .eq("status", "failed").eq("scheduled_date", today),
    admin.from("runs").select("*", { count: "exact", head: true })
      .gte("started_at", `${startOfMonth}T00:00:00+09:00`),
  ]);

  const dau = new Set((dauRuns ?? []).map((r) => r.user_id)).size;
  const mrrEstimate = (proCount ?? 0) * 480;
  const monthPenaltySum = (monthPenalty ?? []).reduce((s, p) => s + (p.amount ?? 0), 0);
  const allPenaltySum = (allPenalty ?? []).reduce((s, p) => s + (p.amount ?? 0), 0);
  const todayDone = (achievedToday ?? 0) + (failedToday ?? 0);
  const achieveRate = todayDone > 0
    ? Math.round(((achievedToday ?? 0) / todayDone) * 100)
    : null;

  return (
    <div style={{ background: "#F2F2F7", minHeight: "100dvh", padding: "24px 16px 48px" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111111", marginBottom: "4px" }}>
          Admin
        </h1>
        <p style={{ fontSize: "12px", color: "#888888", marginBottom: "28px" }}>
          {today} JST 時点
        </p>

        <SectionLabel>ユーザー</SectionLabel>
        <KpiGrid>
          <KpiCard label="総ユーザー数" value={totalUsers ?? 0} />
          <KpiCard label="今日の新規" value={newToday ?? 0} />
          <KpiCard label="今週の新規" value={newWeek ?? 0} />
          <KpiCard label="今月の新規" value={newMonth ?? 0} />
          <KpiCard label="DAU (過去24h ラン)" value={dau} />
        </KpiGrid>

        <SectionLabel>売上</SectionLabel>
        <KpiGrid>
          <KpiCard label="PRO 加入" value={proCount ?? 0} />
          <KpiCard label="推定 MRR" value={`¥${mrrEstimate.toLocaleString()}`} sub="PRO数 × ¥480" />
          <KpiCard label="今月の罰金売上" value={`¥${monthPenaltySum.toLocaleString()}`} />
          <KpiCard label="累計罰金売上" value={`¥${allPenaltySum.toLocaleString()}`} />
        </KpiGrid>

        <SectionLabel>アクティビティ</SectionLabel>
        <KpiGrid>
          <KpiCard label="今日の目標作成" value={goalsToday ?? 0} />
          <KpiCard label="今日のラン" value={runsToday ?? 0} />
          <KpiCard
            label="今日の達成率"
            value={achieveRate != null ? `${achieveRate}%` : "—"}
            sub={todayDone > 0 ? `${achievedToday}/${todayDone}` : "今日まだ結果なし"}
          />
          <KpiCard label="今月の累計ラン" value={runsMonth ?? 0} />
        </KpiGrid>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: "11px", color: "#888888", fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "0.08em",
      marginBottom: "10px", marginTop: "8px", paddingLeft: "2px",
    }}>
      {children}
    </p>
  );
}

function KpiGrid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
      gap: "10px",
      marginBottom: "24px",
    }}>
      {children}
    </div>
  );
}

function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{
      background: "white",
      borderRadius: "14px",
      padding: "14px 16px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    }}>
      <p style={{ fontSize: "11px", color: "#888888", marginBottom: "6px", fontWeight: 600 }}>
        {label}
      </p>
      <p className="metric-value" style={{ fontSize: "26px", color: "#111111", lineHeight: 1.1 }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: "10px", color: "#AAAAAA", marginTop: "4px" }}>{sub}</p>
      )}
    </div>
  );
}
