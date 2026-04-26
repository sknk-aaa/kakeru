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

  const [phase, setPhase] = useState<"idle" | "goalSelect" | "gpsPrompt" | "running" | "paused">("idle");
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
  const [todayGoals, setTodayGoals] = useState<{ id: string; goals: { distance_km: number | null; duration_minutes: number | null; penalty_amount: number } | null }[]>([]);

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
        // BottomNav経由の直接遷移：今日のpendingインスタンスを全件取得
        supabase
          .from("goal_instances")
          .select("id, goals(distance_km, duration_minutes, penalty_amount)")
          .eq("scheduled_date", todayStr)
          .eq("status", "pending")
          .then(({ data }) => {
            const goals = (data ?? []).map((d) => ({
              id: d.id as string,
              goals: d.goals as unknown as { distance_km: number | null; duration_minutes: number | null; penalty_amount: number } | null,
            }));
            setTodayGoals(goals);
            if (goals.length === 1) {
              setEffectiveInstanceId(goals[0].id);
              if (goals[0].goals) setGoalInstance(goals[0].goals);
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

    // 今日の累積ランを取得して目標達成を判定（複数回に分けて走る対応）
    let cumulativeGoalReached = false;
    if (effectiveInstanceId && goalInstance) {
      const d = new Date();
      const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const { data: todayRuns } = await supabase
        .from("runs")
        .select("distance_km, duration_seconds")
        .eq("user_id", user.id)
        .gte("started_at", `${todayStr}T00:00:00`);
      const totalDist = (todayRuns ?? []).reduce((sum, r) => sum + (r.distance_km ?? 0), 0);
      const totalSec = (todayRuns ?? []).reduce((sum, r) => sum + (r.duration_seconds ?? 0), 0);
      const distOk = !goalInstance.distance_km || totalDist >= goalInstance.distance_km;
      const timeOk = !goalInstance.duration_minutes || totalSec >= goalInstance.duration_minutes * 60;
      cumulativeGoalReached = distOk && timeOk;
      if (cumulativeGoalReached) {
        await supabase.from("goal_instances").update({ status: "achieved" }).eq("id", effectiveInstanceId);
      }
    }

    const { count: runCount } = await supabase
      .from("runs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    const installPrompt = runCount === 1 || runCount === 3 ? runCount : 0;

    router.push(
      `/run/result?runId=${run?.id ?? ""}&distanceKm=${distanceKm.toFixed(2)}&durationSec=${elapsedSec}&pace=${Math.round(avgPace)}&calories=${calories}&goalReached=${cumulativeGoalReached}${installPrompt ? `&installPrompt=${installPrompt}` : ""}`
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
  if (phase === "idle" || phase === "gpsPrompt" || phase === "goalSelect") {
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
            onClick={() => {
              if (!urlInstanceId && todayGoals.length >= 2) {
                setPhase("goalSelect");
              } else {
                setPhase("gpsPrompt");
              }
            }}
          >
            走る
          </button>
        </div>
        {phase === "gpsPrompt" && (
          <GpsPermissionModal onAllow={startGps} onClose={() => setPhase("idle")} />
        )}
        {phase === "goalSelect" && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 60, display: "flex", alignItems: "flex-end" }}>
            <div style={{ background: "white", borderRadius: "20px 20px 0 0", padding: "24px 20px calc(env(safe-area-inset-bottom) + 24px)", width: "100%" }}>
              <p style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "6px" }}>どの目標で走りますか？</p>
              <p style={{ fontSize: "13px", color: "#888888", marginBottom: "20px" }}>今日の目標が複数あります</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {todayGoals.map((g) => {
                  const distLabel = g.goals?.distance_km ? `${g.goals.distance_km}km` : null;
                  const timeLabel = g.goals?.duration_minutes ? `${g.goals.duration_minutes}分` : null;
                  const mainLabel = [distLabel, timeLabel].filter(Boolean).join("・") || "フリーラン";
                  return (
                    <button
                      key={g.id}
                      style={{ width: "100%", padding: "14px 16px", borderRadius: "14px", background: "#FFF5EE", border: "2px solid #FF6B00", cursor: "pointer", textAlign: "left" }}
                      onClick={() => {
                        setEffectiveInstanceId(g.id);
                        if (g.goals) setGoalInstance(g.goals);
                        setPhase("gpsPrompt");
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "17px", fontWeight: 700, color: "#FF6B00" }}>🏃 {mainLabel}</span>
                        {g.goals?.penalty_amount && (
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "#EF4444", background: "#FEE2E2", padding: "3px 9px", borderRadius: "99px" }}>
                            罰金 ¥{g.goals.penalty_amount.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
                <button
                  style={{ width: "100%", padding: "16px", borderRadius: "14px", background: "#F2F2F7", border: "none", fontSize: "15px", fontWeight: 600, color: "#888888", cursor: "pointer" }}
                  onClick={() => {
                    setEffectiveInstanceId(null);
                    setGoalInstance(null);
                    setPhase("gpsPrompt");
                  }}
                >
                  フリーランで走る
                </button>
              </div>
            </div>
          </div>
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
            <button
              className="btn-primary"
              style={{ flex: 1, minHeight: "52px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              onClick={handleFinish}
            >
              <Flag size={16} />{goalReached ? "ゴール！" : "終了"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
