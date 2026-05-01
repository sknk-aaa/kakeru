"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, CreditCard, Plus, Repeat, Calendar, Trophy } from "lucide-react";
import Onboarding from "@/components/Onboarding";

interface Goal {
  id: string;
  type: "recurring" | "oneoff" | "challenge";
  days_of_week: number[] | null;
  scheduled_date: string | null;
  challenge_start_date: string | null;
  distance_km: number | null;
  duration_minutes: number | null;
  penalty_amount: number;
  is_active: boolean;
  created_at: string;
}

interface Instance {
  id: string;
  goal_id: string;
  scheduled_date: string;
  status: "pending" | "achieved" | "failed" | "skipped" | "cancelled";
}

interface PastRecurringGoal extends Goal {
  achievedCount: number;
}

const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
const ORANGE = "#FF6B00";

const sectionTitleStyle = {
  fontSize: "17px",
  color: "#111111",
  fontWeight: 800,
  marginBottom: "12px",
  paddingLeft: "2px",
  lineHeight: 1.35,
};

const sectionCardStyle = {
  background: "white",
  borderRadius: "22px",
  overflow: "hidden",
  boxShadow: "0 10px 28px rgba(17,17,17,0.055)",
  border: "1px solid rgba(17,17,17,0.04)",
};

const dividerStyle = {
  height: "1px",
  background: "#F1F1F3",
  marginLeft: "78px",
};

function TodayBadge() {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      height: "21px",
      padding: "0 9px",
      borderRadius: "999px",
      background: ORANGE,
      color: "white",
      fontSize: "11px",
      fontWeight: 800,
      lineHeight: 1,
      flexShrink: 0,
    }}>
      TODAY
    </span>
  );
}

function formatGoalSummary(goal: Goal) {
  if (goal.type === "challenge") {
    const parts: string[] = [];
    if (goal.distance_km) parts.push(`${goal.distance_km}km`);
    if (goal.duration_minutes) parts.push(`${Math.round(goal.duration_minutes / 60)}時間`);
    return parts.join("・") + "チャレンジ";
  }
  const parts: string[] = [];
  if (goal.distance_km) parts.push(`${goal.distance_km}km`);
  if (goal.duration_minutes) parts.push(`${goal.duration_minutes}分`);
  return parts.join("・") || "フリーラン";
}

function formatSchedule(goal: Goal) {
  if (goal.type === "recurring" && goal.days_of_week) {
    return "毎週 " + [...goal.days_of_week].sort((a, b) => WEEK_ORDER.indexOf(a) - WEEK_ORDER.indexOf(b)).map((d) => DAY_NAMES[d]).join("・");
  }
  if ((goal.type === "oneoff" || goal.type === "challenge") && goal.scheduled_date) {
    const d = new Date(goal.scheduled_date + "T00:00:00");
    return `〜${d.getMonth() + 1}/${d.getDate()}(${DAY_NAMES[d.getDay()]})`;
  }
  return "";
}

type DotType = "orange-filled" | "orange-outline" | "gray-outline" | "gray-filled";

function Dot({ type }: { type: DotType }) {
  const isOrange = type === "orange-filled" || type === "orange-outline";
  const isFilled = type === "orange-filled" || type === "gray-filled";
  return (
    <div style={{
      width: "9px", height: "9px", borderRadius: "50%",
      background: isFilled ? (isOrange ? "#FF6B00" : "#CCCCCC") : "transparent",
      border: isFilled ? "none" : `1.5px solid ${isOrange ? "#FF6B00" : "#CCCCCC"}`,
      flexShrink: 0,
    }} />
  );
}

