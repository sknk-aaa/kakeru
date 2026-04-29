"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatPace, formatDuration } from "@/lib/haversine";
import { TrendingUp, Home } from "lucide-react";
import AppShell from "@/components/AppShell";
import InstallPromptModal from "@/components/InstallPromptModal";
import Image from "next/image";

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
  const goalDistKm = params.get("goalDistKm") ? parseFloat(params.get("goalDistKm")!) : null;
  const goalDurMin = params.get("goalDurMin") ? parseInt(params.get("goalDurMin")!) : null;
  const runId = params.get("runId");
  const rawInstall = params.get("installPrompt");
  const installTrigger: 1 | 3 | null = rawInstall === "1" ? 1 : rawInstall === "3" ? 3 : null;
  const [showInstallModal, setShowInstallModal] = useState(installTrigger !== null);

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
          if (pace > 0 && pace < prevBestPace) setIsNewPB(true);
          setPersonalBest({ pace: prevBestPace, distance: prevBestDist });
        });
    });
  }, [runId, pace]);

  const achievementLabel = goalDistKm
    ? `${goalDistKm} km 達成！`
    : goalDurMin
    ? `${goalDurMin} 分 達成！`
    : "目標達成！";

  return (
    <AppShell>
      {showInstallModal && installTrigger && (
        <InstallPromptModal
          triggerRun={installTrigger}
          onClose={() => setShowInstallModal(false)}
        />
      )}
      <div style={{
        display: "flex", flexDirection: "column",
        minHeight: "calc(100vh - 64px)",
        padding: "0 16px 24px",
        background: "linear-gradient(180deg, #FFFFFF 0%, #FFF9F5 100%)",
      }}>

        {/* ─── ヒーロー ─── */}
        <div style={{ textAlign: "center", padding: "32px 0 20px" }}>
          {goalReached ? (
            <>
              <Image
                src="/stickman-assets/stickman-02.png"
                alt="" width={130} height={150}
                style={{ objectFit: "contain", marginBottom: "14px" }}
              />
              <p style={{ fontSize: "10px", color: "#22C55E", fontWeight: 800, letterSpacing: "0.2em", marginBottom: "10px" }}>
                TODAY&apos;S MISSION CLEAR
              </p>
              <p style={{ fontSize: "26px", fontWeight: 800, color: "#111111" }}>{achievementLabel}</p>
            </>
          ) : (
            <>
              <Image
                src="/stickman-assets/stickman-05.png"
                alt="" width={110} height={128}
                style={{ objectFit: "contain", marginBottom: "14px" }}
              />
              <p style={{ fontSize: "24px", fontWeight: 800, color: "#111111", marginBottom: "6px" }}>お疲れ様でした！</p>
              <p style={{ fontSize: "14px", color: "#888888" }}>
                {distanceKm.toFixed(2)} km 走りました
              </p>
            </>
          )}
        </div>

        {/* ─── 自己ベスト更新 ─── */}
        {isNewPB && (
          <div style={{
            background: "#FFF0E5", border: "1px solid #FFDCC4",
            borderRadius: "14px", padding: "12px 14px",
            display: "flex", alignItems: "center", gap: "10px",
            marginBottom: "14px",
          }}>
            <TrendingUp size={20} color="#FF6B00" />
            <div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#FF6B00" }}>自己ベスト更新！</p>
              <p style={{ fontSize: "11px", color: "#888888", marginTop: "2px" }}>
                最速ペース {formatPace(pace)}/km
                {personalBest && personalBest.pace !== Infinity && (
                  <span>（前回 {formatPace(personalBest.pace)}/km）</span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* ─── 結果カード ─── */}
        <div style={{
          background: "white", borderRadius: "20px",
          boxShadow: "0 2px 14px rgba(0,0,0,0.07)",
          overflow: "hidden", marginBottom: "16px",
        }}>
          {/* 主要指標：距離・タイム */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid #F5F5F5" }}>
            <div style={{ textAlign: "center", padding: "22px 8px 16px", borderRight: "1px solid #F5F5F5" }}>
              <p className="metric-value" style={{ fontSize: "46px", color: "#FF6B00", lineHeight: 1 }}>
                {distanceKm.toFixed(2)}
              </p>
              <p style={{ fontSize: "11px", color: "#BBBBBB", marginTop: "5px", fontWeight: 600 }}>km</p>
            </div>
            <div style={{ textAlign: "center", padding: "22px 8px 16px" }}>
              <p className="metric-value" style={{ fontSize: "46px", color: "#111111", lineHeight: 1 }}>
                {formatDuration(durationSec)}
              </p>
              <p style={{ fontSize: "11px", color: "#BBBBBB", marginTop: "5px", fontWeight: 600 }}>タイム</p>
            </div>
          </div>
          {/* サブ指標：ペース・カロリー */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            <div style={{ textAlign: "center", padding: "14px 8px", borderRight: "1px solid #F5F5F5" }}>
              <p className="metric-value" style={{ fontSize: "26px", color: "#111111", lineHeight: 1 }}>
                {formatPace(pace)}
              </p>
              <p style={{ fontSize: "11px", color: "#BBBBBB", marginTop: "4px", fontWeight: 600 }}>平均ペース</p>
            </div>
            <div style={{ textAlign: "center", padding: "14px 8px" }}>
              <p className="metric-value" style={{ fontSize: "26px", color: "#111111", lineHeight: 1 }}>
                {calories}
              </p>
              <p style={{ fontSize: "11px", color: "#BBBBBB", marginTop: "4px", fontWeight: 600 }}>kcal</p>
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <button
          className="btn-primary"
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          onClick={() => router.push("/")}
        >
          <Home size={18} />
          ホームへ
        </button>
      </div>
    </AppShell>
  );
}
