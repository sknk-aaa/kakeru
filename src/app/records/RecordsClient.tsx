"use client";

import { useState } from "react";
import { formatPace, formatDuration } from "@/lib/haversine";
import { Trophy, Clock, Flame, TrendingUp } from "lucide-react";

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
  return h > 0 ? `${h}時間${m}分` : `${m}分`;
}

export default function RecordsClient({
  runs,
  bestPaceSecPerKm,
  longestRunKm,
  totalDurationSec,
  totalCalories,
}: Props) {
  const [period, setPeriod] = useState<Period>("month");

  const now = new Date();
  const filteredRuns = runs.filter((r) => {
    const d = new Date(r.started_at);
    if (period === "month") {
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }
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

    const weekRuns = runs.filter((r) => {
      const d = new Date(r.started_at);
      return d >= weekStart && d <= weekEnd;
    });
    const total = weekRuns.reduce((s, r) => s + r.distance_km, 0);
    const label = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
    return { label, total: Math.round(total * 10) / 10 };
  }).reverse();

  const maxWeekly = Math.max(...weeklyData.map((w) => w.total), 1);
  const filteredTotal = filteredRuns.reduce((s, r) => s + r.distance_km, 0);

  return (
    <div className="px-4 pt-12 pb-4">
      <h1 className="metric-value text-3xl text-[#111111] mb-4">記録</h1>

      {/* 期間タブ */}
      <div className="flex gap-2 mb-5">
        {([["month", "今月"], ["prev", "前月"], ["all", "全期間"]] as [Period, string][]).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setPeriod(value)}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all"
            style={{
              backgroundColor: period === value ? "#FF6B00" : "#F0F0F0",
              color: period === value ? "white" : "#888888",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 週別グラフ */}
      <div className="card mb-4">
        <p className="text-xs text-[#888888] font-medium mb-3">走行距離グラフ（週別）</p>
        <div className="flex items-end gap-1.5 h-24">
          {weeklyData.map((w, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-sm transition-all"
                style={{
                  height: `${Math.max((w.total / maxWeekly) * 80, w.total > 0 ? 4 : 0)}px`,
                  backgroundColor: i === weeklyData.length - 1 ? "#FF6B00" : "#E5E5E5",
                }}
              />
              <span className="text-[9px] text-[#888888]">{w.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 選択期間の合計 */}
      <div className="card mb-4">
        <p className="text-xs text-[#888888] mb-2">
          {period === "month" ? "今月" : period === "prev" ? "前月" : "全期間"}の合計
        </p>
        <p className="text-[#888888] text-sm">
          <span className="metric-value text-[#FF6B00] text-3xl">{Math.round(filteredTotal * 10) / 10}</span>
          {" "}km・{filteredRuns.length}回
        </p>
      </div>

      {/* パーソナルベスト */}
      <div className="card mb-4">
        <p className="text-xs text-[#888888] font-medium mb-3 flex items-center gap-1.5">
          <Trophy size={14} color="#FF6B00" /> パーソナルベスト
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-[#888888]">最速ペース</p>
            <p className="metric-value text-xl text-[#111111]">
              {bestPaceSecPerKm ? formatPace(bestPaceSecPerKm) : "--'--\""}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-[#888888]">最長距離</p>
            <p className="metric-value text-xl text-[#111111]">
              {longestRunKm > 0 ? `${Math.round(longestRunKm * 100) / 100}km` : "--"}
            </p>
          </div>
        </div>
      </div>

      {/* 累計データ */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="card flex items-center gap-2">
          <Clock size={18} color="#888888" />
          <div>
            <p className="text-[10px] text-[#888888]">総走行時間</p>
            <p className="text-sm font-bold">{formatHoursMin(totalDurationSec)}</p>
          </div>
        </div>
        <div className="card flex items-center gap-2">
          <Flame size={18} color="#888888" />
          <div>
            <p className="text-[10px] text-[#888888]">消費カロリー</p>
            <p className="text-sm font-bold">{totalCalories.toLocaleString()}kcal</p>
          </div>
        </div>
      </div>

      {/* 履歴 */}
      <div>
        <p className="text-xs text-[#888888] font-medium mb-2 flex items-center gap-1.5">
          <TrendingUp size={14} /> 履歴
        </p>
        {filteredRuns.length === 0 ? (
          <div className="card text-center py-6">
            <p className="text-[#888888] text-sm">記録がありません</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredRuns.slice(0, 20).map((run) => {
              const d = new Date(run.started_at);
              const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
              return (
                <div key={run.id} className="card flex items-center justify-between py-3">
                  <span className="text-sm text-[#888888] w-12">{dateStr}</span>
                  <span className="metric-value text-[#FF6B00] text-lg">
                    {Math.round(run.distance_km * 100) / 100}
                    <span className="text-xs font-normal text-[#888888] ml-0.5">km</span>
                  </span>
                  <span className="text-sm text-[#888888]">{formatDuration(run.duration_seconds)}</span>
                  <span className="text-xs text-[#888888]">
                    {run.pace_seconds_per_km ? formatPace(run.pace_seconds_per_km) : "--"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
