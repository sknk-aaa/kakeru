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
  monthly_distance_goal_km: number | null;
  stripe_payment_method_id: string | null;
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


  return (
    <div>

      {/* ── スキップ確認モーダル ── */}
      {skipTargetId && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end" }}
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

      {/* ── ヘッダー（白） ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #EBEBEB",
        padding: "0 16px 0 56px", height: "54px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Image src="/stickman-assets/stickman-01.png" alt="" width={24} height={24} style={{ objectFit: "contain" }} priority />
          <span style={{
            fontFamily: "var(--font-display)",
            fontSize: "21px", fontWeight: 900, fontStyle: "italic",
            color: "#FF6B00", letterSpacing: "0.06em",
          }}>KAKERU</span>
        </div>
        <Link href="/goals/new">
          <button
            aria-label="目標を追加"
            style={{
              width: "34px", height: "34px", borderRadius: "50%",
              background: "#FF6B00", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Plus size={16} color="white" strokeWidth={2.5} aria-hidden="true" />
          </button>
        </Link>
      </div>

      {/* ── メインコンテンツ ── */}
      <div style={{ padding: "16px 16px 48px" }}>

        {/* 今日のミッションカード */}
        {todayGoalInstances.map((instance) => {
          if (!instance.goals) return null;

          if (instance.status === "achieved") {
            return (
              <div key={instance.id} style={{
                background: "white", borderRadius: "22px", padding: "20px",
                marginBottom: "12px", textAlign: "center",
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                borderLeft: "5px solid #22C55E",
              }}>
                <Image src="/stickman-assets/stickman-02.png" alt="" width={72} height={72} style={{ objectFit: "contain", marginBottom: "8px" }} />
                <p style={{ fontSize: "9px", color: "#22C55E", fontWeight: 800, letterSpacing: "0.2em", marginBottom: "4px" }}>TODAY&apos;S MISSION</p>
                <p style={{ fontSize: "16px", fontWeight: 800, color: "#111111" }}>目標達成！</p>
                <p style={{ fontSize: "12px", color: "#888888", marginTop: "4px" }}>お疲れ様でした</p>
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

          return (
            <div key={instance.id} style={{
              background: "white",
              borderRadius: "22px", padding: "20px",
              marginBottom: "12px",
              position: "relative", overflow: "hidden",
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
              borderLeft: "5px solid #FF6B00",
            }}>
              {/* ゴーストの棒人間 */}
              <div style={{ position: "absolute", right: "-6px", bottom: "-8px", pointerEvents: "none" }}>
                <Image src="/stickman-assets/stickman-08.png" alt="" width={108} height={108} style={{ objectFit: "contain", opacity: 0.1 }} />
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
                <div>
                  <p style={{ fontSize: "9px", color: "#FF6B00", fontWeight: 800, letterSpacing: "0.2em", marginBottom: "4px" }}>
                    TODAY&apos;S MISSION
                  </p>
                  {mainVal ? (
                    <div style={{ display: "flex", alignItems: "baseline", gap: "5px" }}>
                      <span className="metric-value" style={{ fontSize: "54px", color: "#111111" }}>{mainVal}</span>
                      <span style={{ fontSize: "22px", color: "#FF6B00", fontWeight: 700 }}>{mainUnit}</span>
                    </div>
                  ) : (
                    <span style={{ fontSize: "26px", fontWeight: 800, color: "#111111" }}>フリーラン</span>
                  )}
                  <p style={{ fontSize: "12px", color: "#EF4444", marginTop: "2px", fontWeight: 600 }}>
                    サボると ¥{penalty_amount.toLocaleString()} 課金
                  </p>
                </div>
                <Link href={`/run?goalInstanceId=${instance.id}`} style={{ flexShrink: 0 }}>
                  <button style={{
                    background: "#FF6B00", color: "white", border: "none",
                    borderRadius: "99px", padding: "8px 22px",
                    fontSize: "14px", fontWeight: 800, cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(255,107,0,0.35)",
                    marginTop: "6px",
                  }}>
                    走る →
                  </button>
                </Link>
              </div>

              {mainVal && (progressRatio > 0 || distance_km) && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#888888", marginBottom: "5px", fontWeight: 600 }}>
                    <span>
                      {distance_km
                        ? `${todayRunDistanceKm.toFixed(2)} km 完了`
                        : `${Math.floor(todayRunDurationSec / 60)} 分完了`}
                    </span>
                    <span style={{ color: "#FF6B00" }}>{Math.round(progressRatio * 100)}%</span>
                  </div>
                  <div style={{ height: "6px", background: "#F0F0F0", borderRadius: "99px" }}>
                    <div style={{
                      height: "100%", background: "#FF6B00", borderRadius: "99px",
                      width: `${Math.round(progressRatio * 100)}%`,
                      transition: "width 0.4s ease",
                    }} />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* ── 今月のサマリー（3カード） ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "20px" }}>
          {/* 今月の距離 */}
          <div style={{ background: "white", borderRadius: "16px", padding: "12px 8px 10px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <Image src="/stickman-assets/stickman-05.png" alt="" width={40} height={40} style={{ objectFit: "contain", marginBottom: "4px" }} />
            <p style={{ fontSize: "9px", color: "#AAAAAA", fontWeight: 600, marginBottom: "2px", letterSpacing: "0.04em" }}>今月の距離</p>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "1px" }}>
              <span className="metric-value" style={{ fontSize: "24px", color: "#FF6B00" }}>{totalDistanceMonth}</span>
              <span style={{ fontSize: "10px", color: "#AAAAAA", fontWeight: 600 }}>km</span>
            </div>
          </div>
          {/* 達成率 */}
          <div style={{ background: "white", borderRadius: "16px", padding: "12px 8px 10px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <Image src="/stickman-assets/stickman-02.png" alt="" width={40} height={40} style={{ objectFit: "contain", marginBottom: "4px" }} />
            <p style={{ fontSize: "9px", color: "#AAAAAA", fontWeight: 600, marginBottom: "2px", letterSpacing: "0.04em" }}>達成率</p>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "1px" }}>
              <span className="metric-value" style={{ fontSize: "24px", color: "#111111" }}>{achieveRate}</span>
              <span style={{ fontSize: "10px", color: "#AAAAAA", fontWeight: 600 }}>%</span>
            </div>
          </div>
          {/* 今月の罰金 */}
          <div style={{ background: "white", borderRadius: "16px", padding: "12px 8px 10px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <Image src="/stickman-assets/stickman-08.png" alt="" width={40} height={40} style={{ objectFit: "contain", marginBottom: "4px" }} />
            <p style={{ fontSize: "9px", color: "#AAAAAA", fontWeight: 600, marginBottom: "2px", letterSpacing: "0.04em" }}>今月の罰金</p>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "1px" }}>
              <span style={{ fontSize: "12px", color: "#AAAAAA", fontWeight: 700 }}>¥</span>
              <span className="metric-value" style={{ fontSize: "24px", color: totalPenaltyMonth > 0 ? "#EF4444" : "#111111" }}>
                {totalPenaltyMonth >= 1000 ? `${(totalPenaltyMonth / 1000).toFixed(1)}k` : totalPenaltyMonth}
              </span>
            </div>
          </div>
        </div>

        {/* ── 今週の目標 ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px", paddingLeft: "2px" }}>
          <p style={{ fontSize: "11px", color: "#888888", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            今週の目標
          </p>
          <p style={{ fontSize: "11px", color: "#AAAAAA" }}>
            スキップ残り <strong style={{ color: "#888888" }}>{skipRemaining}回</strong>
          </p>
        </div>

        {visibleInstances.length === 0 ? (
          <div style={{
            background: "white", borderRadius: "22px", padding: "40px 20px",
            textAlign: "center", boxShadow: "0 1px 6px rgba(0,0,0,0.07)", marginBottom: "12px",
          }}>
            <div style={{ marginBottom: "12px" }}>
              <Image src="/stickman-assets/stickman-13.png" alt="" width={80} height={80} style={{ objectFit: "contain" }} />
            </div>
            <p style={{ color: "#888888", fontSize: "14px", marginBottom: "16px" }}>目標を設定してみましょう</p>
            <Link href="/goals/new">
              <button className="btn-primary" style={{ minHeight: "44px", padding: "0 24px", fontSize: "14px" }}>目標を追加する</button>
            </Link>
          </div>
        ) : (
          <div style={{
            background: "white", borderRadius: "22px", overflow: "hidden",
            boxShadow: "0 1px 6px rgba(0,0,0,0.07)", marginBottom: "12px",
          }}>
            {pendingInstances.length === 0 && (
              <div style={{ padding: "32px 20px", textAlign: "center" }}>
                <div style={{ marginBottom: "8px" }}>
                  <Image src="/stickman-assets/stickman-02.png" alt="" width={72} height={72} style={{ objectFit: "contain" }} />
                </div>
                <p style={{ fontSize: "14px", color: "#888888" }}>今週の予定はすべて完了しました</p>
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
                  {idx > 0 && <div style={{ height: "1px", background: "#F5F5F5", marginLeft: "76px" }} />}
                  <button
                    style={{
                      display: "flex", alignItems: "center",
                      padding: "16px 16px",
                      opacity: isFuture && !isPendingNotToday ? 0.38 : 1,
                      cursor: isPendingNotToday ? "pointer" : "default",
                      width: "100%",
                      background: isToday ? "rgba(255,107,0,0.04)" : "none",
                      border: "none", textAlign: "left",
                    }}
                    onClick={handleCardTap}
                  >
                    {/* 日付インジケーター */}
                    <div style={{ width: "46px", textAlign: "center", flexShrink: 0 }}>
                      <p className="metric-value" style={{
                        fontSize: "34px", lineHeight: 1,
                        color: isToday ? "#FF6B00" : "#111111",
                      }}>
                        {d.getDate()}
                      </p>
                      <p style={{
                        fontSize: "11px", marginTop: "2px",
                        color: isToday ? "#FF6B00" : "#AAAAAA",
                        fontWeight: isToday ? 700 : 400,
                      }}>
                        {DAY_NAMES[d.getDay()]}
                      </p>
                    </div>

                    {/* 区切り線 */}
                    <div style={{
                      width: "1px", height: "40px",
                      background: isToday ? "#FFD5B0" : "#EBEBEB",
                      margin: "0 14px", flexShrink: 0,
                    }} />

                    {/* 目標内容 */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        {instance.goals?.distance_km && (
                          <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "15px", fontWeight: 700, color: "#111111" }}>
                            <MapPin size={13} color="#FF6B00" strokeWidth={2.5} aria-hidden="true" />
                            {instance.goals.distance_km}km
                          </span>
                        )}
                        {instance.goals?.duration_minutes && (
                          <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "15px", fontWeight: 700, color: "#111111" }}>
                            <Clock size={13} color="#888888" strokeWidth={2.5} aria-hidden="true" />
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
                            fontWeight: 800, letterSpacing: "0.06em",
                          }}>TODAY</span>
                        )}
                      </div>
                      {instance.goals && (
                        <p style={{ fontSize: "12px", color: "#EF4444", marginTop: "3px", fontWeight: 600 }}>
                          ¥{instance.goals.penalty_amount.toLocaleString()}
                        </p>
                      )}
                    </div>

                    {/* アクション */}
                    <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                      {instance.status === "achieved" && <CheckCircle size={22} color="#22C55E" aria-hidden="true" />}
                      {instance.status === "failed" && <XCircle size={22} color="#EF4444" aria-hidden="true" />}
                      {instance.status === "skipped" && (
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <SkipForward size={14} color="#AAAAAA" aria-hidden="true" />
                          <span style={{ fontSize: "11px", color: "#AAAAAA", fontWeight: 500 }}>スキップ済み</span>
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
                      {isPendingNotToday && <ChevronRight size={16} color="#CCCCCC" aria-hidden="true" />}
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
                  <span style={{ fontSize: "12px", color: "#BBBBBB", fontWeight: 600 }}>
                    今週の記録（{historyInstances.length}件）
                  </span>
                  {showHistory ? <ChevronUp size={14} color="#BBBBBB" /> : <ChevronDown size={14} color="#BBBBBB" />}
                </button>

                {showHistory && historyInstances.map((instance) => {
                  const isToday = instance.scheduled_date === todayStr;
                  const d = new Date(instance.scheduled_date + "T00:00:00");
                  return (
                    <div key={instance.id} style={{ opacity: 0.55 }}>
                      <div style={{ height: "1px", background: "#F5F5F5", marginLeft: "76px" }} />
                      <div style={{ display: "flex", alignItems: "center", padding: "14px 16px" }}>
                        <div style={{ width: "46px", textAlign: "center", flexShrink: 0 }}>
                          <p className="metric-value" style={{ fontSize: "34px", lineHeight: 1, color: isToday ? "#FF6B00" : "#111111" }}>{d.getDate()}</p>
                          <p style={{ fontSize: "11px", marginTop: "2px", color: isToday ? "#FF6B00" : "#AAAAAA" }}>{DAY_NAMES[d.getDay()]}</p>
                        </div>
                        <div style={{ width: "1px", height: "40px", background: "#EBEBEB", margin: "0 14px", flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            {instance.goals?.distance_km && (
                              <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "15px", fontWeight: 700, color: "#111111" }}>
                                <MapPin size={13} color="#FF6B00" strokeWidth={2.5} aria-hidden="true" />{instance.goals.distance_km}km
                              </span>
                            )}
                            {instance.goals?.duration_minutes && (
                              <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "15px", fontWeight: 700, color: "#111111" }}>
                                <Clock size={13} color="#888888" strokeWidth={2.5} aria-hidden="true" />{instance.goals.duration_minutes}分
                              </span>
                            )}
                            {!instance.goals?.distance_km && !instance.goals?.duration_minutes && (
                              <span style={{ fontSize: "15px", fontWeight: 700, color: "#111111" }}>フリーラン</span>
                            )}
                          </div>
                        </div>
                        <div style={{ flexShrink: 0 }}>
                          {instance.status === "achieved" && <CheckCircle size={22} color="#22C55E" />}
                          {instance.status === "failed" && <XCircle size={22} color="#EF4444" />}
                          {instance.status === "skipped" && (
                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              <SkipForward size={14} color="#AAAAAA" />
                              <span style={{ fontSize: "11px", color: "#AAAAAA" }}>スキップ済み</span>
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

        {/* 目標追加リンク */}
        <Link href="/goals/new">
          <div style={{
            background: "white", borderRadius: "18px", padding: "18px 20px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
            transition: "box-shadow 0.15s",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{
                width: "38px", height: "38px", background: "#FF6B00", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Plus size={16} color="white" strokeWidth={2.5} aria-hidden="true" />
              </div>
              <span style={{ fontSize: "15px", fontWeight: 600, color: "#111111" }}>新しい目標を追加</span>
            </div>
            <ChevronRight size={18} color="#CCCCCC" aria-hidden="true" />
          </div>
        </Link>

      </div>
    </div>
  );
}
