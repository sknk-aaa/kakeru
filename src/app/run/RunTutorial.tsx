"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export const TUTORIAL_KEY = "kakeru_run_tutorial_v1";

interface Props {
  onClose: () => void;
}

const RULES = [
  {
    num: "01",
    title: "1回のランで達成する",
    desc: "目標は分割不可。1回のランで距離・時間をクリアしよう。",
  },
  {
    num: "02",
    title: "時速30km超は自動除外",
    desc: "車や自転車での移動はGPSが自動検出してカット。",
  },
  {
    num: "03",
    title: "一時停止は⏸ボタンで",
    desc: "信号待ちや休憩は一時停止OK。再開すれば続きから計測。",
  },
] as const;

export default function RunTutorial({ onClose }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  function handleClose() {
    setMounted(false);
    localStorage.setItem(TUTORIAL_KEY, "1");
    setTimeout(onClose, 320);
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        background: mounted ? "rgba(10, 6, 0, 0.68)" : "rgba(10, 6, 0, 0)",
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(2px)",
        transition: "background 0.32s ease",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      {/* Bottom sheet */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "28px 28px 0 0",
          paddingBottom: "max(env(safe-area-inset-bottom), 24px)",
          transform: mounted ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 右下装飾 stickman-06 */}
        <Image
          src="/stickman-assets/stickman-06.png"
          alt=""
          width={72}
          height={84}
          style={{ width: 72, height: 84, position: "absolute",
            right: 10,
            bottom: "max(env(safe-area-inset-bottom), 24px)",
            objectFit: "contain",
            opacity: 0.18,
            pointerEvents: "none",
          }}
        />
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 0" }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: "#EBEBEB" }} />
        </div>

        {/* Header */}
        <div style={{ position: "relative", padding: "18px 24px 0", minHeight: 120, overflow: "hidden" }}>
          {/* Warm glow behind stickman */}
          <div style={{
            position: "absolute",
            right: -30,
            top: -30,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,107,0,0.13) 0%, transparent 68%)",
            pointerEvents: "none",
          }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.22em",
              color: "#FF6B00",
              marginBottom: 8,
              fontFamily: "'Barlow Condensed', sans-serif",
            }}>
              BEFORE YOU RUN
            </p>
            <h2 style={{
              fontSize: 28,
              fontWeight: 900,
              color: "#111111",
              lineHeight: 1.15,
              fontFamily: "'Barlow Condensed', sans-serif",
              letterSpacing: "0.01em",
              margin: 0,
            }}>
              スタート前に<br />確認しよう
            </h2>
          </div>

          {/* Hero stickman */}
          <Image
            src="/stickman-assets/stickman-05.png"
            alt=""
            width={110}
            height={128}
            style={{ width: 110, height: 128, position: "absolute",
              right: 12,
              bottom: -8,
              objectFit: "contain",
              opacity: 0.92,
            }}
          />
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "#F2F2F2", margin: "16px 24px 0" }} />

        {/* Rules */}
        <div style={{ padding: "16px 24px 0", display: "flex", flexDirection: "column", gap: 14 }}>
          {RULES.map((rule) => (
            <div
              key={rule.num}
              style={{ display: "flex", alignItems: "center", gap: 14 }}
            >
              {/* Number */}
              <span style={{
                fontSize: 34,
                fontWeight: 900,
                color: "#FF6B00",
                lineHeight: 1,
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: "-0.02em",
                flexShrink: 0,
                width: 38,
              }}>
                {rule.num}
              </span>

              {/* Text */}
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#111111",
                  marginBottom: 2,
                  lineHeight: 1.3,
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  {rule.title}
                </p>
                <p style={{
                  fontSize: 12,
                  color: "#888888",
                  lineHeight: 1.55,
                  fontFamily: "'DM Sans', sans-serif",
                  margin: 0,
                }}>
                  {rule.desc}
                </p>
              </div>

            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ padding: "20px 24px 0" }}>
          <button
            onClick={handleClose}
            style={{
              width: "100%",
              height: 54,
              borderRadius: 16,
              background: "linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%)",
              color: "white",
              fontSize: 16,
              fontWeight: 800,
              border: "none",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "0.02em",
              boxShadow: "0 6px 22px rgba(255, 107, 0, 0.38)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            わかった・はじめる
          </button>
        </div>
      </div>
    </div>
  );
}
