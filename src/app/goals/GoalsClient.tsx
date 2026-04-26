"use client";

import Link from "next/link";
import { ChevronRight, Plus, Repeat, Calendar } from "lucide-react";

interface Goal {
  id: string;
  type: "recurring" | "oneoff";
  days_of_week: number[] | null;
  scheduled_date: string | null;
  distance_km: number | null;
  duration_minutes: number | null;
  penalty_amount: number;
  is_active: boolean;
  created_at: string;
}

interface Instance {
  goal_id: string;
  scheduled_date: string;
  status: "pending" | "achieved" | "failed" | "skipped" | "cancelled";
}

interface PastRecurringGoal extends Goal {
  achievedCount: number;
}

const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];
// 月〜日の順で並べるための順序
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

function formatGoalSummary(goal: Goal) {
  const parts: string[] = [];
  if (goal.distance_km) parts.push(`${goal.distance_km}km`);
  if (goal.duration_minutes) parts.push(`${goal.duration_minutes}分`);
  return parts.join("・") || "フリーラン";
}

function formatSchedule(goal: Goal) {
  if (goal.type === "recurring" && goal.days_of_week) {
    return "毎週 " + [...goal.days_of_week].sort((a, b) => WEEK_ORDER.indexOf(a) - WEEK_ORDER.indexOf(b)).map((d) => DAY_NAMES[d]).join("・");
  }
  if (goal.type === "oneoff" && goal.scheduled_date) {
    const d = new Date(goal.scheduled_date + "T00:00:00");
    return `${d.getMonth() + 1}/${d.getDate()}(${DAY_NAMES[d.getDay()]})`;
  }
  return "";
}

type DotType = "orange-filled" | "orange-outline" | "gray-outline" | "gray-filled";

function Dot({ type }: { type: DotType }) {
  const isOrange = type === "orange-filled" || type === "orange-outline";
  const isFilled = type === "orange-filled" || type === "gray-filled";
  return (
    <div style={{
      width: "9px",
      height: "9px",
      borderRadius: "50%",
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
    if (instance?.status === "achieved") {
      dotType = "orange-filled";
    } else if (isToday) {
      dotType = "orange-outline";
    } else if (isPast) {
      dotType = "gray-filled";
    } else {
      dotType = "gray-outline";
    }

    return { dayNum, dayName: DAY_NAMES[dayNum], dotType };
  });

  return (
    <div style={{ display: "flex", gap: "10px", marginTop: "8px", alignItems: "center" }}>
      {dots.map(({ dayNum, dayName, dotType }) => {
        const isOrange = dotType === "orange-filled" || dotType === "orange-outline";
        return (
          <div key={dayNum} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <span style={{ fontSize: "10px", color: isOrange ? "#FF6B00" : "#BBBBBB", fontWeight: 600, lineHeight: 1 }}>
              {dayName}
            </span>
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
  if (instance?.status === "achieved") {
    dotType = "orange-filled";
  } else if (isToday) {
    dotType = "orange-outline";
  } else if (isPast) {
    dotType = "gray-filled";
  } else {
    dotType = "gray-outline";
  }

  return (
    <div style={{ display: "flex", gap: "6px", marginTop: "8px", alignItems: "center" }}>
      <Dot type={dotType} />
    </div>
  );
}

export default function GoalsClient({
  goals,
  instances,
  todayStr,
  pastOneoffInstances,
  pastRecurringGoals,
}: {
  goals: Goal[];
  instances: Instance[];
  todayStr: string;
  pastOneoffInstances: Instance[];
  pastRecurringGoals: PastRecurringGoal[];
}) {
  const recurringGoals = goals.filter((g) => g.type === "recurring");
  const activeOneoffGoals = goals.filter(
    (g) => g.type === "oneoff" && (!g.scheduled_date || g.scheduled_date >= todayStr)
  );
  const pastOneoffGoals = goals.filter(
    (g) => g.type === "oneoff" && g.scheduled_date && g.scheduled_date < todayStr
  );

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

        {recurringGoals.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontSize: "12px", color: "#888888", fontWeight: 600, marginBottom: "10px", paddingLeft: "4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              毎週の目標
            </p>
            <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              {recurringGoals.map((goal, idx) => (
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
                      </div>
                      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                        <p style={{ fontSize: "13px", color: "#888888", fontWeight: 600 }}>¥{goal.penalty_amount.toLocaleString()}</p>
                        <ChevronRight size={18} color="#CCCCCC" />
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeOneoffGoals.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontSize: "12px", color: "#888888", fontWeight: 600, marginBottom: "10px", paddingLeft: "4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              1回のみの目標
            </p>
            <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              {activeOneoffGoals.map((goal, idx) => (
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
                      </div>
                      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                        <p style={{ fontSize: "13px", color: "#888888", fontWeight: 600 }}>¥{goal.penalty_amount.toLocaleString()}</p>
                        <ChevronRight size={18} color="#CCCCCC" />
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

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
                    {isPastRecurring ? (
                      <div style={{ display: "flex", alignItems: "center", padding: "16px 16px", gap: "14px" }}>
                        <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Repeat size={20} color="#AAAAAA" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: "16px", fontWeight: 700, color: "#888888" }}>{formatGoalSummary(goal)}</p>
                          <p style={{ fontSize: "12px", color: "#AAAAAA", marginTop: "2px" }}>{formatSchedule(goal)}</p>
                        </div>
                        <div style={{ flexShrink: 0 }}>
                          <span style={{ fontSize: "12px", color: "#AAAAAA", fontWeight: 600 }}>
                            {(goal as PastRecurringGoal).achievedCount}回達成
                          </span>
                        </div>
                      </div>
                    ) : (
                      <Link href={`/goals/${goal.id}`}>
                        <div style={{ display: "flex", alignItems: "center", padding: "16px 16px", gap: "14px" }}>
                          <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Calendar size={20} color="#AAAAAA" />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: "16px", fontWeight: 700, color: "#888888" }}>{formatGoalSummary(goal)}</p>
                            <p style={{ fontSize: "12px", color: "#AAAAAA", marginTop: "2px" }}>{formatSchedule(goal)}</p>
                          </div>
                          <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                            {statusLabel && (
                              <span style={{ fontSize: "12px", color: statusColor, fontWeight: 600 }}>{statusLabel}</span>
                            )}
                            <ChevronRight size={18} color="#CCCCCC" />
                          </div>
                        </div>
                      </Link>
                    )}
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
