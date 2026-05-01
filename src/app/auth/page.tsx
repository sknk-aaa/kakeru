"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Image from "next/image";

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.258c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.712A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.712V4.956H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.044l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.956L3.964 7.288C4.672 5.161 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const PC_FEATURES = [
  { icon: "/その他素材/地図っぽい-transparent.png", title: "GPSで正確に記録", sub: "距離・時間・ペースを自動で計測" },
  { icon: "/その他素材/課金焦り-transparent.png",  title: "未達成なら自動課金", sub: "目標を達成できないと登録カードに罰金" },
  { icon: "/その他素材/山-transparent.png",         title: "習慣化をサポート",  sub: "リマインダーや記録で継続を後押し" },
];

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

  // ── フォームの中身（モバイル・PC で共有） ──
  const authCardInner = (
    <>
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

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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
    </>
  );

  return (
    <div
      className="sm:flex sm:min-h-screen"
      style={{ minHeight: "100vh", background: "#FFF8F4", overflowX: "hidden" }}
    >

      {/* ════════════════════════════════════════
          PC 左パネル（モバイル非表示）
          背景: クリーム + 抽象画像レイヤー
      ════════════════════════════════════════ */}
      <div
        className="hidden sm:flex sm:flex-col sm:justify-between"
        style={{
          width: "45%",
          minHeight: "100vh",
          background: "#FFFAF6",
          padding: "44px 52px 40px",
          position: "relative",
          overflow: "hidden",
          borderRight: "1px solid rgba(0,0,0,0.06)",
          flexShrink: 0,
        }}
      >
        {/* ── 抽象画像レイヤー ── */}
        {/* 全体テクスチャ */}
        <Image
          src="/抽象画像/抽象画像2.png"
          alt=""
          fill
          style={{ objectFit: "cover", opacity: 0.06, pointerEvents: "none" }}
        />
        {/* 右上アクセント */}
        <div style={{ position: "absolute", top: "-48px", right: "-48px", width: "340px", height: "340px", pointerEvents: "none" }}>
          <Image src="/抽象画像/抽象画像1.png" alt="" fill style={{ objectFit: "contain", opacity: 0.18 }} />
        </div>
        {/* 左下アクセント */}
        <div style={{ position: "absolute", bottom: "-24px", left: "-32px", width: "220px", height: "220px", pointerEvents: "none" }}>
          <Image src="/抽象画像/抽象画像6.png" alt="" fill style={{ objectFit: "contain", opacity: 0.12 }} />
        </div>
        {/* 中央奥の薄いウォーターマーク */}
        <div style={{ position: "absolute", top: "50%", right: "10%", width: "180px", height: "180px", transform: "translateY(-50%)", pointerEvents: "none" }}>
          <Image src="/抽象画像/抽象画像4.png" alt="" fill style={{ objectFit: "contain", opacity: 0.07 }} />
        </div>

        {/* ── ロゴ（上段） ── */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "10px" }}>
          <Image src="/favicon.png" alt="KAKERU" width={34} height={34} style={{ objectFit: "contain" }} />
          <span style={{
            fontFamily: "var(--font-display)",
            fontSize: "22px", fontWeight: 900,
            color: "#FF6B00", letterSpacing: "0.14em",
          }}>
            KAKERU
          </span>
        </div>

        {/* ── メインビジュアル（中段） ── */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <Image
            src="/stickman-assets/stickman-05.png"
            alt=""
            width={188}
            height={235}
            style={{ objectFit: "contain", display: "block", marginBottom: "20px" }}
          />
          <Image
            src="/その他素材/走らなければ-transparent.png"
            alt="走らなければ、課金される。"
            width={320}
            height={209}
            priority
            style={{ display: "block", maxWidth: "100%", height: "auto", marginBottom: "18px" }}
          />
          <p style={{ fontSize: "14px", color: "#777777", lineHeight: 1.75 }}>
            Kakeruは、あなたの「やる気」を守る<br />ランニング習慣化アプリです。
          </p>
        </div>

        {/* ── フィーチャー（下段） ── */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ height: "1px", background: "rgba(0,0,0,0.08)", marginBottom: "24px" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {PC_FEATURES.map(({ icon, title, sub }) => (
              <div key={title} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "13px",
                  background: "#FFF0E5",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 1px 4px rgba(255,107,0,0.12)",
                }}>
                  <Image src={icon} alt="" width={28} height={28} style={{ objectFit: "contain" }} />
                </div>
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "#111111", marginBottom: "3px" }}>{title}</p>
                  <p style={{ fontSize: "12px", color: "#999999", lineHeight: 1.45 }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          右側（モバイルではページ全体 / PCでは右55%）
      ════════════════════════════════════════ */}
      <div className="sm:flex-1 sm:flex sm:flex-col">

        {/* ── モバイルのみ: ヒーローセクション ── */}
        <div className="sm:hidden">
          <div style={{ position: "relative", overflow: "hidden", paddingBottom: "40px" }}>
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
              <Image src="/抽象画像/抽象画像2.png" alt="" fill style={{ objectFit: "cover", opacity: 0.1 }} />
              <div style={{ position: "absolute", top: "-20px", right: "-30px", width: "200px", height: "200px" }}>
                <Image src="/抽象画像/抽象画像4.png" alt="" fill style={{ objectFit: "contain", opacity: 0.18 }} />
              </div>
              <div style={{ position: "absolute", bottom: "0px", left: "-20px", width: "160px", height: "160px" }}>
                <Image src="/抽象画像/抽象画像6.png" alt="" fill style={{ objectFit: "contain", opacity: 0.14 }} />
              </div>
            </div>
            <div style={{ position: "relative", padding: "20px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Image src="/favicon.png" alt="KAKERU" width={28} height={28} style={{ objectFit: "contain" }} />
                <span style={{ fontSize: "18px", fontWeight: 900, color: "#FF6B00", letterSpacing: "0.12em" }}>KAKERU</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "4px" }}>
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#FFCFB0" }} />
                ))}
              </div>
            </div>
            <div style={{ position: "relative", padding: "24px 24px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div style={{ flex: 1, paddingRight: "8px" }}>
                <h1 style={{ margin: 0 }}>
                  <Image
                    src="/その他素材/走らなければ-transparent.png"
                    alt="走らなければ、課金される。"
                    width={250}
                    height={164}
                    priority
                    style={{ display: "block", maxWidth: "100%", height: "auto" }}
                  />
                </h1>
                <p style={{ fontSize: "13px", color: "#666666", lineHeight: 1.7, marginTop: "14px", marginBottom: 0 }}>
                  Kakeruは、あなたの「やる気」を守る<br />ランニング習慣化アプリです。
                </p>
              </div>
              <div style={{ flexShrink: 0, marginTop: "-4px" }}>
                <Image src="/stickman-assets/stickman-05.png" alt="" width={140} height={175} style={{ objectFit: "contain" }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── モバイルのみ: フォームカード（元のスタイル完全維持） ── */}
        <div className="sm:hidden">
          <div style={{ padding: "0 16px 8px", position: "relative", zIndex: 1, marginTop: "-16px" }}>
            <div style={{ position: "absolute", left: "4px", top: "40px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "5px" }}>
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#FFCFB0" }} />
              ))}
            </div>
            <div style={{ background: "white", borderRadius: "24px", padding: "28px 24px", boxShadow: "0 4px 32px rgba(0,0,0,0.10)" }}>
              {/* モバイル限定のサブタイトル */}
              {!message && (
                <p style={{ textAlign: "center", fontSize: "11px", color: "#AAAAAA", letterSpacing: "0.08em", marginBottom: "16px" }}>
                  <span style={{ marginRight: "6px" }}>╲</span>
                  {mode === "reset" ? "パスワードをリセット" : "さあ、今日から変わろう。"}
                  <span style={{ marginLeft: "6px" }}>╱</span>
                </p>
              )}
              {!message && mode === "reset" && (
                <p style={{ textAlign: "center", fontSize: "13px", color: "#888888", marginBottom: "20px" }}>
                  メールアドレスを入力してください
                </p>
              )}
              {authCardInner}
            </div>
          </div>
        </div>

        {/* ── PCのみ: 大見出し + フォームカード ── */}
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-center sm:bg-white" style={{ minHeight: "100vh" }}>
          <div style={{ width: "100%", maxWidth: "540px", padding: "48px 40px" }}>

            {/* PC大見出し */}
            {!message && (
              <div style={{ marginBottom: "36px" }}>
                <p style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "11px", fontWeight: 900,
                  letterSpacing: "0.18em", color: "#FF6B00",
                  marginBottom: "10px",
                }}>
                  {mode === "login" ? "WELCOME BACK" : mode === "signup" ? "GET STARTED" : "RESET PASSWORD"}
                </p>
                <h2 style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "48px", fontWeight: 900,
                  color: "#111111", letterSpacing: "-0.02em",
                  lineHeight: 1.05, marginBottom: "12px",
                }}>
                  {mode === "login" ? "おかえりなさい" : mode === "signup" ? "はじめよう" : "パスワードを\nリセット"}
                </h2>
                <p style={{ fontSize: "15px", color: "#888888", lineHeight: 1.65 }}>
                  {mode === "login"
                    ? "ログインしてランニングを記録しよう"
                    : mode === "signup"
                    ? "アカウントを作成して習慣化を始める"
                    : "登録メールアドレスを入力してください"}
                </p>
              </div>
            )}

            {/* PCフォームカード（パディング大きめ） */}
            <div style={{
              background: "white",
              borderRadius: "24px",
              padding: "36px 32px",
              boxShadow: "0 2px 24px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)",
            }}>
              {authCardInner}
            </div>

            {/* PC下部ラベル */}
            <p style={{ textAlign: "center", fontSize: "12px", color: "#CCCCCC", marginTop: "24px" }}>
              © {new Date().getFullYear()} KAKERU. All rights reserved.
            </p>
          </div>
        </div>

        {/* ── モバイルのみ: フィーチャーグリッド ── */}
        <div className="sm:hidden">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "10px", padding: "20px 16px 48px" }}>
            {[
              { bg: "#FFF0E5", icon: "/その他素材/地図っぽい-transparent.png", title: "GPSで正確に記録", sub: "距離・時間・ペースを自動で計測" },
              { bg: "#FFF9E5", icon: "/その他素材/課金焦り-transparent.png",  title: "未達成なら自動課金", sub: "目標を達成できないと登録カードに罰金が発生" },
              { bg: "#E5F9F3", icon: "/その他素材/山-transparent.png",         title: "習慣化をサポート",  sub: "リマインダーや記録で継続を後押し" },
            ].map(({ bg, icon, title, sub }) => (
              <div key={title} style={{ textAlign: "center" }}>
                <div style={{ width: "76px", height: "76px", borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                  <Image src={icon} alt="" width={54} height={54} style={{ objectFit: "contain" }} />
                </div>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#111111", marginBottom: "5px" }}>{title}</p>
                <p style={{ fontSize: "12px", color: "#888888", lineHeight: 1.5 }}>{sub}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
