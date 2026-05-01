"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, CheckCircle } from "lucide-react";

type Browser = "safari" | "chrome" | "edge";

const BENEFITS: { img: string; w: number; h: number; label: string; sub: string; maxW?: string }[] = [
  { img: "/stickman-assets/stickman-20.png",       w: 187, h: 336,  label: "アプリのように", sub: "使える",  maxW: "65%" },
  { img: "/その他素材/通知ベル-transparent.png",   w: 54,  h: 54,   label: "プッシュ通知で", sub: "忘れない", maxW: "55%" },
  { img: "/その他素材/ホーム画面に追加モック.png", w: 604, h: 1187, label: "1タップで",     sub: "起動" },
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
    <div style={{ background: "#F2F2F7", minHeight: "100dvh" }}>
    <div className="app-content" style={{ maxWidth: "480px", margin: "0 auto", minHeight: "100dvh", background: "white", overflowX: "hidden", paddingBottom: "calc(env(safe-area-inset-bottom) + 40px)" }}>

      {/* ヘッダー */}
      <div style={{
        display: "flex", alignItems: "center", gap: "10px",
        padding: "calc(env(safe-area-inset-top) + 12px) 16px 12px",
        borderBottom: "1px solid #F2F2F7",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", background: "#F2F2F7", borderRadius: "10px", textDecoration: "none", flexShrink: 0 }}>
          <ChevronLeft size={20} color="#111111" />
        </Link>
        <h1 style={{ fontSize: "15px", fontWeight: 700, color: "#111111" }}>ホーム画面に追加</h1>
      </div>

      {/* ヒーロー */}
      <div style={{ position: "relative", padding: "36px 24px 32px", overflow: "hidden" }}>
        {/* 抽象画像1: 右上の背景装飾 */}
        <Image
          src="/抽象画像/抽象画像1.png"
          alt=""
          width={240}
          height={240}
          style={{ position: "absolute", top: -28, right: -48, opacity: 0.28, pointerEvents: "none", userSelect: "none" }}
          aria-hidden
        />
        {/* 抽象画像3: 左下のアクセント */}
        <Image
          src="/抽象画像/抽象画像3.png"
          alt=""
          width={100}
          height={100}
          style={{ position: "absolute", bottom: -20, left: -24, opacity: 0.18, pointerEvents: "none", userSelect: "none" }}
          aria-hidden
        />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "290px" }}>
          <p style={{
            fontFamily: "var(--font-display)",
            fontSize: "11px", fontWeight: 900, letterSpacing: "0.16em",
            color: "#FF6B00", marginBottom: "14px",
          }}>
            INSTALL
          </p>
          <p style={{ fontSize: "24px", fontWeight: 800, color: "#111111", lineHeight: 1.5 }}>
            <span style={{ color: "#FF6B00" }}>「ホーム画面に追加」</span>
            することで、アプリのように使えるようになります。
          </p>
        </div>

        {/* だから続く！ 小さく右下 */}
        <div style={{ position: "absolute", bottom: 16, right: 20, zIndex: 1 }}>
          <Image
            src="/その他素材/だから続く！-transparent.png"
            alt="だから続く！"
            width={110}
            height={28}
            style={{ objectFit: "contain" }}
          />
        </div>
      </div>

      {/* ベネフィット 3列 */}
      <div style={{ position: "relative", padding: "0 16px 28px" }}>
        {/* 抽象画像4: グリッド背景の薄い装飾 */}
        <Image
          src="/抽象画像/抽象画像4.png"
          alt=""
          width={200}
          height={200}
          style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", opacity: 0.08, pointerEvents: "none", userSelect: "none" }}
          aria-hidden
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", position: "relative", zIndex: 1 }}>
          {BENEFITS.map(({ img, label, sub, maxW }) => (
            <div key={label} style={{
              background: "#FFF8F4",
              borderRadius: "18px",
              padding: "14px 0 12px",
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: "8px",
              border: "1px solid rgba(255,107,0,0.08)",
              overflow: "hidden",
            }}>
              <div style={{ height: "130px", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Image
                  src={img} alt=""
                  width={0} height={0}
                  sizes="33vw"
                  style={{ width: maxW ?? "100%", height: "100%", objectFit: "contain" }}
                />
              </div>
              <p style={{ fontSize: "10px", fontWeight: 700, color: "#333333", textAlign: "center", lineHeight: 1.55, padding: "0 4px" }}>
                {label}<br />{sub}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 抽象画像2: 波ライン区切り */}
      <div style={{ position: "relative", height: "40px", overflow: "hidden", marginBottom: "8px" }}>
        <Image
          src="/抽象画像/抽象画像2.png"
          alt=""
          width={420}
          height={80}
          style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", opacity: 0.22, width: "100%", height: "auto" }}
          aria-hidden
        />
      </div>

      {/* インストール済みバナー */}
      {isInstalled && (
        <div style={{ margin: "0 20px 20px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "14px", padding: "16px 18px", display: "flex", alignItems: "center", gap: "10px" }}>
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
                  fontSize: "13px", fontWeight: 700, cursor: "pointer",
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
    </div>
  );
}
