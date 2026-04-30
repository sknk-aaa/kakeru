"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, SkipForward, Plus, ChevronRight, ChevronDown, ChevronUp, MapPin, Clock } from "lucide-react";
import { useState } from "react";

interface GoalInstance {
  id: string;
  scheduled_date: string;
  status: string;
  goals: {
    id: string;
    type: "recurring" | "oneoff" | "challenge";
    distance_km: number | null;
    duration_minutes: number | null;
    penalty_amount: number;
  } | null;
}

interface UserProfile {
  skip_count_this_month: number;
}

interface Props {
  userProfile: UserProfile | null;
  weekInstances: GoalInstance[];
  todayStr: string;
  totalDistanceMonth: number;
  totalPenaltyMonth: number;
  achieveRate: number;
  todayGoalInstances: GoalInstance[];
  todayRunDistanceKm: number;
  todayRunDurationSec: number;
}

const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];
const DAILY_STICKMAN_IMAGES = [
  "/stickman-assets/stickman-01.png",
  "/stickman-assets/stickman-03.png",
  "/stickman-assets/stickman-04.png",
  "/stickman-assets/stickman-05.png",
  "/stickman-assets/stickman-06.png",
  "/stickman-assets/stickman-07.png",
  "/stickman-assets/stickman-08.png",
  "/stickman-assets/stickman-09.png",
];

function getDailyStickmanSrc(seed: string) {
  const hash = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return DAILY_STICKMAN_IMAGES[hash % DAILY_STICKMAN_IMAGES.length];
}

