"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.258c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.712A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.712V4.956H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.044l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.956L3.964 7.288C4.672 5.161 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const RunnerIllustration = () => (
  <svg viewBox="0 0 160 200" width="150" height="190" style={{ overflow: "visible", display: "block" }}>
    {/* ¥ speech bubble */}
    <circle cx="133" cy="25" r="22" fill="#FF6B00" />
    <text x="133" y="33" textAnchor="middle" fill="white" fontSize="22" fontWeight="900">¥</text>
    <polygon points="118,38 100,60 122,44" fill="#FF6B00" />
    {/* head */}
    <circle cx="74" cy="40" r="17" fill="#FF6B00" />
    {/* torso */}
    <line x1="74" y1="57" x2="66" y2="100" stroke="#FF6B00" strokeWidth="11" strokeLinecap="round" />
    {/* arm back */}
    <line x1="70" y1="68" x2="40" y2="60" stroke="#FF6B00" strokeWidth="10" strokeLinecap="round" />
    {/* arm front */}
    <line x1="70" y1="68" x2="96" y2="84" stroke="#FF6B00" strokeWidth="10" strokeLinecap="round" />
    {/* leg back */}
    <line x1="66" y1="100" x2="40" y2="135" stroke="#FF6B00" strokeWidth="10" strokeLinecap="round" />
    <line x1="40" y1="135" x2="28" y2="165" stroke="#FF6B00" strokeWidth="10" strokeLinecap="round" />
    {/* leg front */}
    <line x1="66" y1="100" x2="90" y2="128" stroke="#FF6B00" strokeWidth="10" strokeLinecap="round" />
    <line x1="90" y1="128" x2="76" y2="158" stroke="#FF6B00" strokeWidth="10" strokeLinecap="round" />
    {/* speed lines */}
    <line x1="5" y1="90" x2="40" y2="90" stroke="#FF6B00" strokeWidth="6" strokeLinecap="round" />
    <line x1="10" y1="106" x2="43" y2="106" stroke="#FF6B00" strokeWidth="5" strokeLinecap="round" />
    <line x1="18" y1="120" x2="46" y2="120" stroke="#FF6B00" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleGoogleLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); setLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (mode === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${location.origin}/auth/callback`,
      });
      if (error) { setError(error.message); }
      else { setMessage("パスワードリセットのメールを送信しました。受信トレイをご確認ください。"); }
      setLoading(false);
      return;
    }

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${location.origin}/auth/callback` },
      });
      if (error) { setError(error.message); }
      else if (data.session) { router.push("/"); router.refresh(); return; }
      else { setMessage("確認メールを送りました。受信トレイ（迷惑メールフォルダも）をご確認ください。"); }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError("メールアドレスかパスワードが違います"); }
      else { router.push("/"); router.refresh(); return; }
    }
    setLoading(false);
  }

  function switchMode(next: "login" | "signup" | "reset") {
    setMode(next);
    setError(null);
    setMessage(null);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FFF8F4", overflowX: "hidden" }}>

      {/* ── ヘッダー ── */}
      <div style={{ position: "relative", padding: "20px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* ランニングアイコン */}
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="18" cy="5" r="3.5" fill="#FF6B00" />
            <path d="M16 9 L13 18 M13 18 L8 24 M13 18 L18 23" stroke="#FF6B00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 12 L21 10 M21 10 L24 13" stroke="#FF6B00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 16 L11 16" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" />
            <path d="M5 19 L12 19" stroke="#FF6B00" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: "18px", fontWeight: 900, color: "#FF6B00", letterSpacing: "0.12em" }}>KAKERU</span>
        </div>
        {/* 装飾: ドット（右上） */}
        <div style={{ position: "absolute", top: "16px", right: "20px", display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "4px" }}>
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#FFCFB0" }} />
          ))}
        </div>
      </div>

      {/* ── ヒーロー ── */}
      <div style={{ position: "relative", padding: "24px 24px 0", overflow: "hidden" }}>
        {/* 装飾: 波線（右上） */}
        <svg style={{ position: "absolute", top: "28px", right: "170px" }} width="36" height="18" viewBox="0 0 36 18" fill="none">
          <path d="M2 9 Q9 2 18 9 Q27 16 34 9" stroke="#5ECFB0" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </svg>
        {/* 装飾: 青丸 */}
        <div style={{ position: "absolute", top: "90px", right: "20px", width: "18px", height: "18px", borderRadius: "50%", background: "#7AB8F5" }} />

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          {/* テキスト */}
          <div style={{ flex: 1, paddingRight: "8px" }}>
            <h1 style={{ fontSize: "38px", fontWeight: 900, lineHeight: 1.2, margin: 0, color: "#1A1A1A" }}>
              <span style={{ color: "#FF6B00" }}>走</span>らないと、<br />
              <span style={{ color: "#FF6B00" }}>罰金</span>が発生する。
            </h1>
            <p style={{ fontSize: "13px", color: "#888888", lineHeight: 1.7, marginTop: "12px", marginBottom: 0 }}>
              Kakeruは、あなたの「やる気」を守る<br />ランニング習慣化アプリです。
            </p>
          </div>
          {/* ランナーイラスト */}
          <div style={{ flexShrink: 0, marginTop: "-8px" }}>
            <RunnerIllustration />
          </div>
        </div>

        {/* 装飾: オレンジ波形（下部） */}
        <svg style={{ display: "block", marginTop: "16px", marginLeft: "-24px", width: "calc(100% + 48px)" }} viewBox="0 0 390 48" preserveAspectRatio="none" height="48">
          <path d="M0 28 Q60 8 120 28 Q180 48 240 28 Q300 8 360 28 L390 24 L390 48 L0 48 Z" fill="#FFDDCC" />
          <path d="M0 34 Q80 16 160 34 Q240 52 320 34 L390 30 L390 48 L0 48 Z" fill="#FF6B00" opacity="0.15" />
        </svg>
      </div>

      {/* ── 認証カード ── */}
      <div style={{ padding: "0 16px", marginTop: "-4px", position: "relative", zIndex: 1 }}>
        {/* 装飾: ドット（左） */}
        <div style={{ position: "absolute", left: "4px", top: "40px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "5px" }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#FFCFB0" }} />
          ))}
        </div>

        <div style={{
          background: "white",
          borderRadius: "24px",
          padding: "28px 24px",
          boxShadow: "0 4px 32px rgba(0,0,0,0.10)",
        }}>
          {message ? (
            <div style={{ background: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: "12px", padding: "16px", color: "#15803D", fontSize: "14px", lineHeight: 1.6 }}>
              {message}
              <button
                onClick={() => { setMessage(null); switchMode("login"); }}
                style={{ display: "block", marginTop: "12px", color: "#FF6B00", fontWeight: 700, background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: "14px" }}
              >
                ログイン画面に戻る →
              </button>
            </div>
          ) : (
            <>
              {/* カードタイトル */}
              <p style={{ textAlign: "center", fontSize: "11px", color: "#AAAAAA", letterSpacing: "0.08em", marginBottom: "6px" }}>
                <span style={{ marginRight: "6px" }}>╲</span>
                {mode === "reset" ? "パスワードをリセット" : "さあ、今日から変わろう。"}
                <span style={{ marginLeft: "6px" }}>╱</span>
              </p>
              <p style={{ textAlign: "center", fontSize: "13px", color: "#888888", marginBottom: "20px" }}>
                {mode === "reset"
                  ? "メールアドレスを入力してください"
                  : mode === "signup"
                  ? "アカウントを作成して、あなたの挑戦を始めよう！"
                  : "アカウントを作成して、あなたの挑戦を始めよう！"}
              </p>

              {/* Google ログイン（reset 以外） */}
              {mode !== "reset" && (
                <>
                  <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    style={{
                      width: "100%", minHeight: "52px",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                      background: "white", border: "1.5px solid #E5E5E5", borderRadius: "12px",
                      fontSize: "15px", fontWeight: 600, color: "#333333", cursor: "pointer",
                      marginBottom: "16px",
                    }}
                  >
                    <GoogleIcon />
                    Googleでログイン
                  </button>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                    <div style={{ flex: 1, height: "1px", background: "#EBEBEB" }} />
                    <span style={{ fontSize: "12px", color: "#AAAAAA" }}>または</span>
                    <div style={{ flex: 1, height: "1px", background: "#EBEBEB" }} />
                  </div>
                </>
              )}

              {/* メールフォーム */}
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {/* メールアドレス */}
                <div style={{ position: "relative" }}>
                  <Mail size={16} color="#AAAAAA" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="email"
                    placeholder="メールアドレス"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    style={{
                      width: "100%", height: "52px", border: "1.5px solid #E5E5E5", borderRadius: "12px",
                      paddingLeft: "42px", paddingRight: "14px", fontSize: "15px", color: "#111111",
                      outline: "none", background: "white", boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* パスワード（reset 以外） */}
                {mode !== "reset" && (
                  <div style={{ position: "relative" }}>
                    <Lock size={16} color="#AAAAAA" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="パスワード"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      style={{
                        width: "100%", height: "52px", border: "1.5px solid #E5E5E5", borderRadius: "12px",
                        paddingLeft: "42px", paddingRight: "46px", fontSize: "15px", color: "#111111",
                        outline: "none", background: "white", boxSizing: "border-box",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      {showPassword ? <EyeOff size={16} color="#AAAAAA" /> : <Eye size={16} color="#AAAAAA" />}
                    </button>
                  </div>
                )}

                {/* ログインしたままにする + パスワード忘れ（loginのみ） */}
                {mode === "login" && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "2px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "13px", color: "#555555" }}>
                      <input type="checkbox" defaultChecked style={{ accentColor: "#FF6B00", width: "15px", height: "15px" }} />
                      ログインしたままにする
                    </label>
                    <button
                      type="button"
                      onClick={() => switchMode("reset")}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#FF6B00", fontSize: "13px", fontWeight: 600, padding: 0 }}
                    >
                      パスワードをお忘れの方
                    </button>
                  </div>
                )}

                {error && <p style={{ fontSize: "13px", color: "#EF4444", margin: 0 }}>{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%", minHeight: "52px", marginTop: "4px",
                    background: "linear-gradient(135deg, #FF6B00, #FF9500)",
                    border: "none", borderRadius: "12px",
                    color: "white", fontSize: "16px", fontWeight: 800, cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(255,107,0,0.35)",
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? "処理中..." : mode === "login" ? "ログイン" : mode === "signup" ? "新規登録" : "リセットメールを送る"}
                </button>
              </form>

              {/* モード切り替え */}
              <div style={{ textAlign: "center", marginTop: "16px" }}>
                {mode === "reset" ? (
                  <button onClick={() => switchMode("login")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: "#888888" }}>
                    ← ログイン画面に戻る
                  </button>
                ) : mode === "login" ? (
                  <p style={{ fontSize: "13px", color: "#888888", margin: 0 }}>
                    アカウントをお持ちでない方は{" "}
                    <button onClick={() => switchMode("signup")} style={{ background: "none", border: "none", cursor: "pointer", color: "#FF6B00", fontWeight: 700, fontSize: "13px", padding: 0 }}>
                      新規登録はこちら ›
                    </button>
                  </p>
                ) : (
                  <p style={{ fontSize: "13px", color: "#888888", margin: 0 }}>
                    すでにアカウントをお持ちの方は{" "}
                    <button onClick={() => switchMode("login")} style={{ background: "none", border: "none", cursor: "pointer", color: "#FF6B00", fontWeight: 700, fontSize: "13px", padding: 0 }}>
                      ログインはこちら ›
                    </button>
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── フィーチャー ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", padding: "24px 20px 40px" }}>
        {/* GPS */}
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "#FFF0E5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <circle cx="13" cy="10" r="4" fill="#FF6B00" />
              <path d="M13 14 C13 14 6 19 6 22 Q6 25 13 25 Q20 25 20 22 C20 19 13 14 13 14Z" fill="#FF6B00" opacity="0.2" />
              <path d="M9 20 L6 24" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" />
              <circle cx="6" cy="24" r="1.5" fill="#FF6B00" />
              <path d="M9 20 Q12 22 15 20 Q17 19 19 21" stroke="#FF6B00" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeDasharray="2 2" />
            </svg>
          </div>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "#111111", marginBottom: "4px" }}>GPSで正確に記録</p>
          <p style={{ fontSize: "11px", color: "#888888", lineHeight: 1.5 }}>距離・時間・ペースを自動で計測</p>
        </div>

        {/* 自動課金 */}
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "#FFF9E5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path d="M13 4 Q7 4 7 11 L7 16 L5 18 L21 18 L19 16 L19 11 Q19 4 13 4Z" fill="#F59E0B" />
              <rect x="10.5" y="18" width="5" height="3" rx="1.5" fill="#F59E0B" />
              <circle cx="19" cy="7" r="4" fill="#EF4444" />
              <text x="19" y="10" textAnchor="middle" fill="white" fontSize="7" fontWeight="900">!</text>
            </svg>
          </div>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "#111111", marginBottom: "4px" }}>未達成なら自動課金</p>
          <p style={{ fontSize: "11px", color: "#888888", lineHeight: 1.5 }}>目標を達成できないと登録カードに罰金が発生</p>
        </div>

        {/* 習慣化 */}
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "#E5F9F3", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <rect x="4" y="20" width="5" height="4" rx="1" fill="#10B981" />
              <rect x="10.5" y="15" width="5" height="9" rx="1" fill="#10B981" />
              <rect x="17" y="10" width="5" height="14" rx="1" fill="#10B981" />
              <path d="M6 15 L11 10 L17 12 L21 7" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="21" cy="7" r="2" fill="#FF6B00" />
              <path d="M19 5 L21 7 L23 5" stroke="#FF6B00" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "#111111", marginBottom: "4px" }}>習慣化をサポート</p>
          <p style={{ fontSize: "11px", color: "#888888", lineHeight: 1.5 }}>リマインダーや記録で継続を後押し</p>
        </div>
      </div>

    </div>
  );
}
