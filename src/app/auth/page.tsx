"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Plus, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const FAQ_ITEMS = [
  {
    q: "どのように課金されるの？",
    a: "目標を設定して達成できなかった場合のみ、登録されたカードへ自動でペナルティが課金されます。目標を作成した時点で課金が発生することはございませんので、ご安心ください。",
  },
  {
    q: "クレカ情報は安全？",
    a: "決済は世界基準のStripeを利用しており、カード番号は当アプリのサーバーには保存されません。暗号化された通信で安全に処理されます。",
  },
  {
    q: "途中でやめられる？",
    a: "はい。目標の削除・停止も可能です。ただ、当日の「やっぱりやめた」を使えなくするため、当日のみ削除できない仕様にしています。不本意な課金を避けることと、続けるための一押しのバランスを考えた結果の仕様です。",
  },
  {
    q: "あとから課金額を変更できる？",
    a: "はい。目標作成後も、目標ページから変更可能です。",
  },
  {
    q: "体調が悪い日は？",
    a: "月1回、課金なしで目標を当日でも停止できる、「スキップ機能」を設けています。風邪をひいてしまった日はスキップ機能を使い、翌日以降の目標の停止は無制限となっていますので、安心してご利用いただけます。",
  }
];

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.258c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.712A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.712V4.956H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.044l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.956L3.964 7.288C4.672 5.161 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const AUTH_HISTORY_KEY = "kakeru_auth_logged_in";

function hasAuthHistory() {
  if (typeof window === "undefined") return false;
  const hasLocalHistory = window.localStorage.getItem(AUTH_HISTORY_KEY) === "1";
  const hasCookieHistory = document.cookie
    .split("; ")
    .some((cookie) => cookie === `${AUTH_HISTORY_KEY}=1`);
  return hasLocalHistory || hasCookieHistory;
}