export default function HomeClient({
  userProfile,
  weekInstances,
  todayStr,
  totalDistanceMonth,
  totalPenaltyMonth,
  achieveRate,
  todayGoalInstances,
  todayRunDistanceKm,
  todayRunDurationSec,
}: Props) {
  const router = useRouter();
  const [instances, setInstances] = useState(weekInstances);
  const [skipTargetId, setSkipTargetId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const skipRemaining = Math.max(0, 1 - (userProfile?.skip_count_this_month ?? 0));

  async function handleSkip(instanceId: string) {
    setProcessing(true);
    const res = await fetch("/api/goals/skip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goalInstanceId: instanceId }),
    }).catch(() => null);
    if (!res?.ok) {
      setSkipTargetId(null);
      setProcessing(false);
      return;
    }
    setInstances((prev) =>
      prev.map((i) => i.id === instanceId ? { ...i, status: "skipped" } : i)
    );
    setSkipTargetId(null);
    setProcessing(false);
  }

  const visibleInstances = instances.filter((i) => i.status !== "cancelled");
  const pendingInstances = visibleInstances.filter((i) => i.status === "pending");
  const historyInstances = visibleInstances.filter((i) => i.status !== "pending");
  const todayMissionStickmanSrc = getDailyStickmanSrc(todayStr);

  return (
    <div style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #FFF9F5 46%, #F7F7FA 100%)", minHeight: "100vh" }}>

      {/* ── スキップ確認モーダル ── */}
      {skipTargetId && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "flex-end" }}
          onClick={() => setSkipTargetId(null)}
        >
          <div
            style={{ background: "white", borderRadius: "24px 24px 0 0", padding: "24px 20px calc(env(safe-area-inset-bottom) + 24px)", width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: "36px", height: "4px", background: "#E5E5E5", borderRadius: "2px", margin: "0 auto 20px" }} />
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#111111", marginBottom: "8px" }}>スキップしますか？</h2>
            <p style={{ fontSize: "14px", color: "#888888", lineHeight: 1.6, marginBottom: "6px" }}>
              スキップすると罰金は発生しませんが、達成回数には含まれません。
            </p>
            <div style={{ background: skipRemaining <= 1 ? "#FFF5EE" : "#F2F2F7", borderRadius: "10px", padding: "10px 14px", marginBottom: "20px" }}>
              <p style={{ fontSize: "14px", fontWeight: 600, color: skipRemaining <= 1 ? "#FF6B00" : "#111111" }}>
                {skipRemaining === 1
                  ? "⚠️ これが今月最後のスキップです"
                  : `今月あと ${skipRemaining} 回使用できます`}
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="btn-secondary" style={{ flex: 1, minHeight: "52px" }} onClick={() => setSkipTargetId(null)}>
                キャンセル
              </button>
              <button className="btn-primary" style={{ flex: 1, minHeight: "52px" }} onClick={() => handleSkip(skipTargetId)} disabled={processing}>
                スキップする
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ヘッダー ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "rgba(255,255,255,0.88)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(235,235,235,0.75)",
        padding: "0 16px 0 56px", height: "60px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Image src="/stickman-assets/stickman-01.png" alt="" width={28} height={28} style={{ objectFit: "contain" }} priority />
          <span style={{
            fontFamily: "var(--font-display)",
            fontSize: "24px", fontWeight: 900, fontStyle: "italic",
            color: "#FF6B00", letterSpacing: "0.06em",
          }}>KAKERU</span>
        </div>
        <Link href="/goals/new">
          <button
            aria-label="目標を追加"
            style={{
              width: "42px", height: "42px", borderRadius: "50%",
              background: "white", border: "1px solid rgba(255,107,0,0.14)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 22px rgba(255,107,0,0.15)",
            }}
          >
            <Plus size={22} color="#FF6B00" strokeWidth={2.6} aria-hidden="true" />
          </button>
        </Link>
      </div>

      {/* ── メインコンテンツ ── */}
      <div style={{ padding: "18px 14px 104px" }}>

        {/* ── 今日のミッション ── */}
        {todayGoalInstances.map((instance) => {
          if (!instance.goals) return null;

          if (instance.status === "achieved") {
            return (
              <div key={instance.id} style={{
                background: "white", borderRadius: "22px",
                marginBottom: "14px", overflow: "hidden",
                boxShadow: "0 2px 16px rgba(34,197,94,0.10)",
              }}>
                <div style={{ height: "4px", background: "#22C55E" }} />
                <div style={{ padding: "20px 20px 24px", textAlign: "center" }}>
                  <p style={{ fontSize: "10px", color: "#22C55E", fontWeight: 800, letterSpacing: "0.18em", marginBottom: "14px" }}>TODAY&apos;S MISSION</p>
                  <Image src={todayMissionStickmanSrc} alt="" width={80} height={80} style={{ objectFit: "contain", marginBottom: "10px" }} />
                  <p style={{ fontSize: "18px", fontWeight: 800, color: "#111111", marginBottom: "4px" }}>目標達成！</p>
                  <p style={{ fontSize: "13px", color: "#888888" }}>お疲れ様でした</p>
                </div>
              </div>
            );
          }

          const { distance_km, duration_minutes, penalty_amount } = instance.goals;
          const mainVal = distance_km ?? duration_minutes;
          const mainUnit = distance_km ? "km" : duration_minutes ? "分" : null;
          const progressRatio = distance_km
            ? Math.min(todayRunDistanceKm / distance_km, 1)
            : duration_minutes
            ? Math.min(todayRunDurationSec / (duration_minutes * 60), 1)
            : 0;
          const progressPct = Math.round(progressRatio * 100);

          return (
            <div key={instance.id} style={{
              background: "white",
              borderRadius: "24px",
              marginBottom: "18px",
              overflow: "hidden",
              boxShadow: "0 12px 34px rgba(255,107,0,0.13)",
              border: "1px solid rgba(255,107,0,0.08)",
            }}>
              {/* メトリクス部分 */}
              <div style={{
                padding: "20px 20px 18px",
                position: "relative",
                overflow: "hidden",
                background: "linear-gradient(135deg, #FFF5EE 0%, #FFFFFF 58%)",
              }}>
                <div style={{ position: "absolute", right: "-12px", top: "4px", pointerEvents: "none" }}>
                  <Image src={todayMissionStickmanSrc} alt="" width={138} height={138} style={{ objectFit: "contain", opacity: 0.95 }} />
                </div>
                <div style={{ position: "absolute", right: "24px", bottom: "16px", width: "62px", height: "62px", borderRadius: "50%", background: "#FFE8D9", opacity: 0.72, pointerEvents: "none" }} />

                <p style={{ fontSize: "10px", color: "#FF6B00", fontWeight: 800, letterSpacing: "0.2em", marginBottom: "10px" }}>
                  TODAY&apos;S MISSION
                </p>

                <div style={{ position: "relative", zIndex: 1, maxWidth: "62%" }}>
                  {mainVal ? (
                    <div style={{ display: "flex", alignItems: "baseline", gap: "5px", marginBottom: "6px" }}>
                      <span className="metric-value" style={{ fontSize: "64px", lineHeight: 1, color: "#111111" }}>{mainVal}</span>
                      <span style={{ fontSize: "25px", fontWeight: 800, color: "#FF6B00" }}>{mainUnit}</span>
                    </div>
                  ) : (
                    <p style={{ fontSize: "28px", fontWeight: 800, color: "#111111", marginBottom: "8px", lineHeight: 1.2 }}>フリーラン</p>
                  )}

                  <p style={{ fontSize: "13px", color: "#E65A00", fontWeight: 700, lineHeight: 1.35 }}>
                    サボると ¥{penalty_amount.toLocaleString()} 課金
                  </p>
                </div>

                {/* 進捗バー */}
                {mainVal && (
                  <div style={{ marginTop: "18px", position: "relative", zIndex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, marginBottom: "8px" }}>
                      <span style={{ color: "#555555" }}>
                        {distance_km
                          ? `${todayRunDistanceKm.toFixed(2)} km 完了`
                          : `${Math.floor(todayRunDurationSec / 60)} 分完了`}
                      </span>
                      <span style={{ color: progressPct > 0 ? "#FF6B00" : "#BBBBBB" }}>{progressPct}%</span>
                    </div>
                    <div style={{ height: "8px", background: "#EFEFEF", borderRadius: "99px", overflow: "hidden" }}>
                      <div style={{
                        height: "100%",
                        background: "linear-gradient(90deg, #FF6B00, #FF9500)",
                        borderRadius: "99px",
                        width: `${progressPct}%`,
                        transition: "width 0.5s ease",
                        minWidth: progressPct > 0 ? "8px" : "0",
                      }} />
                    </div>
                  </div>
                )}
              </div>

              {/* CTAエリア */}
              <div style={{ padding: "4px 16px 18px" }}>
                <Link href={`/run?goalInstanceId=${instance.id}`} style={{ display: "block" }}>
                  <button style={{
                    width: "100%", height: "54px",
                    background: "#FF6B00",
                    color: "white", border: "none", borderRadius: "14px",
                    fontSize: "17px", fontWeight: 800, cursor: "pointer",
                    boxShadow: "0 6px 20px rgba(255,107,0,0.38)",
                    letterSpacing: "0.05em",
                  }}>
                    走る →
                  </button>
                </Link>
                {skipRemaining > 0 && (
                  <p style={{ textAlign: "center", fontSize: "11px", color: "#BBBBBB", marginTop: "10px", fontWeight: 500 }}>
                    スキップ残り {skipRemaining} 回
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {/* ── 今月のサマリー ── */}
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ fontSize: "17px", color: "#111111", fontWeight: 800, letterSpacing: "0.01em", marginBottom: "12px", padding: "0 2px" }}>
            今月のサマリー
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "10px" }}>

            {/* 今月の距離 */}
            <div style={{ background: "white", borderRadius: "18px", padding: "13px 8px 12px", boxShadow: "0 8px 24px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.03)", overflow: "hidden", minHeight: "108px" }}>
              <div style={{ height: "34px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}>
                <Image src="/その他素材/今月の距離-transparent.png" alt="" width={42} height={40} style={{ objectFit: "contain" }} />
              </div>
              <p style={{ fontSize: "10px", color: "#777777", fontWeight: 700, marginBottom: "2px", letterSpacing: "0.02em", textAlign: "center" }}>今月の距離</p>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "2px" }}>
                <span className="metric-value" style={{ fontSize: "30px", color: "#111111" }}>{totalDistanceMonth}</span>
                <span style={{ fontSize: "12px", color: "#333333", fontWeight: 800 }}>km</span>
              </div>
              <div style={{ width: "44px", height: "4px", background: "#FF6B00", borderRadius: "99px", margin: "5px auto 0" }} />
            </div>

            {/* 達成率 */}
            <div style={{ background: "white", borderRadius: "18px", padding: "13px 8px 12px", boxShadow: "0 8px 24px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.03)", overflow: "hidden", minHeight: "108px" }}>
              <div style={{ height: "34px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}>
                <Image src="/その他素材/今月の達成率-transparent.png" alt="" width={48} height={48} style={{ objectFit: "contain" }} />
              </div>
              <p style={{ fontSize: "10px", color: "#777777", fontWeight: 700, marginBottom: "2px", letterSpacing: "0.02em", textAlign: "center" }}>達成率</p>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "2px" }}>
                <span className="metric-value" style={{ fontSize: "32px", color: "#111111" }}>{achieveRate}</span>
                <span style={{ fontSize: "13px", color: "#111111", fontWeight: 800 }}>%</span>
              </div>
            </div>

            {/* 今月の罰金 */}
            <div style={{ background: "white", borderRadius: "18px", padding: "13px 8px 12px", boxShadow: "0 8px 24px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.03)", overflow: "hidden", minHeight: "108px" }}>
              <div style={{ height: "34px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "9px" }}>
                <Image src="/その他素材/今月の課金額-transparent.png" alt="" width={44} height={44} style={{ objectFit: "contain" }} />
              </div>
              <p style={{ fontSize: "10px", color: "#777777", fontWeight: 700, marginBottom: "2px", letterSpacing: "0.02em", textAlign: "center" }}>今月の罰金</p>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "1px" }}>
                <span style={{ fontSize: "14px", color: totalPenaltyMonth > 0 ? "#EF4444" : "#111111", fontWeight: 900 }}>¥</span>
                <span className="metric-value" style={{ fontSize: "30px", color: totalPenaltyMonth > 0 ? "#EF4444" : "#111111" }}>
                  {totalPenaltyMonth >= 1000 ? `${(totalPenaltyMonth / 1000).toFixed(1)}k` : totalPenaltyMonth}
                </span>
              </div>
              {totalPenaltyMonth === 0 && (
                <p style={{ fontSize: "10px", color: "#FF6B00", textAlign: "center", fontWeight: 800, marginTop: "2px" }}>すばらしい！</p>
              )}
            </div>

          </div>
        </div>

        {/* ── 今週の目標 ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px", paddingLeft: "2px" }}>
          <p style={{ fontSize: "11px", color: "#999999", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            今週の目標
          </p>
          <p style={{ fontSize: "11px", color: "#BBBBBB" }}>
            スキップ残り <strong style={{ color: "#999999" }}>{skipRemaining}回</strong>
          </p>
        </div>

        {visibleInstances.length === 0 ? (
          <div style={{
            background: "white", borderRadius: "22px",
            boxShadow: "0 1px 8px rgba(0,0,0,0.06)", marginBottom: "12px",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            minHeight: "45vh", padding: "24px 20px",
          }}>
            <Image src="/stickman-assets/stickman-13.png" alt="" width={150} height={108} style={{ objectFit: "contain", marginBottom: "18px" }} priority />
            <p style={{ color: "#111111", fontSize: "16px", fontWeight: 800, marginBottom: "7px" }}>今週の目標がまだありません</p>
            <p style={{ color: "#888888", fontSize: "13px", lineHeight: 1.6, marginBottom: "20px", textAlign: "center" }}>まずは目標を一つ立ててみましょう！</p>
            <Link href="/goals/new">
              <button className="btn-primary" style={{ minHeight: "44px", padding: "0 28px", fontSize: "14px" }}>目標を立てる</button>
            </Link>
          </div>
        ) : (
          <div style={{
            background: "white", borderRadius: "22px", overflow: "hidden",
            boxShadow: "0 1px 8px rgba(0,0,0,0.06)", marginBottom: "14px",
          }}>
            {pendingInstances.length === 0 && (
              <div style={{
                minHeight: "45vh", padding: "20px",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              }}>
                <Image src="/stickman-assets/stickman-13.png" alt="" width={150} height={108} style={{ objectFit: "contain", marginBottom: "18px" }} priority />
                <p style={{ color: "#111111", fontSize: "16px", fontWeight: 800, marginBottom: "7px" }}>今週の目標をすべてクリア！</p>
                <p style={{ color: "#888888", fontSize: "13px", lineHeight: 1.6, marginBottom: "24px", textAlign: "center" }}>この流れのまま、次の目標を今のうちに入れておきましょう！</p>
                <Link href="/goals/new">
                  <button className="btn-primary" style={{ minHeight: "44px", padding: "0 28px", fontSize: "14px" }}>目標を立てる</button>
                </Link>
              </div>
            )}

            {pendingInstances.map((instance, idx) => {
              const isToday = instance.scheduled_date === todayStr;
              const isFuture = instance.scheduled_date > todayStr;
              const isPendingNotToday = instance.status === "pending" && !isToday;
              const d = new Date(instance.scheduled_date + "T00:00:00");

              function handleCardTap() {
                if (!isPendingNotToday || !instance.goals) return;
                if (instance.goals.type === "oneoff") {
                  router.push(`/goals/${instance.goals.id}`);
                } else {
                  router.push(`/goals/instances/${instance.id}`);
                }
              }

              return (
                <div key={instance.id}>
                  {idx > 0 && <div style={{ height: "1px", background: "#F5F5F5", marginLeft: "72px" }} />}
                  <button
                    style={{
                      display: "flex", alignItems: "center",
                      padding: "0 14px",
                      width: "100%",
                      background: isToday ? "rgba(255,107,0,0.035)" : "none",
                      border: "none", textAlign: "left", cursor: isPendingNotToday ? "pointer" : "default",
                      opacity: isFuture && !isToday ? 0.42 : 1,
                      borderLeft: isToday ? "3px solid #FF6B00" : "3px solid transparent",
                      minHeight: "64px",
                    }}
                    onClick={handleCardTap}
                  >
                    {/* 日付 */}
                    <div style={{ width: "44px", textAlign: "center", flexShrink: 0, padding: "14px 0" }}>
                      <p className="metric-value" style={{
                        fontSize: "28px", lineHeight: 1,
                        color: isToday ? "#FF6B00" : "#1A1A1A",
                      }}>
                        {d.getDate()}
                      </p>
                      <p style={{
                        fontSize: "10px", marginTop: "2px",
                        color: isToday ? "#FF6B00" : "#BBBBBB",
                        fontWeight: isToday ? 700 : 400,
                      }}>
                        {DAY_NAMES[d.getDay()]}
                      </p>
                    </div>

                    <div style={{ width: "1px", height: "36px", background: isToday ? "#FFD5B0" : "#EBEBEB", margin: "0 12px", flexShrink: 0 }} />

                    {/* 目標内容 */}
                    <div style={{ flex: 1, minWidth: 0, padding: "14px 0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "7px", flexWrap: "wrap" }}>
                        {instance.goals?.distance_km && (
                          <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "15px", fontWeight: 700, color: "#111111" }}>
                            <MapPin size={12} color="#FF6B00" strokeWidth={2.5} aria-hidden="true" />
                            {instance.goals.distance_km}km
                          </span>
                        )}
                        {instance.goals?.duration_minutes && (
                          <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "15px", fontWeight: 700, color: "#111111" }}>
                            <Clock size={12} color="#AAAAAA" strokeWidth={2.5} aria-hidden="true" />
                            {instance.goals.duration_minutes}分
                          </span>
                        )}
                        {!instance.goals?.distance_km && !instance.goals?.duration_minutes && (
                          <span style={{ fontSize: "15px", fontWeight: 700, color: "#111111" }}>フリーラン</span>
                        )}
                        {isToday && (
                          <span style={{
                            fontSize: "9px", background: "#FF6B00", color: "white",
                            padding: "2px 8px", borderRadius: "99px",
                            fontWeight: 800, letterSpacing: "0.06em", flexShrink: 0,
                          }}>TODAY</span>
                        )}
                      </div>
                      {instance.goals && (
                        <p style={{ fontSize: "11px", color: "#EF4444", marginTop: "3px", fontWeight: 600 }}>
                          ¥{instance.goals.penalty_amount.toLocaleString()}
                        </p>
                      )}
                    </div>

                    {/* アクション */}
                    <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "6px", padding: "14px 0 14px 6px" }}>
                      {instance.status === "achieved" && <CheckCircle size={22} color="#22C55E" aria-hidden="true" />}
                      {instance.status === "failed" && <XCircle size={22} color="#EF4444" aria-hidden="true" />}
                      {instance.status === "skipped" && (
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <SkipForward size={14} color="#CCCCCC" aria-hidden="true" />
                          <span style={{ fontSize: "11px", color: "#CCCCCC", fontWeight: 500 }}>スキップ済み</span>
                        </div>
                      )}
                      {instance.status === "pending" && isToday && (
                        <>
                          <Link href="/run">
                            <button className="btn-primary" style={{ minHeight: "36px", fontSize: "13px", padding: "0 14px" }}>走る</button>
                          </Link>
                          {skipRemaining > 0 && (
                            <button
                              className="btn-secondary"
                              style={{ minHeight: "36px", fontSize: "13px", padding: "0 10px" }}
                              onClick={(e) => { e.stopPropagation(); setSkipTargetId(instance.id); }}
                            >
                              スキップ
                            </button>
                          )}
                        </>
                      )}
                      {isPendingNotToday && <ChevronRight size={15} color="#DDDDDD" aria-hidden="true" />}
                    </div>
                  </button>
                </div>
              );
            })}

            {/* 今週の記録トグル */}
            {historyInstances.length > 0 && (
              <>
                <div style={{ height: "1px", background: "#F5F5F5" }} />
                <button
                  onClick={() => setShowHistory((v) => !v)}
                  style={{
                    width: "100%", minHeight: "44px",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
                    background: "none", border: "none", cursor: "pointer", padding: "10px 16px",
                  }}
                >
                  <span style={{ fontSize: "11px", color: "#CCCCCC", fontWeight: 600 }}>
                    今週の記録（{historyInstances.length}件）
                  </span>
                  {showHistory ? <ChevronUp size={13} color="#CCCCCC" /> : <ChevronDown size={13} color="#CCCCCC" />}
                </button>

                {showHistory && historyInstances.map((instance) => {
                  const isToday = instance.scheduled_date === todayStr;
                  const d = new Date(instance.scheduled_date + "T00:00:00");
                  return (
                    <div key={instance.id} style={{ opacity: 0.55 }}>
                      <div style={{ height: "1px", background: "#F5F5F5", marginLeft: "72px" }} />
                      <div style={{ display: "flex", alignItems: "center", padding: "14px 14px", minHeight: "60px" }}>
                        <div style={{ width: "44px", textAlign: "center", flexShrink: 0 }}>
                          <p className="metric-value" style={{ fontSize: "28px", lineHeight: 1, color: isToday ? "#FF6B00" : "#1A1A1A" }}>{d.getDate()}</p>
                          <p style={{ fontSize: "10px", marginTop: "2px", color: isToday ? "#FF6B00" : "#BBBBBB" }}>{DAY_NAMES[d.getDay()]}</p>
                        </div>
                        <div style={{ width: "1px", height: "36px", background: "#EBEBEB", margin: "0 12px", flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            {instance.goals?.distance_km && (
                              <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "15px", fontWeight: 700, color: "#111111" }}>
                                <MapPin size={12} color="#FF6B00" strokeWidth={2.5} aria-hidden="true" />{instance.goals.distance_km}km
                              </span>
                            )}
                            {instance.goals?.duration_minutes && (
                              <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "15px", fontWeight: 700, color: "#111111" }}>
                                <Clock size={12} color="#AAAAAA" strokeWidth={2.5} aria-hidden="true" />{instance.goals.duration_minutes}分
                              </span>
                            )}
                            {!instance.goals?.distance_km && !instance.goals?.duration_minutes && (
                              <span style={{ fontSize: "15px", fontWeight: 700, color: "#111111" }}>フリーラン</span>
                            )}
                          </div>
                        </div>
                        <div style={{ flexShrink: 0, padding: "0 0 0 6px" }}>
                          {instance.status === "achieved" && <CheckCircle size={20} color="#22C55E" aria-hidden="true" />}
                          {instance.status === "failed" && <XCircle size={20} color="#EF4444" aria-hidden="true" />}
                          {instance.status === "skipped" && (
                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              <SkipForward size={13} color="#CCCCCC" aria-hidden="true" />
                              <span style={{ fontSize: "11px", color: "#CCCCCC" }}>スキップ済み</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
