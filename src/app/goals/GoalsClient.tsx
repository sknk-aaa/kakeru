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

const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

function formatGoalSummary(goal: Goal) {
  const parts: string[] = [];
  if (goal.distance_km) parts.push(`${goal.distance_km}km`);
  if (goal.duration_minutes) parts.push(`${goal.duration_minutes}分`);
  return parts.join("・") || "フリーラン";
}

function formatSchedule(goal: Goal) {
  if (goal.type === "recurring" && goal.days_of_week) {
    return "毎週 " + [...goal.days_of_week].sort().map((d) => DAY_NAMES[d]).join("・");
  }
  if (goal.type === "oneoff" && goal.scheduled_date) {
    const d = new Date(goal.scheduled_date + "T00:00:00");
    return `${d.getMonth() + 1}/${d.getDate()}(${DAY_NAMES[d.getDay()]})`;
  }
  return "";
}

export default function GoalsClient({ goals }: { goals: Goal[] }) {
  const recurringGoals = goals.filter((g) => g.type === "recurring");
  const oneoffGoals = goals.filter((g) => g.type === "oneoff");

  return (
    <div>
      <div style={{ padding: "20px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 className="metric-value" style={{ fontSize: "30px", color: "#111111" }}>目標</h1>
        <Link href="/goals/new">
          <button style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#FF6B00", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }}>
            <Plus size={18} color="white" strokeWidth={2.5} />
          </button>
        </Link>
      </div>

      <div style={{ padding: "0 16px 24px" }}>

        {goals.length === 0 && (
          <div style={{ background: "white", borderRadius: "16px", padding: "40px 20px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <p style={{ color: "#AAAAAA", fontSize: "14px", marginBottom: "16px" }}>設定中の目標がありません</p>
            <Link href="/goals/new">
              <button className="btn-primary" style={{ minHeight: "44px", padding: "0 24px" }}>目標を追加する</button>
            </Link>
          </div>
        )}

        {recurringGoals.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <p style={{ fontSize: "12px", color: "#888888", fontWeight: 600, marginBottom: "8px", paddingLeft: "4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              毎週の目標
            </p>
            <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              {recurringGoals.map((goal, idx) => (
                <div key={goal.id}>
                  {idx > 0 && <div style={{ height: "1px", background: "#F2F2F2", marginLeft: "56px" }} />}
                  <Link href={`/goals/${goal.id}`}>
                    <div style={{ display: "flex", alignItems: "center", padding: "14px 16px", gap: "12px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#FFF0E5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Repeat size={16} color="#FF6B00" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "15px", fontWeight: 600, color: "#111111" }}>{formatGoalSummary(goal)}</p>
                        <p style={{ fontSize: "12px", color: "#888888", marginTop: "2px" }}>{formatSchedule(goal)}</p>
                      </div>
                      <div style={{ flexShrink: 0, textAlign: "right" }}>
                        <p style={{ fontSize: "13px", color: "#EF4444", fontWeight: 600 }}>¥{goal.penalty_amount.toLocaleString()}</p>
                        <ChevronRight size={16} color="#CCCCCC" style={{ marginTop: "2px" }} />
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {oneoffGoals.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <p style={{ fontSize: "12px", color: "#888888", fontWeight: 600, marginBottom: "8px", paddingLeft: "4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              1回のみの目標
            </p>
            <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              {oneoffGoals.map((goal, idx) => (
                <div key={goal.id}>
                  {idx > 0 && <div style={{ height: "1px", background: "#F2F2F2", marginLeft: "56px" }} />}
                  <Link href={`/goals/${goal.id}`}>
                    <div style={{ display: "flex", alignItems: "center", padding: "14px 16px", gap: "12px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#F0F5FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Calendar size={16} color="#4285F4" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "15px", fontWeight: 600, color: "#111111" }}>{formatGoalSummary(goal)}</p>
                        <p style={{ fontSize: "12px", color: "#888888", marginTop: "2px" }}>{formatSchedule(goal)}</p>
                      </div>
                      <div style={{ flexShrink: 0, textAlign: "right" }}>
                        <p style={{ fontSize: "13px", color: "#EF4444", fontWeight: 600 }}>¥{goal.penalty_amount.toLocaleString()}</p>
                        <ChevronRight size={16} color="#CCCCCC" style={{ marginTop: "2px" }} />
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        <Link href="/goals/new">
          <div style={{ background: "white", borderRadius: "16px", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <span style={{ fontSize: "15px", fontWeight: 600, color: "#111111" }}>新しい目標を追加</span>
            <ChevronRight size={18} color="#AAAAAA" />
          </div>
        </Link>

      </div>
    </div>
  );
}
