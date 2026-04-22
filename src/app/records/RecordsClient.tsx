"use client";

import { useState } from "react";
import { formatPace, formatDuration } from "@/lib/haversine";
import { Trophy, Clock, Flame } from "lucide-react";

interface Run {
  id: string;
  distance_km: number;
  duration_seconds: number;
  pace_seconds_per_km: number | null;
  calories: number | null;
  started_at: string;
}

type Period = "month" | "prev" | "all";

interface Props {
  runs: Run[];
  bestPaceSecPerKm: number | null;
  longestRunKm: number;
  totalDurationSec: number;
  totalCalories: number;
}

function formatHoursMin(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h${m}m` : `${m}m`;
}

const PERIOD_LABELS: Record<Period, string> = { month: "今月", prev: "先月", all: "全期間" };

export default function RecordsClient({ runs, bestPaceSecPerKm, longestRunKm, totalDurationSec, totalCalories }: Props) {
  const [period, setPeriod] = useState<Period>("month");

  const now = new Date();
  const filteredRuns = runs.filter((r) => {
    const d = new Date(r.started_at);
    if (period === "month") return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    if (period === "prev") {
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return d.getFullYear() === prev.getFullYear() && d.getMonth() === prev.getMonth();
    }
    return true;
  });

  // 週別グラフデータ（直近7週）
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() - i * 7);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    const total = runs.filter((r) => {
      const d = new Date(r.started_at);
      return d >= weekStart && d <= weekEnd;
    }).reduce((s, r) => s + r.distance_km, 0);
    return { label: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`, total: Math.round(total * 10) / 10 };
  }).reverse();

  const maxWeekly = Math.max(...weeklyData.map((w) => w.total), 5);
  // y軸の上限をきりのよい数字に
  const yMax = Math.ceil(maxWeekly / 5) * 5;
  const yTicks = [yMax, Math.round(yMax * 0.5), 0];

  const filteredTotal = filteredRuns.reduce((s, r) => s + r.distance_km, 0);

  return (
    <div>
      {/* ヘッダー */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #E5E5E5",
        padding: "0 16px", height: "54px",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <h1 style={{ fontSize: "17px", fontWeight: 700, color: "#111111" }}>記録</h1>
      </div>

      <div style={{ padding: "0 16px 24px" }}>

        {/* 期間セグメントコントロール */}
        <div style={{ background: "#E4E4EB", borderRadius: "10px", padding: "2px", display: "flex", marginBottom: "16px" }}>
          {(["month", "prev", "all"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                flex: 1,
                padding: "7px 0",
                borderRadius: "8px",
                background: period === p ? "white" : "transparent",
                boxShadow: period === p ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
                fontSize: "13px",
                fontWeight: period === p ? 600 : 500,
                color: period === p ? "#111111" : "#888888",
                border: "none",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        {/* 期間合計 */}
        <div style={{ background: "white", borderRadius: "16px", padding: "20px", marginBottom: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <p style={{ fontSize: "12px", color: "#888888", marginBottom: "6px" }}>{PERIOD_LABELS[period]}の合計</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
            <div>
              <span className="metric-value" style={{ fontSize: "48px", color: "#FF6B00", lineHeight: 1 }}>
                {Math.round(filteredTotal * 10) / 10}
              </span>
              <span style={{ fontSize: "16px", color: "#888888", marginLeft: "4px" }}>km</span>
            </div>
            <span style={{ fontSize: "16px", color: "#CCCCCC" }}>·</span>
            <span style={{ fontSize: "18px", color: "#888888", fontWeight: 600 }}>{filteredRuns.length}回</span>
          </div>
        </div>

        {/* 週別グラフ */}
        <div style={{ background: "white", borderRadius: "16px", padding: "16px", marginBottom: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <p style={{ fontSize: "12px", color: "#888888", fontWeight: 600, marginBottom: "14px" }}>週別走行距離</p>

          <div style={{ display: "flex", gap: "8px" }}>
            {/* y軸 */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-end", paddingBottom: "18px", flexShrink: 0 }}>
              {yTicks.map((tick) => (
                <span key={tick} style={{ fontSize: "9px", color: "#AAAAAA", lineHeight: 1 }}>{tick}</span>
              ))}
            </div>

            {/* グラフ本体 */}
            <div style={{ flex: 1, position: "relative" }}>
              {/* グリッド線 */}
              {yTicks.map((tick, i) => (
                <div
                  key={tick}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: `${(i / (yTicks.length - 1)) * 100}%`,
                    height: "1px",
                    background: "#F0F0F0",
                    transform: "translateY(-50%)",
                  }}
                />
              ))}

              {/* バー群 */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "100px", paddingBottom: "0" }}>
                {weeklyData.map((w, i) => {
                  const isLatest = i === weeklyData.length - 1;
                  const barH = yMax > 0 ? Math.max((w.total / yMax) * 92, w.total > 0 ? 4 : 0) : 0;
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
                      <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
                        <div
                          style={{
                            width: "100%",
                            height: `${barH}px`,
                            background: isLatest ? "#FF6B00" : "#E5E5E5",
                            borderRadius: "4px 4px 2px 2px",
                            transition: "height 0.3s ease",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* x軸ラベル */}
              <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
                {weeklyData.map((w, i) => (
                  <div key={i} style={{ flex: 1, textAlign: "center" }}>
                    <span style={{ fontSize: "8px", color: i === weeklyData.length - 1 ? "#FF6B00" : "#AAAAAA" }}>
                      {w.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* パーソナルベスト */}
        <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", marginBottom: "12px" }}>
          <div style={{ padding: "14px 16px 10px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Trophy size={14} color="#FF6B00" />
            <span style={{ fontSize: "12px", color: "#888888", fontWeight: 600 }}>パーソナルベスト</span>
          </div>
          <div style={{ height: "1px", background: "#F2F2F2" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            <div style={{ padding: "14px 16px", borderRight: "1px solid #F2F2F2" }}>
              <p style={{ fontSize: "10px", color: "#AAAAAA", marginBottom: "4px" }}>最速ペース</p>
              <p className="metric-value" style={{ fontSize: "26px", color: "#111111" }}>
                {bestPaceSecPerKm ? formatPace(bestPaceSecPerKm) : <span style={{ color: "#CCCCCC" }}>--'--"</span>}
              </p>
            </div>
            <div style={{ padding: "14px 16px" }}>
              <p style={{ fontSize: "10px", color: "#AAAAAA", marginBottom: "4px" }}>最長距離</p>
              <p className="metric-value" style={{ fontSize: "26px", color: "#111111" }}>
                {longestRunKm > 0 ? (
                  <>{Math.round(longestRunKm * 100) / 100}<span style={{ fontSize: "14px", color: "#888888", marginLeft: "2px" }}>km</span></>
                ) : (
                  <span style={{ color: "#CCCCCC" }}>--</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* 累計データ */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
          {[
            { icon: Clock, label: "総走行時間", value: formatHoursMin(totalDurationSec) },
            { icon: Flame, label: "消費カロリー", value: `${totalCalories.toLocaleString()}kcal` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} style={{ background: "white", borderRadius: "16px", padding: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <Icon size={16} color="#AAAAAA" style={{ marginBottom: "8px" }} />
              <p style={{ fontSize: "10px", color: "#AAAAAA", marginBottom: "4px" }}>{label}</p>
              <p className="metric-value" style={{ fontSize: "22px", color: "#111111" }}>{value}</p>
            </div>
          ))}
        </div>

        {/* 履歴リスト */}
        <p style={{ fontSize: "12px", color: "#888888", fontWeight: 600, marginBottom: "8px", paddingLeft: "4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>履歴</p>

        {filteredRuns.length === 0 ? (
          <div style={{ background: "white", borderRadius: "16px", padding: "36px 20px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <p style={{ color: "#AAAAAA", fontSize: "14px" }}>記録がありません</p>
          </div>
        ) : (
          <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            {filteredRuns.slice(0, 20).map((run, idx) => {
              const d = new Date(run.started_at);
              const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
              const dayName = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
              return (
                <div key={run.id}>
                  {idx > 0 && <div style={{ height: "1px", background: "#F2F2F2", marginLeft: "60px" }} />}
                  <div style={{ display: "flex", alignItems: "center", padding: "14px 16px", gap: "12px" }}>
                    {/* 日付 */}
                    <div style={{ width: "36px", flexShrink: 0, textAlign: "center" }}>
                      <p className="metric-value" style={{ fontSize: "18px", color: "#111111", lineHeight: 1 }}>{d.getDate()}</p>
                      <p style={{ fontSize: "10px", color: "#AAAAAA", marginTop: "1px" }}>{d.getMonth() + 1}/{dayName}</p>
                    </div>
                    <div style={{ width: "1px", height: "32px", background: "#F0F0F0", flexShrink: 0 }} />
                    {/* 距離 */}
                    <div style={{ flex: 1 }}>
                      <span className="metric-value" style={{ fontSize: "24px", color: "#FF6B00" }}>
                        {Math.round(run.distance_km * 100) / 100}
                      </span>
                      <span style={{ fontSize: "12px", color: "#AAAAAA", marginLeft: "2px" }}>km</span>
                    </div>
                    {/* 時間・ペース */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ fontSize: "14px", color: "#888888", fontWeight: 500 }}>{formatDuration(run.duration_seconds)}</p>
                      <p style={{ fontSize: "11px", color: "#AAAAAA", marginTop: "2px" }}>
                        {run.pace_seconds_per_km ? formatPace(run.pace_seconds_per_km) + "/km" : "--"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
