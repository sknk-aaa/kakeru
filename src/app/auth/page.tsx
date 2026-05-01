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
  { icon: "/その他素材/課金焦り-transparent.png",  title: "未達成なら自動課金", sub: "目標未達で登録カードに罰金が発生" },
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

  return (
    <div
      className="sm:flex sm:min-h-screen"
      style={{ minHeight: "100vh", background: "#FFF8F4", overflowX: "hidden" }}
    >

      {/* ── PC 左パネル（モバイル非表示） ── */}
      <div
        className="hidden sm:flex sm:flex-col sm:justify-between"
        style={{
          flex: 1,
          background: "linear-gradient(160deg, #FF6B00 0%, #FF9500 100%)",
          padding: "40px 48px",
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 背景装飾 */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "280px", height: "280px", borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
          <div style={{ position: "absolute", bottom: "-80px", left: "-40px", width: "240px", height: "240px", borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        </div>

        {/* ロゴ */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "10px" }}>
          <Image src="/favicon.png" alt="KAKERU" width={32} height={32} style={{ objectFit: "contain" }} />
          <span style={{ fontSize: "22px", fontWeight: 900, color: "white", letterSpacing: "0.12em" }}>KAKERU</span>
        </div>

        {/* 棒人間 + キャッチコピー */}
        <div style={{ position: "relative" }}>
          <Image
            src="/stickman-assets/stickman-05.png"
            alt=""
            width={160}
            height={200}
            style={{ objectFit: "contain", display: "block", marginBottom: "16px" }}
          />
          <Image
            src="/その他素材/走らなければ-transparent.png"
            alt="走らなければ、課金される。"
            width={280}
            height={183}
            style={{ display: "block", maxWidth: "100%", height: "auto", filter: "brightness(0) invert(1)", opacity: 0.9 }}
          />
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", lineHeight: 1.7, marginTop: "14px" }}>
            Kakeruは、あなたの「やる気」を守る<br />ランニング習慣化アプリです。
          </p>
        </div>

        {/* フィーチャー一覧 */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "16px" }}>
          {PC_FEATURES.map(({ icon, title, sub }) => (
            <div key={title} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{
                width: "42px", height: "42px", borderRadius: "12px",
                background: "rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <Image src={icon} alt="" width={26} height={26} style={{ objectFit: "contain" }} />
              </div>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "white", marginBottom: "2px" }}>{title}</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.72)", lineHeight: 1.4 }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 右パネル（モバイルでは全体がここ） ── */}
      <div className="sm:flex-1 sm:flex sm:flex-col sm:overflow-y-auto sm:bg-white">

        {/* ヒーロー（モバイルのみ） */}
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
                <Image
                  src="/stickman-assets/stickman-05.png"
                  alt=""
                  width={140}
                  height={175}
                  style={{ objectFit: "contain" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 認証カード（モバイル: そのまま / PC: 縦中央寄せ・max-width制限） */}
        <div className="sm:flex-1 sm:flex sm:items-center sm:justify-center sm:py-10">
          <div className="sm:w-full sm:max-w-[420px] sm:px-8">

            {/* モバイル用ドット装飾 */}
            <div style={{ padding: "0 16px 8px", position: "relative", zIndex: 1, marginTop: "-16px" }}>
              <div className="sm:hidden" style={{ position: "absolute", left: "4px", top: "40px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "5px" }}>
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
                    <p style={{ textAlign: "center", fontSize: "11px", color: "#AAAAAA", letterSpacing: "0.08em", marginBottom: "6px" }}>
                      <span style={{ marginRight: "6px" }}>╲</span>
                      {mode === "reset" ? "パスワードをリセット" : "さあ、今日から変わろう。"}
                      <span style={{ marginLeft: "6px" }}>╱</span>
                    </p>
                    {mode === "reset" && (
                      <p style={{ textAlign: "center", fontSize: "13px", color: "#888888", marginBottom: "20px" }}>
                        メールアドレスを入力してください
                      </p>
                    )}

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
              </div>
            </div>
          </div>
        </div>

        {/* フィーチャー（モバイルのみ） */}
        <div className="sm:hidden">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "10px", padding: "20px 16px 48px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "76px", height: "76px", borderRadius: "50%", background: "#FFF0E5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                <Image src="/その他素材/地図っぽい-transparent.png" alt="" width={54} height={54} style={{ objectFit: "contain" }} />
              </div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#111111", marginBottom: "5px" }}>GPSで正確に記録</p>
              <p style={{ fontSize: "12px", color: "#888888", lineHeight: 1.5 }}>距離・時間・ペースを自動で計測</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "76px", height: "76px", borderRadius: "50%", background: "#FFF9E5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                <Image src="/その他素材/課金焦り-transparent.png" alt="" width={54} height={54} style={{ objectFit: "contain" }} />
              </div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#111111", marginBottom: "5px" }}>未達成なら自動課金</p>
              <p style={{ fontSize: "12px", color: "#888888", lineHeight: 1.5 }}>目標を達成できないと登録カードに罰金が発生</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "76px", height: "76px", borderRadius: "50%", background: "#E5F9F3", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                <Image src="/その他素材/山-transparent.png" alt="" width={54} height={54} style={{ objectFit: "contain" }} />
              </div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#111111", marginBottom: "5px" }}>習慣化をサポート</p>
              <p style={{ fontSize: "12px", color: "#888888", lineHeight: 1.5 }}>リマインダーや記録で継続を後押し</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
