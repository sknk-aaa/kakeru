"use client";

import Link from "next/link";
import { CheckCircle, XCircle, SkipForward, Plus, ChevronRight, ChevronDown, ChevronUp, X, Route, Trophy, CreditCard, MapPin, Clock, CalendarDays } from "lucide-react";
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
  totalPenaltyMonth: number;
  achieveRate: number;
  todayGoalInstances: GoalInstance[];
  todayRunDistanceKm: number;
  todayRunDurationSec: number;
}

const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

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
  totalPenaltyMonth,
  achieveRate,
  todayGoalInstances,
  todayRunDistanceKm,
  todayRunDurationSec,
}: Props) {
  const [instances, setInstances] = useState(weekInstances);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [skipTargetId, setSkipTargetId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const skipRemaining = Math.max(0, 1 - (userProfile?.skip_count_this_month ?? 0));

  async function handleCancelInstance(instanceId: string) {
    setProcessing(true);
    await fetch(`/api/goals/instances/${instanceId}/cancel`, { method: "POST" });
    // 楽観的削除
    setInstances((prev) => prev.filter((i) => i.id !== instanceId));
    setConfirmCancelId(null);
    setProcessing(false);
  }

  async function handleSkip(instanceId: string) {
    setProcessing(true);
    await fetch("/api/goals/skip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goalInstanceId: instanceId }),
    });
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

      {/* スキップ確認モーダル */}
      {skipTargetId && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "flex-end" }}
          onClick={() => setSkipTargetId(null)}
        >
          <div
            style={{ background: "white", borderRadius: "20px 20px 0 0", padding: "24px 20px calc(env(safe-area-inset-bottom) + 24px)", width: "100%" }}
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
              <button
                className="btn-secondary"
                style={{ flex: 1, minHeight: "52px" }}
                onClick={() => setSkipTargetId(null)}
              >
                キャンセル
              </button>
              <button
                className="btn-primary"
                style={{ flex: 1, minHeight: "52px" }}
                onClick={() => handleSkip(skipTargetId)}
                disabled={processing}
              >
                スキップする
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ヘッダー */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #E5E5E5",
        padding: "0 16px", height: "54px",
        display: "flex", alignItems: "center",
      }}>
        <div style={{ flex: 1 }} />
        <h1 style={{ fontSize: "17px", fontWeight: 700, color: "#111111" }}>ホーム</h1>
        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          <Link href="/goals/new">
            <button style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#FF6B00", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }}>
              <Plus size={16} color="white" strokeWidth={2.5} />
            </button>
          </Link>
        </div>
      </div>

      <div style={{ padding: "12px 16px 24px" }}>

        {/* 今日の目標カード（複数対応） */}
        {todayGoalInstances.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
            {todayGoalInstances.map((instance) => {
              if (!instance.goals) return null;
              const { distance_km, duration_minutes, penalty_amount } = instance.goals;
              return (
                <div key={instance.id} style={{ background: "white", borderRadius: "16px", padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span style={{ fontSize: "12px", color: "#888888", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>今日の目標</span>
                    <Link href={`/run?goalInstanceId=${instance.id}`}>
                      <button className="btn-primary" style={{ minHeight: "32px", fontSize: "12px", padding: "0 14px" }}>走る</button>
                    </Link>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "12px" }}>
                    <p style={{ fontSize: "18px", fontWeight: 700, color: "#111111" }}>
                      {[
                        distance_km && `${distance_km}km`,
                        duration_minutes && `${duration_minutes}分`,
                      ].filter(Boolean).join("・") || "フリーラン"}
                    </p>
                    <span style={{ fontSize: "12px", color: "#EF4444", fontWeight: 600 }}>罰金 ¥{penalty_amount.toLocaleString()}</span>
                  </div>
                  {distance_km && distance_km > 0 && (
                    <div style={{ marginBottom: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                        <span style={{ color: "#FF6B00", fontWeight: 600 }}>{todayRunDistanceKm.toFixed(2)} km</span>
                        <span style={{ color: "#888888" }}>目標 {distance_km} km</span>
                      </div>
                      <div style={{ height: "6px", background: "#F0F0F0", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ height: "100%", background: "#FF6B00", borderRadius: "3px", width: `${Math.min((todayRunDistanceKm / distance_km) * 100, 100)}%`, transition: "width 0.4s ease" }} />
                      </div>
                    </div>
                  )}
                  {duration_minutes && duration_minutes > 0 && (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                        <span style={{ color: "#FF6B00", fontWeight: 600 }}>{Math.floor(todayRunDurationSec / 60)} 分</span>
                        <span style={{ color: "#888888" }}>目標 {duration_minutes} 分</span>
                      </div>
                      <div style={{ height: "6px", background: "#F0F0F0", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ height: "100%", background: "#FF6B00", borderRadius: "3px", width: `${Math.min((todayRunDurationSec / (duration_minutes * 60)) * 100, 100)}%`, transition: "width 0.4s ease" }} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 統計カード */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "20px" }}>
          {[
            { value: String(totalDistanceMonth), unit: "km", label: "今月の距離", color: "#FF6B00", icon: Route },
            { value: String(achieveRate), unit: "%", label: "達成率", color: "#111111", icon: Trophy },
            {
              value: totalPenaltyMonth >= 1000 ? `${(totalPenaltyMonth / 1000).toFixed(1)}k` : String(totalPenaltyMonth),
              unit: "円", label: "今月の罰金", color: "#EF4444", icon: CreditCard,
            },
          ].map((item, i) => (
            <div key={i} style={{ background: "white", borderRadius: "16px", padding: "16px 10px 18px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <item.icon size={16} color={item.color} style={{ margin: "0 auto 8px" }} />
              <p className="metric-value" style={{ fontSize: "30px", color: item.color, lineHeight: 1 }}>
                {item.value}<span style={{ fontSize: "13px", color: item.color, marginLeft: "1px" }}>{item.unit}</span>
              </p>
              <p style={{ fontSize: "11px", color: "#888888", marginTop: "7px" }}>{item.label}</p>
            </div>
          ))}
        </div>

        {/* 今週の目標リスト */}
        <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "10px", paddingLeft: "4px" }}>
          <CalendarDays size={13} color="#888888" />
          <p style={{ fontSize: "12px", color: "#888888", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>今週の目標</p>
        </div>

        {visibleInstances.length === 0 ? (
          <div style={{ background: "white", borderRadius: "16px", padding: "36px 20px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", marginBottom: "16px" }}>
            <p style={{ color: "#888888", fontSize: "14px", marginBottom: "16px" }}>今週の目標がありません</p>
            <Link href="/goals/new">
              <button className="btn-primary" style={{ minHeight: "44px", padding: "0 24px" }}>目標を追加する</button>
            </Link>
          </div>
        ) : (
          <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", marginBottom: "12px" }}>
            {pendingInstances.length === 0 && (
              <div style={{ padding: "24px 20px", textAlign: "center" }}>
                <p style={{ fontSize: "14px", color: "#888888" }}>今週の予定はすべて完了しました</p>
              </div>
            )}
            {pendingInstances.map((instance, idx) => {
              const isToday = instance.scheduled_date === todayStr;
              const isFuture = instance.scheduled_date > todayStr;
              const isPendingNotToday = instance.status === "pending" && !isToday;
              const isConfirmingCancel = confirmCancelId === instance.id;
              const d = new Date(instance.scheduled_date + "T00:00:00");

              return (
                <div key={instance.id} style={{ transition: "opacity 0.2s" }}>
                  {idx > 0 && <div style={{ height: "1px", background: "#F2F2F2", marginLeft: "72px" }} />}

                  {/* 取消確認バー */}
                  {isConfirmingCancel ? (
                    <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", gap: "12px", background: "#FFF5F5" }}>
                      <p style={{ flex: 1, fontSize: "14px", color: "#EF4444", fontWeight: 500 }}>
                        {d.getMonth() + 1}/{d.getDate()}({DAY_NAMES[d.getDay()]}) を取り消しますか？
                      </p>
                      <button
                        style={{ fontSize: "13px", color: "#888888", background: "none", border: "none", cursor: "pointer", padding: "4px 8px" }}
                        onClick={() => setConfirmCancelId(null)}
                      >
                        戻す
                      </button>
                      <button
                        style={{ fontSize: "13px", color: "white", background: "#EF4444", border: "none", borderRadius: "8px", padding: "6px 14px", cursor: "pointer", fontWeight: 600 }}
                        onClick={() => handleCancelInstance(instance.id)}
                        disabled={processing}
                      >
                        取り消す
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", padding: "18px 16px", opacity: isFuture && !isPendingNotToday ? 0.45 : 1 }}>
                      {/* 日付 */}
                      <div style={{ width: "44px", textAlign: "center", flexShrink: 0 }}>
                        <p className="metric-value" style={{ fontSize: "32px", color: isToday ? "#FF6B00" : "#111111", lineHeight: 1 }}>
                          {d.getDate()}
                        </p>
                        <p style={{ fontSize: "12px", color: isToday ? "#FF6B00" : "#888888", marginTop: "3px" }}>
                          {DAY_NAMES[d.getDay()]}
                        </p>
                      </div>

                      <div style={{ width: "1px", height: "42px", background: "#EBEBEB", margin: "0 14px", flexShrink: 0 }} />

                      {/* 目標内容 */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          {instance.goals?.distance_km && (
                            <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "15px", fontWeight: 600, color: "#111111" }}>
                              <MapPin size={13} color="#FF6B00" strokeWidth={2.5} />
                              {instance.goals.distance_km}km
                            </span>
                          )}
                          {instance.goals?.duration_minutes && (
                            <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "15px", fontWeight: 600, color: "#111111" }}>
                              <Clock size={13} color="#888888" strokeWidth={2.5} />
                              {instance.goals.duration_minutes}分
                            </span>
                          )}
                          {!instance.goals?.distance_km && !instance.goals?.duration_minutes && (
                            <span style={{ fontSize: "15px", fontWeight: 600, color: "#111111" }}>フリーラン</span>
                          )}
                          {isToday && (
                            <span style={{ fontSize: "10px", background: "#FF6B00", color: "white", padding: "2px 7px", borderRadius: "99px", fontWeight: 700 }}>今日</span>
                          )}
                        </div>
                        {instance.goals && (
                          <p style={{ fontSize: "12px", color: "#EF4444", marginTop: "4px" }}>
                            罰金 ¥{instance.goals.penalty_amount.toLocaleString()}
                          </p>
                        )}
                      </div>

                      {/* アクション */}
                      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                        {instance.status === "achieved" && <CheckCircle size={22} color="#22C55E" />}
                        {instance.status === "failed" && <XCircle size={22} color="#EF4444" />}
                        {instance.status === "skipped" && (
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <SkipForward size={14} color="#AAAAAA" />
                            <span style={{ fontSize: "12px", color: "#AAAAAA", fontWeight: 500 }}>スキップ済み</span>
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
                                onClick={() => setSkipTargetId(instance.id)}
                              >
                                スキップ
                              </button>
                            )}
                          </>
                        )}

                        {/* 今日以外のpending：×ボタン */}
                        {isPendingNotToday && (
                          <button
                            onClick={() => setConfirmCancelId(instance.id)}
                            style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#F2F2F2", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                          >
                            <X size={14} color="#AAAAAA" strokeWidth={2.5} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* 今週の記録トグル */}
            {historyInstances.length > 0 && (
              <>
                <div style={{ height: "1px", background: "#F2F2F2" }} />
                <button
                  onClick={() => setShowHistory((v) => !v)}
                  style={{ width: "100%", minHeight: "44px", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", background: "none", border: "none", cursor: "pointer", padding: "10px 16px" }}
                >
                  <span style={{ fontSize: "12px", color: "#AAAAAA", fontWeight: 600 }}>
                    今週の記録（{historyInstances.length}件）
                  </span>
                  {showHistory ? <ChevronUp size={14} color="#AAAAAA" /> : <ChevronDown size={14} color="#AAAAAA" />}
                </button>

                {showHistory && historyInstances.map((instance, idx) => {
                  const isToday = instance.scheduled_date === todayStr;
                  const d = new Date(instance.scheduled_date + "T00:00:00");
                  return (
                    <div key={instance.id} style={{ opacity: 0.6 }}>
                      <div style={{ height: "1px", background: "#F2F2F2", marginLeft: "72px" }} />
                      <div style={{ display: "flex", alignItems: "center", padding: "14px 16px" }}>
                        <div style={{ width: "44px", textAlign: "center", flexShrink: 0 }}>
                          <p className="metric-value" style={{ fontSize: "32px", color: isToday ? "#FF6B00" : "#111111", lineHeight: 1 }}>{d.getDate()}</p>
                          <p style={{ fontSize: "12px", color: isToday ? "#FF6B00" : "#888888", marginTop: "3px" }}>{DAY_NAMES[d.getDay()]}</p>
                        </div>
                        <div style={{ width: "1px", height: "42px", background: "#EBEBEB", margin: "0 14px", flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            {instance.goals?.distance_km && (
                              <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "15px", fontWeight: 600, color: "#111111" }}>
                                <MapPin size={13} color="#FF6B00" strokeWidth={2.5} />{instance.goals.distance_km}km
                              </span>
                            )}
                            {instance.goals?.duration_minutes && (
                              <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "15px", fontWeight: 600, color: "#111111" }}>
                                <Clock size={13} color="#888888" strokeWidth={2.5} />{instance.goals.duration_minutes}分
                              </span>
                            )}
                            {!instance.goals?.distance_km && !instance.goals?.duration_minutes && (
                              <span style={{ fontSize: "15px", fontWeight: 600, color: "#111111" }}>フリーラン</span>
                            )}
                          </div>
                        </div>
                        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                          {instance.status === "achieved" && <CheckCircle size={22} color="#22C55E" />}
                          {instance.status === "failed" && <XCircle size={22} color="#EF4444" />}
                          {instance.status === "skipped" && (
                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              <SkipForward size={14} color="#AAAAAA" />
                              <span style={{ fontSize: "12px", color: "#AAAAAA", fontWeight: 500 }}>スキップ済み</span>
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

        <p style={{ fontSize: "12px", color: "#AAAAAA", textAlign: "center", marginBottom: "20px" }}>
          今月スキップ残り <span style={{ fontWeight: 700, color: "#888888" }}>{skipRemaining}回</span>
        </p>

        <Link href="/goals/new">
          <div style={{ background: "white", borderRadius: "16px", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <span style={{ fontSize: "15px", fontWeight: 600, color: "#111111" }}>新しい目標を追加</span>
            <ChevronRight size={18} color="#AAAAAA" />
          </div>
        </Link>
      </div>
    </div>
  );
}
