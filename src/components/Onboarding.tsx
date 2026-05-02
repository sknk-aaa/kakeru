"use client";

import { useState, useRef } from "react";
import Image from "next/image";

const STORAGE_KEY = "kakeru_onboarding_done";

const ACCENT = "#FF6B00";
const BG = "#FEFCFA";
const DARK = "#1C1008";
const SUB = "#6B5236";
const SKIP_COLOR = "#B09980";
const NG_RED = "#FF3B30";
const OK_GREEN = "#34C759";

const TOTAL_STEPS = 4;

function ProgressDots({ current }: { current: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 8,
            width: i === current ? 24 : 8,
            borderRadius: 100,
            background: i === current ? ACCENT : "#D9C9B8",
            transition: "width 0.35s cubic-bezier(.4,0,.2,1), background 0.25s",
          }}
        />
      ))}
    </div>
  );
}

function NextButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: ACCENT,
        color: "#fff",
        border: "none",
        borderRadius: 100,
        padding: "14px 24px",
        fontSize: 15,
        fontWeight: 700,
        cursor: "pointer",
        letterSpacing: "0.01em",
        boxShadow: "0 4px 22px rgba(255,107,0,0.4)",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

function SkipButton({ onClick }: { onClick: () => void }) {
  return (
    <div style={{ position: "absolute", top: "calc(env(safe-area-inset-top) + 16px)", right: 20, zIndex: 10 }}>
      <button
        onClick={onClick}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 14,
          color: SKIP_COLOR,
          fontWeight: 500,
          padding: "4px 8px",
        }}
      >
        スキップ
      </button>
    </div>
  );
}

