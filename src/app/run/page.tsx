"use client";

export const dynamic = "force-dynamic";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamicImport from "next/dynamic";
import Image from "next/image";
import { Pause, Play, Flag, Navigation } from "lucide-react";
import GpsPermissionModal from "@/components/GpsPermissionModal";
import { haversineDistance, speedKmh, calcCalories, formatDuration, type GpsPoint } from "@/lib/haversine";
import AppShell from "@/components/AppShell";
import { createBrowserSupabaseClient } from "@/lib/supabase/client-lazy";

const RunMap = dynamicImport(() => import("@/components/RunMap"), { ssr: false });

type GpsStatus = "idle" | "locating" | "improving" | "ready" | "timeout" | "denied" | "error";

const RECORDING_ACCURACY_THRESHOLD_M = 30;

function toGpsPoint(pos: GeolocationPosition): GpsPoint {
  return {
    lat: pos.coords.latitude,
    lng: pos.coords.longitude,
    timestamp: pos.timestamp || Date.now(),
    accuracy: pos.coords.accuracy,
  };
}

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
    penalty_amount?: number;
  } | null>(null);
  const [effectiveInstanceId, setEffectiveInstanceId] = useState<string | null>(urlInstanceId);
  const [weightKg, setWeightKg] = useState(60);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [todayGoals, setTodayGoals] = useState<{ id: string; goals: { distance_km: number | null; duration_minutes: number | null; penalty_amount: number } | null }[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isLoadingGoal, setIsLoadingGoal] = useState(true);
  const [currentPosition, setCurrentPosition] = useState<GpsPoint | null>(null);
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>("idle");
  const [lastAccuracy, setLastAccuracy] = useState<number | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const warmupWatchIdRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPausedRef = useRef(false);
  const wakeLockRef = useRef<{ release: () => Promise<void> } | null>(null);
  // 採用・不採用問わず最後の有効 GPS 点を保持する（速度・ジャンプ判定の基準点）
  const lastGpsUpdateRef = useRef<GpsPoint | null>(null);

  async function acquireWakeLock() {
    const nav = navigator as unknown as { wakeLock?: { request: (type: string) => Promise<{ release: () => Promise<void> }> } };
    if (!nav.wakeLock) return;
    try {
      wakeLockRef.current = await nav.wakeLock.request("screen");
    } catch {
      // 非対応ブラウザや権限拒否は無視
    }
  }

  function releaseWakeLock() {
    wakeLockRef.current?.release();
    wakeLockRef.current = null;
  }

  const handleGpsError = useCallback((err: GeolocationPositionError) => {
    console.error("GPS error:", err);
    if (err.code === err.PERMISSION_DENIED) {
      setGpsStatus("denied");
      return;
    }
    if (err.code === err.TIMEOUT) {
      setGpsStatus((status) => status === "ready" ? status : "timeout");
      return;
    }
    setGpsStatus((status) => status === "ready" ? status : "error");
  }, []);

  useEffect(() => {
    let cancelled = false;
    const d = new Date();
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    async function loadRunContext() {
      const supabase = await createBrowserSupabaseClient();
      if (cancelled) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      supabase.from("users").select("weight_kg").eq("id", user.id).single().then(({ data }) => {
        if (!cancelled && data?.weight_kg) setWeightKg(data.weight_kg);
      });

      if (urlInstanceId) {
        supabase
          .from("goal_instances")
          .select("goals(distance_km, duration_minutes, penalty_amount)")
          .eq("id", urlInstanceId)
          .single()
          .then(({ data }) => {
            if (cancelled) return;
            if (data?.goals) setGoalInstance(data.goals as unknown as { distance_km: number | null; duration_minutes: number | null; penalty_amount: number });
            setIsLoadingGoal(false);
          });
      } else {
        supabase
          .from("goal_instances")
          .select("id, goals(distance_km, duration_minutes, penalty_amount)")
          .eq("scheduled_date", todayStr)
          .eq("status", "pending")
          .then(({ data }) => {
            if (cancelled) return;
            const goals = (data ?? []).map((d) => ({
              id: d.id as string,
              goals: d.goals as unknown as { distance_km: number | null; duration_minutes: number | null; penalty_amount: number } | null,
            }));
            setTodayGoals(goals);
            if (goals.length === 1) {
              setEffectiveInstanceId(goals[0].id);
              if (goals[0].goals) setGoalInstance(goals[0].goals);
            }
            setIsLoadingGoal(false);
          });
      }
    }

    loadRunContext();
    return () => { cancelled = true; };
  }, [urlInstanceId]);

  const startGps = useCallback(() => {
    if (!navigator.geolocation) {
      setPhase("running");
      setGpsStatus("error");
      return;
    }

    // ウォームアップを停止してから記録用 watch を開始
    if (warmupWatchIdRef.current !== null) {
      navigator.geolocation.clearWatch(warmupWatchIdRef.current);
      warmupWatchIdRef.current = null;
    }

    setPhase("running");
    setGpsStatus("locating");
    setLastAccuracy(null);
    setSaveError(null);
    setStartedAt(new Date());
    lastGpsUpdateRef.current = null;
    acquireWakeLock();

    timerRef.current = setInterval(() => {
      if (!isPausedRef.current) {
        setElapsedSec((s) => s + 1);
      }
    }, 1000);

    const handlePosition = (pos: GeolocationPosition, source: "initial" | "watch") => {
      const newPoint = toGpsPoint(pos);
      const accuracy = Number.isFinite(pos.coords.accuracy) ? pos.coords.accuracy : null;
      const isAccurate = accuracy !== null && accuracy <= RECORDING_ACCURACY_THRESHOLD_M;

      // 精度が十分な点はポーズ中・initial でも基準点として更新しておく
      // → 再開時や速度フィルター後に古い基準点で誤判定されるのを防ぐ
      const prevRef = lastGpsUpdateRef.current;
      if (isAccurate) lastGpsUpdateRef.current = newPoint;

      if (isPausedRef.current) return;

      setCurrentPosition(newPoint);
      setLastAccuracy(accuracy === null ? null : Math.round(accuracy));

      if (!isAccurate) {
        setGpsStatus((status) => source === "initial" && status === "ready" ? status : "improving");
        return;
      }

      setGpsStatus("ready");
      if (source === "initial") return;

      setGpsPoints((prev) => {
        // 採用・不採用問わず直前の GPS 更新点と比較することで、
        // 速度スパイク後やポーズ後に正常な速度で走り出しても弾かれなくなる
        if (prevRef) {
          const speed = speedKmh(prevRef, newPoint);
          if (speed > 30) return prev;
          const jumpKm = haversineDistance(prevRef, newPoint);
          if (jumpKm > 0.2) return prev;
        }
        const newPoints = [...prev, newPoint];
        const dist = newPoints.slice(1).reduce((acc, p, i) => acc + haversineDistance(newPoints[i], p), 0);
        setDistanceKm(dist);
        setCalories(calcCalories(dist, weightKg));
        return newPoints;
      });
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => handlePosition(pos, "initial"),
      handleGpsError,
      { enableHighAccuracy: false, maximumAge: 15000, timeout: 5000 }
    );

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => handlePosition(pos, "watch"),
      handleGpsError,
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    );
  }, [handleGpsError, weightKg]);

  // GPS ウォームアップ：権限が既に granted の場合のみ、ハードウェアを事前に起動しておく
  useEffect(() => {
    if (!navigator.geolocation || !navigator.permissions) return;
    navigator.permissions.query({ name: "geolocation" as PermissionName })
      .then((result) => {
        if (result.state !== "granted") return;
        warmupWatchIdRef.current = navigator.geolocation.watchPosition(
          () => {},
          () => {},
          { enableHighAccuracy: true, maximumAge: 0, timeout: 30000 }
        );
      })
      .catch(() => {});
    return () => {
      if (warmupWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(warmupWatchIdRef.current);
        warmupWatchIdRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible" && phase === "running") {
        acquireWakeLock();
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [phase]);

  function handlePauseResume() {
    isPausedRef.current = !isPausedRef.current;
    setPhase(isPausedRef.current ? "paused" : "running");
  }

  async function handleFinish() {
    if (warmupWatchIdRef.current !== null) {
      navigator.geolocation.clearWatch(warmupWatchIdRef.current);
      warmupWatchIdRef.current = null;
    }
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    releaseWakeLock();

    const supabase = await createBrowserSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const finishedAt = new Date();
    const avgPace = distanceKm > 0 ? elapsedSec / distanceKm : 0;

    const { data: run, error: runError } = await supabase.from("runs").insert({
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

    if (runError) {
      setSaveError("ランの保存に失敗しました。もう一度お試しください。");
      setPhase("paused");
      return;
    }

    let cumulativeGoalReached = false;
    if (effectiveInstanceId && goalInstance) {
      const distOk = !goalInstance.distance_km || distanceKm >= goalInstance.distance_km;
      const timeOk = !goalInstance.duration_minutes || elapsedSec >= goalInstance.duration_minutes * 60;
      cumulativeGoalReached = distOk && timeOk;
      if (cumulativeGoalReached) {
        await supabase.from("goal_instances").update({ status: "achieved" }).eq("id", effectiveInstanceId);
        const { data: inst } = await supabase.from("goal_instances").select("goal_id").eq("id", effectiveInstanceId).single();
        if (inst?.goal_id) {
          await supabase.from("goals").update({ consecutive_failures: 0 }).eq("id", inst.goal_id);
        }
      }
    }

    const { count: runCount } = await supabase
      .from("runs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    const installPrompt = runCount === 1 || runCount === 3 ? runCount : 0;

    const goalDistParam = goalInstance?.distance_km ? `&goalDistKm=${goalInstance.distance_km}` : "";
    const goalDurParam = goalInstance?.duration_minutes ? `&goalDurMin=${goalInstance.duration_minutes}` : "";

    router.push(
      `/run/result?runId=${run?.id ?? ""}&distanceKm=${distanceKm.toFixed(2)}&durationSec=${elapsedSec}&pace=${Math.round(avgPace)}&calories=${calories}&goalReached=${cumulativeGoalReached}${goalDistParam}${goalDurParam}${installPrompt ? `&installPrompt=${installPrompt}` : ""}`
    );
  }

  const distPct = goalInstance?.distance_km && goalInstance.distance_km > 0
    ? Math.min((distanceKm / goalInstance.distance_km) * 100, 100)
    : null;
  const timePct = goalInstance?.duration_minutes && goalInstance.duration_minutes > 0
    ? Math.min((elapsedSec / (goalInstance.duration_minutes * 60)) * 100, 100)
    : null;

  const remainDistKm = goalInstance?.distance_km
    ? Math.max(0, goalInstance.distance_km - distanceKm)
    : null;
  const remainMinutes = goalInstance?.duration_minutes
    ? Math.max(0, Math.ceil((goalInstance.duration_minutes * 60 - elapsedSec) / 60))
    : null;
  const goalReached = Boolean(
    goalInstance &&
    (phase === "running" || phase === "paused") &&
    (!goalInstance.distance_km || distanceKm >= goalInstance.distance_km) &&
    (!goalInstance.duration_minutes || elapsedSec >= goalInstance.duration_minutes * 60)
  );

  const gpsStatusColor = phase === "paused"
    ? "#FBBF24"
    : gpsStatus === "ready"
    ? "#22C55E"
    : gpsStatus === "denied" || gpsStatus === "timeout" || gpsStatus === "error"
    ? "#EF4444"
    : "#F59E0B";
  const gpsStatusText = (() => {
    if (phase === "paused") return "一時停止中";
    if (gpsStatus === "locating") return "現在地を探しています";
    if (gpsStatus === "improving") return lastAccuracy ? `GPS精度を調整中（±${lastAccuracy}m）` : "GPS精度を調整中";
    if (gpsStatus === "ready") return lastAccuracy ? `GPS計測中（±${lastAccuracy}m）` : "GPS計測中";
    if (gpsStatus === "timeout") return "GPSが安定しません。屋外で空が見える場所へ";
    if (gpsStatus === "denied") return "位置情報が許可されていません";
    if (gpsStatus === "error") return "GPSを取得できません";
    return "GPS待機中";
  })();

  // ── 開始前画面 ──
  if (phase === "idle" || phase === "gpsPrompt" || phase === "goalSelect") {
    const hasGoal = goalInstance !== null;
    const hasMultipleGoals = !hasGoal && todayGoals.length >= 2;
    const isFreeRun = !isLoadingGoal && !hasGoal && todayGoals.length === 0;
    const mainVal = goalInstance?.distance_km ?? goalInstance?.duration_minutes;
    const mainUnit = goalInstance?.distance_km ? "km" : goalInstance?.duration_minutes ? "分" : null;
    const penaltyAmount = goalInstance?.penalty_amount ?? todayGoals[0]?.goals?.penalty_amount;

    return (
      <AppShell>
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          minHeight: "calc(100vh - 64px)", padding: "0 24px 32px",
          background: "linear-gradient(180deg, #FFFFFF 0%, #FFF9F5 100%)",
        }}>

          {/* コンテンツ中央エリア */}
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            textAlign: "center", width: "100%",
          }}>
            {isLoadingGoal ? (
              <>
                <Image
                  src="/stickman-assets/stickman-05.png"
                  alt="" width={120} height={140}
                  style={{ objectFit: "contain", opacity: 0.35, marginBottom: "16px" }}
                />
                <p style={{ fontSize: "13px", color: "#CCCCCC" }}>準備中...</p>
              </>
            ) : (
              <>
                {/* 棒人間 */}
                <Image
                  src={isFreeRun ? "/stickman-assets/stickman-01.png" : "/stickman-assets/stickman-05.png"}
                  alt="" width={130} height={150}
                  style={{ objectFit: "contain", marginBottom: "24px" }}
                />

                {/* 目標あり（1件） */}
                {hasGoal && mainVal && (
                  <>
                    <p style={{ fontSize: "10px", color: "#FF6B00", fontWeight: 800, letterSpacing: "0.2em", marginBottom: "14px" }}>
                      TODAY&apos;S MISSION
                    </p>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "8px", marginBottom: "12px" }}>
                      <span className="metric-value" style={{ fontSize: "80px", color: "#111111", lineHeight: 1 }}>{mainVal}</span>
                      <span style={{ fontSize: "28px", fontWeight: 700, color: "#FF6B00" }}>{mainUnit}</span>
                    </div>
                    {penaltyAmount != null && penaltyAmount > 0 && (
                      <p style={{ fontSize: "14px", color: "#EF4444", fontWeight: 700 }}>
                        サボると ¥{penaltyAmount.toLocaleString()} 課金
                      </p>
                    )}
                  </>
                )}

                {/* フリーランゴール（距離・時間なし） */}
                {hasGoal && !mainVal && (
                  <>
                    <p style={{ fontSize: "10px", color: "#FF6B00", fontWeight: 800, letterSpacing: "0.2em", marginBottom: "14px" }}>
                      TODAY&apos;S MISSION
                    </p>
                    <p style={{ fontSize: "34px", fontWeight: 800, color: "#111111", marginBottom: "12px" }}>フリーラン</p>
                    {penaltyAmount != null && penaltyAmount > 0 && (
                      <p style={{ fontSize: "14px", color: "#EF4444", fontWeight: 700 }}>
                        サボると ¥{penaltyAmount.toLocaleString()} 課金
                      </p>
                    )}
                  </>
                )}

                {/* 目標複数 */}
                {hasMultipleGoals && (
                  <>
                    <p style={{ fontSize: "11px", color: "#FF6B00", fontWeight: 800, letterSpacing: "0.14em", marginBottom: "14px" }}>
                      TODAY&apos;S MISSIONS
                    </p>
                    <p style={{ fontSize: "22px", fontWeight: 800, color: "#111111", marginBottom: "8px" }}>
                      今日は{todayGoals.length}つの目標があります
                    </p>
                    <p style={{ fontSize: "13px", color: "#888888" }}>走る前に目標を選べます</p>
                  </>
                )}

                {/* 目標なし・フリーラン */}
                {isFreeRun && (
                  <>
                    <p style={{ fontSize: "26px", fontWeight: 800, color: "#111111", marginBottom: "8px" }}>フリーラン</p>
                    <p style={{ fontSize: "14px", color: "#888888" }}>今日の記録を残そう</p>
                  </>
                )}
              </>
            )}
          </div>

          {/* 走るボタン */}
          <button
            className="btn-primary"
            style={{ width: "100%", fontSize: "17px", letterSpacing: "0.04em", opacity: isLoadingGoal ? 0.5 : 1 }}
            disabled={isLoadingGoal}
            onClick={() => {
              if (!urlInstanceId && todayGoals.length >= 2) {
                setPhase("goalSelect");
              } else {
                setPhase("gpsPrompt");
              }
            }}
          >
            {isFreeRun ? "計測スタート →" : "走る →"}
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
                        {g.goals?.penalty_amount ? (
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "#EF4444", background: "#FEE2E2", padding: "3px 9px", borderRadius: "99px" }}>
                            罰金 ¥{g.goals.penalty_amount.toLocaleString()}
                          </span>
                        ) : null}
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

  // ── 計測中画面 ──
  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", background: "#ffffff", overflow: "hidden" }}>

      {/* ヘッダー（白） */}
      <div style={{
        flexShrink: 0, background: "white",
        borderBottom: "1px solid #F0F0F0",
        padding: "10px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <div
            className={phase === "running" ? "animate-pulse" : ""}
            style={{
              width: "8px", height: "8px", borderRadius: "50%",
              background: gpsStatusColor,
            }}
          />
          <span style={{ fontSize: "12px", color: "#888888", fontWeight: 600 }}>
            {phase === "paused" ? "一時停止中" : "計測中"}
          </span>
        </div>
        {goalInstance && (
          <span style={{ fontSize: "13px", fontWeight: 700, color: goalReached ? "#22C55E" : "#FF6B00" }}>
            {goalReached
              ? "目標達成！🎉"
              : remainDistKm !== null
              ? `あと ${remainDistKm.toFixed(2)} km`
              : remainMinutes !== null
              ? `あと ${remainMinutes} 分`
              : [
                  goalInstance.distance_km && `${goalInstance.distance_km}km`,
                  goalInstance.duration_minutes && `${goalInstance.duration_minutes}分`,
                ].filter(Boolean).join("・")}
          </span>
        )}
      </div>

      {/* 地図 */}
      <div style={{ flex: 1, minHeight: 0, overflow: "hidden", position: "relative" }}>
        <RunMap points={gpsPoints} currentPosition={currentPosition} />
        {gpsStatus !== "idle" && (
          <div style={{ position: "absolute", top: "12px", left: "12px", right: "12px", zIndex: 500, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
            <div style={{
              maxWidth: "100%",
              display: "flex", alignItems: "center", gap: "6px",
              padding: "8px 12px", borderRadius: "999px",
              background: "rgba(17,17,17,0.78)", color: "white",
              fontSize: "12px", fontWeight: 700, lineHeight: 1.35,
              boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
            }}>
              <Navigation size={14} color={gpsStatusColor} />
              <span>{gpsStatusText}</span>
            </div>
          </div>
        )}
        {phase === "paused" && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.28)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontWeight: 700, fontSize: "16px", background: "rgba(0,0,0,0.55)", padding: "8px 20px", borderRadius: "999px" }}>一時停止中</span>
          </div>
        )}
      </div>

      {/* 目標達成バナー */}
      {goalReached && (
        <div style={{
          flexShrink: 0,
          background: "linear-gradient(135deg, #22C55E, #16A34A)",
          padding: "10px 16px",
          display: "flex", alignItems: "center", gap: "10px",
        }}>
          <Image src="/stickman-assets/stickman-02.png" alt="" width={36} height={36} style={{ objectFit: "contain" }} />
          <p style={{ fontSize: "14px", fontWeight: 800, color: "white" }}>目標達成！このままゴールしよう 🎉</p>
        </div>
      )}

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
                  <div style={{ height: "100%", background: distPct >= 100 ? "#22C55E" : "#FF6B00", borderRadius: "3px", width: `${distPct}%`, transition: "width 0.5s ease" }} />
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
                  <div style={{ height: "100%", background: timePct >= 100 ? "#22C55E" : "#FF6B00", borderRadius: "3px", width: `${timePct}%`, transition: "width 0.5s ease" }} />
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
          {saveError && (
            <p style={{ fontSize: "13px", color: "#EF4444", textAlign: "center", marginBottom: "8px" }}>{saveError}</p>
          )}
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              className="btn-secondary"
              style={{ flex: 1, minHeight: "52px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              onClick={handlePauseResume}
            >
              {phase === "paused" ? <><Play size={16} />再開</> : <><Pause size={16} />一時停止</>}
            </button>
            <button
              style={{
                flex: 1, minHeight: "52px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                background: goalReached ? "#22C55E" : "#FF6B00",
                color: "white", border: "none", borderRadius: "12px",
                fontSize: "16px", fontWeight: 800, cursor: "pointer",
                boxShadow: goalReached
                  ? "0 4px 20px rgba(34,197,94,0.45)"
                  : "0 4px 14px rgba(255,107,0,0.35)",
                transition: "background 0.3s, box-shadow 0.3s",
              }}
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
