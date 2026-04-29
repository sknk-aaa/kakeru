"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { User, Weight, Target, CreditCard, LogOut, ChevronRight, Check, CheckCircle, KeyRound, Bell, MapPin } from "lucide-react";

const sectionLabel: React.CSSProperties = {
  fontSize: "11px", color: "#999999", fontWeight: 700,
  letterSpacing: "0.14em", textTransform: "uppercase",
  marginBottom: "10px", paddingLeft: "2px",
  display: "flex", alignItems: "center", gap: "5px",
};

const cardStyle: React.CSSProperties = {
  background: "white", borderRadius: "22px",
  boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
  overflow: "hidden",
};

export default function SettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [monthlyGoal, setMonthlyGoal] = useState("");
  const [hasCard, setHasCard] = useState(false);
  const [cardInfo, setCardInfo] = useState<{ brand: string; last4: string } | null>(null);
  const [notifyMorning, setNotifyMorning] = useState(true);
  const [notifyEvening, setNotifyEvening] = useState(true);
  const [isEmailUser, setIsEmailUser] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [cityName, setCityName] = useState("");
  const [locationLat, setLocationLat] = useState<number | null>(null);
  const [locationLng, setLocationLng] = useState<number | null>(null);
  const [cityQuery, setCityQuery] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<{ name: string; admin1: string; latitude: number; longitude: number }[]>([]);
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
        .select("weight_kg, monthly_distance_goal_km, stripe_payment_method_id, notify_morning, notify_evening, city_name, location_lat, location_lng")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.weight_kg) setWeightKg(String(data.weight_kg));
          if (data?.monthly_distance_goal_km) setMonthlyGoal(String(data.monthly_distance_goal_km));
          if (data?.notify_morning != null) setNotifyMorning(data.notify_morning);
          if (data?.notify_evening != null) setNotifyEvening(data.notify_evening);
          if (data?.city_name) setCityName(data.city_name);
          if (data?.location_lat) setLocationLat(data.location_lat);
          if (data?.location_lng) setLocationLng(data.location_lng);
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
      city_name: cityName || null,
      location_lat: locationLat,
      location_lng: locationLng,
      prefecture: null,
    }).eq("id", user.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  useEffect(() => {
    if (!cityQuery.trim()) { setCitySuggestions([]); return; }
    const timer = setTimeout(async () => {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityQuery)}&count=5&language=ja&countryCode=JP`);
      const data = await res.json();
      setCitySuggestions(data.results ?? []);
    }, 300);
    return () => clearTimeout(timer);
  }, [cityQuery]);

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

  async function handleToggleNotify(field: "notify_morning" | "notify_evening", value: boolean) {
    if (field === "notify_morning") setNotifyMorning(value);
    else setNotifyEvening(value);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("users").update({ [field]: value }).eq("id", user.id);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth");
  }

  return (
    <AppShell>
      {/* ヘッダー */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "rgba(255,255,255,0.94)", backdropFilter: "blur(14px)",
        borderBottom: "1px solid #EBEBEB",
        padding: "0 16px 0 56px", height: "54px",
        display: "flex", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Image src="/stickman-assets/stickman-01.png" alt="" width={24} height={24} style={{ objectFit: "contain" }} priority />
          <span style={{ fontFamily: "var(--font-display)", fontSize: "21px", fontWeight: 900, fontStyle: "italic", color: "#FF6B00", letterSpacing: "0.06em" }}>KAKERU</span>
        </div>
      </div>

      <div style={{ padding: "16px 14px 100px", background: "linear-gradient(180deg, #FFFFFF 0%, #FFF9F5 46%, #F7F7FA 100%)", minHeight: "100vh" }}>

        {/* ─── プロフィール ─── */}
        <p style={sectionLabel}><User size={12} />プロフィール</p>
        <div style={{ ...cardStyle, marginBottom: "14px" }}>
          <div style={{ padding: "18px 18px 16px" }}>
            <p style={{ fontSize: "11px", color: "#BBBBBB", fontWeight: 600, marginBottom: "4px" }}>メールアドレス</p>
            <p style={{ fontSize: "15px", fontWeight: 600, color: "#111111" }}>{email}</p>
          </div>
          {isEmailUser && (
            <>
              <div style={{ height: "1px", background: "#F5F5F5" }} />
              {!showPasswordForm ? (
                <button
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: "6px", padding: "16px 18px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
                  onClick={() => setShowPasswordForm(true)}
                >
                  <KeyRound size={13} color="#888888" />
                  <span style={{ fontSize: "14px", color: "#888888" }}>パスワードを変更する</span>
                </button>
              ) : (
                <div style={{ padding: "16px 18px" }}>
                  <p style={{ fontSize: "13px", color: "#888888", fontWeight: 600, display: "flex", alignItems: "center", gap: "5px", marginBottom: "12px" }}>
                    <KeyRound size={13} />パスワード変更
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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
                  {pwError && <p style={{ fontSize: "13px", color: "#EF4444", marginTop: "8px" }}>{pwError}</p>}
                  <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                    <button
                      className="btn-primary"
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                      onClick={handleChangePassword}
                      disabled={changingPw || !newPassword || !confirmPassword}
                    >
                      {pwSaved ? <><Check size={16} />変更しました</> : changingPw ? "変更中..." : "変更する"}
                    </button>
                    <button
                      style={{ padding: "0 16px", fontSize: "14px", color: "#888888", border: "1px solid #E5E5E5", borderRadius: "12px", background: "white", cursor: "pointer" }}
                      onClick={() => { setShowPasswordForm(false); setNewPassword(""); setConfirmPassword(""); setPwError(null); }}
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ─── 体重 ─── */}
        <p style={sectionLabel}><Weight size={12} />体重（カロリー計算用）</p>
        <div style={{ ...cardStyle, padding: "14px 18px", marginBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              className="input"
              style={{ flex: 1 }}
              type="number"
              inputMode="decimal"
              placeholder="例: 65"
              min="30"
              max="200"
              step="0.1"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
            />
            <span style={{ fontSize: "14px", color: "#888888", fontWeight: 600, flexShrink: 0 }}>kg</span>
          </div>
        </div>

        {/* ─── 月間目標 ─── */}
        <p style={sectionLabel}><Target size={12} />月間目標距離（任意）</p>
        <div style={{ ...cardStyle, padding: "14px 18px", marginBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              className="input"
              style={{ flex: 1 }}
              type="number"
              inputMode="decimal"
              placeholder="例: 100"
              min="1"
              step="1"
              value={monthlyGoal}
              onChange={(e) => setMonthlyGoal(e.target.value)}
            />
            <span style={{ fontSize: "14px", color: "#888888", fontWeight: 600, flexShrink: 0 }}>km/月</span>
          </div>
        </div>

        {/* ─── 地域 ─── */}
        <p style={sectionLabel}><MapPin size={12} />地域（雨の日スキップ用）</p>
        <div style={{ marginBottom: "14px", position: "relative" }}>
          {cityName && !cityQuery ? (
            <div style={{ ...cardStyle, padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: "15px", color: "#111111", fontWeight: 600 }}>{cityName}</p>
                <p style={{ fontSize: "11px", color: "#CCCCCC", marginTop: "2px" }}>設定済み</p>
              </div>
              <button
                style={{ fontSize: "13px", color: "#FF6B00", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}
                onClick={() => { setCityName(""); setLocationLat(null); setLocationLng(null); }}
              >
                変更する
              </button>
            </div>
          ) : (
            <>
              <div style={{ ...cardStyle, padding: "0" }}>
                <input
                  style={{ width: "100%", padding: "16px 18px", fontSize: "15px", border: "none", outline: "none", background: "transparent", boxSizing: "border-box" }}
                  type="text"
                  placeholder="市区町村名を入力（例: 渋谷区）"
                  value={cityQuery}
                  onChange={(e) => setCityQuery(e.target.value)}
                />
              </div>
              {citySuggestions.length > 0 && (
                <div style={{ position: "absolute", zIndex: 10, width: "100%", marginTop: "4px", background: "white", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", overflow: "hidden" }}>
                  {citySuggestions.map((s, i) => (
                    <button
                      key={i}
                      style={{ width: "100%", textAlign: "left", padding: "14px 18px", fontSize: "14px", borderTop: i > 0 ? "1px solid #F5F5F5" : "none", background: "none", border: "none", borderTopColor: "#F5F5F5", cursor: "pointer" }}
                      onClick={() => {
                        setCityName(s.name);
                        setLocationLat(s.latitude);
                        setLocationLng(s.longitude);
                        setCityQuery("");
                        setCitySuggestions([]);
                      }}
                    >
                      <span style={{ color: "#111111", fontWeight: 600 }}>{s.name}</span>
                      {s.admin1 && <span style={{ color: "#AAAAAA", fontSize: "12px", marginLeft: "8px" }}>{s.admin1}</span>}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* 保存ボタン */}
        <button
          className="btn-primary"
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "24px" }}
          onClick={handleSave}
          disabled={saving}
        >
          {saved ? <><Check size={16} />保存しました</> : saving ? "保存中..." : "変更を保存"}
        </button>

        {/* ─── メール通知 ─── */}
        <p style={sectionLabel}><Bell size={12} />メール通知</p>
        <div style={{ ...cardStyle, marginBottom: "14px" }}>
          {(
            [
              { field: "notify_morning", label: "朝のリマインダー（8時）", value: notifyMorning },
              { field: "notify_evening", label: "夜のリマインダー（22時）", value: notifyEvening },
            ] as const
          ).map(({ field, label, value }, i) => (
            <div
              key={field}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "18px 18px",
                borderTop: i > 0 ? "1px solid #F5F5F5" : "none",
              }}
            >
              <span style={{ fontSize: "15px", color: "#111111" }}>{label}</span>
              <button
                role="switch"
                aria-checked={value}
                onClick={() => handleToggleNotify(field, !value)}
                style={{
                  position: "relative", flexShrink: 0,
                  width: "48px", height: "28px", borderRadius: "99px",
                  background: value ? "#FF6B00" : "#E5E5E5",
                  border: "none", cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                <span style={{
                  position: "absolute", top: "2px", left: "2px",
                  width: "24px", height: "24px",
                  background: "white", borderRadius: "50%",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  transition: "transform 0.2s",
                  transform: value ? "translateX(20px)" : "translateX(0)",
                }} />
              </button>
            </div>
          ))}
        </div>

        {/* ─── 支払い方法 ─── */}
        <p style={sectionLabel}><CreditCard size={12} />支払い方法</p>
        <div style={{ marginBottom: "14px" }}>
          {hasCard ? (
            <div style={{ ...cardStyle }}>
              <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", borderRadius: "18px", margin: "12px", padding: "18px 20px" }}>
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
              <button
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", background: "none", border: "none", borderTop: "1px solid #F5F5F5", cursor: "pointer" }}
                onClick={() => router.push("/auth/card")}
              >
                <span style={{ fontSize: "14px", color: "#888888" }}>カードを変更する</span>
                <ChevronRight size={16} color="#CCCCCC" />
              </button>
            </div>
          ) : (
            <div style={{ ...cardStyle }}>
              <button
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 18px", background: "none", border: "none", cursor: "pointer" }}
                onClick={() => router.push("/auth/card")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <CreditCard size={18} color="#888888" />
                  <span style={{ fontSize: "14px", color: "#111111", fontWeight: 500 }}>クレジットカードを登録する</span>
                </div>
                <ChevronRight size={16} color="#CCCCCC" />
              </button>
            </div>
          )}
        </div>

        {/* ─── ログアウト ─── */}
        <button
          style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "16px 4px", background: "none", border: "none", cursor: "pointer" }}
          onClick={handleLogout}
        >
          <LogOut size={18} color="#EF4444" />
          <span style={{ fontSize: "14px", color: "#EF4444", fontWeight: 500 }}>ログアウト</span>
        </button>
      </div>
    </AppShell>
  );
}
