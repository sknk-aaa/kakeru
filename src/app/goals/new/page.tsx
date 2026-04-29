"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client-lazy";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AppShell from "@/components/AppShell";
import ProModal from "@/components/ProModal";

const DAYS = ["日", "月", "火", "水", "木", "金", "土"];

type GoalType = "recurring" | "oneoff" | "challenge";
type EscalationType = "multiplier" | "surcharge";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: "12px", color: "#888888", fontWeight: 600, marginBottom: "8px", paddingLeft: "4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
      {children}
    </p>
  );
}

function ListRow({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", padding: "14px 16px", gap: "12px" }}>
        <span style={{ fontSize: "15px", color: "#111111", fontWeight: 500, width: "80px", flexShrink: 0 }}>{label}</span>
        <div style={{ flex: 1 }}>{children}</div>
      </div>
      {!last && <div style={{ height: "1px", background: "#F2F2F2", marginLeft: "16px" }} />}
    </>
  );
}

function Toggle({ value, onChange, disabled }: { value: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={onChange}
      style={{
        width: "44px", height: "26px", borderRadius: "13px",
        background: value ? "#FF6B00" : "#E4E4EB",
        border: "none", cursor: disabled ? "default" : "pointer",
        position: "relative", transition: "background 0.2s", flexShrink: 0,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span style={{
        position: "absolute", top: "3px",
        left: value ? "21px" : "3px",
        width: "20px", height: "20px",
        borderRadius: "50%", background: "white",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        transition: "left 0.2s", display: "block",
      }} />
    </button>
  );
}

export default function NewGoalPage() {
  const router = useRouter();
  const [type, setType] = useState<GoalType>("recurring");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [scheduledDate, setScheduledDate] = useState("");
  const [challengeDays, setChallengeDays] = useState("30");
  const [distanceKm, setDistanceKm] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [penaltyAmount, setPenaltyAmount] = useState("500");
  const [step, setStep] = useState<"form" | "confirm">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [overlapDays, setOverlapDays] = useState<string[]>([]);
  const [showOverlapConfirm, setShowOverlapConfirm] = useState(false);
  const [proModal, setProModal] = useState<{ name: string; desc: string } | null>(null);

  // サブスク機能
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [escalationEnabled, setEscalationEnabled] = useState(false);
  const [escalationType, setEscalationType] = useState<EscalationType>("multiplier");
  const [escalationValue, setEscalationValue] = useState("1.5");
  const [isLocked, setIsLocked] = useState(false);
  const [coolingWeeks, setCoolingWeeks] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSubscription() {
      const supabase = await createBrowserSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("users").select("is_subscribed").eq("id", user.id).single();
      if (!cancelled) {
        setIsSubscribed(data?.is_subscribed ?? false);
      }
    }

    loadSubscription();
    return () => { cancelled = true; };
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayDayOfWeek = new Date(todayStr + "T00:00:00").getDay();
  const includesToday =
    (type === "recurring" && selectedDays.includes(todayDayOfWeek)) ||
    (type === "oneoff" && scheduledDate === todayStr);

  const challengeEndDate = (() => {
    if (type !== "challenge" || !challengeDays || parseInt(challengeDays) < 1) return "";
    const d = new Date();
    d.setDate(d.getDate() + parseInt(challengeDays) - 1);
    return d.toISOString().split("T")[0];
  })();

  function toggleDay(day: number) {
    setSelectedDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  }

  function handleProToggle(setter: (v: boolean) => void, current: boolean, featureName: string, desc: string) {
    if (!isSubscribed) { setProModal({ name: featureName, desc }); return; }
    setter(!current);
  }

  function handleCoolingSelect(weeks: number | null) {
    if (!isSubscribed && weeks !== null) { setProModal({ name: "クーリング期間", desc: "設定後N週間は目標を変更・削除不可にする PRO 限定機能です。" }); return; }
    setCoolingWeeks(weeks);
  }

  function validate() {
    if (type === "recurring" && selectedDays.length === 0) { setError("曜日を1つ以上選択してください"); return false; }
    if (type === "oneoff" && !scheduledDate) { setError("日付を選択してください"); return false; }
    if (type === "challenge" && (!challengeDays || parseInt(challengeDays) < 1)) { setError("期間を入力してください"); return false; }
    if (!distanceKm && !durationMinutes) { setError("距離または時間を入力してください"); return false; }
    if (distanceKm && parseFloat(distanceKm) < 0.1) { setError("距離は0.1km以上で入力してください"); return false; }
    if (durationMinutes && parseInt(durationMinutes) < 1) { setError("時間は1分以上で入力してください"); return false; }
    if (!penaltyAmount || parseInt(penaltyAmount) < 100) { setError("罰金は100円以上で入力してください"); return false; }
    if (escalationEnabled && (!escalationValue || parseFloat(escalationValue) <= 0)) { setError("罰金増加の値を入力してください"); return false; }
    return true;
  }

  async function handleCheckOverlap() {
    setError(null);
    if (!validate()) return;
    if (type === "challenge") { setStep("confirm"); return; }

    const supabase = await createBrowserSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }

    const { data: existingGoals } = await supabase
      .from("goals")
      .select("type, days_of_week, scheduled_date")
      .eq("user_id", user.id)
      .eq("is_active", true);

    const overlaps: string[] = [];
    if (type === "recurring") {
      for (const g of existingGoals ?? []) {
        if (g.type === "recurring" && Array.isArray(g.days_of_week)) {
          for (const d of selectedDays) {
            if ((g.days_of_week as number[]).includes(d) && !overlaps.includes(DAYS[d])) overlaps.push(DAYS[d]);
          }
        }
      }
    } else {
      const targetDayOfWeek = new Date(scheduledDate + "T00:00:00").getDay();
      for (const g of existingGoals ?? []) {
        if (g.type === "oneoff" && g.scheduled_date === scheduledDate) { overlaps.push(scheduledDate); break; }
        if (g.type === "recurring" && Array.isArray(g.days_of_week)) {
          if ((g.days_of_week as number[]).includes(targetDayOfWeek)) { overlaps.push(DAYS[targetDayOfWeek]); break; }
        }
      }
    }

    if (overlaps.length > 0) { setOverlapDays(overlaps); setShowOverlapConfirm(true); }
    else setStep("confirm");
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    const supabase = await createBrowserSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }

    const today = new Date().toISOString().split("T")[0];
    const endDate = type === "challenge" ? challengeEndDate : type === "oneoff" ? scheduledDate : null;

    const { data: goal, error: goalError } = await supabase.from("goals").insert({
      user_id: user.id,
      type,
      days_of_week: type === "recurring" ? selectedDays : null,
      scheduled_date: endDate,
      challenge_start_date: type === "challenge" ? today : null,
      distance_km: distanceKm ? parseFloat(distanceKm) : null,
      duration_minutes: durationMinutes ? parseInt(durationMinutes) : null,
      penalty_amount: parseInt(penaltyAmount),
      is_active: true,
      escalation_type: type === "recurring" && escalationEnabled ? escalationType : null,
      escalation_value: type === "recurring" && escalationEnabled ? parseFloat(escalationValue) : null,
      is_locked: type === "oneoff" && isLocked ? true : false,
      cooling_weeks: type === "recurring" ? coolingWeeks : null,
    }).select().single();

    if (goalError || !goal) { setError("保存に失敗しました"); setLoading(false); return; }

    const instancesToCreate: { goal_id: string; user_id: string; scheduled_date: string; status: string }[] = [];
    if (type === "recurring") {
      for (let i = 0; i < 28; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        if (selectedDays.includes(d.getDay())) {
          instancesToCreate.push({ goal_id: goal.id, user_id: user.id, scheduled_date: d.toISOString().split("T")[0], status: "pending" });
        }
      }
    } else if (type === "oneoff") {
      instancesToCreate.push({ goal_id: goal.id, user_id: user.id, scheduled_date: scheduledDate, status: "pending" });
    } else if (type === "challenge" && challengeEndDate) {
      instancesToCreate.push({ goal_id: goal.id, user_id: user.id, scheduled_date: challengeEndDate, status: "pending" });
    }
    if (instancesToCreate.length > 0) await supabase.from("goal_instances").insert(instancesToCreate);
    router.push("/");
  }

  const inputStyle = {
    border: "none", outline: "none", fontSize: "15px", color: "#111111",
    background: "transparent", width: "100%", textAlign: "right" as const,
  };

  const coolingOptions: { label: string; value: number | null }[] = [
    { label: "なし", value: null },
    { label: "2週間", value: 2 },
    { label: "4週間", value: 4 },
    { label: "8週間", value: 8 },
    { label: "12週間", value: 12 },
  ];

  // タスクB: PRO購読者のみチャレンジタブを表示
  const goalTypes: [GoalType, string][] = [
    ["recurring", "毎週"],
    ["oneoff", "1回のみ"],
    ...(isSubscribed ? [["challenge", "チャレンジ"] as [GoalType, string]] : []),
  ];

  if (step === "confirm") {
    const endDateFormatted = type === "challenge"
      ? (() => { const d = new Date(challengeEndDate + "T00:00:00"); return `${d.getMonth() + 1}/${d.getDate()}(${DAYS[d.getDay()]})`; })()
      : null;

    const summaryRows = [
      { label: "種類", value: type === "recurring" ? "毎週" : type === "oneoff" ? "1回のみ" : "チャレンジ" },
      type === "recurring"
        ? { label: "曜日", value: selectedDays.sort().map((d) => DAYS[d]).join("・") }
        : type === "oneoff"
        ? { label: "日付", value: scheduledDate }
        : { label: "期間", value: `${challengeDays}日間（〜${endDateFormatted}）` },
      distanceKm ? { label: type === "challenge" ? "累計距離" : "距離", value: `${distanceKm}km` } : null,
      durationMinutes ? { label: type === "challenge" ? "累計時間" : "時間", value: `${durationMinutes}分` } : null,
      { label: "罰金", value: `¥${parseInt(penaltyAmount).toLocaleString()}`, danger: true },
      type === "recurring" && escalationEnabled
        ? { label: "罰金増加", value: escalationType === "multiplier" ? `連続失敗×${escalationValue}倍` : `連続失敗+¥${parseInt(escalationValue).toLocaleString()}/回` }
        : null,
      type === "oneoff" && isLocked ? { label: "ロック", value: "取り消し不可能", danger: true } : null,
      type === "recurring" && coolingWeeks != null
        ? { label: "クーリング期間", value: `最初の${coolingWeeks}週間は変更・停止不可`, danger: true }
        : null,
    ].filter(Boolean) as { label: string; value: string; danger?: boolean }[];

    const hasWarningBelow = (type === "challenge") || (type === "oneoff" && isLocked) || (type === "recurring" && coolingWeeks != null);

    return (
      <AppShell>
        <div>
          <div style={{ padding: "20px 20px 12px", display: "flex", alignItems: "center" }}>
            <button onClick={() => setStep("form")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: "#FF6B00", fontSize: "15px", fontWeight: 500 }}>
              <ChevronLeft size={20} color="#FF6B00" /> 戻る
            </button>
          </div>
          <div style={{ padding: "0 16px 24px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111111", marginBottom: "20px" }}>確認</h1>
            <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", marginBottom: "12px" }}>
              {summaryRows.map((row, idx) => (
                <div key={row.label}>
                  {idx > 0 && <div style={{ height: "1px", background: "#F2F2F2", marginLeft: "16px" }} />}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 16px" }}>
                    <span style={{ fontSize: "15px", color: "#888888" }}>{row.label}</span>
                    <span style={{ fontSize: "15px", fontWeight: 600, color: row.danger ? "#EF4444" : "#111111" }}>{row.value}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: "#FFF5EE", borderRadius: "12px", padding: "12px 14px", marginBottom: hasWarningBelow ? "12px" : "20px", borderLeft: "3px solid #FF6B00" }}>
              <p style={{ fontSize: "13px", color: "#FF6B00", lineHeight: 1.5 }}>
                {type === "challenge"
                  ? `⚠️ 期間終了（${endDateFormatted}）時点で未達成の場合、¥${parseInt(penaltyAmount).toLocaleString()}が引き落とされます。期間中は停止できません。`
                  : "⚠️ 未達成の場合はクレジットカードから自動で引き落とされます"}
              </p>
            </div>

            {type === "oneoff" && isLocked && (
              <div style={{ background: "#FEE2E2", borderRadius: "12px", padding: "12px 14px", marginBottom: coolingWeeks != null ? "12px" : "20px", borderLeft: "3px solid #EF4444" }}>
                <p style={{ fontSize: "13px", color: "#EF4444", lineHeight: 1.5 }}>🔒 この目標は作成後、当日まで削除・変更できません</p>
              </div>
            )}

            {type === "recurring" && coolingWeeks != null && (
              <div style={{ background: "#FFF5EE", borderRadius: "12px", padding: "12px 14px", marginBottom: "20px", borderLeft: "3px solid #FF6B00" }}>
                <p style={{ fontSize: "13px", color: "#FF6B00", lineHeight: 1.5 }}>🔒 最初の{coolingWeeks}週間は変更・停止できません</p>
              </div>
            )}

            {error && <p style={{ fontSize: "14px", color: "#EF4444", marginBottom: "12px" }}>{error}</p>}
            <button className="btn-primary" style={{ width: "100%" }} onClick={handleSubmit} disabled={loading}>
              {loading ? "設定中..." : "目標を設定する"}
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div style={{ background: "#F2F2F7", minHeight: "100%" }}>
        <div style={{ padding: "20px 20px 12px", display: "flex", alignItems: "center" }}>
          <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: "#FF6B00", fontSize: "15px", fontWeight: 500 }}>
            <ChevronLeft size={20} color="#FF6B00" /> 戻る
          </button>
        </div>

        <div style={{ padding: "0 16px 24px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111111", marginBottom: "20px" }}>目標を設定</h1>

          {/* タイプ選択 */}
          <SectionLabel>設定タイプ</SectionLabel>
          <div style={{ background: "#E4E4EB", borderRadius: "10px", padding: "2px", display: "flex", marginBottom: "20px" }}>
            {goalTypes.map(([value, label]) => (
              <button
                key={value}
                onClick={() => setType(value)}
                style={{
                  flex: 1, padding: "8px 0", borderRadius: "8px",
                  background: type === value ? "white" : "transparent",
                  boxShadow: type === value ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
                  fontSize: "13px", fontWeight: type === value ? 600 : 500,
                  color: type === value ? "#111111" : "#888888",
                  border: "none", cursor: "pointer", transition: "all 0.15s",
                }}
              >{label}</button>
            ))}
          </div>

          {/* 曜日選択（recurring） */}
          {type === "recurring" && (
            <div style={{ marginBottom: "20px" }}>
              <SectionLabel>実施する曜日</SectionLabel>
              <div style={{ display: "flex", gap: "6px" }}>
                {DAYS.map((day, i) => (
                  <button key={i} onClick={() => toggleDay(i)} style={{
                    flex: 1, height: "44px", borderRadius: "10px", fontSize: "14px", fontWeight: 700,
                    background: selectedDays.includes(i) ? "#FF6B00" : "white",
                    color: selectedDays.includes(i) ? "white" : "#888888",
                    border: "none", cursor: "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)", transition: "all 0.15s",
                  }}>{day}</button>
                ))}
              </div>
              {includesToday && (
                <p style={{ fontSize: "12px", color: "#AAAAAA", marginTop: "8px", paddingLeft: "4px" }}>
                  当日を含む目標は、当日の距離・時間・金額の変更ができません
                </p>
              )}
            </div>
          )}

          {/* 日付選択（oneoff） */}
          {type === "oneoff" && (
            <div style={{ marginBottom: "20px" }}>
              <SectionLabel>実施する日</SectionLabel>
              <div style={{ background: "white", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <div style={{ padding: "14px 16px" }}>
                  <input type="date" value={scheduledDate} min={todayStr}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    style={{ border: "none", outline: "none", fontSize: "15px", color: "#111111", background: "transparent", width: "100%" }} />
                </div>
              </div>
              {includesToday && (
                <p style={{ fontSize: "12px", color: "#AAAAAA", marginTop: "8px", paddingLeft: "4px" }}>
                  当日を含む目標は、当日の距離・時間・金額の変更ができません
                </p>
              )}
            </div>
          )}

          {/* 期間選択（challenge） */}
          {type === "challenge" && (
            <div style={{ marginBottom: "20px" }}>
              <SectionLabel>チャレンジ期間</SectionLabel>
              <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", padding: "14px 16px", gap: "12px" }}>
                  <input
                    type="number" inputMode="numeric" placeholder="30" min="1" max="365"
                    value={challengeDays} onChange={(e) => setChallengeDays(e.target.value)}
                    style={{ flex: 1, border: "none", outline: "none", fontSize: "15px", color: "#111111", background: "transparent", textAlign: "right" }}
                  />
                  <span style={{ fontSize: "15px", color: "#888888", flexShrink: 0 }}>日間</span>
                </div>
              </div>
              {challengeEndDate && (
                <p style={{ fontSize: "12px", color: "#AAAAAA", marginTop: "8px", paddingLeft: "4px" }}>
                  終了日：{challengeEndDate}（当日含む）
                </p>
              )}
              <p style={{ fontSize: "12px", color: "#AAAAAA", marginTop: "4px", paddingLeft: "4px" }}>
                期間中に累計で目標を達成してください。期間終了日に判定されます。
              </p>
            </div>
          )}

          {/* 距離・時間・罰金 */}
          <SectionLabel>{type === "challenge" ? "累計目標・罰金の設定" : "目標・罰金の設定"}</SectionLabel>
          <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", marginBottom: "20px" }}>
            <ListRow label="距離 (km)">
              <input type="number" inputMode="decimal" placeholder="例: 100" min="0.1" step="0.1"
                value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)} style={inputStyle} />
            </ListRow>
            <ListRow label="時間 (分)">
              <input type="number" inputMode="numeric" placeholder="例: 300" min="1"
                value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} style={inputStyle} />
            </ListRow>
            <ListRow label="罰金 (円)" last>
              <input type="number" inputMode="numeric" placeholder="500" min="100" step="100"
                value={penaltyAmount} onChange={(e) => setPenaltyAmount(e.target.value)}
                style={{ ...inputStyle, color: "#EF4444" }} />
            </ListRow>
          </div>
          <p style={{ fontSize: "12px", color: "#AAAAAA", marginBottom: "20px", paddingLeft: "4px" }}>
            {type === "challenge"
              ? "期間中の累計距離・累計時間を目標にします。どちらか一方でも両方でも設定できます。"
              : "距離・時間はどちらか一方、または両方設定できます。罰金は最低100円。"}
          </p>

          {/* PRO機能（recurring） */}
          {type === "recurring" && (
            <>
              <SectionLabel>PRO機能</SectionLabel>
              <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", marginBottom: "20px" }}>
                {/* 連続失敗で罰金増加 */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                    <span style={{ fontSize: "15px", color: "#111111", fontWeight: 500 }}>連続失敗で罰金増加</span>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: "#FF6B00", background: "#FFF0E5", padding: "2px 6px", borderRadius: "4px" }}>PRO</span>
                  </div>
                  <Toggle value={escalationEnabled} onChange={() => handleProToggle(setEscalationEnabled, escalationEnabled, "連続失敗で罰金増加", "連続して失敗するたびに罰金が増加するエスカレーション機能は PRO 限定です。")} disabled={!isSubscribed} />
                </div>
                {escalationEnabled && (
                  <>
                    <div style={{ height: "1px", background: "#F2F2F2" }} />
                    <div style={{ padding: "14px 16px" }}>
                      <p style={{ fontSize: "12px", color: "#888888", marginBottom: "10px" }}>増加方式</p>
                      <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
                        {([["multiplier", "倍率"], ["surcharge", "上乗せ"]] as [EscalationType, string][]).map(([v, label]) => (
                          <button key={v} onClick={() => setEscalationType(v)} style={{
                            flex: 1, padding: "8px", borderRadius: "8px", fontSize: "14px", fontWeight: 600,
                            background: escalationType === v ? "#FF6B00" : "#F2F2F7",
                            color: escalationType === v ? "white" : "#888888",
                            border: "none", cursor: "pointer",
                          }}>{label}</button>
                        ))}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                          type="number" inputMode="decimal" value={escalationValue}
                          onChange={(e) => setEscalationValue(e.target.value)}
                          step={escalationType === "multiplier" ? "0.1" : "100"}
                          min={escalationType === "multiplier" ? "1.1" : "100"}
                          style={{ flex: 1, border: "1px solid #E4E4EB", borderRadius: "8px", padding: "8px 12px", fontSize: "15px", outline: "none" }}
                        />
                        <span style={{ fontSize: "14px", color: "#888888", flexShrink: 0 }}>
                          {escalationType === "multiplier" ? "倍（連続毎）" : "円（連続毎）"}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                <div style={{ height: "1px", background: "#F2F2F2" }} />

                {/* 初期クーリング期間 */}
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "15px", color: "#111111", fontWeight: 500 }}>初期クーリング期間</span>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: "#FF6B00", background: "#FFF0E5", padding: "2px 6px", borderRadius: "4px" }}>PRO</span>
                  </div>
                  <p style={{ fontSize: "12px", color: "#888888", marginBottom: "10px" }}>設定後X週間は変更・停止不可</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {coolingOptions.map(({ label, value }) => (
                      <button
                        key={String(value)}
                        onClick={() => handleCoolingSelect(value)}
                        style={{
                          display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px",
                          borderRadius: "10px", border: "1.5px solid",
                          borderColor: coolingWeeks === value ? "#FF6B00" : "#F2F2F7",
                          background: coolingWeeks === value ? "#FFF5EE" : "#F2F2F7",
                          cursor: "pointer",
                        }}
                      >
                        <span style={{ width: "18px", height: "18px", borderRadius: "50%", border: "2px solid", borderColor: coolingWeeks === value ? "#FF6B00" : "#CCCCCC", background: coolingWeeks === value ? "#FF6B00" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {coolingWeeks === value && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "white", display: "block" }} />}
                        </span>
                        <span style={{ fontSize: "14px", color: "#111111" }}>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* PRO機能（oneoff） */}
          {type === "oneoff" && (
            <>
              <SectionLabel>PRO機能</SectionLabel>
              <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", marginBottom: "20px" }}>
                {/* 取り消し不可能 */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                    <span style={{ fontSize: "15px", color: "#111111", fontWeight: 500 }}>取り消し不可能にする</span>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: "#FF6B00", background: "#FFF0E5", padding: "2px 6px", borderRadius: "4px" }}>PRO</span>
                  </div>
                  <Toggle value={isLocked} onChange={() => handleProToggle(setIsLocked, isLocked, "目標ロック", "当日まで削除・変更できなくする目標ロック機能は PRO 限定です。")} disabled={!isSubscribed} />
                </div>
                {isLocked && (
                  <>
                    <div style={{ height: "1px", background: "#F2F2F2" }} />
                    <div style={{ padding: "10px 16px" }}>
                      <p style={{ fontSize: "13px", color: "#EF4444", lineHeight: 1.5 }}>⚠️ 当日まで削除・変更できなくなります</p>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {error && <p style={{ fontSize: "14px", color: "#EF4444", marginBottom: "12px" }}>{error}</p>}

          <button className="btn-primary" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
            onClick={handleCheckOverlap}>
            確認する <ChevronRight size={16} />
          </button>

          {showOverlapConfirm && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "flex-end" }}>
              <div style={{ background: "white", borderRadius: "20px 20px 0 0", padding: "24px 20px calc(env(safe-area-inset-bottom) + 24px)", width: "100%" }}>
                <p style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "12px" }}>⚠️ 目標が重複しています</p>
                <p style={{ fontSize: "14px", color: "#555555", lineHeight: 1.6, marginBottom: "8px" }}>
                  <strong style={{ color: "#FF6B00" }}>{overlapDays.join("・")}</strong> に既に目標が設定されています。
                </p>
                <p style={{ fontSize: "13px", color: "#888888", lineHeight: 1.6, marginBottom: "24px" }}>
                  同じ日に複数の目標がある場合、それぞれ別のランで達成する必要があります。
                </p>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button style={{ flex: 1, padding: "14px", borderRadius: "12px", background: "#F2F2F7", border: "none", fontSize: "15px", fontWeight: 600, color: "#111111", cursor: "pointer" }}
                    onClick={() => setShowOverlapConfirm(false)}>キャンセル</button>
                  <button className="btn-primary" style={{ flex: 1 }}
                    onClick={() => { setShowOverlapConfirm(false); setStep("confirm"); }}>このまま追加する</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {proModal && (
        <ProModal
          featureName={proModal.name}
          description={proModal.desc}
          onClose={() => setProModal(null)}
        />
      )}
    </AppShell>
  );
}
