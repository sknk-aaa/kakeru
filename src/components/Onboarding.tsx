"use client";

import { useState, useRef } from "react";
import Image from "next/image";

const STORAGE_KEY = "kakeru_onboarding_done";

const STEPS = [
  {
    label: "HOW IT WORKS",
    title: "走らなければ、\n罰金。だから続く。",
    body: "目標を達成しない日は、設定した金額が自動で引き落とされます。だから逃げられない。",
    note: null,
  },
  {
    label: "PENALTY RULE",
    title: "課金されるのは、\n目標を達成しなかった日だけ",
    body: "走れば課金なし。課金されたくないから、走る。",
    note: "※ 罰金を有効にするには、クレジットカードの登録が必要です。",
  },
  {
    label: "GET STARTED",
    title: "まずは軽めの\n目標から",
    body: "最初から高い目標は必要ありません。続けられるペースから始めましょう。",
    note: null,
  },
] as const;

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const touchStartX = useRef<number | null>(null);

  function done() {
    localStorage.setItem(STORAGE_KEY, "1");
    onDone();
  }

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1);
    else done();
  }

  function prev() {
    if (step > 0) setStep(step - 1);
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) next();
    else if (diff < -50) prev();
    touchStartX.current = null;
  }

  const current = STEPS[step];

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "#FEFCFA",
        display: "flex", flexDirection: "column",
        userSelect: "none",
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ヘッダー */}
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "16px 20px 0" }}>
        <button
          onClick={done}
          style={{ background: "none", border: "none", fontSize: "14px", color: "#AAAAAA", cursor: "pointer", fontWeight: 500, padding: "4px 8px" }}
        >
          スキップ
        </button>
      </div>

      {/* イラスト */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px" }}>
        {step === 0 && (
          <Image
            src="/stickman-assets/stickman-08.png"
            alt=""
            width={260}
            height={260}
            style={{ objectFit: "contain", maxHeight: "45vh" }}
            priority
          />
        )}
        {step === 1 && (
          <Image
            src="/その他素材/クレカロック-transparent.png"
            alt=""
            width={220}
            height={220}
            style={{ objectFit: "contain", maxHeight: "45vh" }}
            priority
          />
        )}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <Image
              src="/stickman-assets/stickman-06.png"
              alt=""
              width={140}
              height={140}
              style={{ objectFit: "contain" }}
              priority
            />
            <Image
              src="/その他素材/オンボーディング-目標作成.png"
              alt=""
              width={260}
              height={120}
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
        )}
      </div>

      {/* テキスト */}
      <div style={{ padding: "0 28px 8px" }}>
        <p style={{
          fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em",
          color: "#FF6B00", textTransform: "uppercase", marginBottom: 10,
        }}>
          {current.label}
        </p>
        <h2 style={{
          fontSize: "26px", fontWeight: 900, lineHeight: 1.25,
          color: "#1C1008", marginBottom: 12,
          whiteSpace: "pre-wrap",
        }}>
          {current.title}
        </h2>
        <p style={{ fontSize: "15px", lineHeight: 1.75, color: "#6B5236" }}>
          {current.body}
        </p>
        {current.note && (
          <p style={{ fontSize: "12px", color: "#AAAAAA", marginTop: 10, lineHeight: 1.65 }}>
            {current.note}
          </p>
        )}
      </div>

      {/* フッター：ドット + ボタン */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 24px calc(24px + env(safe-area-inset-bottom))",
      }}>
        {/* プログレスドット */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                height: 8, borderRadius: 4,
                width: i === step ? 22 : 8,
                background: i === step ? "#FF6B00" : "#E0D5C8",
                transition: "width 0.25s ease, background 0.25s ease",
              }}
            />
          ))}
        </div>

        {/* ナビボタン */}
        <button
          onClick={next}
          style={{
            background: "#FF6B00", color: "white",
            border: "none", borderRadius: 100,
            padding: "13px 22px",
            fontSize: "15px", fontWeight: 800,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {step === STEPS.length - 1 ? "Kakeruをはじめる" : "次へ →"}
        </button>
      </div>
    </div>
  );
}