function Footer({ current, ctaLabel, onNext }: { current: number; ctaLabel: string; onNext: () => void }) {
  return (
    <div
      style={{
        padding: "16px 28px calc(36px + env(safe-area-inset-bottom))",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <ProgressDots current={current} />
      <NextButton label={ctaLabel} onClick={onNext} />
    </div>
  );
}

function Step1({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", background: BG, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <Image
        src="/抽象画像/抽象画像1.png"
        alt=""
        width={340}
        height={340}
        style={{ position: "absolute", width: 340, height: 340, objectFit: "contain", opacity: 0.28, bottom: 60, right: -70, pointerEvents: "none" }}
        aria-hidden
      />
      <Image
        src="/抽象画像/抽象画像3.png"
        alt=""
        width={180}
        height={180}
        style={{ position: "absolute", width: 180, height: 180, objectFit: "contain", opacity: 0.15, top: 80, left: -50, pointerEvents: "none" }}
        aria-hidden
      />

      <SkipButton onClick={onSkip} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 32px" }}>
        <Image
          src="/角丸アイコン.png"
          alt="KAKERU"
          width={100}
          height={100}
          style={{
            width: 100,
            height: 100,
            borderRadius: 24,
            objectFit: "cover",
            boxShadow: "0 8px 28px rgba(255,107,0,0.32)",
            marginBottom: 20,
          }}
          priority
        />
        <h1 style={{ fontSize: 26, fontWeight: 800, color: DARK, lineHeight: 1.25, marginBottom: 12, letterSpacing: "-0.02em", textAlign: "center" }}>
          KAKERUへようこそ！
        </h1>
        <p style={{ fontSize: 15, color: SUB, lineHeight: 1.75, fontWeight: 400, textAlign: "center", marginBottom: 32 }}>
          罰金で、走る習慣をつくる。<br />あなたのランニングを、次のレベルへ。
        </p>
        <Image
          src="/その他素材/走らなければ-transparent.png"
          alt="走らなければ、課金される。"
          width={340}
          height={120}
          style={{ width: "88%", height: "auto", objectFit: "contain", filter: "drop-shadow(0 4px 16px rgba(255,107,0,0.2))" }}
        />
      </div>

      <Footer current={0} ctaLabel="次へ →" onNext={onNext} />
    </div>
  );
}

function Step2({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", background: BG, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          position: "absolute", bottom: 80, left: -60,
          width: 320, height: 320, opacity: 0.18,
          backgroundImage: "url(/抽象画像/抽象画像1.png)",
          backgroundSize: "contain", backgroundRepeat: "no-repeat",
          filter: "blur(1px)",
          pointerEvents: "none",
        }}
        aria-hidden
      />
      <div
        style={{
          position: "absolute", top: 60, right: -40,
          width: 160, height: 160, opacity: 0.13,
          backgroundImage: "url(/抽象画像/抽象画像4.png)",
          backgroundSize: "contain", backgroundRepeat: "no-repeat",
          pointerEvents: "none",
        }}
        aria-hidden
      />

      <SkipButton onClick={onSkip} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 28px" }}>
        <div style={{ height: 100, flexShrink: 0 }} />

        <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 16 }}>
          PENALTY RULE
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 800, color: DARK, lineHeight: 1.2, marginBottom: 16, letterSpacing: "-0.02em" }}>
          課金されるのは、<br />目標を達成しなかった<br />日だけ
        </h1>

        <p style={{ fontSize: 15, color: SUB, lineHeight: 1.7, fontWeight: 400 }}>
          走れば課金なし。<br />課金されたくないから、走る。
        </p>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, position: "relative", marginTop: 8 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative" }}>
              <div style={{
                position: "absolute", top: -6, right: -6,
                width: 26, height: 26, borderRadius: "50%",
                background: NG_RED, color: "#fff",
                fontSize: 11, fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 3, boxShadow: "0 2px 6px rgba(255,59,48,0.4)",
              }}>✕</div>
              <Image
                src="/stickman-assets/stickman-22.png"
                alt="走らない"
                width={120}
                height={120}
                style={{ width: 120, height: "auto", objectFit: "contain", filter: "drop-shadow(0 4px 12px rgba(255,107,0,0.15))" }}
              />
            </div>
            <div style={{
              background: "#FFF3EC", border: "1.5px solid #FFD4B2",
              borderRadius: 100, padding: "5px 14px",
              fontSize: 12, fontWeight: 700, color: ACCENT, whiteSpace: "nowrap",
            }}>走らない → 課金</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ width: 1, height: 36, background: "#E5D5C5" }} />
            <div style={{ fontSize: 11, fontWeight: 700, color: "#C4A882", letterSpacing: "0.12em" }}>VS</div>
            <div style={{ width: 1, height: 36, background: "#E5D5C5" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative" }}>
              <div style={{
                position: "absolute", top: -6, right: -6,
                width: 26, height: 26, borderRadius: "50%",
                background: OK_GREEN, color: "#fff",
                fontSize: 12, fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 3, boxShadow: "0 2px 6px rgba(52,199,89,0.4)",
              }}>✓</div>
              <Image
                src="/stickman-assets/stickman-02.png"
                alt="走る"
                width={120}
                height={120}
                style={{ width: 120, height: "auto", objectFit: "contain", filter: "drop-shadow(0 4px 12px rgba(52,199,89,0.15))" }}
              />
            </div>
            <div style={{
              background: "#F0FAF2", border: "1.5px solid #9EE0A8",
              borderRadius: 100, padding: "5px 14px",
              fontSize: 12, fontWeight: 700, color: "#2D8A3E", whiteSpace: "nowrap",
            }}>走る → ¥0</div>
          </div>
        </div>

        <p style={{ fontSize: 12, color: SKIP_COLOR, lineHeight: 1.6, textAlign: "center", marginBottom: 8 }}>
          ※ 罰金を有効にするには、クレジットカードの登録が必要です。
        </p>
      </div>

      <Footer current={1} ctaLabel="次へ →" onNext={onNext} />
    </div>
  );
}

