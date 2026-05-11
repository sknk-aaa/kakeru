export const dynamic = "force-dynamic";

import { redirect, notFound } from "next/navigation";
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

// ── design tokens ──
const INK = "#1A1F2E";
const INK3 = "#6B7385";
const INK4 = "#9AA1B1";
const LINE = "#E7E9EE";
const LINE2 = "#EEF0F4";
const BG = "#F5F6F8";
const GREEN = "#1FA463";
const RED = "#E03A2E";
const BLUE = "#2E5BFF";
const ORANGE = "#FF6B00";

function SectionHead({ title, note }: { title: string; note?: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "baseline", gap: "12px",
      marginBottom: "14px", paddingBottom: "10px",
      borderBottom: `1px solid ${LINE}`,
    }}>
      <span style={{ fontSize: "15px", fontWeight: 700, color: INK, letterSpacing: "0.02em" }}>{title}</span>
      {note && <span style={{ fontSize: "12px", color: INK4 }}>{note}</span>}
    </div>
  );
}

function DeltaBadge({ n, prefix = "" }: { n: number; prefix?: string }) {
  if (n > 0) return <span style={{ fontSize: "12px", fontWeight: 600, color: GREEN }}>+{prefix}{n.toLocaleString()}</span>;
  if (n < 0) return <span style={{ fontSize: "12px", fontWeight: 600, color: RED }}>{prefix}{n.toLocaleString()}</span>;
  return <span style={{ fontSize: "12px", fontWeight: 600, color: INK4 }}>±{prefix}0</span>;
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: "12px", padding: "18px 20px", ...style }}>
      {children}
    </div>
  );
}

function MetricCard({
  label, value, unit, deltaVal, deltaPrefix, sub, sparkline, dimValue,
}: {
  label: string;
  value: string | number;
  unit?: string;
  deltaVal?: number;
  deltaPrefix?: string;
  sub?: string;
  sparkline?: number[];
  dimValue?: boolean;
}) {
  return (
    <Card>
      <div style={{ fontSize: "12px", fontWeight: 600, color: INK3, marginBottom: "8px" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1, color: dimValue ? INK4 : INK }}>
          {value}
        </span>
        {unit && <span style={{ fontSize: "14px", fontWeight: 600, color: INK3 }}>{unit}</span>}
        {deltaVal !== undefined && <DeltaBadge n={deltaVal} prefix={deltaPrefix} />}
      </div>
      {sub && <div style={{ fontSize: "11px", color: INK4, marginTop: "4px" }}>{sub}</div>}
      {sparkline && sparkline.length > 1 && (
        <div style={{ height: "26px", width: "100%", marginTop: "10px" }}>
          <Sparkline data={sparkline} color={ORANGE} />
        </div>
      )}
    </Card>
  );
}

