"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, MapPin, Clock, AlertCircle } from "lucide-react";
import AppShell from "@/components/AppShell";

const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

interface InstanceWithGoal {
  id: string;
  scheduled_date: string;
  status: string;
  goals: {
    id: string;
    type: string;
    distance_km: number | null;
    duration_minutes: number | null;
    penalty_amount: number;
    days_of_week: number[] | null;
  } | null;
}

function dateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getMonth() + 1}月${d.getDate()}日（${DAY_NAMES[d.getDay()]}）`;
}

export default function InstancePage() {
  const router = useRouter();
  const params = useParams();
  const instanceId = params.instanceId as string;

  const [instance, setInstance] = useState<InstanceWithGoal | null>(null);
  const [cancelled, setCancelled] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [todayStr] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("goal_instances")
      .select("id, scheduled_date, status, goals(id, type, distance_km, duration_minutes, penalty_amount, days_of_week)")
      .eq("id", instanceId)
      .single()
      .then(({ data }) => {
        if (data) setInstance(data as unknown as InstanceWithGoal);
      });
  }, [instanceId]);

  async function handleCancel() {
    setProcessing(true);
    setError(null);
    const res = await fetch(`/api/goals/instances/${instanceId}/cancel`, { method: "POST" });
    if (res.ok) {
      setCancelled(true);
    } else {
      setError("取り消しに失敗しました");
    }
    setProcessing(false);
  }

  if (!instance) {
    return (
      <AppShell>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "50vh" }}>
          <p style={{ color: "#AAAAAA" }}>読み込み中...</p>
        </div>
      </AppShell>
    );
  }

  const goal = instance.goals;
  if (!goal) return null;

  const d = new Date(instance.scheduled_date + "T00:00:00");
  const isToday = instance.scheduled_date === todayStr;
  const label = dateLabel(instance.scheduled_date);

  return (
    <AppShell>
      <div>
        {/* ヘッダー */}
        <div style={{
          position: "sticky", top: 0, zIndex: 10,
          background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)",
          borderBottom: "1px solid #E5E5E5",
          padding: "0 16px", height: "54px",
          display: "flex", alignItems: "center",
        }}>
          <button
            onClick={() => router.back()}
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: "#FF6B00", fontSize: "15px", fontWeight: 500 }}
          >
            <ChevronLeft size={20} color="#FF6B00" /> ホーム
          </button>
        </div>

        <div style={{ padding: "0 16px 48px" }}>

          {/* タイトル */}
          <div style={{ paddingTop: "24px", marginBottom: "20px" }}>
            <p style={{ fontSize: "12px", color: "#888888", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
              この日の目標
            </p>
            <h1 style={{ fontSize: "30px", fontWeight: 800, color: "#111111", lineHeight: 1.1 }}>
              {label}
            </h1>
          </div>

          {/* 目標詳細カード */}
          <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", marginBottom: "20px" }}>

            {/* 実施曜日（recurring のみ） */}
            {goal.days_of_week && goal.days_of_week.length > 0 && (
              <div style={{ padding: "16px 16px 14px", borderBottom: "1px solid #F2F2F2" }}>
                <p style={{ fontSize: "11px", color: "#AAAAAA", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>
                  実施曜日
                </p>
                <div style={{ display: "flex", gap: "5px" }}>
                  {DAY_NAMES.map((day, i) => {
                    const isActive = goal.days_of_week!.includes(i);
                    const isThisDay = i === d.getDay();
                    return (
                      <div
                        key={i}
                        style={{
                          flex: 1, height: "36px", borderRadius: "8px",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "13px", fontWeight: 700,
                          background: isActive ? (isThisDay ? "#FF6B00" : "#FFE8D6") : "#F5F5F5",
                          color: isActive ? (isThisDay ? "white" : "#FF6B00") : "#CCCCCC",
                        }}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 目標距離・時間 */}
            <div style={{ padding: "16px 16px 14px", borderBottom: "1px solid #F2F2F2" }}>
              <p style={{ fontSize: "11px", color: "#AAAAAA", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>
                目標
              </p>
              <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                {goal.distance_km && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <MapPin size={15} color="#FF6B00" />
                    <span style={{ fontSize: "22px", fontWeight: 800, color: "#111111" }}>
                      {goal.distance_km}
                      <span style={{ fontSize: "13px", fontWeight: 500, color: "#888888" }}> km</span>
                    </span>
                  </div>
                )}
                {goal.duration_minutes && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Clock size={15} color="#888888" />
                    <span style={{ fontSize: "22px", fontWeight: 800, color: "#111111" }}>
                      {goal.duration_minutes}
                      <span style={{ fontSize: "13px", fontWeight: 500, color: "#888888" }}> 分</span>
                    </span>
                  </div>
                )}
                {!goal.distance_km && !goal.duration_minutes && (
                  <span style={{ fontSize: "18px", fontWeight: 700, color: "#111111" }}>フリーラン</span>
                )}
              </div>
            </div>

            {/* 罰金 */}
            <div style={{ padding: "16px 16px 14px" }}>
              <p style={{ fontSize: "11px", color: "#AAAAAA", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
                罰金
              </p>
              <p style={{ fontSize: "22px", fontWeight: 800, color: "#EF4444" }}>
                ¥{goal.penalty_amount.toLocaleString("ja-JP")}
              </p>
            </div>
          </div>

          {/* アクションエリア */}
          {isToday ? (
            <div style={{ background: "#F8F8F8", borderRadius: "12px", padding: "14px 16px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <AlertCircle size={16} color="#AAAAAA" style={{ flexShrink: 0, marginTop: "1px" }} />
              <p style={{ fontSize: "13px", color: "#888888", lineHeight: 1.6 }}>当日の目標は取り消せません。</p>
            </div>
          ) : cancelled ? (
            <div style={{ background: "#F0FDF4", borderRadius: "12px", padding: "20px 16px", textAlign: "center", borderLeft: "3px solid #22C55E" }}>
              <p style={{ fontSize: "16px", fontWeight: 700, color: "#22C55E", marginBottom: "4px" }}>取り消しました ✓</p>
              <p style={{ fontSize: "13px", color: "#888888" }}>この日の目標スケジュールを取り消しました</p>
            </div>
          ) : (
            <>
              {error && <p style={{ fontSize: "13px", color: "#EF4444", marginBottom: "10px" }}>{error}</p>}
              <button
                onClick={handleCancel}
                disabled={processing}
                style={{ width: "100%", minHeight: "52px", background: "white", border: "1.5px solid #EF4444", borderRadius: "10px", color: "#EF4444", fontSize: "15px", fontWeight: 700, cursor: "pointer", marginBottom: "10px" }}
              >
                {processing ? "処理中..." : `${label}の目標を取り消す`}
              </button>
              <p style={{ fontSize: "12px", color: "#AAAAAA", textAlign: "center" }}>
                この日分のみキャンセルされます。翌週以降は継続されます。
              </p>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