function Step3({ onNext }: { onNext: () => void }) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", background: BG, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          position: "absolute", bottom: 120, left: 0, right: 0,
          height: 120, opacity: 0.25,
          backgroundImage: "url(/抽象画像/抽象画像2.png)",
          backgroundSize: "cover", backgroundRepeat: "no-repeat", backgroundPosition: "center",
          pointerEvents: "none",
        }}
        aria-hidden
      />
      <div
        style={{
          position: "absolute", top: 30, left: -40, width: 180, height: 180, opacity: 0.12,
          backgroundImage: "url(/抽象画像/抽象画像1.png)",
          backgroundSize: "contain", backgroundRepeat: "no-repeat",
          pointerEvents: "none",
        }}
        aria-hidden
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 28px" }}>
        <div style={{ height: 100, flexShrink: 0 }} />

        <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 16 }}>
          GET STARTED
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 800, color: DARK, lineHeight: 1.2, marginBottom: 12, letterSpacing: "-0.02em" }}>
          目標を設定する
        </h1>

        <p style={{ fontSize: 15, color: SUB, lineHeight: 1.7, fontWeight: 400, maxWidth: 300, marginBottom: 16 }}>
          曜日の繰り返し目標や、特定の日付で目標を立てられます。
        </p>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
          <div style={{
            position: "absolute",
            width: 240, height: 240,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,180,80,0.22) 0%, transparent 70%)",
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }} />
          <div style={{
            borderRadius: 20, overflow: "hidden",
            boxShadow: "0 20px 50px rgba(28,16,8,0.2), 0 4px 16px rgba(255,107,0,0.12)",
            border: "1px solid rgba(255,255,255,0.8)",
            maxWidth: 200, width: "100%", position: "relative", zIndex: 2,
          }}>
            <Image
              src="/その他素材/ホーム画面スクショ.png"
              alt="ホーム画面"
              width={400}
              height={800}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>
        </div>
      </div>

      <Footer current={2} ctaLabel="次へ →" onNext={onNext} />
    </div>
  );
}

function Step4({ onFinish }: { onFinish: () => void }) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", background: BG, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <Image
        src="/抽象画像/抽象画像2.png"
        alt=""
        width={320}
        height={320}
        style={{ position: "absolute", width: 320, height: 320, objectFit: "contain", opacity: 0.2, bottom: 60, right: -60, pointerEvents: "none" }}
        aria-hidden
      />
      <Image
        src="/抽象画像/抽象画像4.png"
        alt=""
        width={160}
        height={160}
        style={{ position: "absolute", width: 160, height: 160, objectFit: "contain", opacity: 0.14, top: 80, left: -30, pointerEvents: "none" }}
        aria-hidden
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 28px" }}>
        <div style={{ height: 100, flexShrink: 0 }} />

        <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 12 }}>
          GET STARTED
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 800, color: DARK, lineHeight: 1.2, marginBottom: 12, letterSpacing: "-0.02em" }}>
          まずは軽めの目標から
        </h1>

        <p style={{ fontSize: 15, color: SUB, lineHeight: 1.7, fontWeight: 400, maxWidth: 280 }}>
          最初から高い目標は必要ありません。続けられるペースから始めましょう。
        </p>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 12, position: "relative" }}>
          <div style={{
            position: "absolute",
            width: 240, height: 240,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,180,80,0.2) 0%, transparent 70%)",
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }} />
          <div style={{
            borderRadius: 24, overflow: "hidden",
            boxShadow: "0 24px 60px rgba(28,16,8,0.22), 0 4px 16px rgba(255,107,0,0.14)",
            border: "1px solid rgba(255,255,255,0.8)",
            maxWidth: 300, width: "100%", position: "relative", zIndex: 2,
          }}>
            <Image
              src="/その他素材/オンボーディング-目標作成.png"
              alt="目標設定画面"
              width={440}
              height={240}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>
        </div>
      </div>

      <Footer current={3} ctaLabel="Kakeruをはじめる" onNext={onFinish} />
    </div>
  );
}

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const touchStartX = useRef<number | null>(null);

  function done() {
    localStorage.setItem(STORAGE_KEY, "1");
    onDone();
  }

  function next() {
    if (step < TOTAL_STEPS - 1) setStep(step + 1);
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

  const screens = [
    <Step1 key="s1" onNext={next} onSkip={done} />,
    <Step2 key="s2" onNext={next} onSkip={done} />,
    <Step3 key="s3" onNext={next} />,
    <Step4 key="s4" onFinish={done} />,
  ];

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: BG,
        userSelect: "none",
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>
        {screens.map((screen, i) => (
          <div
            key={i}
            style={{
              position: "absolute", inset: 0,
              transition: "transform 0.4s cubic-bezier(.4,0,.2,1), opacity 0.3s",
              transform: i === step ? "translateX(0)" : i < step ? "translateX(-100%)" : "translateX(100%)",
              opacity: i === step ? 1 : 0,
              pointerEvents: i === step ? "auto" : "none",
            }}
          >
            {screen}
          </div>
        ))}
      </div>
    </div>
  );
}
