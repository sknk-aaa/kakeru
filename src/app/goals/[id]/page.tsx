"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft } from "lucide-react";
import AppShell from "@/components/AppShell";

const DAYS = ["日", "月", "火", "水", "木", "金", "土"];

interface Goal {
  id: string;
  type: "recurring" | "oneoff";
  days_of_week: number[] | null;
  scheduled_date: string | null;
  distance_km: number | null;
  duration_minutes: number | null;
  penalty_amount: number;
}

function ListRow({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", padding: "14px 16px", gap: "12px" }}>
        <span style={{ fontSize: "15px", color: "#111111", fontWeight: 500, width: "80px", flexShrink: 0 }}>{label}</span>
        <div style={{ flex: 1 }}>{children}</div>
      </div>
      {!last && <div style={{ height: "1px", background: "#F2F2F2", marginLeft: "16px" }} />}
    </>
  );
}

export default function GoalEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [todayStr] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [goal, setGoal] = useState<Goal | null>(null);
  const [distanceKm, setDistanceKm] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [penaltyAmount, setPenaltyAmount] = useState("");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [hasTodayInstance, setHasTodayInstance] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.from("goals").select("*").eq("id", id).single().then(({ data }) => {
      if (!data) return;
      setGoal(data as Goal);
      setDistanceKm(data.distance_km ? String(data.distance_km) : "");
      setDurationMinutes(data.duration_minutes ? String(data.duration_minutes) : "");
      setPenaltyAmount(String(data.penalty_amount));
      setSelectedDays(data.days_of_week ?? []);
    });

    supabase.from("goal_instances")
      .select("id")
      .eq("goal_id", id)
      .eq("scheduled_date", todayStr)
      .eq("status", "pending")
      .maybeSingle()
      .then(({ data }) => setHasTodayInstance(!!data));
  }, [id]);

  function toggleDay(day: number) {
    setSelectedDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  }

  async function handleSave() {
    setLoading(true);
    setError(null);
    if (!distanceKm && !durationMinutes) { setError("距離または時間を入力してください"); setLoading(false); return; }
    if (parseInt(penaltyAmount) < 100) { setError("罰金は100円以上で入力してください"); setLoading(false); return; }

    const res = await fetch(`/api/goals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        distance_km: distanceKm || null,
        duration_minutes: durationMinutes || null,
        penalty_amount: penaltyAmount,
        ...(goal?.type === "recurring" ? { days_of_week: selectedDays } : {}),
      }),
    });
    if (!res.ok) { setError("保存に失敗しました"); setLoading(false); return; }
    setSaved(true);
    setLoading(false);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/goals/${id}`, { method: "DELETE" });
    router.push("/goals");
  }

  if (!goal) {
    return (
      <AppShell>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "50vh" }}>
          <p style={{ color: "#AAAAAA" }}>読み込み中...</p>
        </div>
      </AppShell>
    );
  }

  const isLockedToday =
    (goal.type === "oneoff" && goal.scheduled_date === todayStr) ||
    (goal.type === "recurring" && hasTodayInstance);

  const inputStyle = {
    border: "none",
    outline: "none",
    fontSize: "15px",
    color: "#111111",
    background: "transparent",
    width: "100%",
    textAlign: "right" as const,
  };

  return (
    <AppShell>
      <div>
        <div style={{ padding: "20px 20px 12px", display: "flex", alignItems: "center", gap: "4px" }}>
          <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: "#FF6B00", fontSize: "15px", fontWeight: 500 }}>
            <ChevronLeft size={20} color="#FF6B00" /> 目標
          </button>
        </div>

        <div style={{ padding: "0 16px 24px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111111", marginBottom: "6px" }}>目標を編集</h1>
          <p style={{ fontSize: "13px", color: "#AAAAAA", marginBottom: "20px" }}>
            {goal.type === "recurring" ? "毎週繰り返し" : "1回のみ"}
          </p>

          {/* 曜日選択（繰り返しのみ） */}
          {goal.type === "recurring" && (
            <div style={{ marginBottom: "16px" }}>
              <p style={{ fontSize: "12px", color: "#888888", fontWeight: 600, marginBottom: "8px", paddingLeft: "4px" }}>実施する曜日</p>
              <div style={{ display: "flex", gap: "6px" }}>
                {DAYS.map((day, i) => (
                  <button
                    key={i}
                    onClick={() => toggleDay(i)}
                    style={{
                      flex: 1, height: "44px", borderRadius: "10px", fontSize: "14px", fontWeight: 700,
                      background: selectedDays.includes(i) ? "#FF6B00" : "white",
                      color: selectedDays.includes(i) ? "white" : "#888888",
                      border: "none", cursor: "pointer",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                      transition: "all 0.15s",
                    }}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: "11px", color: "#AAAAAA", marginTop: "6px", paddingLeft: "4px" }}>
                ※曜日の変更は既存のスケジュールには反映されません
              </p>
            </div>
          )}

          {/* 目標・罰金 */}
          <p style={{ fontSize: "12px", color: "#888888", fontWeight: 600, marginBottom: "8px", paddingLeft: "4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            目標・罰金
          </p>
          <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", marginBottom: "20px" }}>
            <ListRow label="距離 (km)">
              <input type="number" inputMode="decimal" placeholder="例: 5" min="0.1" step="0.1"
                value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)} style={inputStyle} disabled={isLockedToday} />
            </ListRow>
            <ListRow label="時間 (分)">
              <input type="number" inputMode="numeric" placeholder="例: 30" min="1"
                value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} style={inputStyle} disabled={isLockedToday} />
            </ListRow>
            <ListRow label="罰金 (円)" last>
              <input type="number" inputMode="numeric" placeholder="500" min="100" step="100"
                value={penaltyAmount} onChange={(e) => setPenaltyAmount(e.target.value)}
                style={{ ...inputStyle, color: "#EF4444" }} disabled={isLockedToday} />
            </ListRow>
          </div>

          {/* 保存ボタン：ロック中は非表示 */}
          {isLockedToday ? (
            <div style={{ background: "#F8F8F8", borderRadius: "12px", padding: "16px 20px", textAlign: "center", marginBottom: "12px" }}>
              <p style={{ fontSize: "14px", color: "#888888" }}>当日の目標は変更できません</p>
            </div>
          ) : (
            <>
              {error && <p style={{ fontSize: "14px", color: "#EF4444", marginBottom: "12px" }}>{error}</p>}
              <button
                className="btn-primary"
                style={{ width: "100%", marginBottom: "12px", background: saved ? "#22C55E" : undefined }}
                onClick={handleSave}
                disabled={loading}
              >
                {saved ? "保存しました ✓" : loading ? "保存中..." : "変更を保存する"}
              </button>
            </>
          )}

          {/* 停止ボタン：oneoffのロック中のみ非表示、recurringは当日でも停止可 */}
          {!(isLockedToday && goal.type === "oneoff") && (
            !showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                style={{ width: "100%", minHeight: "52px", background: "white", border: "1.5px solid #EF4444", borderRadius: "8px", color: "#EF4444", fontSize: "16px", fontWeight: 600, cursor: "pointer" }}
              >
                この目標を停止する
              </button>
            ) : (
              <div style={{ background: "white", borderRadius: "16px", padding: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <p style={{ fontSize: "14px", color: "#111111", fontWeight: 600, marginBottom: "6px" }}>本当に停止しますか？</p>
                <p style={{ fontSize: "13px", color: "#888888", lineHeight: 1.6, marginBottom: hasTodayInstance ? "8px" : "14px" }}>
                  明日以降のスケジュールがキャンセルされます。過去の記録は残ります。
                </p>
                {hasTodayInstance && (
                  <div style={{ background: "#FFF5EE", borderRadius: "10px", padding: "10px 12px", marginBottom: "14px", borderLeft: "3px solid #FF6B00" }}>
                    <p style={{ fontSize: "13px", color: "#FF6B00", fontWeight: 600 }}>
                      ⚠️ 今日の目標は残ります
                    </p>
                    <p style={{ fontSize: "12px", color: "#888888", marginTop: "2px" }}>
                      今日分はスキップか達成が必要です
                    </p>
                  </div>
                )}
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    className="btn-secondary"
                    style={{ flex: 1, minHeight: "48px" }}
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    やめる
                  </button>
                  <button
                    style={{ flex: 1, minHeight: "48px", background: "#EF4444", color: "white", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: 700, cursor: "pointer" }}
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? "停止中..." : "停止する"}
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </AppShell>
  );
}