function WeekDots({ goal, instances, todayStr }: { goal: Goal; instances: Instance[]; todayStr: string }) {
  if (!goal.days_of_week || goal.days_of_week.length === 0) return null;

  const today = new Date(todayStr + "T00:00:00");
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  const sortedDays = [...goal.days_of_week].sort((a, b) => WEEK_ORDER.indexOf(a) - WEEK_ORDER.indexOf(b));

  const dots = sortedDays.map((dayNum) => {
    const offset = dayNum === 0 ? 6 : dayNum - 1;
    const targetDate = new Date(monday);
    targetDate.setDate(monday.getDate() + offset);
    const y = targetDate.getFullYear();
    const mo = String(targetDate.getMonth() + 1).padStart(2, "0");
    const dd = String(targetDate.getDate()).padStart(2, "0");
    const targetDateStr = `${y}-${mo}-${dd}`;

    const instance = instances.find((i) => i.goal_id === goal.id && i.scheduled_date === targetDateStr);
    const isToday = targetDateStr === todayStr;
    const isPast = targetDateStr < todayStr;

    let dotType: DotType;
    if (instance?.status === "achieved") dotType = "orange-filled";
    else if (isToday) dotType = "orange-outline";
    else if (isPast) dotType = "gray-filled";
    else dotType = "gray-outline";

    return { dayNum, dayName: DAY_NAMES[dayNum], dotType };
  });

  return (
    <div style={{ display: "flex", gap: "10px", marginTop: "8px", alignItems: "center" }}>
      {dots.map(({ dayNum, dayName, dotType }) => {
        const isOrange = dotType === "orange-filled" || dotType === "orange-outline";
        return (
          <div key={dayNum} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <span style={{ fontSize: "10px", color: isOrange ? "#FF6B00" : "#BBBBBB", fontWeight: 600, lineHeight: 1 }}>{dayName}</span>
            <Dot type={dotType} />
          </div>
        );
      })}
    </div>
  );
}

function OneoffDot({ goal, instances, todayStr }: { goal: Goal; instances: Instance[]; todayStr: string }) {
  if (!goal.scheduled_date) return null;
  const instance = instances.find((i) => i.goal_id === goal.id);
  const isToday = goal.scheduled_date === todayStr;
  const isPast = goal.scheduled_date < todayStr;

  let dotType: DotType;
  if (instance?.status === "achieved") dotType = "orange-filled";
  else if (isToday) dotType = "orange-outline";
  else if (isPast) dotType = "gray-filled";
  else dotType = "gray-outline";

  return (
    <div style={{ display: "flex", gap: "6px", marginTop: "8px", alignItems: "center" }}>
      <Dot type={dotType} />
    </div>
  );
}

