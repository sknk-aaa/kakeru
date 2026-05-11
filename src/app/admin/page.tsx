export const dynamic = "force-dynamic";

import { redirect, notFound } from "next/navigation";
import {
  Users, UserPlus, Activity,
  CreditCard, Wallet, TrendingUp,
  Target, Flag, Footprints,
  ArrowUp, ArrowDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Sparkline from "@/components/admin/Sparkline";

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
): number[] {
  const buckets = new Array(7).fill(0);
  const todayMs = Date.parse(today + "T00:00:00+09:00");
  for (const r of rows) {
    const t = r[dateField] as string | null;
    if (!t) continue;
    const dayJst = jstDateStr(new Date(t));
    const dayMs = Date.parse(dayJst + "T00:00:00+09:00");
    const daysAgo = Math.round((todayMs - dayMs) / 86400000);
    if (daysAgo >= 0 && daysAgo < 7) {
      buckets[6 - daysAgo] += valueField ? ((r[valueField] as number | null) ?? 0) : 1;
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
  if (!adminEmails.includes(user.email ?? "")) {
    notFound();
  }

  const admin = createAdminClient();
  const today = jstDateStr();
  const yesterday = jstDateOffset(-1);
  const sevenDaysAgo = jstDateOffset(-7);
  const startOfMonth = jstStartOfMonthStr();
  const dayAgoIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const weekAgoIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalUsers },
    { count: newToday },
    { count: newYesterday },
    { count: newWeek },
    { count: newMonth },
    { data: dauRuns },
    { count: proCount },
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
    { data: usersLast7Days },
    { data: runsLast7Days },
    { data: goalsLast7Days },
    { data: penaltiesLast7Days },
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
    admin.from("users").select("created_at")
      .gte("created_at", `${sevenDaysAgo}T00:00:00+09:00`),
    admin.from("runs").select("started_at")
      .gte("started_at", `${sevenDaysAgo}T00:00:00+09:00`),
    admin.from("goals").select("created_at")
      .gte("created_at", `${sevenDaysAgo}T00:00:00+09:00`),
    admin.from("penalties").select("amount, charged_at").eq("status", "charged")
      .gte("charged_at", `${sevenDaysAgo}T00:00:00+09:00`),
  ]);

  const dau = new Set((dauRuns ?? []).map((r) => r.user_id)).size;
  const mrrEstimate = (proCount ?? 0) * 480;
  const monthPenaltySum = (monthPenalty ?? []).reduce((s, p) => s + (p.amount ?? 0), 0);
  const penaltyYesterdaySum = (penaltyYesterday ?? []).reduce((s, p) => s + (p.amount ?? 0), 0);
  const allPenaltySum = (allPenalty ?? []).reduce((s, p) => s + (p.amount ?? 0), 0);
  const todayDone = (achievedToday ?? 0) + (failedToday ?? 0);
  const achieveRate = todayDone > 0
    ? Math.round(((achievedToday ?? 0) / todayDone) * 100)
    : null;

  const usersSparkline = bucketByDay(usersLast7Days ?? [], "created_at", null, today);
  const runsSparkline = bucketByDay(runsLast7Days ?? [], "started_at", null, today);
  const goalsSparkline = bucketByDay(goalsLast7Days ?? [], "created_at", null, today);
  const penaltySparkline = bucketByDay(penaltiesLast7Days ?? [], "charged_at", "amount", today);

  return (
    <div style={{ background: "#F2F2F7", minHeight: "100dvh", padding: "24px 16px 48px" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111111", marginBottom: "4px" }}>
          Admin
        </h1>
        <p style={{ fontSize: "12px", color: "#888888", marginBottom: "24px" }}>
          {today} JST 時点
        </p>

        {/* ヒーロー */}
        <div style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          borderRadius: "20px",
          padding: "24px 28px",
          marginBottom: "28px",
          color: "white",
          boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
        }}>
          <p style={{ fontSize: "12px", opacity: 0.7, marginBottom: "6px", fontWeight: 600, letterSpacing: "0.08em" }}>
            今月の総売上
          </p>
          <p className="metric-value" style={{ fontSize: "44px", lineHeight: 1, marginBottom: "8px" }}>
            ¥{(mrrEstimate + monthPenaltySum).toLocaleString()}
          </p>
          <p style={{ fontSize: "12px", opacity: 0.7 }}>
            PRO ¥{mrrEstimate.toLocaleString()} + 罰金 ¥{monthPenaltySum.toLocaleString()}
          </p>
        </div>

        <SectionLabel>ユーザー</SectionLabel>
        <KpiGrid>
          <KpiCard icon={Users} label="総ユーザー数" value={totalUsers ?? 0} accent="#3B82F6" />
          <KpiCard icon={UserPlus} label="今日の新規" value={newToday ?? 0} accent="#3B82F6"
            trend={{ delta: (newToday ?? 0) - (newYesterday ?? 0) }} sparkline={usersSparkline} />
          <KpiCard icon={UserPlus} label="今週の新規" value={newWeek ?? 0} accent="#3B82F6" />
          <KpiCard icon={UserPlus} label="今月の新規" value={newMonth ?? 0} accent="#3B82F6" />
          <KpiCard icon={Activity} label="DAU (24h ラン)" value={dau} accent="#3B82F6" />
        </KpiGrid>

        <SectionLabel>売上</SectionLabel>
        <KpiGrid>
          <KpiCard icon={CreditCard} label="PRO 加入" value={proCount ?? 0} accent="#FF6B00" />
          <KpiCard icon={Wallet} label="推定 MRR" value={`¥${mrrEstimate.toLocaleString()}`}
            sub="PRO数 × ¥480" accent="#FF6B00" />
          <KpiCard icon={TrendingUp} label="今月の罰金売上"
            value={`¥${monthPenaltySum.toLocaleString()}`}
            trend={{ delta: monthPenaltySum - penaltyYesterdaySum, prefix: "¥" }}
            sparkline={penaltySparkline} accent="#FF6B00" />
          <KpiCard icon={Wallet} label="累計罰金売上"
            value={`¥${allPenaltySum.toLocaleString()}`} accent="#FF6B00" />
        </KpiGrid>

        <SectionLabel>アクティビティ</SectionLabel>
        <KpiGrid>
          <KpiCard icon={Target} label="今日の目標作成" value={goalsToday ?? 0} accent="#22C55E"
            trend={{ delta: (goalsToday ?? 0) - (goalsYesterday ?? 0) }} sparkline={goalsSparkline} />
          <KpiCard icon={Footprints} label="今日のラン" value={runsToday ?? 0} accent="#22C55E"
            trend={{ delta: (runsToday ?? 0) - (runsYesterday ?? 0) }} sparkline={runsSparkline} />
          <KpiCard icon={Flag} label="今日の達成率"
            value={achieveRate != null ? `${achieveRate}%` : "—"}
            sub={todayDone > 0 ? `${achievedToday}/${todayDone}` : "今日まだ結果なし"}
            accent="#22C55E" />
          <KpiCard icon={Footprints} label="今月の累計ラン" value={runsMonth ?? 0} accent="#22C55E" />
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
      gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
      gap: "10px",
      marginBottom: "24px",
    }}>
      {children}
    </div>
  );
}

