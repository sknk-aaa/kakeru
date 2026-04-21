"use client";

import Link from "next/link";
import { CheckCircle, XCircle, Clock, ChevronRight, Plus, SkipForward } from "lucide-react";
import { useState } from "react";

interface GoalInstance {
  id: string;
  scheduled_date: string;
  status: string;
  goals: {
    distance_km: number | null;
    duration_minutes: number | null;
    penalty_amount: number;
  } | null;
}

interface UserProfile {
  skip_count_this_month: number;
  monthly_distance_goal_km: number | null;
  stripe_payment_method_id: string | null;
}

interface Props {
  userProfile: UserProfile | null;
  weekInstances: GoalInstance[];
  todayStr: string;
  totalDistanceMonth: number;
  monthGoal: number;
  progressPct: number;
  totalPenaltyMonth: number;
  achieveRate: number;
}

const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getMonth() + 1}/${d.getDate()}(${DAY_NAMES[d.getDay()]})`;
}

function formatGoal(goal: GoalInstance["goals"]) {
  if (!goal) return "";
  const parts: string[] = [];
  if (goal.distance_km) parts.push(`${goal.distance_km}km`);
  if (goal.duration_minutes) parts.push(`${goal.duration_minutes}分`);
  return parts.join("・");
}

export default function HomeClient({
  userProfile,
  weekInstances,
  todayStr,
  totalDistanceMonth,
  monthGoal,
  progressPct,
  totalPenaltyMonth,
  achieveRate,
}: Props) {
  const [skipping, setSkipping] = useState<string | null>(null);
  const skipRemaining = Math.max(0, 1 - (userProfile?.skip_count_this_month ?? 0));

  async function handleSkip(instanceId: string) {
    setSkipping(instanceId);
    await fetch("/api/goals/skip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goalInstanceId: instanceId }),
    });
    window.location.reload();
  }

  return (
    <div className="px-4 pt-12 pb-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="metric-value text-3xl text-[#111111]">カケル</h1>
          <p className="text-[#888888] text-xs mt-0.5">今週の目標</p>
        </div>
        <Link href="/goals/new">
          <button className="w-10 h-10 rounded-full bg-[#FF6B00] flex items-center justify-center">
            <Plus size={20} color="white" strokeWidth={2.5} />
          </button>
        </Link>
      </div>

      {/* 月間プログレス */}
      {monthGoal > 0 && (
        <div className="card mb-4">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-xs text-[#888888] font-medium">今月の目標距離</span>
            <span className="text-xs text-[#888888]">
              <span className="metric-value text-[#111111] text-lg">{totalDistanceMonth}</span>
              /{monthGoal}km
            </span>
          </div>
          <div className="h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FF6B00] rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-right text-xs text-[#888888] mt-1">{progressPct}%</p>
        </div>
      )}

      {/* 今週の目標リスト */}
      <div className="mb-4">
        {weekInstances.length === 0 ? (
          <div className="card flex flex-col items-center py-8 gap-3">
            <p className="text-[#888888] text-sm">今週の目標がありません</p>
            <Link href="/goals/new">
              <button className="btn-primary px-6 text-sm" style={{ minHeight: "44px" }}>
                目標を追加する
              </button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {weekInstances.map((instance) => {
              const isToday = instance.scheduled_date === todayStr;
              const isPast = instance.scheduled_date < todayStr;
              const isFuture = instance.scheduled_date > todayStr;

              return (
                <div
                  key={instance.id}
                  className="card flex items-center gap-3"
                  style={{
                    opacity: isFuture ? 0.6 : 1,
                    borderColor: instance.status === "achieved"
                      ? "#22C55E"
                      : instance.status === "failed"
                      ? "#EF4444"
                      : "#E5E5E5",
                  }}
                >
                  <div className="shrink-0">
                    {instance.status === "achieved" && (
                      <CheckCircle size={22} color="#22C55E" />
                    )}
                    {instance.status === "failed" && (
                      <XCircle size={22} color="#EF4444" />
                    )}
                    {instance.status === "skipped" && (
                      <SkipForward size={22} color="#888888" />
                    )}
                    {(instance.status === "pending" || instance.status === "cancelled") && (
                      <Clock
                        size={22}
                        color={isToday ? "#FF6B00" : "#CCCCCC"}
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold"
                      style={{ color: isToday ? "#FF6B00" : "#111111" }}
                    >
                      {formatDate(instance.scheduled_date)}
                      {isToday && (
                        <span className="ml-2 text-xs bg-[#FF6B00] text-white px-1.5 py-0.5 rounded-full">
                          今日
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-[#888888] mt-0.5">
                      {formatGoal(instance.goals)}
                      {instance.goals && (
                        <span className="ml-2">罰金¥{instance.goals.penalty_amount.toLocaleString()}</span>
                      )}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {instance.status === "pending" && isToday && (
                      <>
                        <Link href="/run">
                          <button className="btn-primary text-xs px-3" style={{ minHeight: "36px" }}>
                            走る
                          </button>
                        </Link>
                        {skipRemaining > 0 && (
                          <button
                            className="btn-secondary text-xs px-3"
                            style={{ minHeight: "36px" }}
                            onClick={() => handleSkip(instance.id)}
                            disabled={skipping === instance.id}
                          >
                            スキップ
                          </button>
                        )}
                      </>
                    )}
                    {instance.status === "skipped" && (
                      <span className="text-xs text-[#888888]">スキップ済</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* スキップ残り */}
      <p className="text-xs text-[#888888] text-center mb-4">
        今月スキップ残り: <span className="font-bold text-[#111111]">{skipRemaining}回</span>
      </p>

      {/* 統計カード3つ */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="card text-center py-4">
          <p className="metric-value text-[#FF6B00] text-2xl">{totalDistanceMonth}</p>
          <p className="text-[10px] text-[#888888] mt-1">km 今月</p>
        </div>
        <div className="card text-center py-4">
          <p className="metric-value text-[#111111] text-2xl">{achieveRate}</p>
          <p className="text-[10px] text-[#888888] mt-1">% 達成率</p>
        </div>
        <div className="card text-center py-4">
          <p className="metric-value text-[#EF4444] text-2xl">
            {totalPenaltyMonth >= 1000
              ? `${(totalPenaltyMonth / 1000).toFixed(1)}k`
              : totalPenaltyMonth}
          </p>
          <p className="text-[10px] text-[#888888] mt-1">円 罰金</p>
        </div>
      </div>

      {/* 目標追加リンク */}
      <Link href="/goals/new">
        <div className="card flex items-center justify-between py-3">
          <span className="text-sm font-medium text-[#111111]">新しい目標を追加</span>
          <ChevronRight size={18} color="#888888" />
        </div>
      </Link>
    </div>
  );
}
