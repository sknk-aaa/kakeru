"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { User, Weight, Target, CreditCard, LogOut, ChevronRight, Check, CheckCircle, KeyRound } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [monthlyGoal, setMonthlyGoal] = useState("");
  const [hasCard, setHasCard] = useState(false);
  const [cardInfo, setCardInfo] = useState<{ brand: string; last4: string } | null>(null);
  const [isEmailUser, setIsEmailUser] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setEmail(user.email ?? "");
      setIsEmailUser(user.app_metadata?.provider === "email");
      supabase
        .from("users")
        .select("weight_kg, monthly_distance_goal_km, stripe_payment_method_id")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.weight_kg) setWeightKg(String(data.weight_kg));
          if (data?.monthly_distance_goal_km) setMonthlyGoal(String(data.monthly_distance_goal_km));
          if (data?.stripe_payment_method_id) {
            setHasCard(true);
            fetch("/api/stripe/payment-method")
              .then((r) => r.json())
              .then((d) => { if (d.card) setCardInfo(d.card); });
          }
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

  async function handleChangePassword() {
    if (newPassword.length < 8) { setPwError("8文字以上で入力してください"); return; }
    if (newPassword !== confirmPassword) { setPwError("パスワードが一致しません"); return; }
    setChangingPw(true);
    setPwError(null);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPwError(error.message);
    } else {
      setPwSaved(true);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setPwSaved(false);
        setShowPasswordForm(false);
      }, 1500);
    }
    setChangingPw(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth");
  }

  return (
    <AppShell>
      <div
        style={{
          position: "sticky", top: 0, zIndex: 10,
          background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)",
          borderBottom: "1px solid #E5E5E5",
          padding: "0 16px", height: "54px",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <h1 style={{ fontSize: "17px", fontWeight: 700, color: "#111111" }}>設定</h1>
      </div>
      <div className="px-4 pt-4 pb-4">

        {/* プロフィール */}
        <div className="mb-4">
          <p className="text-xs text-[#888888] font-medium mb-2 flex items-center gap-1.5">
            <User size={13} /> プロフィール
          </p>
          <div className="card">
            <p className="text-sm text-[#888888]">メールアドレス</p>
            <p className="text-[15px] font-medium text-[#111111] mt-0.5">{email}</p>
            {isEmailUser && (
              <div className="border-t border-[#F2F2F2] mt-4 pt-4">
                {!showPasswordForm ? (
                  <button
                    className="flex items-center gap-1.5 text-sm text-[#888888]"
                    onClick={() => setShowPasswordForm(true)}
                  >
                    <KeyRound size={13} /> パスワードを変更する
                  </button>
                ) : (
                  <>
                    <p className="text-sm text-[#888888] flex items-center gap-1.5 mb-3">
                      <KeyRound size={13} /> パスワード変更
                    </p>
                    <div className="flex flex-col gap-2">
                      <input
                        className="input"
                        type="password"
                        placeholder="新しいパスワード（8文字以上）"
                        value={newPassword}
                        onChange={(e) => { setNewPassword(e.target.value); setPwError(null); }}
                        autoComplete="new-password"
                      />
                      <input
                        className="input"
                        type="password"
                        placeholder="新しいパスワード（確認）"
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setPwError(null); }}
                        autoComplete="new-password"
                      />
                    </div>
                    {pwError && <p className="text-[#EF4444] text-sm mt-2">{pwError}</p>}
                    <div className="flex gap-2 mt-3">
                      <button
                        className="btn-primary flex-1 gap-2"
                        onClick={handleChangePassword}
                        disabled={changingPw || !newPassword || !confirmPassword}
                      >
                        {pwSaved ? <><Check size={16} />変更しました</> : changingPw ? "変更中..." : "変更する"}
                      </button>
                      <button
                        className="px-4 py-3 text-sm text-[#888888] border border-[#E5E5E5] rounded-lg"
                        onClick={() => { setShowPasswordForm(false); setNewPassword(""); setConfirmPassword(""); setPwError(null); }}
                      >
                        キャンセル
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
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
          {hasCard ? (
            <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              {/* 登録済み表示 */}
              <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", borderRadius: "14px", margin: "12px", padding: "18px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <CheckCircle size={15} color="#22C55E" />
                    <span style={{ fontSize: "11px", color: "#22C55E", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>登録済み</span>
                  </div>
                  <CreditCard size={22} color="rgba(255,255,255,0.5)" />
                </div>
                <p style={{ fontSize: "20px", color: "white", fontWeight: 600, letterSpacing: "0.12em", fontFamily: "monospace" }}>
                  •••• •••• •••• {cardInfo?.last4 ?? "····"}
                </p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "6px", textTransform: "capitalize" }}>
                  {cardInfo?.brand ?? ""}
                </p>
              </div>
              {/* 変更ボタン */}
              <button
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", background: "none", border: "none", cursor: "pointer", borderTop: "1px solid #F2F2F2" }}
                onClick={() => router.push("/auth/card")}
              >
                <span style={{ fontSize: "14px", color: "#888888" }}>カードを変更する</span>
                <ChevronRight size={16} color="#CCCCCC" />
              </button>
            </div>
          ) : (
            <button
              className="card w-full flex items-center justify-between py-3"
              onClick={() => router.push("/auth/card")}
            >
              <div className="flex items-center gap-3">
                <CreditCard size={18} color="#888888" />
                <span className="text-sm font-medium">クレジットカードを登録する</span>
              </div>
              <ChevronRight size={16} color="#888888" />
            </button>
          )}
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