function rememberAuthHistory() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_HISTORY_KEY, "1");
  document.cookie = `${AUTH_HISTORY_KEY}=1; max-age=31536000; path=/; samesite=lax`;
}

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup" | "reset">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<Record<number, boolean>>({});

  function toggleFaq(i: number) {
    setOpenFaq((prev) => ({ ...prev, [i]: !prev[i] }));
  }

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (hasAuthHistory()) setMode("login");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

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
      else if (data.session) {
        rememberAuthHistory();
        router.push("/");
        router.refresh();
        return;
      }
      else { setMessage("確認メールを送りました。受信トレイ（迷惑メールフォルダも）をご確認ください。"); }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError("メールアドレスかパスワードが違います"); }
      else {
        rememberAuthHistory();
        router.push("/");
        router.refresh();
        return;
      }
    }
    setLoading(false);
  }

  function switchMode(next: "login" | "signup" | "reset") {
    setMode(next);
    setError(null);
    setMessage(null);
  }

  return (
    <div style={{ background: "#FEFAF7", minHeight: "100vh", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: "720px", minHeight: "100vh", overflowX: "hidden", background: "#FEFAF7" }}>

        {/* ── ヒーロー（ヘッダー含む） ── */}
        <div style={{ position: "relative", overflow: "hidden", paddingBottom: "44px" }}>

          {/* 抽象画像 背景レイヤー */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <Image src="/抽象画像/抽象画像2.png" alt="" fill sizes="(max-width: 720px) 100vw, 720px" style={{ objectFit: "cover", opacity: 0.1 }} />
            <div style={{ position: "absolute", top: "-20px", right: "-30px", width: "200px", height: "200px" }}>
              <Image src="/抽象画像/抽象画像4.png" alt="" fill sizes="200px" style={{ objectFit: "contain", opacity: 0.18 }} />
            </div>
            <div style={{ position: "absolute", bottom: "0px", left: "-20px", width: "160px", height: "160px" }}>
              <Image src="/抽象画像/抽象画像6.png" alt="" fill sizes="160px" style={{ objectFit: "contain", opacity: 0.14 }} />
            </div>
          </div>

          {/* ヘッダー */}
          <div style={{ position: "relative", padding: "20px 18px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Image src="/stickman-assets/stickman-01.png" alt="" width={28} height={28} style={{ width: 28, height: 28, objectFit: "contain" }} />
              <span style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 900, fontStyle: "italic", color: "#FF6B00", letterSpacing: "0.06em" }}>KAKERU</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Link href="/lp" style={{ color: "#B85D1D", fontSize: "12px", fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
                このアプリについて
              </Link>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "4px" }} aria-hidden="true">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#FFCFB0" }} />
                ))}
              </div>
            </div>
          </div>

          {/* ヒーローコンテンツ */}
          <div style={{ position: "relative", padding: "30px 28px 0", textAlign: "center" }}>
            <Image
              src="/favicon.png"
              alt=""
              width={102}
              height={102}
              priority
              sizes="102px"
              style={{ width: 102, height: 102, objectFit: "contain", margin: "0 auto", display: "block" }}
            />
            <h1 style={{ fontSize: "26px", lineHeight: 1.35, fontWeight: 900, color: "#1C1008", margin: "12px 0 10px", letterSpacing: 0 }}>
              未来の自分を、<br />
              少しだけ走らせる。
            </h1>
            <p style={{ fontSize: "13.5px", color: "#6B5236", lineHeight: 1.8, fontWeight: 500, margin: 0 }}>
              目標を決めて、走れた日は課金なし。<br />
              まずは無料で始められます。
            </p>
          </div>
        </div>

        {/* ── 認証カード ── */}
        <div style={{ padding: "0 16px 8px", position: "relative", zIndex: 1, marginTop: "-16px" }}>
          <div style={{ position: "absolute", left: "4px", top: "40px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "5px" }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#FFCFB0" }} />
            ))}
          </div>

          <div style={{ background: "white", borderRadius: "24px", padding: "28px 24px", boxShadow: "0 0 20px 5px rgba(0,0,0,0.065)" }}>
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
                  {mode === "reset" ? "パスワードをリセット" : mode === "signup" ? "まずは無料でアカウント作成" : "さあ、今日から変わろう。"}
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
                      {mode === "signup" ? "Googleでかんたん登録" : "Googleでログイン"}
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
                    {loading ? "処理中..." : mode === "login" ? "ログイン" : mode === "signup" ? "無料ではじめる" : "リセットメールを送る"}
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

        {/* ── FAQ ── */}
        <div style={{ padding: "16px 16px 40px" }}>
          <p style={{ textAlign: "center", fontSize: "11px", color: "#AAAAAA", letterSpacing: "0.08em", marginBottom: "14px" }}>
            <span style={{ marginRight: "6px" }}>╲</span>
            よくある質問
            <span style={{ marginLeft: "6px" }}>╱</span>
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {FAQ_ITEMS.map((item, i) => {
              const isOpen = !!openFaq[i];
              return (
                <div key={item.q} style={{ background: "white", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
                  <button
                    onClick={() => toggleFaq(i)}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
                  >
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#FF6B00", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "white", lineHeight: 1 }}>Q</span>
                    </div>
                    <span style={{ flex: 1, fontSize: "14px", fontWeight: 600, color: "#111111", lineHeight: 1.5 }}>{item.q}</span>
                    {isOpen
                      ? <X size={17} color="#BBBBBB" strokeWidth={2} style={{ flexShrink: 0 }} />
                      : <Plus size={17} color="#BBBBBB" strokeWidth={2} style={{ flexShrink: 0 }} />
                    }
                  </button>
                  {isOpen && (
                    <div style={{ display: "flex", gap: "12px", padding: "0 16px 16px" }}>
                      <div style={{ flexShrink: 0, paddingTop: "1px" }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#FFF0E5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: "11px", fontWeight: 800, color: "#FF6B00", lineHeight: 1 }}>A</span>
                        </div>
                      </div>
                      <p style={{ flex: 1, fontSize: "14px", color: "#555555", lineHeight: 1.75, whiteSpace: "pre-line", paddingTop: "4px", marginBottom: 0 }}>
                        {item.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
