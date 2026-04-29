"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft } from "lucide-react";

const DAYS = ["日", "月", "火", "水", "木", "金", "土"];

export interface Goal {
  id: string;
  type: "recurring" | "oneoff" | "challenge";
  days_of_week: number[] | null;
  scheduled_date: string | null;
  challenge_start_date: string | null;
  distance_km: number | null;
  duration_minutes: number | null;
  penalty_amount: number;
  is_locked: boolean;
  escalation_type: "multiplier" | "surcharge" | null;
  escalation_value: number | null;
  consecutive_failures: number;
  cooling_weeks: number | null;
  created_at: string;
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

export default function GoalEditClient({ goal }: { goal: Goal }) {
  const router = useRouter();

  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();

  const [distanceKm, setDistanceKm] = useState(goal.distance_km ? String(goal.distance_km) : "");
  const [durationMinutes, setDurationMinutes] = useState(goal.duration_minutes ? String(goal.duration_minutes) : "");
  const [penaltyAmount, setPenaltyAmount] = useState(String(goal.penalty_amount));
  const [selectedDays, setSelectedDays] = useState<number[]>(goal.days_of_week ?? []);
  const [scheduledDate, setScheduledDate] = useState(goal.type === "oneoff" ? (goal.scheduled_date ?? "") : "");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [hasTodayInstance, setHasTodayInstance] = useState(false);
  const [challengeProgress, setChallengeProgress] = useState<{ totalDistKm: number; totalSec: number } | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.from("goal_instances")
      .select("id")
      .eq("goal_id", goal.id)
      .eq("scheduled_date", todayStr)
      .eq("status", "pending")
      .maybeSingle()
      .then(({ data }) => setHasTodayInstance(!!data));

    if (goal.type === "challenge" && goal.challenge_start_date) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) return;
        supabase.from("runs")
          .select("distance_km, duration_seconds")
          .eq("user_id", user.id)
          .gte("started_at", goal.challenge_start_date! + "T00:00:00")
          .then(({ data: runs }) => {
            const totalDistKm = Math.round((runs ?? []).reduce((s, r) => s + (r.distance_km ?? 0), 0) * 10) / 10;
            const totalSec = (runs ?? []).reduce((s, r) => s + (r.duration_seconds ?? 0), 0);
            setChallengeProgress({ totalDistKm, totalSec });
          });
      });
    }
  }, [goal.id, goal.type, goal.challenge_start_date, todayStr]);

  function toggleDay(day: number) {
    setSelectedDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  }

  async function handleSave() {
    setLoading(true);
    setError(null);
    if (!distanceKm && !durationMinutes) { setError("距離または時間を入力してください"); setLoading(false); return; }
    if (parseInt(penaltyAmount) < 100) { setError("罰金は100円以上で入力してください"); setLoading(false); return; }

    const res = await fetch(`/api/goals/${goal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        distance_km: distanceKm || null,
        duration_minutes: durationMinutes || null,
        penalty_amount: penaltyAmount,
        ...(goal.type === "recurring" ? { days_of_week: selectedDays } : {}),
        ...(goal.type === "oneoff" ? { scheduled_date: scheduledDate } : {}),
      }),
    });
    if (!res.ok) { setError("保存に失敗しました"); setLoading(false); return; }
    setSaved(true);
    setLoading(false);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/goals/${goal.id}`, { method: "DELETE" });
    router.push("/goals");
  }

  const isPermanentlyLocked = goal.is_locked;
  const isChallenge = goal.type === "challenge";

  const isCooling = (() => {
    if (!goal.cooling_weeks) return false;
    const lockUntil = new Date(new Date(goal.created_at).getTime() + goal.cooling_weeks * 7 * 24 * 60 * 60 * 1000);
    return lockUntil > new Date(Date.now() + 9 * 60 * 60 * 1000);
  })();
  const coolingRemainingDays = (() => {
    if (!goal.cooling_weeks) return 0;
    const lockUntil = new Date(new Date(goal.created_at).getTime() + goal.cooling_weeks * 7 * 24 * 60 * 60 * 1000);
    return Math.max(0, Math.ceil((lockUntil.getTime() - (Date.now() + 9 * 60 * 60 * 1000)) / (1000 * 60 * 60 * 24)));
  })();
  const coolingUnlockDate = (() => {
    if (!goal.cooling_weeks) return "";
    const lockUntil = new Date(new Date(goal.created_at).getTime() + goal.cooling_weeks * 7 * 24 * 60 * 60 * 1000);
    return lockUntil.toISOString().split("T")[0];
  })();

  const isLockedOneoffToday = !isPermanentlyLocked && !isCooling && goal.type === "oneoff" && goal.scheduled_date === todayStr;
  const isLockedRecurringToday = !isPermanentlyLocked && !isCooling && goal.type === "recurring" && hasTodayInstance;
  const isInputLocked = isPermanentlyLocked || isChallenge || isCooling || isLockedOneoffToday || isLockedRecurringToday;
  const todayDayOfWeek = new Date(todayStr + "T00:00:00").getDay();

  const nextChargeAmount = (() => {
    if (!goal.escalation_type || !goal.escalation_value) return null;
    const n = goal.consecutive_failures + 1;
    if (goal.escalation_type === "multiplier") {
      return Math.round(Math.min(goal.penalty_amount * Math.pow(goal.escalation_value, n), goal.penalty_amount * 5));
    }
    return Math.round(Math.min(goal.penalty_amount + goal.escalation_value * n, goal.penalty_amount * 5));
  })();

  const inputStyle = {
    border: "none",
    outline: "none",
    fontSize: "15px",
    color: "#111111",
    background: "transparent",
    width: "100%",
    textAlign: "right" as const,
  };

  return (
    <div>
      <div style={{ padding: "20px 20px 12px", display: "flex", alignItems: "center", gap: "4px" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: "#FF6B00", fontSize: "15px", fontWeight: 500 }}>
          <ChevronLeft size={20} color="#FF6B00" /> 目標
        </button>
      </div>

      <div style={{ padding: "0 16px 24px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111111", marginBottom: "6px" }}>目標を編集</h1>
        <p style={{ fontSize: "13px", color: "#AAAAAA", marginBottom: "20px" }}>
          {goal.type === "recurring" ? "毎週繰り返し" : "1回のみ"}
        </p>

        {isChallenge && (
          <div style={{ background: "#FFFBEB", borderRadius: "12px", padding: "14px 16px", marginBottom: "20px", borderLeft: "3px solid #F59E0B" }}>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#F59E0B", marginBottom: "8px" }}>🏆 チャレンジ進捗</p>
            {challengeProgress !== null ? (
              <>
                {goal.distance_km && (
                  <div style={{ marginBottom: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#888888", marginBottom: "4px" }}>
                      <span style={{ color: "#FF6B00", fontWeight: 600 }}>{challengeProgress.totalDistKm}km</span>
                      <span>目標 {goal.distance_km}km（{Math.round((challengeProgress.totalDistKm / goal.distance_km) * 100)}%）</span>
                    </div>
                    <div style={{ height: "5px", background: "#F0F0F0", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ height: "100%", background: "#FF6B00", borderRadius: "3px", width: `${Math.min((challengeProgress.totalDistKm / goal.distance_km) * 100, 100)}%` }} />
                    </div>
                  </div>
                )}
                {goal.duration_minutes && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#888888", marginBottom: "4px" }}>
                      <span style={{ color: "#FF6B00", fontWeight: 600 }}>{Math.round(challengeProgress.totalSec / 60)}分</span>
                      <span>目標 {goal.duration_minutes}分（{Math.round((challengeProgress.totalSec / (goal.duration_minutes * 60)) * 100)}%）</span>
                    </div>
                    <div style={{ height: "5px", background: "#F0F0F0", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ height: "100%", background: "#FF6B00", borderRadius: "3px", width: `${Math.min((challengeProgress.totalSec / (goal.duration_minutes * 60)) * 100, 100)}%` }} />
                    </div>
                  </div>
                )}
                {goal.scheduled_date && (
                  <p style={{ fontSize: "12px", color: "#888888", marginTop: "10px" }}>
                    終了日：{goal.scheduled_date}　残り{Math.max(0, Math.ceil((new Date(goal.scheduled_date + "T00:00:00").getTime() - new Date(todayStr + "T00:00:00").getTime()) / (1000 * 60 * 60 * 24)))}日
                  </p>
                )}
              </>
            ) : (
              <p style={{ fontSize: "13px", color: "#AAAAAA" }}>読み込み中...</p>
            )}
            <p style={{ fontSize: "12px", color: "#EF4444", marginTop: "10px" }}>⚠️ チャレンジ目標は期間中に停止できません</p>
          </div>
        )}

        {isCooling && !isPermanentlyLocked && !isChallenge && (
          <div style={{ background: "#FFF5EE", borderRadius: "12px", padding: "14px 16px", marginBottom: "20px", borderLeft: "3px solid #FF6B00" }}>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#FF6B00", marginBottom: "4px" }}>🔒 クーリング期間中</p>
            <p style={{ fontSize: "13px", color: "#888888" }}>変更・停止できません（残り{coolingRemainingDays}日 / {coolingUnlockDate}まで）</p>
          </div>
        )}

        {isPermanentlyLocked && (
          <div style={{ background: "#FEE2E2", borderRadius: "12px", padding: "14px 16px", marginBottom: "20px", borderLeft: "3px solid #EF4444" }}>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#EF4444", marginBottom: "4px" }}>🔒 取り消し不可能な目標</p>
            <p style={{ fontSize: "13px", color: "#888888" }}>この目標は削除・変更できません</p>
          </div>
        )}

        {goal.type === "recurring" && (
          <div style={{ marginBottom: "16px" }}>
            <p style={{ fontSize: "12px", color: "#888888", fontWeight: 600, marginBottom: "8px", paddingLeft: "4px" }}>実施する曜日</p>
            <div style={{ display: "flex", gap: "6px" }}>
              {DAYS.map((day, i) => {
                const isTodayDay = isLockedRecurringToday && i === todayDayOfWeek;
                const disabled = isPermanentlyLocked || isTodayDay;
                return (
                  <button
                    key={i}
                    onClick={() => !disabled && toggleDay(i)}
                    style={{
                      flex: 1, height: "44px", borderRadius: "10px", fontSize: "14px", fontWeight: 700,
                      background: selectedDays.includes(i) ? (isTodayDay ? "#FFBB88" : isPermanentlyLocked ? "#CCCCCC" : "#FF6B00") : "white",
                      color: selectedDays.includes(i) ? "white" : (disabled ? "#CCCCCC" : "#888888"),
                      border: "none", cursor: disabled ? "default" : "pointer",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                      transition: "all 0.15s",
                      opacity: isTodayDay ? 0.6 : 1,
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            {!isPermanentlyLocked && (
              <p style={{ fontSize: "11px", color: "#AAAAAA", marginTop: "6px", paddingLeft: "4px" }}>
                ※曜日の変更は既存のスケジュールには反映されません
              </p>
            )}
          </div>
        )}

        {goal.type === "oneoff" && (
          <div style={{ marginBottom: "16px" }}>
            <p style={{ fontSize: "12px", color: "#888888", fontWeight: 600, marginBottom: "8px", paddingLeft: "4px" }}>実施日</p>
            <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div style={{ padding: "14px 16px" }}>
                <input
                  type="date"
                  value={scheduledDate}
                  min={todayStr}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  disabled={isInputLocked}
                  style={{ border: "none", outline: "none", fontSize: "15px", color: "#111111", background: "transparent", width: "100%" }}
                />
              </div>
            </div>
          </div>
        )}

        <p style={{ fontSize: "12px", color: "#888888", fontWeight: 600, marginBottom: "8px", paddingLeft: "4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          目標・罰金
        </p>
        <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", marginBottom: "20px" }}>
          <ListRow label="距離 (km)">
            <input type="number" inputMode="decimal" placeholder="例: 5" min="0.1" step="0.1"
              value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)} style={inputStyle} disabled={isInputLocked} />
          </ListRow>
          <ListRow label="時間 (分)">
            <input type="number" inputMode="numeric" placeholder="例: 30" min="1"
              value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} style={inputStyle} disabled={isInputLocked} />
          </ListRow>
          <ListRow label="罰金 (円)" last>
            <input type="number" inputMode="numeric" placeholder="500" min="100" step="100"
              value={penaltyAmount} onChange={(e) => setPenaltyAmount(e.target.value)}
              style={{ ...inputStyle, color: "#EF4444" }} disabled={isInputLocked} />
          </ListRow>
        </div>

        {goal.type === "recurring" && goal.escalation_type && (
          <div style={{ background: "white", borderRadius: "16px", padding: "14px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
              <p style={{ fontSize: "12px", color: "#888888", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>罰金増加</p>
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#FF6B00", background: "#FFF0E5", padding: "2px 6px", borderRadius: "4px" }}>PRO</span>
            </div>
            {goal.consecutive_failures > 0 ? (
              <p style={{ fontSize: "14px", color: "#111111" }}>
                連続失敗: <strong style={{ color: "#EF4444" }}>{goal.consecutive_failures}回</strong>
                {nextChargeAmount !== null && (
                  <> → 次回 <strong style={{ color: "#EF4444" }}>¥{nextChargeAmount.toLocaleString()}</strong>
                  <span style={{ fontSize: "12px", color: "#888888" }}>（通常¥{goal.penalty_amount.toLocaleString()}の{(nextChargeAmount / goal.penalty_amount).toFixed(2)}倍）</span></>
                )}
              </p>
            ) : (
              <p style={{ fontSize: "14px", color: "#22C55E", fontWeight: 600 }}>連続失敗なし（リセット済み）</p>
            )}
          </div>
        )}

        {isPermanentlyLocked ? (
          <div style={{ background: "#F8F8F8", borderRadius: "12px", padding: "16px 20px", textAlign: "center", marginBottom: "12px" }}>
            <p style={{ fontSize: "14px", color: "#888888" }}>取り消し不可能な目標のため変更できません</p>
          </div>
        ) : isChallenge ? null : isCooling ? (
          <div style={{ background: "#FFF5EE", borderRadius: "12px", padding: "16px 20px", textAlign: "center", marginBottom: "12px" }}>
            <p style={{ fontSize: "14px", color: "#FF6B00" }}>クーリング期間中のため変更できません</p>
          </div>
        ) : isLockedOneoffToday ? (
          <div style={{ background: "#F8F8F8", borderRadius: "12px", padding: "16px 20px", textAlign: "center", marginBottom: "12px" }}>
            <p style={{ fontSize: "14px", color: "#888888" }}>当日の目標は変更できません</p>
          </div>
        ) : (
          <>
            {isLockedRecurringToday && (
              <p style={{ fontSize: "12px", color: "#AAAAAA", marginBottom: "8px", paddingLeft: "4px" }}>
                距離・時間・金額は当日変更できません。曜日の変更は可能です。
              </p>
            )}
            {error && <p style={{ fontSize: "14px", color: "#EF4444", marginBottom: "12px" }}>{error}</p>}
            <button
              className="btn-primary"
              style={{ width: "100%", marginBottom: "12px", background: saved ? "#22C55E" : undefined }}
              onClick={handleSave}
              disabled={loading}
            >
              {saved ? "保存しました ✓" : loading ? "保存中..." : "変更を保存する"}
            </button>
          </>
        )}

        {!isPermanentlyLocked && !isChallenge && !isCooling && !isLockedOneoffToday && (
          !showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{ width: "100%", minHeight: "52px", background: "white", border: "1.5px solid #EF4444", borderRadius: "8px", color: "#EF4444", fontSize: "16px", fontWeight: 600, cursor: "pointer" }}
            >
              この目標を停止する
            </button>
          ) : (
            <div style={{ background: "white", borderRadius: "16px", padding: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <p style={{ fontSize: "14px", color: "#111111", fontWeight: 600, marginBottom: "6px" }}>本当に停止しますか？</p>
              <p style={{ fontSize: "13px", color: "#888888", lineHeight: 1.6, marginBottom: hasTodayInstance ? "8px" : "14px" }}>
                明日以降のスケジュールがキャンセルされます。過去の記録は残ります。
              </p>
              {hasTodayInstance && (
                <div style={{ background: "#FFF5EE", borderRadius: "10px", padding: "10px 12px", marginBottom: "14px", borderLeft: "3px solid #FF6B00" }}>
                  <p style={{ fontSize: "13px", color: "#FF6B00", fontWeight: 600 }}>⚠️ 今日の目標は残ります</p>
                  <p style={{ fontSize: "12px", color: "#888888", marginTop: "2px" }}>今日分はスキップか達成が必要です</p>
                </div>
              )}
              <div style={{ display: "flex", gap: "8px" }}>
                <button className="btn-secondary" style={{ flex: 1, minHeight: "48px" }} onClick={() => setShowDeleteConfirm(false)}>
                  やめる
                </button>
                <button
                  style={{ flex: 1, minHeight: "48px", background: "#EF4444", color: "white", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: 700, cursor: "pointer" }}
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "停止中..." : "停止する"}
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
