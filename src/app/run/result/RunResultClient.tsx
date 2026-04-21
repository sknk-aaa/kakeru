"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatPace, formatDuration } from "@/lib/haversine";
import { CheckCircle, TrendingUp, Home } from "lucide-react";
import AppShell from "@/components/AppShell";

export default function RunResultClient() {
  const params = useSearchParams();
  const router = useRouter();
  const [personalBest, setPersonalBest] = useState<{ pace: number; distance: number } | null>(null);
  const [isNewPB, setIsNewPB] = useState(false);

  const distanceKm = parseFloat(params.get("distanceKm") ?? "0");
  const durationSec = parseInt(params.get("durationSec") ?? "0");
  const pace = parseInt(params.get("pace") ?? "0");
  const calories = parseInt(params.get("calories") ?? "0");
  const goalReached = params.get("goalReached") === "true";
  const runId = params.get("runId");

  useEffect(() => {
    if (!runId) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("runs")
        .select("pace_seconds_per_km, distance_km")
        .eq("user_id", user.id)
        .not("id", "eq", runId)
        .order("pace_seconds_per_km", { ascending: true })
        .limit(1)
        .then(({ data }) => {
          const prevBestPace = data?.[0]?.pace_seconds_per_km ?? Infinity;
          const prevBestDist = data?.[0]?.distance_km ?? 0;
          if (pace > 0 && pace < prevBestPace) {
            setIsNewPB(true);
          }
          setPersonalBest({ pace: prevBestPace, distance: prevBestDist });
        });
    });
  }, [runId, pace]);

  return (
    <AppShell>
      <div className="flex flex-col min-h-[calc(100vh-64px)] px-4 pt-12 pb-4">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          {goalReached ? (
            <>
              <CheckCircle size={56} color="#22C55E" className="mx-auto mb-3" />
              <h1 className="text-2xl font-bold text-[#111111]">目標達成！</h1>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-full bg-[#F0F0F0] flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🏃</span>
              </div>
              <h1 className="text-2xl font-bold text-[#111111]">お疲れ様でした</h1>
            </>
          )}
        </div>

        {/* 自己ベスト更新 */}
        {isNewPB && (
          <div className="bg-[#FFF0E5] border border-[#FFDCC4] rounded-xl p-4 flex items-center gap-3 mb-4">
            <TrendingUp size={22} color="#FF6B00" />
            <div>
              <p className="text-sm font-bold text-[#FF6B00]">🎉 自己ベスト更新！</p>
              <p className="text-xs text-[#888888] mt-0.5">
                最速ペース {formatPace(pace)}/km
                {personalBest && personalBest.pace !== Infinity && (
                  <span>（前回 {formatPace(personalBest.pace)}/km）</span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* 結果カード */}
        <div className="card mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center py-2">
              <p className="metric-value text-[#FF6B00] text-4xl">{distanceKm.toFixed(2)}</p>
              <p className="text-xs text-[#888888] mt-1">km</p>
            </div>
            <div className="text-center py-2">
              <p className="metric-value text-[#111111] text-4xl">{formatDuration(durationSec)}</p>
              <p className="text-xs text-[#888888] mt-1">タイム</p>
            </div>
            <div className="text-center py-2">
              <p className="metric-value text-[#111111] text-2xl">{formatPace(pace)}</p>
              <p className="text-xs text-[#888888] mt-1">平均ペース</p>
            </div>
            <div className="text-center py-2">
              <p className="metric-value text-[#111111] text-2xl">{calories}</p>
              <p className="text-xs text-[#888888] mt-1">kcal</p>
            </div>
          </div>
        </div>

        <div className="flex-1" />

        <button
          className="btn-primary w-full gap-2"
          onClick={() => router.push("/")}
        >
          <Home size={18} />
          ダッシュボードへ
        </button>
      </div>
    </AppShell>
  );
}
