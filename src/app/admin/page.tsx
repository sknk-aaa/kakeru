export const dynamic = "force-dynamic";

import { redirect, notFound } from "next/navigation";
import {
  Users, UserPlus, Activity,
  CreditCard, Wallet, TrendingUp,
  Target, Flag, Footprints,
  ArrowUp, ArrowDown,
  AlertTriangle, Clock,
  CheckCircle2, MapPin,
  ListChecks,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Sparkline from "@/components/admin/Sparkline";
import { classifySource } from "@/lib/admin-helpers";

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
    { data: usersLast7Days },
    { data: runsLast7Days },
    { data: goalsLast7Days },
    { data: penaltiesLast7Days },
    { data: allUsersUtm },
    { data: recentUsers },
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
    admin.from("users").select("created_at")
      .gte("created_at", `${sevenDaysAgo}T00:00:00+09:00`),
    admin.from("runs").select("started_at")
      .gte("started_at", `${sevenDaysAgo}T00:00:00+09:00`),
    admin.from("goals").select("created_at")
      .gte("created_at", `${sevenDaysAgo}T00:00:00+09:00`),
    admin.from("penalties").select("amount, charged_at").eq("status", "charged")
      .gte("charged_at", `${sevenDaysAgo}T00:00:00+09:00`),
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
  const achieveRate = todayDone > 0
    ? Math.round(((achievedToday ?? 0) / todayDone) * 100)
    : null;

  const goalCreatedCount = new Set((goalUsersData ?? []).map((g) => g.user_id)).size;
  const firstRunCount = new Set((runUsersData ?? []).map((r) => r.user_id)).size;

  const paymentFailuresLast7d = (failedPenaltiesRaw ?? []).filter((p) => {
    const gi = p.goal_instances as unknown as { scheduled_date: string } | { scheduled_date: string }[] | null;
    const sd = Array.isArray(gi) ? gi[0]?.scheduled_date : gi?.scheduled_date;
    return sd && sd >= sevenDaysAgo;
  }).length;

  const usersSparkline = bucketByDay(usersLast7Days ?? [], "created_at", null, today);
  const runsSparkline = bucketByDay(runsLast7Days ?? [], "started_at", null, today);
  const goalsSparkline = bucketByDay(goalsLast7Days ?? [], "created_at", null, today);
  const penaltySparkline = bucketByDay(penaltiesLast7Days ?? [], "charged_at", "amount", today);

  // 流入元集計
  const sourceCounts = new Map<string, number>();
  for (const u of allUsersUtm ?? []) {
    const key = classifySource(u as { utm_source: string | null; referrer: string | null; utm_captured_at: string | null });
    sourceCounts.set(key, (sourceCounts.get(key) ?? 0) + 1);
  }
  const sourcesSorted = [...sourceCounts.entries()].sort((a, b) => b[1] - a[1]);

  // ユーザー一覧の集計
  const userIds = (recentUsers ?? []).map((u) => u.id);
  const goalsBy = new Map<string, number>();
  const runsBy = new Map<string, number>();
  const penaltiesBy = new Map<string, number>();

  if (userIds.length > 0) {
    const [{ data: g }, { data: r }, { data: p }] = await Promise.all([
      admin.from("goals").select("user_id").in("user_id", userIds),
      admin.from("runs").select("user_id").in("user_id", userIds),
      admin.from("penalties").select("user_id, amount").eq("status", "charged").in("user_id", userIds),
    ]);
    for (const x of g ?? []) goalsBy.set(x.user_id, (goalsBy.get(x.user_id) ?? 0) + 1);
    for (const x of r ?? []) runsBy.set(x.user_id, (runsBy.get(x.user_id) ?? 0) + 1);
    for (const x of p ?? []) penaltiesBy.set(x.user_id, (penaltiesBy.get(x.user_id) ?? 0) + (x.amount ?? 0));
  }

  const totalUsersNum = totalUsers ?? 0;

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

        <SectionLabel>アラート</SectionLabel>
        <KpiGrid>
          <KpiCard icon={AlertTriangle} label="課金失敗(7日)" value={paymentFailuresLast7d} accent="#EF4444" />
          <KpiCard icon={Clock} label="今日の判定待ち" value={pendingTodayCount ?? 0} accent="#EF4444" />
        </KpiGrid>

        <SectionLabel>オンボーディング</SectionLabel>
        <KpiGrid>
          <KpiCard icon={CreditCard} label="カード登録"
            value={`${cardRegisteredCount ?? 0}/${totalUsersNum}`}
            sub={totalUsersNum > 0 ? `${(((cardRegisteredCount ?? 0) / totalUsersNum) * 100).toFixed(1)}%` : "—"}
            accent="#A855F7" />
          <KpiCard icon={Target} label="目標作成"
            value={`${goalCreatedCount}/${totalUsersNum}`}
            sub={totalUsersNum > 0 ? `${((goalCreatedCount / totalUsersNum) * 100).toFixed(1)}%` : "—"}
            accent="#A855F7" />
          <KpiCard icon={CheckCircle2} label="初回ラン完了"
            value={`${firstRunCount}/${totalUsersNum}`}
            sub={totalUsersNum > 0 ? `${((firstRunCount / totalUsersNum) * 100).toFixed(1)}%` : "—"}
            accent="#A855F7" />
        </KpiGrid>

        <SectionLabel>ユーザー</SectionLabel>
        <KpiGrid>
          <KpiCard icon={Users} label="総ユーザー数" value={totalUsersNum} accent="#3B82F6" />
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

        {/* 流入元 */}
        <SectionLabel>流入元</SectionLabel>
        <div style={{
          background: "white", borderRadius: "14px", padding: "8px 0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          borderLeft: "3px solid #6B7280",
          marginBottom: "24px",
        }}>
          {sourcesSorted.length === 0 ? (
            <p style={{ padding: "16px", textAlign: "center", color: "#AAAAAA", fontSize: "13px" }}>
              データがありません
            </p>
          ) : sourcesSorted.map(([source, count], i) => (
            <div key={source} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 16px",
              borderTop: i > 0 ? "1px solid #F5F5F5" : "none",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <MapPin size={12} color="#6B7280" />
                <span style={{ fontSize: "13px", color: "#111111", fontWeight: 500 }}>{source}</span>
              </div>
              <span className="metric-value" style={{ fontSize: "16px", color: "#111111" }}>
                {count}
              </span>
            </div>
          ))}
        </div>

        {/* ユーザー一覧 */}
        <SectionLabel>最新ユーザー一覧 (20件)</SectionLabel>
        <div style={{
          background: "white", borderRadius: "14px", padding: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          overflowX: "auto",
        }}>
          {(!recentUsers || recentUsers.length === 0) ? (
            <p style={{ padding: "20px", textAlign: "center", color: "#AAAAAA", fontSize: "13px" }}>
              <ListChecks size={20} style={{ display: "inline-block", marginRight: 6, verticalAlign: "middle" }} />
              まだユーザーがいません
            </p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: "560px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #EEE" }}>
                  <th style={th}>メール</th>
                  <th style={th}>登録日</th>
                  <th style={th}>カード</th>
                  <th style={thNum}>目標</th>
                  <th style={thNum}>ラン</th>
                  <th style={th}>PRO</th>
                  <th style={thNum}>罰金</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid #F5F5F5" }}>
                    <td style={{ ...td, maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {u.email}
                    </td>
                    <td style={td}>{jstDateStr(new Date(u.created_at))}</td>
                    <td style={td}>
                      <span style={{ color: u.stripe_payment_method_id ? "#22C55E" : "#AAAAAA", fontWeight: 600 }}>
                        {u.stripe_payment_method_id ? "登録済" : "未登録"}
                      </span>
                    </td>
                    <td style={tdNum}>{goalsBy.get(u.id) ?? 0}</td>
                    <td style={tdNum}>{runsBy.get(u.id) ?? 0}</td>
                    <td style={td}>
                      <span style={{ color: u.is_subscribed ? "#FF6B00" : "#AAAAAA", fontWeight: 700 }}>
                        {u.is_subscribed ? "PRO" : "FREE"}
                      </span>
                    </td>
                    <td style={tdNum}>¥{(penaltiesBy.get(u.id) ?? 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

const th: React.CSSProperties = {
  padding: "10px 8px", textAlign: "left", fontSize: "11px", color: "#888888", fontWeight: 700,
  textTransform: "uppercase", letterSpacing: "0.05em",
};
const thNum: React.CSSProperties = { ...th, textAlign: "right" };
const td: React.CSSProperties = { padding: "10px 8px", color: "#111111" };
const tdNum: React.CSSProperties = { ...td, textAlign: "right", fontVariantNumeric: "tabular-nums" };

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