function AlertCard({
  label, value, sub, type,
}: {
  label: string;
  value: number;
  sub?: string;
  type: "zero" | "warn" | "error";
}) {
  const borderColor = type === "error" ? RED : type === "warn" ? ORANGE : LINE;
  const bg = type === "error"
    ? "linear-gradient(90deg, rgba(224,58,46,0.04), transparent 60%)"
    : type === "warn"
    ? "linear-gradient(90deg, rgba(255,107,0,0.05), transparent 60%)"
    : "#fff";
  return (
    <div style={{ background: bg, border: `1px solid ${LINE}`, borderLeft: `3px solid ${borderColor}`, borderRadius: "12px", padding: "18px 20px" }}>
      <div style={{ fontSize: "12px", fontWeight: 600, color: INK3, marginBottom: "8px" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
        <span style={{ fontSize: "28px", fontWeight: 700, color: type === "zero" ? INK4 : INK }}>{value}</span>
        {type === "warn" && value > 0 && (
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#E55F00" }}>処理が必要</span>
        )}
      </div>
      {sub && <div style={{ fontSize: "11px", color: INK4, marginTop: "4px" }}>{sub}</div>}
    </div>
  );
}

function ObCard({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <Card>
      <div style={{ fontSize: "12px", fontWeight: 600, color: INK3, marginBottom: "8px" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
        <span style={{ fontSize: "28px", fontWeight: 700, color: INK }}>{value}</span>
        <span style={{ fontSize: "14px", fontWeight: 600, color: INK3 }}>/ {total}</span>
      </div>
      <div style={{ height: "6px", background: LINE2, borderRadius: "100px", marginTop: "12px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${Math.max(pct, 0)}%`, background: color, borderRadius: "100px" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "11px", color: INK4, fontWeight: 500 }}>
        <span>達成率</span>
        <b style={{ color: "#3A4256", fontWeight: 700 }}>{pct.toFixed(1)}%</b>
      </div>
    </Card>
  );
}

function Badge({ children, variant }: {
  children: React.ReactNode;
  variant: "card-yes" | "card-no" | "plan-pro" | "plan-free";
}) {
  const map: Record<string, React.CSSProperties> = {
    "card-yes":  { background: "#E6F6EE", color: GREEN },
    "card-no":   { background: BG, color: INK4 },
    "plan-pro":  { background: "#FFF3EA", color: "#E55F00" },
    "plan-free": { background: BG, color: INK3 },
  };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", fontSize: "11px", fontWeight: 600, padding: "2px 9px", borderRadius: "100px", whiteSpace: "nowrap", ...map[variant] }}>
      {children}
    </span>
  );
}

const UTM_COLORS: Record<string, string> = {
  direct: ORANGE, unknown: ORANGE,
  x: INK, twitter: INK,
  tiktok: RED, note: GREEN, google: BLUE,
};
function getUtmColor(source: string): string {
  return UTM_COLORS[source.toLowerCase()] ?? INK4;
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
  const achieveRate = todayDone > 0 ? Math.round(((achievedToday ?? 0) / todayDone) * 100) : null;
  const goalCreatedCount = new Set((goalUsersData ?? []).map((g) => g.user_id)).size;
  const firstRunCount = new Set((runUsersData ?? []).map((r) => r.user_id)).size;

  const paymentFailuresLast7d = (failedPenaltiesRaw ?? []).filter((p) => {
    const gi = p.goal_instances as unknown as { scheduled_date: string } | { scheduled_date: string }[] | null;
    const sd = Array.isArray(gi) ? gi[0]?.scheduled_date : gi?.scheduled_date;
    return sd && sd >= sevenDaysAgo;
  }).length;

  const penaltySparkline = bucketByDay(penaltiesLast7Days ?? [], "charged_at", "amount", today);

  const sourceCounts = new Map<string, number>();
  for (const u of allUsersUtm ?? []) {
    const key = classifySource(u as { utm_source: string | null; referrer: string | null; utm_captured_at: string | null });
    sourceCounts.set(key, (sourceCounts.get(key) ?? 0) + 1);
  }
  const sourcesSorted = [...sourceCounts.entries()].sort((a, b) => b[1] - a[1]);
  const utmTotal = sourcesSorted.reduce((s, [, c]) => s + c, 0) || 1;

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
  const totalRevenue = mrrEstimate + monthPenaltySum;
  const jstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const jstMonthLabel = `${jstNow.getUTCFullYear()}年${jstNow.getUTCMonth() + 1}月(MTD)`;
  const monthNum = String(parseInt(startOfMonth.slice(5, 7), 10));

  return (
    <div style={{ background: BG, minHeight: "100dvh", padding: "32px 28px 56px" }}>
      <div style={{ maxWidth: "1240px", margin: "0 auto" }}>

        {/* ページヘッダー */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "24px", fontWeight: 700, letterSpacing: "-0.01em", color: INK }}>
            管理ダッシュボード
          </div>
          <div style={{ fontSize: "13px", color: INK3, marginTop: "6px" }}>
            {today} JST 時点 · Kakeru
          </div>
        </div>

        {/* ── ヒーロー ── */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{
            background: INK, color: "#fff", borderRadius: "14px", padding: "28px 32px",
            display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center",
            gap: "24px", position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", right: "-60px", bottom: "-80px",
              width: "240px", height: "240px",
              background: "radial-gradient(circle, rgba(255,107,0,0.32), transparent 65%)",
              pointerEvents: "none",
            }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", letterSpacing: "0.06em", fontWeight: 600, textTransform: "uppercase" }}>
                今月の総売上
              </div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", marginTop: "2px" }}>
                {jstMonthLabel}
              </div>
              <div className="metric-value" style={{ fontSize: "56px", fontWeight: 800, letterSpacing: "-0.02em", marginTop: "12px", lineHeight: 1 }}>
                ¥{totalRevenue.toLocaleString()}
              </div>
              <div style={{ marginTop: "14px", display: "flex", gap: "18px", flexWrap: "wrap", fontSize: "13px", color: "rgba(255,255,255,0.8)" }}>
                <span style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", padding: "5px 10px", borderRadius: "100px" }}>
                  PRO <strong style={{ color: "#fff", fontWeight: 700, marginLeft: "4px" }}>¥{mrrEstimate.toLocaleString()}</strong>
                </span>
                <span style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", padding: "5px 10px", borderRadius: "100px" }}>
                  罰金 <strong style={{ color: "#fff", fontWeight: 700, marginLeft: "4px" }}>¥{monthPenaltySum.toLocaleString()}</strong>
                </span>
              </div>
            </div>
            <div style={{ position: "relative", zIndex: 1, textAlign: "right" }}>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)", marginBottom: "8px" }}>月次推移</div>
              <svg width="220" height="80" viewBox="0 0 220 80" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF6B00" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#FF6B00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <path d="M0 60 L30 58 L60 55 L90 52 L120 45 L150 38 L180 22 L220 12 L220 80 L0 80 Z" fill="url(#heroGrad)" />
                <polyline points="0,60 30,58 60,55 90,52 120,45 150,38 180,22 220,12" stroke="#FF6B00" strokeWidth={2} fill="none" strokeLinecap="round" />
                <circle cx={220} cy={12} r={3.5} fill="#FF6B00" />
                <circle cx={220} cy={12} r={6} fill="#FF6B00" opacity={0.25} />
              </svg>
            </div>
          </div>
        </div>

        {/* ── アラート ── */}
        <div style={{ marginBottom: "36px" }}>
          <SectionHead title="アラート" note="対応が必要な項目" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
            <AlertCard
              label="課金失敗(直近7日)"
              value={paymentFailuresLast7d}
              sub={paymentFailuresLast7d === 0 ? "問題なし" : `${paymentFailuresLast7d}件の失敗`}
              type={paymentFailuresLast7d === 0 ? "zero" : "error"}
            />
            <AlertCard
              label="今日の判定待ち"
              value={pendingTodayCount ?? 0}
              sub={(pendingTodayCount ?? 0) > 0 ? `罰金処理キューに ${pendingTodayCount} 件` : "処理なし"}
              type={(pendingTodayCount ?? 0) === 0 ? "zero" : "warn"}
            />
          </div>
        </div>

        {/* ── 売上 ── */}
        <div style={{ marginBottom: "36px" }}>
          <SectionHead title="売上" note="PRO課金と罰金の内訳" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[14px]">
            <MetricCard label="PRO 加入数" value={proCount ?? 0} sub="アクティブ契約" />
            <MetricCard label="推定 MRR" value={`¥${mrrEstimate.toLocaleString()}`} sub="PRO数 × ¥480" />
            <MetricCard
              label="今月の罰金売上"
              value={`¥${monthPenaltySum.toLocaleString()}`}
              deltaVal={monthPenaltySum - penaltyYesterdaySum}
              deltaPrefix="¥"
              sparkline={penaltySparkline}
            />
            <MetricCard label="累計罰金売上" value={`¥${allPenaltySum.toLocaleString()}`} sub="サービス開始から" />
          </div>
        </div>

        {/* ── オンボーディング ── */}
        <div style={{ marginBottom: "36px" }}>
          <SectionHead title="オンボーディング" note={`N = ${totalUsersNum}ユーザー`} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-[14px]">
            <ObCard label="カード登録" value={cardRegisteredCount ?? 0} total={totalUsersNum} color={ORANGE} />
            <ObCard label="目標作成" value={goalCreatedCount} total={totalUsersNum} color={GREEN} />
            <ObCard label="初回ラン完了" value={firstRunCount} total={totalUsersNum} color={BLUE} />
          </div>
        </div>

        {/* ── ユーザー ── */}
        <div style={{ marginBottom: "36px" }}>
          <SectionHead title="ユーザー" note="登録数とアクティブ状況" />
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-[14px]">
            <MetricCard label="総ユーザー数" value={totalUsersNum} sub="全期間" />
            <MetricCard
              label="今日の新規"
              value={newToday ?? 0}
              deltaVal={(newToday ?? 0) - (newYesterday ?? 0)}
              sub="vs 昨日"
              dimValue={(newToday ?? 0) === 0}
            />
            <MetricCard label="今週の新規" value={newWeek ?? 0} sub="月曜起算" dimValue={(newWeek ?? 0) === 0} />
            <MetricCard label="今月の新規" value={newMonth ?? 0} sub={`${monthNum}月1日から`} dimValue={(newMonth ?? 0) === 0} />
            <MetricCard
              label="DAU (24h ラン)"
              value={dau}
              unit={`/ ${totalUsersNum}`}
              sub={`アクティブ率 ${totalUsersNum > 0 ? Math.round((dau / totalUsersNum) * 100) : 0}%`}
            />
          </div>
        </div>

        {/* ── アクティビティ ── */}
        <div style={{ marginBottom: "36px" }}>
          <SectionHead title="アクティビティ" note="本日のユーザー行動" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[14px]">
            <MetricCard
              label="今日の目標作成"
              value={goalsToday ?? 0}
              deltaVal={(goalsToday ?? 0) - (goalsYesterday ?? 0)}
              sub="vs 昨日"
            />
            <MetricCard
              label="今日のラン"
              value={runsToday ?? 0}
              deltaVal={(runsToday ?? 0) - (runsYesterday ?? 0)}
              sub="vs 昨日"
            />
            <MetricCard
              label="今日の達成率"
              value={achieveRate != null ? `${achieveRate}%` : "—"}
              sub={todayDone > 0 ? `${achievedToday ?? 0}/${todayDone}` : "本日まだ結果なし"}
              dimValue={achieveRate == null}
            />
            <MetricCard label="今月の累計ラン" value={runsMonth ?? 0} sub={`${monthNum}月累計`} />
          </div>
        </div>

        {/* ── 流入元 ── */}
        <div style={{ marginBottom: "36px" }}>
          <SectionHead title="流入元" note="UTMソース別の登録数" />
          <Card>
            {sourcesSorted.length === 0 ? (
              <p style={{ textAlign: "center", color: INK4, fontSize: "13px" }}>データがありません</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {sourcesSorted.map(([source, count]) => {
                  const pct = (count / utmTotal) * 100;
                  const color = getUtmColor(source);
                  return (
                    <div key={source} style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: "14px" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 500, color: "#3A4256" }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: color, flexShrink: 0, display: "inline-block" }} />
                          {source}
                        </div>
                        <div style={{ height: "6px", background: LINE2, borderRadius: "100px", overflow: "hidden", marginTop: "6px" }}>
                          <div style={{ width: `${Math.max(pct, 0)}%`, height: "100%", background: color, borderRadius: "100px" }} />
                        </div>
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: count === 0 ? INK4 : INK, minWidth: "40px", textAlign: "right" }}>
                        {count}
                        <span style={{ display: "block", fontSize: "10px", color: INK4, fontWeight: 500, marginTop: "1px" }}>
                          {Math.round(pct)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* ── 最新ユーザー一覧 ── */}
        <div style={{ marginBottom: "36px" }}>
          <SectionHead title="最新ユーザー一覧" note="登録日の新しい順" />
          <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: "12px", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", display: "flex", alignItems: "baseline", justifyContent: "space-between", borderBottom: `1px solid ${LINE}` }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: INK }}>直近の登録</h3>
              <span style={{ fontSize: "12px", color: INK4 }}>表示 {recentUsers?.length ?? 0} 件</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: "720px" }}>
                <thead>
                  <tr>
                    <th style={th}>メール</th>
                    <th style={th}>登録日</th>
                    <th style={th}>カード</th>
                    <th style={thNum}>目標</th>
                    <th style={thNum}>ラン</th>
                    <th style={th}>プラン</th>
                    <th style={thNum}>累計罰金</th>
                  </tr>
                </thead>
                <tbody>
                  {(!recentUsers || recentUsers.length === 0) ? (
                    <tr>
                      <td colSpan={7} style={{ padding: "20px", textAlign: "center", color: INK4, fontSize: "13px" }}>
                        まだユーザーがいません
                      </td>
                    </tr>
                  ) : recentUsers.map((u) => {
                    const fines = penaltiesBy.get(u.id) ?? 0;
                    return (
                      <tr key={u.id} style={{ borderBottom: `1px solid ${LINE2}` }}>
                        <td style={{ ...td, color: BLUE, fontWeight: 500, whiteSpace: "nowrap", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {u.email}
                        </td>
                        <td style={{ ...td, color: INK3, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                          {jstDateStr(new Date(u.created_at))}
                        </td>
                        <td style={td}>
                          <Badge variant={u.stripe_payment_method_id ? "card-yes" : "card-no"}>
                            {u.stripe_payment_method_id ? "登録済" : "未登録"}
                          </Badge>
                        </td>
                        <td style={tdNum}>{goalsBy.get(u.id) ?? 0}</td>
                        <td style={tdNum}>{runsBy.get(u.id) ?? 0}</td>
                        <td style={td}>
                          <Badge variant={u.is_subscribed ? "plan-pro" : "plan-free"}>
                            {u.is_subscribed ? "PRO" : "FREE"}
                          </Badge>
                        </td>
                        <td style={{ ...tdNum, color: fines > 0 ? "#E55F00" : INK4, fontWeight: fines > 0 ? 700 : 500 }}>
                          ¥{fines.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

const th: React.CSSProperties = {
  padding: "10px 20px", textAlign: "left", fontSize: "11px", letterSpacing: "0.04em",
  color: INK4, fontWeight: 600, background: BG, borderBottom: `1px solid ${LINE}`, whiteSpace: "nowrap",
};
const thNum: React.CSSProperties = { ...th, textAlign: "right" };
const td: React.CSSProperties = { padding: "13px 20px", color: INK, verticalAlign: "middle" };
const tdNum: React.CSSProperties = { ...td, textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 };
