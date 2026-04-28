"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AppShell from "@/components/AppShell";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, Check, ChevronRight } from "lucide-react";

const PRO_FEATURES = [
  "チャレンジ目標（期間累計でゴール設定）",
  "エスカレーション（連続失敗で罰金増加）",
  "クーリング期間（変更・削除ロック）",
  "目標ロック（単発目標の直前キャンセル封印）",
];

export default function ProManagePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.replace("/auth"); return; }
      supabase.from("users").select("is_subscribed").eq("id", user.id).single()
        .then(({ data }) => {
          if (!data?.is_subscribed) router.replace("/pro");
          else setChecking(false);
        });
    });
  }, [router]);

  async function handlePortal() {
    setLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json() as { url?: string };
    if (data.url) window.location.href = data.url;
    else setLoading(false);
  }

  if (checking) return null;

  return (
    <AppShell>
      {/* ヘッダー */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #F0F0F0",
        padding: "0 16px", height: "54px",
        display: "flex", alignItems: "center",
      }}>
        <button
          onClick={() => router.back()}
          aria-label="戻る"
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: "#FF6B00", fontSize: "15px", fontWeight: 600, gap: "2px" }}
        >
          <ChevronLeft size={20} color="#FF6B00" aria-hidden="true" />
          戻る
        </button>
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <span style={{
            fontSize: "12px", fontWeight: 900, letterSpacing: "0.18em",
            background: "linear-gradient(90deg, #FF6B00, #FF9500)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            KAKERU PRO
          </span>
        </div>
        <div style={{ width: "56px" }} />
      </div>

      <div style={{ padding: "32px 16px", display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* 棒人間 */}
        <Image
          src="/stickman-assets/stickman-02.png"
          alt=""
          width={100}
          height={100}
          style={{ objectFit: "contain", marginBottom: "16px" }}
        />

        {/* PRO バッジ */}
        <span style={{
          display: "inline-block",
          background: "linear-gradient(135deg, #FF6B00, #FF9500)",
          color: "white", fontSize: "11px", fontWeight: 900,
          letterSpacing: "0.15em", padding: "5px 16px", borderRadius: "99px",
          boxShadow: "0 4px 14px rgba(255,107,0,0.4)",
          marginBottom: "12px",
        }}>
          ★ PRO
        </span>

        <h1 style={{ fontSize: "22px", fontWeight: 900, color: "#111111", marginBottom: "6px" }}>
          PRO プラン利用中
        </h1>
        <p style={{ fontSize: "14px", color: "#888888", marginBottom: "32px" }}>
          すべての PRO 機能が使えます
        </p>

        {/* 利用中の機能一覧 */}
        <div style={{ width: "100%", background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", marginBottom: "24px" }}>
          {PRO_FEATURES.map((feature, i) => (
            <div
              key={i}
              style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "14px 16px",
                borderTop: i > 0 ? "1px solid #F2F2F2" : "none",
              }}
            >
              <div style={{ width: "22px", height: "22px", background: "#22C55E", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Check size={12} color="white" strokeWidth={3} aria-hidden="true" />
              </div>
              <span style={{ fontSize: "14px", color: "#111111" }}>{feature}</span>
            </div>
          ))}
        </div>

        {/* 管理ボタン */}
        <button
          onClick={handlePortal}
          disabled={loading}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px",
            background: "white", border: "1.5px solid #E5E5E5", borderRadius: "14px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          <span style={{ fontSize: "15px", color: "#333333", fontWeight: 600 }}>
            {loading ? "処理中..." : "プランを変更・解約する"}
          </span>
          <ChevronRight size={16} color="#CCCCCC" aria-hidden="true" />
        </button>
        <p style={{ fontSize: "11px", color: "#BBBBBB", marginTop: "8px", textAlign: "center" }}>
          Stripe カスタマーポータルで管理できます
        </p>
      </div>
    </AppShell>
  );
}
