"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Pause, Play, Flag, Navigation } from "lucide-react";
import GpsPermissionModal from "@/components/GpsPermissionModal";
import { haversineDistance, speedKmh, calcCalories, formatPace, formatDuration, type GpsPoint } from "@/lib/haversine";
import AppShell from "@/components/AppShell";
import { createClient } from "@/lib/supabase/client";

const RunMap = dynamic(() => import("@/components/RunMap"), { ssr: false });

export default function RunPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>}>
      <RunPageInner />
    </Suspense>
  );
}

function RunPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const goalInstanceId = searchParams.get("goalInstanceId");

  const [phase, setPhase] = useState<"idle" | "gpsPrompt" | "running" | "paused">("idle");
  const [gpsPoints, setGpsPoints] = useState<GpsPoint[]>([]);
  const [distanceKm, setDistanceKm] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [currentPace, setCurrentPace] = useState(0);
  const [calories, setCalories] = useState(0);
  const [goalInstance, setGoalInstance] = useState<{
    distance_km: number | null;
    duration_minutes: number | null;
  } | null>(null);
  const [weightKg, setWeightKg] = useState(60);
  const [goalReached, setGoalReached] = useState(false);
  const [startedAt, setStartedAt] = useState<Date | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPausedRef = useRef(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("users").select("weight_kg").eq("id", user.id).single().then(({ data }) => {
        if (data?.weight_kg) setWeightKg(data.weight_kg);
      });
      if (goalInstanceId) {
        supabase
          .from("goal_instances")
          .select("goals(distance_km, duration_minutes)")
          .eq("id", goalInstanceId)
          .single()
          .then(({ data }) => {
            if (data?.goals) setGoalInstance(data.goals as unknown as { distance_km: number | null; duration_minutes: number | null });
          });
      }
    });
  }, [goalInstanceId]);

  const startGps = useCallback(() => {
    setPhase("running");
    setStartedAt(new Date());

    timerRef.current = setInterval(() => {
      if (!isPausedRef.current) {
        setElapsedSec((s) => s + 1);
      }
    }, 1000);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        if (isPausedRef.current) return;
        const newPoint: GpsPoint = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timestamp: Date.now(),
        };
        setGpsPoints((prev) => {
          const last = prev[prev.length - 1];
          if (last) {
            const speed = speedKmh(last, newPoint);
            if (speed > 30) return prev; // 車での不正防止
          }
          const newPoints = [...prev, newPoint];
          const dist = newPoints.slice(1).reduce((acc, p, i) => {
            return acc + haversineDistance(newPoints[i], p);
          }, 0);
          setDistanceKm(dist);

          // ペース計算（直近1kmの平均）
          if (last) {
            const segDist = haversineDistance(last, newPoint);
            const segSec = (newPoint.timestamp - last.timestamp) / 1000;
            if (segDist > 0 && segSec > 0) {
              const pace = segSec / segDist;
              setCurrentPace(Math.min(pace, 1800)); // 上限30分/km
            }
          }

          const cal = calcCalories(dist, weightKg);
          setCalories(cal);
          return newPoints;
        });
      },
      (err) => console.error("GPS error:", err),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  }, [weightKg]);

  // ゴール判定
  useEffect(() => {
    if (!goalInstance || goalReached || phase !== "running") return;
    const distOk = !goalInstance.distance_km || distanceKm >= goalInstance.distance_km;
    const timeOk = !goalInstance.duration_minutes || elapsedSec >= goalInstance.duration_minutes * 60;
    if (distOk && timeOk) setGoalReached(true);
  }, [distanceKm, elapsedSec, goalInstance, goalReached, phase]);

  function handlePauseResume() {
    isPausedRef.current = !isPausedRef.current;
    setPhase(isPausedRef.current ? "paused" : "running");
  }

  async function handleFinish() {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const finishedAt = new Date();
    const avgPace = distanceKm > 0 ? elapsedSec / distanceKm : 0;

    const { data: run } = await supabase.from("runs").insert({
      goal_instance_id: goalInstanceId || null,
      user_id: user.id,
      distance_km: Math.round(distanceKm * 100) / 100,
      duration_seconds: elapsedSec,
      pace_seconds_per_km: Math.round(avgPace),
      calories,
      gps_path: gpsPoints,
      started_at: startedAt?.toISOString() ?? finishedAt.toISOString(),
      finished_at: finishedAt.toISOString(),
    }).select().single();

    if (goalInstanceId && goalReached) {
      await supabase
        .from("goal_instances")
        .update({ status: "achieved" })
        .eq("id", goalInstanceId);
    }

    router.push(
      `/run/result?runId=${run?.id ?? ""}&distanceKm=${distanceKm.toFixed(2)}&durationSec=${elapsedSec}&pace=${Math.round(avgPace)}&calories=${calories}&goalReached=${goalReached}`
    );
  }

  const goalDistancePct =
    goalInstance?.distance_km && distanceKm > 0
      ? Math.min((distanceKm / goalInstance.distance_km) * 100, 100)
      : null;

  if (phase === "idle" || phase === "gpsPrompt") {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-[#FFF0E5] flex items-center justify-center mb-6">
            <Navigation size={36} color="#FF6B00" />
          </div>
          <h1 className="text-2xl font-bold mb-2">ランニングを開始</h1>
          {goalInstance && (
            <div className="card mb-6 text-left w-full max-w-xs">
              <p className="text-xs text-[#888888] mb-1">今日の目標</p>
              <p className="font-semibold">
                {[
                  goalInstance.distance_km && `${goalInstance.distance_km}km`,
                  goalInstance.duration_minutes && `${goalInstance.duration_minutes}分`,
                ].filter(Boolean).join("・")}
              </p>
            </div>
          )}
          <button
            className="btn-primary w-full max-w-xs"
            onClick={() => setPhase("gpsPrompt")}
          >
            走る
          </button>
        </div>
        {phase === "gpsPrompt" && (
          <GpsPermissionModal
            onAllow={startGps}
            onClose={() => setPhase("idle")}
          />
        )}
      </AppShell>
    );
  }

  // 計測中はfixed全画面レイアウト（BottomNavはz-50で上に重なる）
  return (
    <div
      className="fixed inset-0 z-10 flex flex-col bg-white"
      style={{ paddingBottom: "calc(56px + env(safe-area-inset-bottom))" }}
    >
      {/* 地図：残り全スペースを埋める */}
      <div className="flex-1 min-h-0 relative">
        <RunMap points={gpsPoints} />
        {phase === "paused" && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="text-white font-bold text-lg bg-black/60 px-4 py-2 rounded-full">一時停止中</span>
          </div>
        )}
      </div>

      {/* メトリクスパネル：固定高さ */}
      <div className="shrink-0 bg-white border-t border-[#E5E5E5] px-4 pt-3 pb-2">
        {/* プログレスバー（目標距離あり） */}
        {goalDistancePct !== null && (
          <div className="mb-2">
            <div className="flex justify-between text-xs text-[#888888] mb-1">
              <span>{distanceKm.toFixed(2)}km</span>
              <span>{goalInstance?.distance_km}km</span>
            </div>
            <div className="h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FF6B00] rounded-full transition-all"
                style={{ width: `${goalDistancePct}%` }}
              />
            </div>
          </div>
        )}

        {/* 3つの数値 */}
        <div className="grid grid-cols-3 gap-1 mb-2">
          <div className="text-center">
            <p className="metric-value text-[#FF6B00] text-3xl leading-none">{distanceKm.toFixed(2)}</p>
            <p className="text-[10px] text-[#888888] mt-0.5">km</p>
          </div>
          <div className="text-center">
            <p className="metric-value text-[#111111] text-3xl leading-none">{formatDuration(elapsedSec)}</p>
            <p className="text-[10px] text-[#888888] mt-0.5">経過時間</p>
          </div>
          <div className="text-center">
            <p className="metric-value text-[#111111] text-3xl leading-none">{formatPace(currentPace)}</p>
            <p className="text-[10px] text-[#888888] mt-0.5">ペース/km</p>
          </div>
        </div>

        <p className="text-center text-xs text-[#888888] mb-2">{calories} kcal</p>

        {/* ボタン */}
        <div className="flex gap-2">
          <button className="btn-secondary flex-1 gap-1.5" style={{ minHeight: "44px" }} onClick={handlePauseResume}>
            {phase === "paused" ? <><Play size={15} />再開</> : <><Pause size={15} />一時停止</>}
          </button>
          {goalInstance ? (
            <button
              className="btn-primary flex-1 gap-1.5"
              style={{ minHeight: "44px", opacity: goalReached ? 1 : 0.35 }}
              onClick={handleFinish}
              disabled={!goalReached}
            >
              <Flag size={15} />{goalReached ? "ゴール！" : "ゴール"}
            </button>
          ) : (
            <button className="btn-primary flex-1 gap-1.5" style={{ minHeight: "44px" }} onClick={handleFinish}>
              <Flag size={15} />終了
            </button>
          )}
        </div>
        {!goalReached && goalInstance && (
          <p className="text-[10px] text-[#888888] text-center mt-1">目標達成後にゴールできます</p>
        )}
      </div>
    </div>
  );
}
