"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Timer, TrendingUp, Zap } from "lucide-react";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${location.origin}/auth/callback` },
      });
      if (error) {
        setError(error.message);
      } else if (data.session) {
        // メール確認なしの設定の場合、即座にセッションが返る
        router.push("/");
        router.refresh();
      } else {
        setMessage("確認メールを送りました。受信トレイ（迷惑メールフォルダも）をご確認ください。");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError("メールアドレスかパスワードが違います");
      } else {
        router.push("/");
        router.refresh();
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ヒーロー */}
      <div className="bg-[#111111] px-6 pt-16 pb-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-full bg-[#FF6B00] flex items-center justify-center">
            <span className="metric-value text-white text-[16px]">K</span>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">カケル</span>
        </div>
        <h1 className="metric-value text-white text-4xl leading-none mb-2">
          走らなければ<br />
          <span className="text-[#FF6B00]">課金される。</span>
        </h1>
        <p className="text-[#888888] text-[15px] mt-3">
          目標を設定して、罰金を賭けて走ろう。
        </p>
        <div className="flex gap-4 mt-6">
          {[
            { icon: Timer, label: "GPS計測" },
            { icon: TrendingUp, label: "目標管理" },
            { icon: Zap, label: "自動課金" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <Icon size={14} color="#FF6B00" />
              <span className="text-[#888888] text-xs">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* フォーム */}
      <div className="flex-1 px-6 py-8">
        {message ? (
          <div className="bg-[#F0FDF4] border border-[#22C55E] rounded-xl p-4 text-[#15803D] text-[15px]">
            {message}
          </div>
        ) : (
          <>
            <button
              className="btn-primary w-full mb-4 gap-3"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.258c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.712A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.712V4.956H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.044l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.956L3.964 7.288C4.672 5.161 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Googleでログイン
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-[#E5E5E5]" />
              <span className="text-[#888888] text-xs">または</span>
              <div className="flex-1 h-px bg-[#E5E5E5]" />
            </div>

            <form onSubmit={handleEmailAuth} className="flex flex-col gap-3">
              <input
                className="input"
                type="email"
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <input
                className="input"
                type="password"
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
              {error && (
                <p className="text-[#EF4444] text-sm">{error}</p>
              )}
              <button className="btn-primary w-full" type="submit" disabled={loading}>
                {loading ? "処理中..." : mode === "login" ? "ログイン" : "新規登録"}
              </button>
            </form>

            <button
              className="w-full mt-4 text-[#888888] text-sm py-2"
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); }}
            >
              {mode === "login" ? "アカウントをお持ちでない方 → 新規登録" : "すでにアカウントをお持ちの方 → ログイン"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
