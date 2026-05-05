import Image from "next/image";
import BackButton from "@/components/BackButton";
import {
  SkipForward, BarChart2, Mail, Bell, Download, CreditCard,
  TrendingUp, Lock, Shield, Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const STEPS = [
  {
    num: "01",
    title: "目標を作る",
    body: "距離・日数・罰金額を設定。「週5日、3km」など自分のペースでOK。",
    img: "/stickman-assets/stickman-23.png",
    imgW: 90,
    imgH: 110,
  },
  {
    num: "02",
    title: "毎日走って記録する",
    body: "走ったらアプリで記録。目標を達成した日は課金なし。",
    img: "/stickman-assets/stickman-05.png",
    imgW: 130,
    imgH: 130,
  },
  {
    num: "03",
    title: "達成できなかった日は自動課金",
    body: "走れなかった日だけ、設定した金額が引き落とされる。「課金されたくないから走る」の仕組み。",
    img: "/stickman-assets/stickman-12.png",
    imgW: 150,
    imgH: 110,
  },
] as const;

type Feature = { icon: LucideIcon; title: string; body: string; highlight?: boolean };

const FREE_FEATURES: Feature[] = [
  {
    icon: SkipForward,
    title: "スキップ",
    body: "体調不良・急用の日はスキップできます。スキップした日は罰金なし。当日以外であれば取り消し無制限なので、誤操作も安心。",
    highlight: true,
  },
  { icon: BarChart2, title: "記録・履歴確認", body: "記録ページで過去の走行履歴・達成状況・罰金履歴をいつでも確認できます。" },
  { icon: Mail, title: "メール通知", body: "達成・未達成の結果や重要なお知らせをメールでお届けします。" },
  { icon: Bell, title: "プッシュ通知", body: "目標の締め切り前にプッシュ通知でリマインド。走り忘れを防ぎます。" },
  { icon: Download, title: "ホーム画面に追加", body: "PWAとしてインストールすれば、アプリのように1タップで起動できます。" },
  { icon: CreditCard, title: "カード登録と罰金", body: "罰金を有効にするにはクレジットカードの登録が必要です。未登録なら罰金なし — 普通のランニングアプリとしても使えます。" },
];

const PRO_FEATURES: Feature[] = [
  { icon: TrendingUp, title: "連続失敗で罰金増加", body: "毎週目標を連続で失敗すると罰金が自動増加。「倍率方式」と「上乗せ方式」の2種類から選択でき、上限は基本罰金の5倍。" },
  { icon: Lock, title: "取り消し不可能", body: "1回限りの目標に設定すると、作成後から実施当日まで削除・変更が一切できなくなります。逃げ道を完全にふさぎたい人向け。" },
  { icon: Shield, title: "初期クーリング期間", body: "目標作成時に「最初のX週間は変更・停止不可」を設定できます（2/4/8/12週から選択）。新習慣を強制的に定着させます。" },
  { icon: Target, title: "集中チャレンジモード", body: "指定した期間内に累計距離・時間を達成するモード（例：30日で累計100km）。期間終了時に一括判定し、未達成なら罰金発生。期間中は停止不可。" },
];

function FeatureCard({ icon: Icon, title, body, highlight }: Feature) {
  return (
    <div style={{
      display: "flex", gap: "14px",
      padding: "16px 18px",
      background: highlight ? "#FFF8F4" : "white",
      borderRadius: "16px",
      border: `1px solid ${highlight ? "rgba(255,107,0,0.18)" : "#EFEFEF"}`,
    }}>
      <div style={{
        width: "42px", height: "42px", flexShrink: 0,
        background: highlight ? "rgba(255,107,0,0.1)" : "#F5F5F7",
        borderRadius: "12px",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={18} color="#FF6B00" strokeWidth={1.8} />
      </div>
      <div>
        <p style={{ fontSize: "14px", fontWeight: 700, color: "#1C1008", marginBottom: "5px" }}>{title}</p>
        <p style={{ fontSize: "13px", lineHeight: 1.7, color: "#6B5236" }}>{body}</p>
      </div>
    </div>
  );
}

function ProFeatureCard({ icon: Icon, title, body }: Feature) {
  return (
    <div style={{
      display: "flex", gap: "14px",
      padding: "16px 18px",
      background: "#FFFBF5",
      borderRadius: "16px",
      border: "1px solid rgba(255,149,0,0.22)",
    }}>
      <div style={{
        width: "42px", height: "42px", flexShrink: 0,
        background: "linear-gradient(135deg, rgba(255,107,0,0.12), rgba(255,149,0,0.12))",
        borderRadius: "12px",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={18} color="#FF6B00" strokeWidth={1.8} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
          <p style={{ fontSize: "14px", fontWeight: 700, color: "#1C1008" }}>{title}</p>
          <span style={{
            fontFamily: "var(--font-display)",
            fontSize: "9px", fontWeight: 900, letterSpacing: "0.08em",
            background: "linear-gradient(135deg, #FF6B00, #FF9500)",
            color: "white", padding: "2px 7px", borderRadius: "99px",
            flexShrink: 0,
          }}>PRO</span>
        </div>
        <p style={{ fontSize: "13px", lineHeight: 1.7, color: "#6B5236" }}>{body}</p>
      </div>
    </div>
  );
}

export default function HowToPage() {
  return (
    <div style={{ background: "#FAFAFA", minHeight: "100dvh" }}>
      <div style={{ maxWidth: "480px", margin: "0 auto", background: "white", minHeight: "100dvh" }}>

        {/* ヘッダー */}
        <header style={{
          position: "sticky", top: 0, zIndex: 50,
          background: "rgba(255,255,255,0.92)", backdropFilter: "blur(16px)",
          borderBottom: "1px solid #EDE0CC",
          height: "56px", display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "0 20px",
        }}>
          <BackButton loggedInHref="/goals" />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Image src="/stickman-assets/stickman-01.png" width={22} height={22} alt="" style={{ width: 22, height: 22, objectFit: "contain" }} />
            <span style={{ fontFamily: "var(--font-display)", fontSize: "19px", fontWeight: 900, fontStyle: "italic", color: "#FF6B00", letterSpacing: "0.06em" }}>KAKERU</span>
          </div>
          <div style={{ width: 60 }} />
        </header>

        <main style={{ padding: "32px 20px calc(env(safe-area-inset-bottom) + 48px)" }}>

          {/* ── HOW IT WORKS ── */}
          <p style={{
            fontFamily: "var(--font-display)",
            fontSize: "11px", fontWeight: 900, letterSpacing: "0.2em",
            color: "#FF6B00", textTransform: "uppercase",
            marginBottom: "20px",
          }}>
            How It Works
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {STEPS.map((step, i) => (
              <div key={step.num}>
                {/* ステップカード */}
                <div style={{
                  position: "relative",
                  background: "white",
                  borderRadius: "20px",
                  border: "1px solid #F0ECE6",
                  padding: "20px 20px 20px 20px",
                  overflow: "hidden",
                  minHeight: "140px",
                }}>
                  {/* 背景の大きな数字 */}
                  <span style={{
                    position: "absolute",
                    top: -10,
                    right: 12,
                    fontFamily: "var(--font-display)",
                    fontSize: "100px",
                    fontWeight: 900,
                    color: "rgba(255,107,0,0.06)",
                    lineHeight: 1,
                    userSelect: "none",
                    pointerEvents: "none",
                  }}>
                    {step.num}
                  </span>

                  {/* STEP ラベル + 番号 */}
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "10px" }}>
                    <span style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "10px", fontWeight: 900, letterSpacing: "0.2em",
                      color: "#FF6B00", textTransform: "uppercase",
                    }}>STEP</span>
                    <span style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "36px", fontWeight: 900,
                      color: "#FF6B00", lineHeight: 1,
                    }}>{step.num}</span>
                  </div>

                  {/* テキスト（右のstickmanと被らないよう幅制限） */}
                  <div style={{ maxWidth: `calc(100% - ${step.imgW + 8}px)` }}>
                    <p style={{ fontSize: "16px", fontWeight: 800, color: "#1C1008", marginBottom: "7px", lineHeight: 1.3 }}>
                      {step.title}
                    </p>
                    <p style={{ fontSize: "13px", lineHeight: 1.75, color: "#6B5236" }}>
                      {step.body}
                    </p>
                  </div>

                  {/* stickman */}
                  <div style={{
                    position: "absolute",
                    right: 0,
                    bottom: 0,
                    width: `${step.imgW}px`,
                    height: `${step.imgH}px`,
                  }}>
                    <Image
                      src={step.img}
                      alt=""
                      fill
                      sizes={`${step.imgW}px`}
                      style={{ objectFit: "contain", objectPosition: "right bottom" }}
                    />
                  </div>
                </div>

                {/* ステップ間コネクター */}
                {i < STEPS.length - 1 && (
                  <div style={{ display: "flex", justifyContent: "center", padding: "2px 0" }}>
                    <div style={{
                      width: "2px",
                      height: "28px",
                      background: "repeating-linear-gradient(to bottom, #FF6B00 0, #FF6B00 4px, transparent 4px, transparent 9px)",
                    }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ── FEATURES ── */}
          <p style={{
            fontFamily: "var(--font-display)",
            fontSize: "11px", fontWeight: 900, letterSpacing: "0.2em",
            color: "#FF6B00", textTransform: "uppercase",
            marginTop: "44px", marginBottom: "14px",
          }}>
            Features
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {FREE_FEATURES.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>

          {/* PRO 小見出し */}
          <div style={{
            display: "flex", alignItems: "center", gap: "12px",
            marginTop: "32px", marginBottom: "14px",
          }}>
            <div style={{
              background: "linear-gradient(135deg, #FF6B00, #FF9500)",
              borderRadius: "10px", padding: "5px 14px",
              display: "flex", alignItems: "center", gap: "5px",
            }}>
              <span style={{ color: "white", fontSize: "11px" }}>★</span>
              <span style={{
                fontFamily: "var(--font-display)",
                fontSize: "13px", fontWeight: 900, letterSpacing: "0.1em",
                color: "white",
              }}>PRO</span>
            </div>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "#BBBBBB", letterSpacing: "0.05em" }}>
              プランで解放される機能
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {PRO_FEATURES.map((f) => (
              <ProFeatureCard key={f.title} {...f} />
            ))}
          </div>

        </main>
      </div>
    </div>
  );
}
