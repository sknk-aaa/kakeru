"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AppShell from "@/components/AppShell";

function ProSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [activationResult, setActivationResult] = useState<{ sessionId: string; activated: boolean } | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;

    fetch("/api/stripe/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then((r) => r.json())
      .then((d: { activated?: boolean }) => {
        if (!cancelled) setActivationResult({ sessionId, activated: d.activated ?? false });
      })
      .catch(() => {
        if (!cancelled) setActivationResult({ sessionId, activated: false });
      });

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const activated = sessionId
    ? activationResult?.sessionId === sessionId
      ? activationResult.activated
      : null
    : true;

  return (
    <div style={{ minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", textAlign: "center" }}>
      <div style={{ marginBottom: "24px" }}>
        <Image src="/stickman-assets/stickman-15.png" alt="" width={120} height={120} style={{ width: 120, height: 120, objectFit: "contain" }} />
      </div>

      <div style={{ marginBottom: "12px" }}>
        <span style={{
          display: "inline-block",
          background: "linear-gradient(135deg, #FF6B00, #FF9500)",
          color: "white", fontSize: "11px", fontWeight: 900,
          letterSpacing: "0.15em", padding: "5px 16px", borderRadius: "99px",
          boxShadow: "0 4px 14px rgba(255,107,0,0.4)",
        }}>
          ★ PRO
        </span>
      </div>

      {activated === null ? (
        <>
          <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#111111", marginBottom: "12px" }}>加入を確認中...</h1>
          <p style={{ fontSize: "14px", color: "#888888" }}>少々お待ちください</p>
        </>
      ) : activated ? (
        <>
          <h1 style={{ fontSize: "28px", fontWeight: 900, color: "#111111", marginBottom: "12px", letterSpacing: "-0.01em" }}>
            PRO 加入完了！
          </h1>
          <p style={{ fontSize: "15px", color: "#777777", lineHeight: 1.75, marginBottom: "36px" }}>
            すべての PRO 機能が使えるようになりました。<br />
            本気の習慣化を、一緒に始めましょう。
          </p>
          <Link href="/" style={{ width: "100%", maxWidth: "320px" }}>
            <button style={{
              width: "100%", minHeight: "54px",
              background: "linear-gradient(135deg, #FF6B00, #FF9500)",
              border: "none", borderRadius: "16px",
              color: "white", fontSize: "16px", fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 6px 24px rgba(255,107,0,0.4)",
            }}>
              ホームへ
            </button>
          </Link>
        </>
      ) : (
        <>
          <h1 style={{ fontSize: "22px", fontWeight: 900, color: "#111111", marginBottom: "12px" }}>加入処理中です</h1>
          <p style={{ fontSize: "14px", color: "#888888", lineHeight: 1.75, marginBottom: "32px" }}>
            Stripe での決済は完了しています。<br />
            反映まで少し時間がかかる場合があります。<br />
            しばらく経ってからアプリを開き直してください。
          </p>
          <Link href="/" style={{ width: "100%", maxWidth: "320px" }}>
            <button style={{
              width: "100%", minHeight: "54px",
              background: "#F2F2F7", border: "none", borderRadius: "16px",
              color: "#333333", fontSize: "16px", fontWeight: 700, cursor: "pointer",
            }}>
              ホームへ
            </button>
          </Link>
        </>
      )}
    </div>
  );
}

export default function ProSuccessPage() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <ProSuccessContent />
      </Suspense>
    </AppShell>
  );
}
