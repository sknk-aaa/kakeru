"use client";

import { RadialBarChart, RadialBar, Legend, ResponsiveContainer } from "recharts";
import DailyBarChart from "./DailyBarChart";

// ── types ──────────────────────────────────────────────────────────────────

export type RecentUser = {
  id: string;
  email: string | null;
  created_at: string;
  stripe_payment_method_id: string | null;
  is_subscribed: boolean | null;
};

export type AdminData = {
  today: string;
  jstMonthLabel: string;
  monthNum: string;
  totalUsersNum: number;
  newToday: number | null;
  newYesterday: number | null;
  newWeek: number | null;
  newMonth: number | null;
  dau: number;
  proCount: number | null;
  cardRegisteredCount: number | null;
  goalCreatedCount: number;
  firstRunCount: number;
  mrrEstimate: number;
  monthPenaltySum: number;
  penaltyYesterdaySum: number;
  allPenaltySum: number;
  goalsToday: number | null;
  goalsYesterday: number | null;
  runsToday: number | null;
  runsYesterday: number | null;
  achievedToday: number | null;
  todayDone: number;
  achieveRate: number | null;
  runsMonth: number | null;
  pendingTodayCount: number | null;
  paymentFailuresLast7d: number;
  penaltyChart7: number[];
  runsChart7: number[];
  userChart30: number[];
  sourcesSorted: [string, number][];
  recentUsers: RecentUser[];
  goalsBy: Record<string, number>;
  runsBy: Record<string, number>;
  penaltiesBy: Record<string, number>;
};

// ── design tokens ──────────────────────────────────────────────────────────

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

// ── shared components ──────────────────────────────────────────────────────

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
  label, value, unit, deltaVal, deltaPrefix, sub, dimValue,
}: {
  label: string;
  value: string | number;
  unit?: string;
  deltaVal?: number;
  deltaPrefix?: string;
  sub?: string;
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
    </Card>
  );
}

function AlertCard({ label, value, sub, type }: {
  label: string; value: number; sub?: string; type: "zero" | "warn" | "error";
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

function jstDateStr(dateStr: string): string {
  const d = new Date(new Date(dateStr).getTime() + 9 * 60 * 60 * 1000);
  return d.toISOString().split("T")[0];
}

const th: React.CSSProperties = {
  padding: "10px 20px", textAlign: "left", fontSize: "11px", letterSpacing: "0.04em",
  color: INK4, fontWeight: 600, background: BG, borderBottom: `1px solid ${LINE}`, whiteSpace: "nowrap",
};
const thNum: React.CSSProperties = { ...th, textAlign: "right" };
const td: React.CSSProperties = { padding: "13px 20px", color: INK, verticalAlign: "middle" };
const tdNum: React.CSSProperties = { ...td, textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 };

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card style={{ padding: "20px 20px 12px", marginTop: "14px" }}>
      <div style={{ fontSize: "12px", fontWeight: 600, color: INK3, marginBottom: "12px" }}>{title}</div>
      {children}
    </Card>
  );
}

// ── visual components ──────────────────────────────────────────────────────

