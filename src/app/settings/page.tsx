"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { User, Weight, Target, CreditCard, LogOut, ChevronRight, Check } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [monthlyGoal, setMonthlyGoal] = useState("");
  const [hasCard, setHasCard] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setEmail(user.email ?? "");
      supabase
        .from("users")
        .select("weight_kg, monthly_distance_goal_km, stripe_payment_method_id")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.weight_kg) setWeightKg(String(data.weight_kg));
          if (data?.monthly_distance_goal_km) setMonthlyGoal(String(data.monthly_distance_goal_km));
          setHasCard(!!data?.stripe_payment_method_id);
        });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("users").update({
      weight_kg: weightKg ? parseFloat(weightKg) : null,
      monthly_distance_goal_km: monthlyGoal ? parseFloat(monthlyGoal) : null,
    }).eq("id", user.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth");
  }

  return (
    <AppShell>
      <div className="px-4 pt-12 pb-4">
        <h1 className="metric-value text-3xl text-[#111111] mb-6">設定</h1>

        {/* プロフィール */}
        <div className="mb-4">
          <p className="text-xs text-[#888888] font-medium mb-2 flex items-center gap-1.5">
            <User size={13} /> プロフィール
          </p>
          <div className="card">
            <p className="text-sm text-[#888888]">メールアドレス</p>
            <p className="text-[15px] font-medium text-[#111111] mt-0.5">{email}</p>
          </div>
        </div>

        {/* 体重 */}
        <div className="mb-4">
          <p className="text-xs text-[#888888] font-medium mb-2 flex items-center gap-1.5">
            <Weight size={13} /> 体重（カロリー計算用）
          </p>
          <div className="card">
            <div className="flex items-center gap-3">
              <input
                className="input flex-1"
                type="number"
                inputMode="decimal"
                placeholder="例: 65"
                min="30"
                max="200"
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
              />
              <span className="text-[#888888] shrink-0">kg</span>
            </div>
          </div>
        </div>

        {/* 月間目標 */}
        <div className="mb-4">
          <p className="text-xs text-[#888888] font-medium mb-2 flex items-center gap-1.5">
            <Target size={13} /> 月間目標距離（任意）
          </p>
          <div className="card">
            <div className="flex items-center gap-3">
              <input
                className="input flex-1"
                type="number"
                inputMode="decimal"
                placeholder="例: 100"
                min="1"
                step="1"
                value={monthlyGoal}
                onChange={(e) => setMonthlyGoal(e.target.value)}
              />
              <span className="text-[#888888] shrink-0">km/月</span>
            </div>
          </div>
        </div>

        {/* 保存ボタン */}
        <button
          className="btn-primary w-full mb-6 gap-2"
          onClick={handleSave}
          disabled={saving}
        >
          {saved ? <><Check size={16} />保存しました</> : saving ? "保存中..." : "変更を保存"}
        </button>

        {/* クレカ */}
        <div className="mb-4">
          <p className="text-xs text-[#888888] font-medium mb-2 flex items-center gap-1.5">
            <CreditCard size={13} /> 支払い方法
          </p>
          <button
            className="card w-full flex items-center justify-between py-3"
            onClick={() => router.push("/auth/card")}
          >
            <div className="flex items-center gap-3">
              <CreditCard size={18} color={hasCard ? "#22C55E" : "#888888"} />
              <span className="text-sm font-medium">
                {hasCard ? "クレジットカード登録済み" : "クレジットカードを登録する"}
              </span>
            </div>
            <ChevronRight size={16} color="#888888" />
          </button>
        </div>

        {/* ログアウト */}
        <button
          className="w-full flex items-center gap-3 py-4 text-[#EF4444]"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">ログアウト</span>
        </button>
      </div>
    </AppShell>
  );
}
