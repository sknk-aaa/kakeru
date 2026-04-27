"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Plus, Repeat, Calendar, Trophy } from "lucide-react";

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
      <div style={{ padding: "16px 16px", cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#FFF9E5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Trophy size={20} color="#F59E0B" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: "16px", fontWeight: 700, color: "#111111" }}>{formatGoalSummary(goal)}</p>
                {daysLeft !== null && (
                  <p style={{ fontSize: "12px", color: daysLeft <= 7 ? "#EF4444" : "#888888", marginTop: "2px" }}>
                    残り{daysLeft}日 {formatSchedule(goal)}
                  </p>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                <p style={{ fontSize: "13px", color: "#888888", fontWeight: 600 }}>¥{goal.penalty_amount.toLocaleString()}</p>
                <ChevronRight size={18} color="#CCCCCC" />
              </div>
            </div>

            {distPct !== null && (
              <div style={{ marginTop: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#888888", marginBottom: "4px" }}>
                  <span style={{ color: "#FF6B00", fontWeight: 600 }}>{progress.totalDistKm}km</span>
                  <span>目標 {goal.distance_km}km（{Math.round(distPct)}%）</span>
                </div>
                <div style={{ height: "5px", background: "#F0F0F0", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "#FF6B00", borderRadius: "3px", width: `${distPct}%` }} />
                </div>
              </div>
            )}

            {timePct !== null && (
              <div style={{ marginTop: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#888888", marginBottom: "4px" }}>
                  <span style={{ color: "#FF6B00", fontWeight: 600 }}>{Math.round(progress.totalSec / 60)}分</span>
                  <span>目標 {goal.duration_minutes}分（{Math.round(timePct)}%）</span>
                </div>
                <div style={{ height: "5px", background: "#F0F0F0", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "#FF6B00", borderRadius: "3px", width: `${timePct}%` }} />
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
  isRainy,
  challengeProgress,
}: {
  goals: Goal[];
  instances: Instance[];
  todayStr: string;
  pastOneoffInstances: Instance[];
  pastRecurringGoals: PastRecurringGoal[];
  isRainy: boolean;
  challengeProgress: Record<string, { totalDistKm: number; totalSec: number }>;
}) {
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());

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
    <div>
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #E5E5E5",
        padding: "0 16px", height: "54px",
        display: "flex", alignItems: "center",
      }}>
        <div style={{ flex: 1 }} />
        <h1 style={{ fontSize: "17px", fontWeight: 700, color: "#111111" }}>目標</h1>
        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          <Link href="/goals/new">
            <button style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#FF6B00", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }}>
              <Plus size={18} color="white" strokeWidth={2.5} />
            </button>
          </Link>
        </div>
      </div>

      <div style={{ padding: "0 16px 24px" }}>

        {goals.length === 0 && (
          <div style={{ background: "white", borderRadius: "16px", padding: "48px 20px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <p style={{ color: "#AAAAAA", fontSize: "15px", marginBottom: "16px" }}>設定中の目標がありません</p>
            <Link href="/goals/new">
              <button className="btn-primary" style={{ minHeight: "48px", padding: "0 28px" }}>目標を追加する</button>
            </Link>
          </div>
        )}

        {/* チャレンジ */}
        {challengeGoals.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontSize: "12px", color: "#888888", fontWeight: 600, marginBottom: "10px", paddingLeft: "4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              進行中のチャレンジ
            </p>
            <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              {challengeGoals.map((goal, idx) => (
                <div key={goal.id}>
                  {idx > 0 && <div style={{ height: "1px", background: "#F2F2F2", marginLeft: "74px" }} />}
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
          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontSize: "12px", color: "#888888", fontWeight: 600, marginBottom: "10px", paddingLeft: "4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              毎週の目標
            </p>
            <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              {recurringGoals.map((goal, idx) => {
                const todayInstance = getTodayPendingInstance(goal.id);
                return (
                  <div key={goal.id}>
                    {idx > 0 && <div style={{ height: "1px", background: "#F2F2F2", marginLeft: "68px" }} />}
                    <Link href={`/goals/${goal.id}`}>
                      <div style={{ display: "flex", alignItems: "center", padding: "16px 16px", gap: "14px" }}>
                        <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#FFF0E5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Repeat size={20} color="#FF6B00" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: "16px", fontWeight: 700, color: "#111111" }}>{formatGoalSummary(goal)}</p>
                          <p style={{ fontSize: "12px", color: "#888888", marginTop: "2px" }}>{formatSchedule(goal)}</p>
                          <WeekDots goal={goal} instances={instances} todayStr={todayStr} />
                          {isRainy && todayInstance && (
                            <RainSkipButton
                              instanceId={todayInstance.id}
                              onSkipped={() => setSkippedIds((prev) => new Set([...prev, todayInstance.id]))}
                            />
                          )}
                        </div>
                        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                          <p style={{ fontSize: "13px", color: "#888888", fontWeight: 600 }}>¥{goal.penalty_amount.toLocaleString()}</p>
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
          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontSize: "12px", color: "#888888", fontWeight: 600, marginBottom: "10px", paddingLeft: "4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              1回のみの目標
            </p>
            <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              {activeOneoffGoals.map((goal, idx) => {
                const todayInstance = getTodayPendingInstance(goal.id);
                return (
                  <div key={goal.id}>
                    {idx > 0 && <div style={{ height: "1px", background: "#F2F2F2", marginLeft: "68px" }} />}
                    <Link href={`/goals/${goal.id}`}>
                      <div style={{ display: "flex", alignItems: "center", padding: "16px 16px", gap: "14px" }}>
                        <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#F0F5FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Calendar size={20} color="#4285F4" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: "16px", fontWeight: 700, color: "#111111" }}>{formatGoalSummary(goal)}</p>
                          <p style={{ fontSize: "12px", color: "#888888", marginTop: "2px" }}>{formatSchedule(goal)}</p>
                          <OneoffDot goal={goal} instances={instances} todayStr={todayStr} />
                          {isRainy && todayInstance && (
                            <RainSkipButton
                              instanceId={todayInstance.id}
                              onSkipped={() => setSkippedIds((prev) => new Set([...prev, todayInstance.id]))}
                            />
                          )}
                        </div>
                        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                          <p style={{ fontSize: "13px", color: "#888888", fontWeight: 600 }}>¥{goal.penalty_amount.toLocaleString()}</p>
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
            <p style={{ fontSize: "12px", color: "#888888", fontWeight: 600, marginBottom: "10px", paddingLeft: "4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              過去の目標
            </p>
            <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              {[...pastOneoffGoals, ...pastRecurringGoals].map((goal, idx) => {
                const isPastRecurring = "achievedCount" in goal;
                const instance = pastOneoffInstances.find((i) => i.goal_id === goal.id);
                const statusLabel = instance?.status === "achieved" ? "達成" : instance?.status === "failed" ? "失敗" : null;
                const statusColor = instance?.status === "achieved" ? "#22C55E" : "#EF4444";
                return (
                  <div key={goal.id}>
                    {idx > 0 && <div style={{ height: "1px", background: "#F2F2F2", marginLeft: "68px" }} />}
                    <div style={{ display: "flex", alignItems: "center", padding: "16px 16px", gap: "14px" }}>
                      <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {isPastRecurring ? <Repeat size={20} color="#AAAAAA" /> : <Calendar size={20} color="#AAAAAA" />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "16px", fontWeight: 700, color: "#888888" }}>{formatGoalSummary(goal)}</p>
                        <p style={{ fontSize: "12px", color: "#AAAAAA", marginTop: "2px" }}>{formatSchedule(goal)}</p>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ fontSize: "13px", color: "#AAAAAA", fontWeight: 600 }}>¥{goal.penalty_amount.toLocaleString()}</p>
                        {isPastRecurring ? (
                          <p style={{ fontSize: "11px", color: "#AAAAAA", marginTop: "2px" }}>{(goal as PastRecurringGoal).achievedCount}回達成</p>
                        ) : statusLabel ? (
                          <p style={{ fontSize: "11px", color: statusColor, marginTop: "2px" }}>{statusLabel}</p>
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
