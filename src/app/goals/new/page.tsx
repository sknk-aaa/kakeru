"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, Calendar, Repeat } from "lucide-react";
import AppShell from "@/components/AppShell";

const DAYS = ["日", "月", "火", "水", "木", "金", "土"];

type GoalType = "recurring" | "oneoff";

export default function NewGoalPage() {
  const router = useRouter();
  const [type, setType] = useState<GoalType>("recurring");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [scheduledDate, setScheduledDate] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [penaltyAmount, setPenaltyAmount] = useState("500");
  const [step, setStep] = useState<"form" | "confirm">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleDay(day: number) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function validate() {
    if (type === "recurring" && selectedDays.length === 0) {
      setError("曜日を1つ以上選択してください");
      return false;
    }
    if (type === "oneoff" && !scheduledDate) {
      setError("日付を選択してください");
      return false;
    }
    if (!distanceKm && !durationMinutes) {
      setError("距離または時間のどちらかを入力してください");
      return false;
    }
    if (distanceKm && parseFloat(distanceKm) < 0.1) {
      setError("距離は0.1km以上で入力してください");
      return false;
    }
    if (durationMinutes && parseInt(durationMinutes) < 1) {
      setError("時間は1分以上で入力してください");
      return false;
    }
    if (!penaltyAmount || parseInt(penaltyAmount) < 100) {
      setError("罰金は100円以上で入力してください");
      return false;
    }
    return true;
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }

    const today = new Date().toISOString().split("T")[0];

    const { data: goal, error: goalError } = await supabase
      .from("goals")
      .insert({
        user_id: user.id,
        type,
        days_of_week: type === "recurring" ? selectedDays : null,
        scheduled_date: type === "oneoff" ? scheduledDate : null,
        distance_km: distanceKm ? parseFloat(distanceKm) : null,
        duration_minutes: durationMinutes ? parseInt(durationMinutes) : null,
        penalty_amount: parseInt(penaltyAmount),
        is_active: true,
      })
      .select()
      .single();

    if (goalError || !goal) {
      setError("保存に失敗しました");
      setLoading(false);
      return;
    }

    // goal_instancesを生成
    const instancesToCreate: {
      goal_id: string;
      user_id: string;
      scheduled_date: string;
      status: string;
    }[] = [];

    if (type === "recurring") {
      // 今日から4週間分を生成
      for (let i = 0; i < 28; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        if (selectedDays.includes(d.getDay())) {
          instancesToCreate.push({
            goal_id: goal.id,
            user_id: user.id,
            scheduled_date: d.toISOString().split("T")[0],
            status: d.toISOString().split("T")[0] === today ? "pending" : "pending",
          });
        }
      }
    } else {
      instancesToCreate.push({
        goal_id: goal.id,
        user_id: user.id,
        scheduled_date: scheduledDate,
        status: "pending",
      });
    }

    if (instancesToCreate.length > 0) {
      await supabase.from("goal_instances").insert(instancesToCreate);
    }

    router.push("/");
  }

  const dayNames = type === "recurring" && selectedDays.length > 0
    ? selectedDays.sort().map((d) => DAYS[d]).join("・")
    : "";

  if (step === "confirm") {
    return (
      <AppShell>
        <div className="px-4 pt-12 pb-4">
          <button className="flex items-center gap-1 text-[#888888] mb-6" onClick={() => setStep("form")}>
            <ChevronLeft size={18} /> 戻る
          </button>
          <h1 className="text-2xl font-bold mb-6">確認</h1>

          <div className="card mb-4">
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-[#888888] text-sm">種類</dt>
                <dd className="text-sm font-medium">{type === "recurring" ? "繰り返し" : "1回のみ"}</dd>
              </div>
              {type === "recurring" && (
                <div className="flex justify-between">
                  <dt className="text-[#888888] text-sm">曜日</dt>
                  <dd className="text-sm font-medium">毎週 {dayNames}</dd>
                </div>
              )}
              {type === "oneoff" && (
                <div className="flex justify-between">
                  <dt className="text-[#888888] text-sm">日付</dt>
                  <dd className="text-sm font-medium">{scheduledDate}</dd>
                </div>
              )}
              {distanceKm && (
                <div className="flex justify-between">
                  <dt className="text-[#888888] text-sm">距離</dt>
                  <dd className="text-sm font-medium">{distanceKm}km</dd>
                </div>
              )}
              {durationMinutes && (
                <div className="flex justify-between">
                  <dt className="text-[#888888] text-sm">時間</dt>
                  <dd className="text-sm font-medium">{durationMinutes}分</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-[#888888] text-sm">罰金</dt>
                <dd className="text-sm font-bold text-[#EF4444]">¥{parseInt(penaltyAmount).toLocaleString()}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-[#FFF0E5] border border-[#FFDCC4] rounded-xl p-3 mb-6">
            <p className="text-xs text-[#FF6B00] leading-relaxed">
              ⚠️ 未達成の場合はクレジットカードから自動で引き落とされます
            </p>
          </div>

          {error && <p className="text-[#EF4444] text-sm mb-4">{error}</p>}

          <button className="btn-primary w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? "設定中..." : "目標を設定する"}
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="px-4 pt-12 pb-4">
        <button className="flex items-center gap-1 text-[#888888] mb-6" onClick={() => router.back()}>
          <ChevronLeft size={18} /> 戻る
        </button>
        <h1 className="text-2xl font-bold mb-6">目標を設定</h1>

        {/* 種類選択 */}
        <div className="mb-5">
          <p className="text-sm font-semibold text-[#888888] mb-2">設定タイプ</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "recurring" as GoalType, label: "曜日を指定する", icon: Repeat },
              { value: "oneoff" as GoalType, label: "特定の日を指定する", icon: Calendar },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setType(value)}
                className="card flex items-center gap-2 py-3 transition-all"
                style={{
                  borderColor: type === value ? "#FF6B00" : "#E5E5E5",
                  backgroundColor: type === value ? "#FFF5EE" : "white",
                }}
              >
                <Icon size={16} color={type === value ? "#FF6B00" : "#888888"} />
                <span
                  className="text-sm font-medium"
                  style={{ color: type === value ? "#FF6B00" : "#111111" }}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 曜日選択 */}
        {type === "recurring" && (
          <div className="mb-5">
            <p className="text-sm font-semibold text-[#888888] mb-2">実施する曜日</p>
            <div className="flex gap-1.5">
              {DAYS.map((day, i) => (
                <button
                  key={i}
                  onClick={() => toggleDay(i)}
                  className="flex-1 h-11 rounded-lg text-sm font-bold transition-all"
                  style={{
                    backgroundColor: selectedDays.includes(i) ? "#FF6B00" : "#F0F0F0",
                    color: selectedDays.includes(i) ? "white" : "#888888",
                  }}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 日付選択 */}
        {type === "oneoff" && (
          <div className="mb-5">
            <p className="text-sm font-semibold text-[#888888] mb-2">実施する日</p>
            <input
              className="input"
              type="date"
              value={scheduledDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
          </div>
        )}

        {/* 距離・時間 */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div>
            <p className="text-sm font-semibold text-[#888888] mb-2">距離（km）</p>
            <input
              className="input"
              type="number"
              inputMode="decimal"
              placeholder="例: 5"
              min="0.1"
              step="0.1"
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value)}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#888888] mb-2">時間（分）</p>
            <input
              className="input"
              type="number"
              inputMode="numeric"
              placeholder="例: 30"
              min="1"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
            />
          </div>
        </div>
        <p className="text-xs text-[#888888] -mt-3 mb-5">どちらか一方でも両方でもOK</p>

        {/* 罰金 */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-[#888888] mb-2">罰金額（円）</p>
          <input
            className="input"
            type="number"
            inputMode="numeric"
            placeholder="最低100円"
            min="100"
            step="100"
            value={penaltyAmount}
            onChange={(e) => setPenaltyAmount(e.target.value)}
          />
          <p className="text-xs text-[#888888] mt-1">最低100円</p>
        </div>

        {error && <p className="text-[#EF4444] text-sm mb-4">{error}</p>}

        <button
          className="btn-primary w-full"
          onClick={() => {
            setError(null);
            if (validate()) setStep("confirm");
          }}
        >
          確認する
        </button>
      </div>
    </AppShell>
  );
}