function KpiCard({
  icon: Icon, label, value, sub, accent, trend, sparkline,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
  trend?: { delta: number; prefix?: string };
  sparkline?: number[];
}) {
  return (
    <div style={{
      background: "white",
      borderRadius: "14px",
      padding: "14px 16px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      borderLeft: `3px solid ${accent}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
        <Icon size={14} color={accent} strokeWidth={2.5} />
        <p style={{ fontSize: "11px", color: "#888888", fontWeight: 600 }}>{label}</p>
      </div>
      <p className="metric-value" style={{ fontSize: "26px", color: "#111111", lineHeight: 1.1 }}>
        {value}
      </p>
      {trend && (
        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
          {trend.delta > 0 ? (
            <>
              <ArrowUp size={11} color="#22C55E" strokeWidth={2.5} />
              <span style={{ fontSize: "11px", color: "#22C55E", fontWeight: 700 }}>
                +{trend.prefix ?? ""}{trend.delta.toLocaleString()}
              </span>
            </>
          ) : trend.delta < 0 ? (
            <>
              <ArrowDown size={11} color="#EF4444" strokeWidth={2.5} />
              <span style={{ fontSize: "11px", color: "#EF4444", fontWeight: 700 }}>
                {trend.prefix ?? ""}{trend.delta.toLocaleString()}
              </span>
            </>
          ) : (
            <span style={{ fontSize: "11px", color: "#AAAAAA", fontWeight: 600 }}>変化なし</span>
          )}
          <span style={{ fontSize: "10px", color: "#BBBBBB" }}>vs 昨日</span>
        </div>
      )}
      {sub && <p style={{ fontSize: "10px", color: "#AAAAAA", marginTop: "4px" }}>{sub}</p>}
      {sparkline && sparkline.length > 1 && (
        <div style={{ marginTop: "8px", height: "28px" }}>
          <Sparkline data={sparkline} color={accent} />
        </div>
      )}
    </div>
  );
}
