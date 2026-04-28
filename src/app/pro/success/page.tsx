"use client";

import Link from "next/link";
import Image from "next/image";
import AppShell from "@/components/AppShell";

export default function ProSuccessPage() {
  return (
    <AppShell>
      <div style={{ minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", textAlign: "center" }}>
        <div style={{ marginBottom: "24px" }}>
          <Image
            src="/stickman-assets/stickman-02.png"
            alt=""
            width={120}
            height={120}
            style={{ objectFit: "contain" }}
          />
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
      </div>
    </AppShell>
  );
}
