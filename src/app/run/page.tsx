"use client";

export const dynamic = "force-dynamic";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamicImport from "next/dynamic";
import { Pause, Play, Flag, Navigation } from "lucide-react";
import GpsPermissionModal from "@/components/GpsPermissionModal";
import { haversineDistance, speedKmh, calcCalories, formatDuration, type GpsPoint } from "@/lib/haversine";
import AppShell from "@/components/AppShell";
import { createClient } from "@/lib/supabase/client";

const RunMap = dynamicImport(() => import("@/components/RunMap"), { ssr: false });

export default function RunPage() {
  return (
    <Suspense fallback={<div style={{ height: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}><p>Loading...</p></div>}>
      <RunPageInner />
    </Suspense>
  );
}

function RunPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlInstanceId = searchParams.get("goalInstanceId");

  const [phase, setPhase] = useState<"idle" | "gpsPrompt" | "running" | "paused">("idle");
  const [gpsPoints, setGpsPoints] = useState<GpsPoint[]>([]);
  const [distanceKm, setDistanceKm] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [calories, setCalories] = useState(0);
  const [goalInstance, setGoalInstance] = useState<{
    distance_km: number | null;
    duration_minutes: number | null;
  } | null>(null);
  const [effectiveInstanceId, setEffectiveInstanceId] = useState<string | null>(urlInstanceId);
  const [weightKg, setWeightKg] = useState(60);
  const [goalReached, setGoalReached] = useState(false);
  const [startedAt, setStartedAt] = useState<Date | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPausedRef = useRef(false);

  useEffect(() => {
    const supabase = createClient();
    const d = new Date();
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;

      supabase.from("users").select("weight_kg").eq("id", user.id).single().then(({ data }) => {
        if (data?.weight_kg) setWeightKg(data.weight_kg);
      });

      if (urlInstanceId) {
        supabase
          .from("goal_instances")
          .select("goals(distance_km, duration_minutes)")
          .eq("id", urlInstanceId)
          .single()
          .then(({ data }) => {
            if (data?.goals) setGoalInstance(data.goals as unknown as { distance_km: number | null; duration_minutes: number | null });
          });
      } else {
        // BottomNav経由の直接遷移：今日のpendingインスタンスを自動取得
        supabase
          .from("goal_instances")
          .select("id, goals(distance_km, duration_minutes)")
          .eq("scheduled_date", todayStr)
          .eq("status", "pending")
          .limit(1)
          .single()
          .then(({ data }) => {
            if (data) {
              setEffectiveInstanceId(data.id);
              if (data.goals) setGoalInstance(data.goals as unknown as { distance_km: number | null; duration_minutes: number | null });
            }
          });
      }
    });
  }, [urlInstanceId]);

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
        if (pos.coords.accuracy > 30) return;
        const newPoint: GpsPoint = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timestamp: Date.now(),
          accuracy: pos.coords.accuracy,
        };
        setGpsPoints((prev) => {
          const last = prev[prev.length - 1];
          if (last) {
            const speed = speedKmh(last, newPoint);
            if (speed > 30) return prev;
          }
          const newPoints = [...prev, newPoint];
          const dist = newPoints.slice(1).reduce((acc, p, i) => acc + haversineDistance(newPoints[i], p), 0);
          setDistanceKm(dist);
          setCalories(calcCalories(dist, weightKg));
          return newPoints;
        });
      },
      (err) => console.error("GPS error:", err),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
  }, [weightKg]);

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
      goal_instance_id: effectiveInstanceId || null,
      user_id: user.id,
      distance_km: Math.round(distanceKm * 100) / 100,
      duration_seconds: elapsedSec,
      pace_seconds_per_km: Math.round(avgPace),
      calories,
      gps_path: gpsPoints,
      started_at: startedAt?.toISOString() ?? finishedAt.toISOString(),
      finished_at: finishedAt.toISOString(),
    }).select().single();

    if (effectiveInstanceId && goalReached) {
      await supabase.from("goal_instances").update({ status: "achieved" }).eq("id", effectiveInstanceId);
    }

    router.push(
      `/run/result?runId=${run?.id ?? ""}&distanceKm=${distanceKm.toFixed(2)}&durationSec=${elapsedSec}&pace=${Math.round(avgPace)}&calories=${calories}&goalReached=${goalReached}`
    );
  }

  // プログレス計算
  const distPct = goalInstance?.distance_km && goalInstance.distance_km > 0
    ? Math.min((distanceKm / goalInstance.distance_km) * 100, 100)
    : null;
  const timePct = goalInstance?.duration_minutes && goalInstance.duration_minutes > 0
    ? Math.min((elapsedSec / (goalInstance.duration_minutes * 60)) * 100, 100)
    : null;

  // 開始前画面
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
          <button className="btn-primary w-full max-w-xs" onClick={() => setPhase("gpsPrompt")}>
            走る
          </button>
        </div>
        {phase === "gpsPrompt" && (
          <GpsPermissionModal onAllow={startGps} onClose={() => setPhase("idle")} />
        )}
      </AppShell>
    );
  }

  // 計測中画面
  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", background: "#ffffff", overflow: "hidden" }}>

      {/* ヘッダー */}
      <div style={{ flexShrink: 0, background: "#111111", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ color: "#888888", fontSize: "12px" }}>計測中</span>
        {goalInstance && (
          <span style={{ color: "#FF6B00", fontSize: "13px", fontWeight: 700 }}>
            目標: {[
              goalInstance.distance_km && `${goalInstance.distance_km}km`,
              goalInstance.duration_minutes && `${goalInstance.duration_minutes}分`,
            ].filter(Boolean).join("・")}
          </span>
        )}
        {phase === "paused" && (
          <span style={{ color: "#FBBF24", fontSize: "12px", fontWeight: 700 }}>一時停止中</span>
        )}
      </div>

      {/* 地図 */}
      <div style={{ flex: 1, minHeight: 0, overflow: "hidden", position: "relative" }}>
        <RunMap points={gpsPoints} />
        {phase === "paused" && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontWeight: 700, fontSize: "16px", background: "rgba(0,0,0,0.6)", padding: "8px 20px", borderRadius: "999px" }}>一時停止中</span>
          </div>
        )}
      </div>

      {/* 統計 + ボタン */}
      <div style={{ flexShrink: 0, background: "#ffffff", borderTop: "1px solid #E5E5E5" }}>

        {/* 目標プログレス */}
        {(distPct !== null || timePct !== null) && (
          <div style={{ padding: "10px 16px 0", display: "flex", flexDirection: "column", gap: "6px" }}>
            {distPct !== null && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#888888", marginBottom: "3px" }}>
                  <span style={{ color: "#FF6B00", fontWeight: 600 }}>{distanceKm.toFixed(2)}km</span>
                  <span>目標 {goalInstance?.distance_km}km（{Math.round(distPct)}%）</span>
                </div>
                <div style={{ height: "5px", background: "#F0F0F0", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "#FF6B00", borderRadius: "3px", width: `${distPct}%`, transition: "width 0.5s ease" }} />
                </div>
              </div>
            )}
            {timePct !== null && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#888888", marginBottom: "3px" }}>
                  <span style={{ color: "#FF6B00", fontWeight: 600 }}>{formatDuration(elapsedSec)}</span>
                  <span>目標 {goalInstance?.duration_minutes}分（{Math.round(timePct)}%）</span>
                </div>
                <div style={{ height: "5px", background: "#F0F0F0", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "#FF6B00", borderRadius: "3px", width: `${timePct}%`, transition: "width 0.5s ease" }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 統計数値 */}
        <div style={{ padding: "8px 16px 6px" }}>
          <div style={{ textAlign: "center", marginBottom: "6px" }}>
            <p className="metric-value" style={{ fontSize: "52px", color: "#111111", lineHeight: 1 }}>{formatDuration(elapsedSec)}</p>
            <p style={{ fontSize: "11px", color: "#888888", marginTop: "3px" }}>経過時間</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
            <div style={{ textAlign: "center" }}>
              <p className="metric-value" style={{ fontSize: "32px", color: "#FF6B00", lineHeight: 1 }}>{distanceKm.toFixed(2)}</p>
              <p style={{ fontSize: "11px", color: "#888888", marginTop: "3px" }}>km</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p className="metric-value" style={{ fontSize: "32px", color: "#111111", lineHeight: 1 }}>{calories}</p>
              <p style={{ fontSize: "11px", color: "#888888", marginTop: "3px" }}>kcal</p>
            </div>
          </div>
        </div>

        {/* ボタン */}
        <div style={{ padding: `0 12px calc(env(safe-area-inset-bottom) + 8px)` }}>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              className="btn-secondary"
              style={{ flex: 1, minHeight: "52px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              onClick={handlePauseResume}
            >
              {phase === "paused" ? <><Play size={16} />再開</> : <><Pause size={16} />一時停止</>}
            </button>
            {goalInstance ? (
              <button
                className="btn-primary"
                style={{ flex: 1, minHeight: "52px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", opacity: goalReached ? 1 : 0.35 }}
                onClick={handleFinish}
                disabled={!goalReached}
              >
                <Flag size={16} />{goalReached ? "ゴール！" : "ゴール"}
              </button>
            ) : (
              <button
                className="btn-primary"
                style={{ flex: 1, minHeight: "52px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                onClick={handleFinish}
              >
                <Flag size={16} />終了
              </button>
            )}
          </div>
          {!goalReached && goalInstance && (
            <p style={{ fontSize: "11px", color: "#888888", textAlign: "center", marginTop: "4px" }}>目標達成後にゴールできます</p>
          )}
        </div>

      </div>
    </div>
  );
}
