"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, CheckCircle } from "lucide-react";

type Browser = "safari" | "chrome" | "edge";

const BENEFITS = [
  { img: "/stickman-assets/stickman-04.png", label: "1タップで\n即起動" },
  { img: "/stickman-assets/stickman-07.png", label: "プッシュ通知\nで忘れない" },
  { img: "/stickman-assets/stickman-02.png", label: "アプリと同じ\n使い心地" },
];

const STEPS: Record<Browser, { icon: string; detail: string }[]> = {
  safari: [
    { icon: "①", detail: "画面下部の 共有ボタン（□↑）をタップ" },
    { icon: "②", detail: "「ホーム画面に追加」を選択" },
    { icon: "③", detail: "右上の「追加」をタップして完了" },
  ],
  chrome: [
    { icon: "①", detail: "右上のメニュー（⋮）をタップ" },
    { icon: "②", detail: "「ホーム画面に追加」を選択" },
    { icon: "③", detail: "「追加」をタップして完了" },
  ],
  edge: [
    { icon: "①", detail: "右下のメニューをタップ" },
    { icon: "②", detail: "「電話に追加」を選択" },
    { icon: "③", detail: "「インストール」をタップして完了" },
  ],
};

export default function InstallPage() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [browser, setBrowser] = useState<Browser>("safari");

  useEffect(() => {
    setIsInstalled(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  return (
    <div style={{ minHeight: "100dvh", background: "white", paddingBottom: "calc(env(safe-area-inset-bottom) + 32px)" }}>
      {/* ヘッダー */}
      <div style={{
        display: "flex", alignItems: "center", gap: "10px",
        padding: "calc(env(safe-area-inset-top) + 12px) 16px 12px",
        borderBottom: "1px solid #F2F2F7",
      }}>
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", background: "#F2F2F7", borderRadius: "10px", textDecoration: "none", flexShrink: 0 }}
        >
          <ChevronLeft size={20} color="#111111" />
        </Link>
        <h1 style={{ fontSize: "15px", fontWeight: 700, color: "#111111" }}>ホーム画面に追加</h1>
      </div>

      {/* ヒーロー: pc,スマホ */}
      <div style={{ padding: "28px 24px 4px", display: "flex", justifyContent: "center" }}>
        <Image
          src="/その他素材/pc,スマホ-transparent.png"
          alt="カケル アプリ画面"
          width={320}
          height={220}
          style={{ objectFit: "contain", maxWidth: "100%" }}
          priority
        />
      </div>

      {/* サブコピー: だから続く！ */}
      <div style={{ display: "flex", justifyContent: "center", padding: "0 24px 24px" }}>
        <Image
          src="/その他素材/だから続く！-transparent.png"
          alt="だから続く！"
          width={220}
          height={56}
          style={{ objectFit: "contain", maxWidth: "100%" }}
        />
      </div>

      {/* メリット3列 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", padding: "0 20px 28px" }}>
        {BENEFITS.map(({ img, label }) => (
          <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "14px 8px", background: "#FAFAFA", borderRadius: "14px" }}>
            <Image src={img} alt="" width={52} height={52} style={{ objectFit: "contain" }} />
            <p style={{ fontSize: "11px", fontWeight: 600, color: "#333333", textAlign: "center", lineHeight: 1.5, whiteSpace: "pre-line" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* インストール済みバナー */}
      {isInstalled && (
        <div style={{ margin: "0 20px 24px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "14px", padding: "16px 18px", display: "flex", alignItems: "center", gap: "10px" }}>
          <CheckCircle size={20} color="#22C55E" />
          <p style={{ fontSize: "14px", fontWeight: 600, color: "#16A34A" }}>すでにインストール済みです</p>
        </div>
      )}

      {/* ブラウザ別手順 */}
      {!isInstalled && (
        <div style={{ padding: "0 20px" }}>
          <p style={{
            fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 900,
            color: "#FF6B00", letterSpacing: "0.12em", textTransform: "uppercase",
            marginBottom: "12px",
          }}>
            インストール手順
          </p>

          {/* ブラウザタブ */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
            {(["safari", "chrome", "edge"] as Browser[]).map((b) => (
              <button
                key={b}
                onClick={() => setBrowser(b)}
                style={{
                  flex: 1, padding: "10px 4px",
                  background: browser === b ? "#FF6B00" : "#F2F2F7",
                  color: browser === b ? "white" : "#666666",
                  border: "none", borderRadius: "10px",
                  fontSize: "13px", fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {b.charAt(0).toUpperCase() + b.slice(1)}
              </button>
            ))}
          </div>

          {/* 手順 */}
          <div style={{ background: "#FAFAFA", borderRadius: "16px", padding: "4px 16px" }}>
            {STEPS[browser].map(({ icon, detail }, i) => (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "center", gap: "14px",
                  padding: "16px 0",
                  borderBottom: i < STEPS[browser].length - 1 ? "1px solid #EFEFEF" : "none",
                }}
              >
                <span style={{
                  fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 900,
                  color: "#FF6B00", lineHeight: 1, minWidth: "30px", textAlign: "center",
                }}>{icon}</span>
                <p style={{ fontSize: "14px", color: "#222222", lineHeight: 1.6 }}>{detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
