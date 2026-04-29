"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { formatPace, formatDuration } from "@/lib/haversine";
import { Trophy, Clock, Flame, MapPin } from "lucide-react";

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
  weeklyData: { label: string; total: number }[];
  allTimeDistanceKm: number;
  allTimeRunCount: number;
  prevMonthDistanceKm: number;
  prevMonthRunCount: number;
  bestPaceSecPerKm: number | null;
  longestRunKm: number;
  totalDurationSec: number;
  totalCalories: number;
  monthGoal: number;
  monthDistanceKm: number;
}

function formatHoursMin(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h${m}m` : `${m}m`;
}

const PERIOD_LABELS: Record<Period, string> = { month: "今月", prev: "先月", all: "全期間" };

const sectionLabel: React.CSSProperties = {
  fontSize: "11px", color: "#999999", fontWeight: 700,
  letterSpacing: "0.14em", textTransform: "uppercase",
  marginBottom: "10px", paddingLeft: "2px",
};

const card: React.CSSProperties = {
  background: "white", borderRadius: "22px",
  boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
};

export default function RecordsClient({
  runs, weeklyData, allTimeDistanceKm, allTimeRunCount,
  prevMonthDistanceKm, prevMonthRunCount,
  bestPaceSecPerKm, longestRunKm, totalDurationSec, totalCalories,
  monthGoal, monthDistanceKm,
}: Props) {
  const [period, setPeriod] = useState<Period>("month");
  const [allPeriodRuns, setAllPeriodRuns] = useState<Run[]>([]);
  const [allPeriodOffset, setAllPeriodOffset] = useState(0);
  const [hasMoreAll, setHasMoreAll] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);

  const now = new Date();
  const monthRuns = runs.filter(r => {
    const d = new Date(r.started_at);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
  const prevRuns = runs.filter(r => {
    const d = new Date(r.started_at);
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return d.getFullYear() === prev.getFullYear() && d.getMonth() === prev.getMonth();
  });

  useEffect(() => {
    if (period !== "all") {
      setVisibleCount(5);
      return;
    }
    setIsLoadingMore(true);
    fetch("/api/runs?limit=10&offset=0")
      .then(r => r.json())
      .then(({ runs: fetched, hasMore: more }: { runs: Run[]; hasMore: boolean }) => {
        setAllPeriodRuns(fetched);
        setAllPeriodOffset(10);
        setHasMoreAll(more);
        setIsLoadingMore(false);
      });
  }, [period]);

  const loadMoreAll = () => {
    setIsLoadingMore(true);
    fetch(`/api/runs?limit=10&offset=${allPeriodOffset}`)
      .then(r => r.json())
      .then(({ runs: fetched, hasMore: more }: { runs: Run[]; hasMore: boolean }) => {
        setAllPeriodRuns(prev => [...prev, ...fetched]);
        setAllPeriodOffset(o => o + 10);
        setHasMoreAll(more);
        setIsLoadingMore(false);
      });
  };

  const filteredTotal = period === "month" ? monthDistanceKm
    : period === "prev" ? prevMonthDistanceKm
    : allTimeDistanceKm;
  const filteredCount = period === "month" ? monthRuns.length
    : period === "prev" ? prevMonthRunCount
    : allTimeRunCount;

  const currentPeriodRuns = period === "month" ? monthRuns : prevRuns;
  const displayedRuns = period === "all" ? allPeriodRuns : currentPeriodRuns.slice(0, visibleCount);
  const hasMoreLocal = period !== "all" && currentPeriodRuns.length > visibleCount;
  const isInitialAllLoad = period === "all" && isLoadingMore && allPeriodRuns.length === 0;

  const maxWeekly = Math.max(...weeklyData.map(w => w.total), 5);
  const yMax = Math.ceil(maxWeekly / 5) * 5;
  const yTicks = [yMax, Math.round(yMax * 0.5), 0];

  return (
    <div style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #FFF9F5 46%, #F7F7FA 100%)", minHeight: "100vh" }}>

      {/* ヘッダー */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "rgba(255,255,255,0.88)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(235,235,235,0.75)",
        padding: "0 16px 0 56px", height: "60px",
        display: "flex", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Image src="/stickman-assets/stickman-01.png" alt="" width={28} height={28} style={{ objectFit: "contain" }} priority />
          <span style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 900, fontStyle: "italic", color: "#FF6B00", letterSpacing: "0.06em" }}>KAKERU</span>
        </div>
      </div>

      <div style={{ padding: "16px 14px 100px" }}>

        {/* 期間セグメントコントロール */}
        <div style={{ background: "#E4E4EB", borderRadius: "12px", padding: "2px", display: "flex", marginBottom: "16px" }}>
          {(["month", "prev", "all"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                flex: 1, padding: "8px 0", borderRadius: "10px",
                background: period === p ? "white" : "transparent",
                boxShadow: period === p ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
                fontSize: "13px",
                fontWeight: period === p ? 700 : 500,
                color: period === p ? "#111111" : "#888888",
                border: "none", cursor: "pointer", transition: "all 0.15s",
              }}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        {/* 期間合計カード */}
        <div style={{ ...card, padding: "22px 20px", marginBottom: "14px" }}>
          <p style={{ ...sectionLabel, marginBottom: "12px" }}>{PERIOD_LABELS[period]}の合計</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: period === "month" && monthGoal > 0 ? "18px" : "0" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "5px" }}>
              <span className="metric-value" style={{ fontSize: "52px", color: "#FF6B00", lineHeight: 1 }}>
                {Math.round(filteredTotal * 10) / 10}
              </span>
              {period === "month" && monthGoal > 0 ? (
                <span style={{ fontSize: "16px", color: "#CCCCCC" }}>/ {monthGoal} km</span>
              ) : (
                <span style={{ fontSize: "16px", color: "#BBBBBB", fontWeight: 600 }}>km</span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ fontSize: "20px", color: "#DDDDDD" }}>·</span>
              <span className="metric-value" style={{ fontSize: "22px", color: "#BBBBBB" }}>{filteredCount}</span>
              <span style={{ fontSize: "13px", color: "#BBBBBB", fontWeight: 600 }}>回</span>
            </div>
          </div>
          {period === "month" && monthGoal > 0 && (
            <>
              <div style={{ height: "7px", background: "#F0F0F0", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{
                  height: "100%", background: "#FF6B00", borderRadius: "4px",
                  width: `${Math.min((monthDistanceKm / monthGoal) * 100, 100)}%`,
                  transition: "width 0.5s ease",
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                <span style={{ fontSize: "12px", color: "#FF6B00", fontWeight: 700 }}>{Math.round((monthDistanceKm / monthGoal) * 100)}%</span>
                <span style={{ fontSize: "12px", color: "#AAAAAA" }}>残り {Math.max(0, monthGoal - monthDistanceKm).toFixed(1)} km</span>
              </div>
            </>
          )}
        </div>

        {/* 週別グラフ */}
        <div style={{ ...card, padding: "20px 18px", marginBottom: "14px" }}>
          <p style={sectionLabel}>週別走行距離</p>
          <div style={{ display: "flex", gap: "8px" }}>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-end", paddingBottom: "20px", flexShrink: 0 }}>
              {yTicks.map((tick) => (
                <span key={tick} style={{ fontSize: "9px", color: "#CCCCCC", lineHeight: 1 }}>{tick}</span>
              ))}
            </div>
            <div style={{ flex: 1, position: "relative" }}>
              {yTicks.map((_, i) => (
                <div key={i} style={{
                  position: "absolute", left: 0, right: 0,
                  top: `${(i / (yTicks.length - 1)) * 100}%`,
                  height: "1px", background: "#F2F2F2",
                  transform: "translateY(-50%)",
                }} />
              ))}
              <div style={{ display: "flex", alignItems: "flex-end", gap: "5px", height: "100px" }}>
                {weeklyData.map((w, i) => {
                  const isLatest = i === weeklyData.length - 1;
                  const barH = yMax > 0 ? Math.max((w.total / yMax) * 92, w.total > 0 ? 4 : 0) : 0;
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
                      <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
                        <div style={{
                          width: "100%", height: `${barH}px`,
                          background: isLatest ? "#FF6B00" : "#E8E8EE",
                          borderRadius: "6px 6px 2px 2px",
                          transition: "height 0.3s ease",
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: "5px", marginTop: "6px" }}>
                {weeklyData.map((w, i) => (
                  <div key={i} style={{ flex: 1, textAlign: "center" }}>
                    <span style={{ fontSize: "8px", color: i === weeklyData.length - 1 ? "#FF6B00" : "#CCCCCC", fontWeight: i === weeklyData.length - 1 ? 700 : 400 }}>
                      {w.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* パーソナルベスト */}
        <div style={{ ...card, overflow: "hidden", marginBottom: "14px" }}>
          <div style={{ padding: "16px 18px 12px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Trophy size={13} color="#FF6B00" />
            <span style={sectionLabel}>パーソナルベスト</span>
          </div>
          <div style={{ height: "1px", background: "#F5F5F5" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            <div style={{ padding: "16px 18px", borderRight: "1px solid #F5F5F5" }}>
              <p style={{ fontSize: "10px", color: "#BBBBBB", fontWeight: 600, marginBottom: "6px" }}>最速ペース</p>
              <p className="metric-value" style={{ fontSize: "28px", color: "#111111" }}>
                {bestPaceSecPerKm ? formatPace(bestPaceSecPerKm) : <span style={{ color: "#DDDDDD" }}>--&apos;--&quot;</span>}
              </p>
            </div>
            <div style={{ padding: "16px 18px" }}>
              <p style={{ fontSize: "10px", color: "#BBBBBB", fontWeight: 600, marginBottom: "6px" }}>最長距離</p>
              <p className="metric-value" style={{ fontSize: "28px", color: "#111111" }}>
                {longestRunKm > 0 ? (
                  <>{Math.round(longestRunKm * 100) / 100}<span style={{ fontSize: "14px", color: "#AAAAAA", marginLeft: "2px" }}>km</span></>
                ) : (
                  <span style={{ color: "#DDDDDD" }}>--</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* 累計データ */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
          {[
            { icon: Clock, label: "総走行時間", value: formatHoursMin(totalDurationSec) },
            { icon: Flame, label: "消費カロリー", value: `${totalCalories.toLocaleString()}kcal` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} style={{ ...card, padding: "18px 16px" }}>
              <Icon size={16} color="#FF6B00" style={{ marginBottom: "10px" }} />
              <p style={{ fontSize: "10px", color: "#BBBBBB", fontWeight: 600, marginBottom: "5px" }}>{label}</p>
              <p className="metric-value" style={{ fontSize: "22px", color: "#111111" }}>{value}</p>
            </div>
          ))}
        </div>

        {/* 履歴リスト */}
        <p style={sectionLabel}>履歴</p>

        {isInitialAllLoad ? (
          <div style={{ ...card, padding: "40px 20px", textAlign: "center" }}>
            <p style={{ color: "#BBBBBB", fontSize: "14px" }}>読み込み中...</p>
          </div>
        ) : displayedRuns.length === 0 ? (
          <div style={{ ...card, padding: "40px 20px", textAlign: "center" }}>
            <MapPin size={28} color="#DDDDDD" style={{ margin: "0 auto 12px" }} />
            <p style={{ color: "#BBBBBB", fontSize: "14px" }}>記録がありません</p>
          </div>
        ) : (
          <>
            <div style={{ ...card, overflow: "hidden" }}>
              {displayedRuns.map((run, idx) => {
                const d = new Date(run.started_at);
                const dayName = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
                return (
                  <div key={run.id}>
                    {idx > 0 && <div style={{ height: "1px", background: "#F5F5F5", marginLeft: "72px" }} />}
                    <div style={{ display: "flex", alignItems: "center", padding: "16px 16px", gap: "12px" }}>
                      <div style={{ width: "40px", flexShrink: 0, textAlign: "center" }}>
                        <p className="metric-value" style={{ fontSize: "22px", color: "#111111", lineHeight: 1 }}>{d.getDate()}</p>
                        <p style={{ fontSize: "10px", color: "#CCCCCC", marginTop: "2px", fontWeight: 500 }}>
                          {d.getMonth() + 1}/{dayName}
                        </p>
                      </div>
                      <div style={{ width: "1px", height: "32px", background: "#F0F0F0", flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
                          <span className="metric-value" style={{ fontSize: "26px", color: "#FF6B00" }}>
                            {Math.round(run.distance_km * 100) / 100}
                          </span>
                          <span style={{ fontSize: "12px", color: "#BBBBBB", fontWeight: 600 }}>km</span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ fontSize: "14px", color: "#555555", fontWeight: 600 }}>{formatDuration(run.duration_seconds)}</p>
                        <p style={{ fontSize: "11px", color: "#CCCCCC", marginTop: "2px" }}>
                          {run.pace_seconds_per_km ? formatPace(run.pace_seconds_per_km) + "/km" : "--"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {(hasMoreLocal || (period === "all" && hasMoreAll)) && (
              <button
                onClick={period === "all" ? loadMoreAll : () => setVisibleCount(v => v + 5)}
                disabled={isLoadingMore}
                style={{
                  display: "block", width: "100%", marginTop: "10px",
                  padding: "14px", borderRadius: "14px",
                  background: "white", border: "none", cursor: isLoadingMore ? "default" : "pointer",
                  fontSize: "13px", fontWeight: 600,
                  color: isLoadingMore ? "#CCCCCC" : "#FF6B00",
                  boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
                }}
              >
                {isLoadingMore ? "読み込み中..." : "もっと見る"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