function RainSkipButton({ instanceId, onSkipped }: { instanceId: string; onSkipped: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSkip() {
    setLoading(true);
    const res = await fetch("/api/goals/rain-skip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goalInstanceId: instanceId }),
    });
    setLoading(false);
    if (res.ok) {
      onSkipped();
    } else {
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
        <button
          onClick={() => setConfirming(false)}
          style={{ flex: 1, padding: "8px", borderRadius: "8px", background: "#F2F2F7", border: "none", fontSize: "13px", color: "#888888", cursor: "pointer" }}
        >
          キャンセル
        </button>
        <button
          onClick={handleSkip}
          disabled={loading}
          style={{ flex: 2, padding: "8px", borderRadius: "8px", background: "#4285F4", border: "none", fontSize: "13px", fontWeight: 600, color: "white", cursor: "pointer" }}
        >
          {loading ? "処理中..." : "☔ スキップする（無料）"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      style={{ marginTop: "8px", width: "100%", padding: "8px", borderRadius: "8px", background: "#EFF6FF", border: "1px solid #BFDBFE", fontSize: "13px", fontWeight: 600, color: "#4285F4", cursor: "pointer" }}
    >
      ☔ 雨の日スキップ（無料）
    </button>
  );
}

function ChallengeCard({
  goal,
  progress,
  todayStr,
}: {
  goal: Goal;
  progress: { totalDistKm: number; totalSec: number };
  todayStr: string;
}) {
  const endDate = goal.scheduled_date ? new Date(goal.scheduled_date + "T00:00:00") : null;
  const today = new Date(todayStr + "T00:00:00");
  const daysLeft = endDate ? Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))) : null;

  const distPct = goal.distance_km ? Math.min((progress.totalDistKm / goal.distance_km) * 100, 100) : null;
  const timePct = goal.duration_minutes ? Math.min((progress.totalSec / (goal.duration_minutes * 60)) * 100, 100) : null;

  return (
    <Link href={`/goals/${goal.id}`}>
      <div style={{ padding: "18px 16px", cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
          <div style={{
            width: "50px",
            height: "50px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #FFF7D6 0%, #FFE8A3 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}>
            <Trophy size={22} color="#F59E0B" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: "17px", fontWeight: 800, color: "#111111", lineHeight: 1.3 }}>{formatGoalSummary(goal)}</p>
                {daysLeft !== null && (
                  <p style={{ fontSize: "12px", color: daysLeft <= 7 ? "#EF4444" : "#888888", marginTop: "4px", fontWeight: 600 }}>
                    残り{daysLeft}日 {formatSchedule(goal)}
                  </p>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                <p style={{ fontSize: "13px", color: "#777777", fontWeight: 700 }}>¥{goal.penalty_amount.toLocaleString()}</p>
                <ChevronRight size={18} color="#CCCCCC" />
              </div>
            </div>

            {distPct !== null && (
              <div style={{ marginTop: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#888888", marginBottom: "4px" }}>
                  <span style={{ color: ORANGE, fontWeight: 800 }}>{progress.totalDistKm}km</span>
                  <span>目標 {goal.distance_km}km（{Math.round(distPct)}%）</span>
                </div>
                <div style={{ height: "6px", background: "#F1F1F3", borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{ height: "100%", background: ORANGE, borderRadius: "999px", width: `${distPct}%` }} />
                </div>
              </div>
            )}

            {timePct !== null && (
              <div style={{ marginTop: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#888888", marginBottom: "4px" }}>
                  <span style={{ color: ORANGE, fontWeight: 800 }}>{Math.round(progress.totalSec / 60)}分</span>
                  <span>目標 {goal.duration_minutes}分（{Math.round(timePct)}%）</span>
                </div>
                <div style={{ height: "6px", background: "#F1F1F3", borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{ height: "100%", background: ORANGE, borderRadius: "999px", width: `${timePct}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function GoalsClient({
  goals,
  instances,
  todayStr,
  pastOneoffInstances,
  pastRecurringGoals,
  initialIsRainy,
  challengeProgress,
  hasCard,
}: {
  goals: Goal[];
  instances: Instance[];
  todayStr: string;
  pastOneoffInstances: Instance[];
  pastRecurringGoals: PastRecurringGoal[];
  initialIsRainy: boolean;
  challengeProgress: Record<string, { totalDistKm: number; totalSec: number }>;
  hasCard: boolean;
}) {
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());
  const [isRainy, setIsRainy] = useState(initialIsRainy);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("kakeru_onboarding_done")) {
      setShowOnboarding(true);
    }
  }, []);
  const hasPendingToday = instances.some((i) => i.scheduled_date === todayStr && i.status === "pending");

  useEffect(() => {
    if (!hasPendingToday) return;

    const controller = new AbortController();
    fetch("/api/goals/rain-status", { signal: controller.signal })
      .then((res) => res.ok ? res.json() : null)
      .then((data: { isRainy?: boolean } | null) => {
        if (data) setIsRainy(Boolean(data.isRainy));
      })
      .catch(() => {});

    return () => controller.abort();
  }, [hasPendingToday]);

  const recurringGoals = goals.filter((g) => g.type === "recurring");
  const challengeGoals = goals.filter((g) => g.type === "challenge");
  const activeOneoffGoals = goals.filter(
    (g) => g.type === "oneoff" && (!g.scheduled_date || g.scheduled_date >= todayStr)
  );
  const pastOneoffGoals = goals.filter(
    (g) => g.type === "oneoff" && g.scheduled_date && g.scheduled_date < todayStr
  );

  function getTodayPendingInstance(goalId: string): Instance | undefined {
    return instances.find(
      (i) => i.goal_id === goalId && i.scheduled_date === todayStr && i.status === "pending" && !skippedIds.has(i.id)
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #FFFFFF 0%, #FFF9F5 36%, #F7F7FA 100%)",
    }}>
      {showOnboarding && <Onboarding onDone={() => setShowOnboarding(false)} />}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "rgba(255,255,255,0.88)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(235,235,235,0.75)",
        padding: "0 16px 0 56px", height: "60px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Image src="/stickman-assets/stickman-01.png" alt="" width={28} height={28} style={{ objectFit: "contain" }} priority />
          <span style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 900, fontStyle: "italic", color: "#FF6B00", letterSpacing: "0.06em" }}>KAKERU</span>
        </div>
        <Link href="/goals/new">
          <button style={{
            width: "42px", height: "42px", borderRadius: "50%",
            background: "white", display: "flex", alignItems: "center", justifyContent: "center",
            border: "1px solid rgba(255,107,0,0.14)",
            boxShadow: "0 8px 22px rgba(255,107,0,0.15)",
            cursor: "pointer",
          }}>
            <Plus size={22} color={ORANGE} strokeWidth={2.6} />
          </button>
        </Link>
      </div>

      {!hasCard && (
        <Link href="/auth/card" style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "#FFF4EE", borderBottom: "1px solid #FFD9B0",
          padding: "11px 20px", textDecoration: "none",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <CreditCard size={15} color="#FF6B00" strokeWidth={2} />
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#C85C0A" }}>
              カードを登録して罰金を有効にしましょう
            </span>
          </div>
          <ChevronRight size={15} color="#FF6B00" />
        </Link>
      )}

      <div style={{ padding: "16px 16px 24px" }}>

        {goals.length === 0 && (
          <div style={{
            background: "white",
            borderRadius: "24px",
            padding: "36px 22px 30px",
            textAlign: "center",
            boxShadow: "0 12px 32px rgba(17,17,17,0.06)",
            border: "1px solid rgba(255,107,0,0.10)",
            overflow: "hidden",
            position: "relative",
          }}>
            <div style={{ position: "absolute", right: "-28px", bottom: "-24px", pointerEvents: "none" }}>
              <Image src="/その他素材/山-transparent.png" alt="" width={156} height={108} style={{ objectFit: "contain", opacity: 0.16 }} />
            </div>
            <Image src="/stickman-assets/stickman-13.png" alt="" width={122} height={88} style={{ display: "block", objectFit: "contain", margin: "0 auto 14px", position: "relative", zIndex: 1 }} />
            <p style={{ color: "#111111", fontSize: "19px", fontWeight: 900, marginBottom: "8px", position: "relative", zIndex: 1 }}>目標を設定してみましょう</p>
            <p style={{ color: "#888888", fontSize: "13px", lineHeight: 1.7, marginBottom: "20px", position: "relative", zIndex: 1 }}>
              走る日と内容を先に決めておくと、今日やることが迷わず見えます。
            </p>
            <Link href="/goals/new">
              <button className="btn-primary" style={{ minHeight: "48px", padding: "0 28px", position: "relative", zIndex: 1 }}>目標を追加する</button>
            </Link>
          </div>
        )}

        {/* チャレンジ */}
        {challengeGoals.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <p style={sectionTitleStyle}>進行中のチャレンジ</p>
            <div style={sectionCardStyle}>
              {challengeGoals.map((goal, idx) => (
                <div key={goal.id}>
                  {idx > 0 && <div style={dividerStyle} />}
                  <ChallengeCard
                    goal={goal}
                    progress={challengeProgress[goal.id] ?? { totalDistKm: 0, totalSec: 0 }}
                    todayStr={todayStr}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 毎週の目標 */}
        {recurringGoals.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <p style={sectionTitleStyle}>毎週の目標</p>
            <div style={sectionCardStyle}>
              {recurringGoals.map((goal, idx) => {
                const todayInstance = getTodayPendingInstance(goal.id);
                return (
                  <div key={goal.id}>
                    {idx > 0 && <div style={dividerStyle} />}
                    <Link href={`/goals/${goal.id}`}>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "17px 16px",
                        gap: "14px",
                        borderLeft: todayInstance ? `4px solid ${ORANGE}` : "4px solid transparent",
                      }}>
                        <div style={{ width: "50px", height: "50px", borderRadius: "16px", background: "#FFF0E5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Repeat size={22} color={ORANGE} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                            <p style={{ fontSize: "17px", fontWeight: 800, color: "#111111", lineHeight: 1.3, minWidth: 0 }}>{formatGoalSummary(goal)}</p>
                            {todayInstance && <TodayBadge />}
                          </div>
                          <p style={{ fontSize: "12px", color: "#777777", marginTop: "4px", fontWeight: 600 }}>{formatSchedule(goal)}</p>
                          <WeekDots goal={goal} instances={instances} todayStr={todayStr} />
                          {isRainy && todayInstance && (
                            <RainSkipButton
                              instanceId={todayInstance.id}
                              onSkipped={() => setSkippedIds((prev) => new Set([...prev, todayInstance.id]))}
                            />
                          )}
                        </div>
                        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                          <p style={{ fontSize: "13px", color: "#777777", fontWeight: 700 }}>¥{goal.penalty_amount.toLocaleString()}</p>
                          <ChevronRight size={18} color="#CCCCCC" />
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 1回のみの目標 */}
        {activeOneoffGoals.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <p style={sectionTitleStyle}>1回のみの目標</p>
            <div style={sectionCardStyle}>
              {activeOneoffGoals.map((goal, idx) => {
                const todayInstance = getTodayPendingInstance(goal.id);
                return (
                  <div key={goal.id}>
                    {idx > 0 && <div style={dividerStyle} />}
                    <Link href={`/goals/${goal.id}`}>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "17px 16px",
                        gap: "14px",
                        borderLeft: todayInstance ? `4px solid ${ORANGE}` : "4px solid transparent",
                      }}>
                        <div style={{ width: "50px", height: "50px", borderRadius: "16px", background: "#EEF5FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Calendar size={22} color="#4285F4" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                            <p style={{ fontSize: "17px", fontWeight: 800, color: "#111111", lineHeight: 1.3, minWidth: 0 }}>{formatGoalSummary(goal)}</p>
                            {todayInstance && <TodayBadge />}
                          </div>
                          <p style={{ fontSize: "12px", color: "#777777", marginTop: "4px", fontWeight: 600 }}>{formatSchedule(goal)}</p>
                          <OneoffDot goal={goal} instances={instances} todayStr={todayStr} />
                          {isRainy && todayInstance && (
                            <RainSkipButton
                              instanceId={todayInstance.id}
                              onSkipped={() => setSkippedIds((prev) => new Set([...prev, todayInstance.id]))}
                            />
                          )}
                        </div>
                        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                          <p style={{ fontSize: "13px", color: "#777777", fontWeight: 700 }}>¥{goal.penalty_amount.toLocaleString()}</p>
                          <ChevronRight size={18} color="#CCCCCC" />
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 過去の目標 */}
        {(pastOneoffGoals.length > 0 || pastRecurringGoals.length > 0) && (
          <div style={{ marginBottom: "20px" }}>
            <p style={sectionTitleStyle}>過去の目標</p>
            <div style={{
              ...sectionCardStyle,
              boxShadow: "0 8px 22px rgba(17,17,17,0.04)",
              background: "rgba(255,255,255,0.92)",
            }}>
              {[...pastOneoffGoals, ...pastRecurringGoals].map((goal, idx) => {
                const isPastRecurring = "achievedCount" in goal;
                const instance = pastOneoffInstances.find((i) => i.goal_id === goal.id);
                const statusLabel = instance?.status === "achieved" ? "達成" : instance?.status === "failed" ? "失敗" : null;
                const statusColor = instance?.status === "achieved" ? "#22C55E" : "#EF4444";
                return (
                  <div key={goal.id}>
                    {idx > 0 && <div style={dividerStyle} />}
                    <div style={{ display: "flex", alignItems: "center", padding: "16px 16px", gap: "14px" }}>
                      <div style={{ width: "50px", height: "50px", borderRadius: "16px", background: "#F3F3F3", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {isPastRecurring ? <Repeat size={22} color="#A6A6A6" /> : <Calendar size={22} color="#A6A6A6" />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "17px", fontWeight: 800, color: "#888888", lineHeight: 1.3 }}>{formatGoalSummary(goal)}</p>
                        <p style={{ fontSize: "12px", color: "#AAAAAA", marginTop: "4px", fontWeight: 600 }}>{formatSchedule(goal)}</p>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ fontSize: "13px", color: "#999999", fontWeight: 700 }}>¥{goal.penalty_amount.toLocaleString()}</p>
                        {isPastRecurring ? (
                          <p style={{ fontSize: "11px", color: "#999999", marginTop: "4px", fontWeight: 700 }}>{(goal as PastRecurringGoal).achievedCount}回達成</p>
                        ) : statusLabel ? (
                          <p style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: "38px",
                            height: "22px",
                            padding: "0 8px",
                            borderRadius: "999px",
                            background: instance?.status === "achieved" ? "rgba(34,197,94,0.10)" : "rgba(239,68,68,0.10)",
                            fontSize: "11px",
                            color: statusColor,
                            marginTop: "5px",
                            fontWeight: 800,
                          }}>{statusLabel}</p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