function NewSignupsCard({ d }: { d: AdminData }) {
  const cells = [
    { label: "今日", value: d.newToday ?? 0, delta: (d.newToday ?? 0) - (d.newYesterday ?? 0), showDelta: true },
    { label: "今週", value: d.newWeek ?? 0, showDelta: false },
    { label: "今月", value: d.newMonth ?? 0, showDelta: false },
  ];
  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 12px", borderBottom: `1px solid ${LINE}`, fontSize: "12px", fontWeight: 600, color: INK3 }}>
        新規登録
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
        {cells.map(({ label, value, delta, showDelta }, i) => (
          <div key={label} style={{ padding: "16px 20px", borderRight: i < 2 ? `1px solid ${LINE}` : undefined }}>
            <div style={{ fontSize: "11px", color: INK4, fontWeight: 500, marginBottom: "6px" }}>{label}</div>
            <div style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1, color: value === 0 ? INK4 : INK, letterSpacing: "-0.02em" }}>
              {value}
            </div>
            {showDelta && delta !== undefined && (
              <div style={{ marginTop: "6px" }}>
                <DeltaBadge n={delta} />
                <span style={{ fontSize: "10px", color: INK4, marginLeft: "4px" }}>vs 昨日</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function OnboardingFunnel({ d }: { d: AdminData }) {
  const steps = [
    { label: "カード登録",   value: d.cardRegisteredCount ?? 0, color: ORANGE },
    { label: "目標作成",     value: d.goalCreatedCount,         color: GREEN  },
    { label: "初回ラン完了", value: d.firstRunCount,            color: BLUE   },
  ];
  const max = d.totalUsersNum || 1;
  return (
    <Card>
      <div style={{ fontSize: "12px", fontWeight: 600, color: INK3, marginBottom: "16px" }}>
        オンボーディングファネル{" "}
        <span style={{ color: INK4, fontWeight: 500 }}>N = {d.totalUsersNum}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {steps.map(({ label, value, color }) => {
          const pct = (value / max) * 100;
          return (
            <div key={label}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "12px" }}>
                <span style={{ color: INK, fontWeight: 600 }}>{label}</span>
                <span style={{ color: INK3, fontWeight: 700 }}>
                  {value}{" "}
                  <span style={{ color: INK4, fontWeight: 400 }}>({pct.toFixed(1)}%)</span>
                </span>
              </div>
              <div style={{ height: "28px", background: LINE2, borderRadius: "6px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.max(pct, 0)}%`, background: color, borderRadius: "6px" }} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function OnboardingRadial({ d }: { d: AdminData }) {
  const total = d.totalUsersNum || 1;
  const items = [
    { name: "カード登録",   value: Math.round((d.cardRegisteredCount ?? 0) / total * 100), fill: ORANGE },
    { name: "目標作成",     value: Math.round(d.goalCreatedCount            / total * 100), fill: GREEN  },
    { name: "初回ラン完了", value: Math.round(d.firstRunCount               / total * 100), fill: BLUE   },
  ];
  return (
    <Card style={{ padding: "20px 20px 12px" }}>
      <div style={{ fontSize: "12px", fontWeight: 600, color: INK3, marginBottom: "4px" }}>
        オンボーディング達成率
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <RadialBarChart
          cx="50%" cy="50%" innerRadius="30%" outerRadius="90%"
          barSize={14} data={items} startAngle={90} endAngle={-270}
        >
          <RadialBar dataKey="value" cornerRadius={4} background={{ fill: LINE2 }} />
          <Legend
            iconSize={10}
            layout="vertical"
            verticalAlign="middle"
            align="right"
            formatter={(value: string) => {
              const item = items.find((i) => i.name === value);
              return <span style={{ fontSize: "11px", color: INK }}>{value} {item?.value ?? 0}%</span>;
            }}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </Card>
  );
}

function UtmStackedBar({ sourcesSorted }: { sourcesSorted: [string, number][] }) {
  const total = sourcesSorted.reduce((s, [, c]) => s + c, 0) || 1;
  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ height: "32px", borderRadius: "8px", overflow: "hidden", display: "flex" }}>
        {sourcesSorted.map(([source, count]) => (
          <div
            key={source}
            style={{
              width: `${(count / total) * 100}%`,
              background: getUtmColor(source),
              minWidth: count > 0 ? "2px" : 0,
            }}
            title={`${source}: ${count} (${Math.round((count / total) * 100)}%)`}
          />
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 16px", marginTop: "10px" }}>
        {sourcesSorted.map(([source, count]) => (
          <div key={source} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: INK3 }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: getUtmColor(source), display: "inline-block", flexShrink: 0 }} />
            <span style={{ fontWeight: 600, color: INK }}>{source}</span>
            <span>{Math.round((count / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── main component ─────────────────────────────────────────────────────────

export default function AdminShell({ data: d }: { data: AdminData }) {
  const totalRevenue = d.mrrEstimate + d.monthPenaltySum;
  const utmTotal = d.sourcesSorted.reduce((s, [, c]) => s + c, 0) || 1;

  return (
    <div style={{ background: BG, minHeight: "100dvh" }}>
      {/* ヘッダー */}
      <header style={{ background: INK, padding: "16px 40px", display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontFamily: "var(--font-display), sans-serif", fontSize: "18px", fontWeight: 800, color: "#fff", letterSpacing: "-0.01em" }}>
          KAKERU
        </span>
        <span style={{ fontSize: "10px", fontWeight: 700, background: ORANGE, color: "#fff", padding: "2px 7px", borderRadius: "100px", letterSpacing: "0.04em" }}>
          ADMIN
        </span>
        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginLeft: "auto" }}>
          {d.today} JST
        </span>
      </header>

      {/* コンテンツ */}
      <main style={{ maxWidth: "1060px", margin: "0 auto", padding: "36px 40px" }}>

        {/* ① ヒーロー */}
        <div style={{ marginBottom: "28px" }}>
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
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", marginTop: "2px" }}>{d.jstMonthLabel}</div>
              <div style={{ fontSize: "56px", fontWeight: 800, letterSpacing: "-0.02em", marginTop: "12px", lineHeight: 1, fontFamily: "var(--font-display), sans-serif" }}>
                ¥{totalRevenue.toLocaleString()}
              </div>
              <div style={{ marginTop: "14px", display: "flex", gap: "12px", flexWrap: "wrap", fontSize: "13px", color: "rgba(255,255,255,0.8)" }}>
                {[
                  { label: "PRO", value: `¥${d.mrrEstimate.toLocaleString()}` },
                  { label: "罰金", value: `¥${d.monthPenaltySum.toLocaleString()}` },
                ].map(({ label, value }) => (
                  <span key={label} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", padding: "5px 10px", borderRadius: "100px" }}>
                    {label} <strong style={{ color: "#fff", fontWeight: 700, marginLeft: "4px" }}>{value}</strong>
                  </span>
                ))}
              </div>
            </div>
            <div style={{ position: "relative", zIndex: 1, textAlign: "right" }}>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)", marginBottom: "8px" }}>月次推移</div>
              <svg width="200" height="70" viewBox="0 0 220 80" preserveAspectRatio="none">
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

        {/* ② アラート */}
        <div style={{ marginBottom: "28px" }}>
          <SectionHead title="アラート" note="対応が必要な項目" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
            <AlertCard
              label="課金失敗(直近7日)"
              value={d.paymentFailuresLast7d}
              sub={d.paymentFailuresLast7d === 0 ? "問題なし" : `${d.paymentFailuresLast7d}件の失敗`}
              type={d.paymentFailuresLast7d === 0 ? "zero" : "error"}
            />
            <AlertCard
              label="今日の判定待ち"
              value={d.pendingTodayCount ?? 0}
              sub={(d.pendingTodayCount ?? 0) > 0 ? `罰金処理キューに ${d.pendingTodayCount} 件` : "処理なし"}
              type={(d.pendingTodayCount ?? 0) === 0 ? "zero" : "warn"}
            />
          </div>
        </div>

        {/* ③ サービス状況 + OnboardingRadial */}
        <div style={{ marginBottom: "28px" }}>
          <SectionHead title="サービス状況" note="主要指標サマリー" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "14px", alignItems: "start" }}>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-[14px]">
              <MetricCard label="総ユーザー数" value={d.totalUsersNum} sub="全期間" />
              <MetricCard label="PRO 加入数" value={d.proCount ?? 0} sub={`MRR ¥${d.mrrEstimate.toLocaleString()}`} />
              <MetricCard label="DAU (24h ラン)" value={d.dau} unit={`/ ${d.totalUsersNum}`} sub={`アクティブ率 ${d.totalUsersNum > 0 ? Math.round((d.dau / d.totalUsersNum) * 100) : 0}%`} />
              <MetricCard label="今月の新規登録" value={d.newMonth ?? 0} sub={`${d.monthNum}月1日から`} dimValue={(d.newMonth ?? 0) === 0} />
              <MetricCard label="今日のラン" value={d.runsToday ?? 0} deltaVal={(d.runsToday ?? 0) - (d.runsYesterday ?? 0)} sub="vs 昨日" />
              <MetricCard label="今月の罰金売上" value={`¥${d.monthPenaltySum.toLocaleString()}`} sub={`累計: ¥${d.allPenaltySum.toLocaleString()}`} />
            </div>
            <OnboardingRadial d={d} />
          </div>
        </div>

        {/* ④ ユーザー登録推移 */}
        <div style={{ marginBottom: "28px" }}>
          <SectionHead title="ユーザー" note="登録推移とオンボーディング" />
          <ChartCard title="ユーザー登録推移 (過去30日)">
            <DailyBarChart data={d.userChart30} today={d.today} color={ORANGE} height={280} />
          </ChartCard>
          <div style={{ marginTop: "14px", marginBottom: "14px" }}>
            <NewSignupsCard d={d} />
          </div>
          <div className="grid grid-cols-2 gap-[14px]" style={{ marginBottom: "14px" }}>
            <MetricCard label="総ユーザー数" value={d.totalUsersNum} sub="全期間" />
            <MetricCard label="DAU (24h ラン)" value={d.dau} unit={`/ ${d.totalUsersNum}`} sub={`アクティブ率 ${d.totalUsersNum > 0 ? Math.round((d.dau / d.totalUsersNum) * 100) : 0}%`} />
          </div>
          <OnboardingFunnel d={d} />
        </div>

        {/* ⑤ 売上 */}
        <div style={{ marginBottom: "28px" }}>
          <SectionHead title="売上" note="PRO課金と罰金の内訳" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[14px]">
            <MetricCard label="PRO 加入数" value={d.proCount ?? 0} sub="アクティブ契約" />
            <MetricCard label="推定 MRR" value={`¥${d.mrrEstimate.toLocaleString()}`} sub="PRO数 × ¥480" />
            <MetricCard label="今月の罰金売上" value={`¥${d.monthPenaltySum.toLocaleString()}`} deltaVal={d.monthPenaltySum - d.penaltyYesterdaySum} deltaPrefix="¥" />
            <MetricCard label="累計罰金売上" value={`¥${d.allPenaltySum.toLocaleString()}`} sub="サービス開始から" />
          </div>
          <ChartCard title="罰金推移 (過去7日)">
            <DailyBarChart data={d.penaltyChart7} today={d.today} color={ORANGE} unit="¥" height={200} />
          </ChartCard>
        </div>

        {/* ⑤ アクティビティ */}
        <div style={{ marginBottom: "28px" }}>
          <SectionHead title="アクティビティ" note="本日のユーザー行動" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[14px]">
            <MetricCard label="今日の目標作成" value={d.goalsToday ?? 0} deltaVal={(d.goalsToday ?? 0) - (d.goalsYesterday ?? 0)} sub="vs 昨日" />
            <MetricCard label="今日のラン" value={d.runsToday ?? 0} deltaVal={(d.runsToday ?? 0) - (d.runsYesterday ?? 0)} sub="vs 昨日" />
            <MetricCard label="今日の達成率" value={d.achieveRate != null ? `${d.achieveRate}%` : "—"} sub={d.todayDone > 0 ? `${d.achievedToday ?? 0}/${d.todayDone}` : "本日まだ結果なし"} dimValue={d.achieveRate == null} />
            <MetricCard label="今月の累計ラン" value={d.runsMonth ?? 0} sub={`${d.monthNum}月累計`} />
          </div>
          <ChartCard title="ラン推移 (過去7日)">
            <DailyBarChart data={d.runsChart7} today={d.today} color={GREEN} height={200} />
          </ChartCard>
        </div>

        {/* ⑥ 流入元 */}
        <div style={{ marginBottom: "28px" }}>
          <SectionHead title="流入元" note="UTMソース別の登録数" />
          {d.sourcesSorted.length > 0 && <UtmStackedBar sourcesSorted={d.sourcesSorted} />}
          <Card>
            {d.sourcesSorted.length === 0 ? (
              <p style={{ textAlign: "center", color: INK4, fontSize: "13px" }}>データがありません</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {d.sourcesSorted.map(([source, count]) => {
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
                        <span style={{ display: "block", fontSize: "10px", color: INK4, fontWeight: 500, marginTop: "1px" }}>{Math.round(pct)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* ⑥ ユーザーテーブル */}
        <div>
          <SectionHead title="最新ユーザー一覧" note="登録日の新しい順" />
          <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: "12px", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", display: "flex", alignItems: "baseline", justifyContent: "space-between", borderBottom: `1px solid ${LINE}` }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: INK }}>直近の登録</h3>
              <span style={{ fontSize: "12px", color: INK4 }}>表示 {d.recentUsers.length} 件</span>
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
                  {d.recentUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: "20px", textAlign: "center", color: INK4, fontSize: "13px" }}>
                        まだユーザーがいません
                      </td>
                    </tr>
                  ) : d.recentUsers.map((u) => {
                    const fines = d.penaltiesBy[u.id] ?? 0;
                    return (
                      <tr key={u.id} style={{ borderBottom: `1px solid ${LINE2}` }}>
                        <td style={{ ...td, color: BLUE, fontWeight: 500, whiteSpace: "nowrap", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {u.email}
                        </td>
                        <td style={{ ...td, color: INK3, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                          {jstDateStr(u.created_at)}
                        </td>
                        <td style={td}>
                          <Badge variant={u.stripe_payment_method_id ? "card-yes" : "card-no"}>
                            {u.stripe_payment_method_id ? "登録済" : "未登録"}
                          </Badge>
                        </td>
                        <td style={tdNum}>{d.goalsBy[u.id] ?? 0}</td>
                        <td style={tdNum}>{d.runsBy[u.id] ?? 0}</td>
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

      </main>
    </div>
  );
}
