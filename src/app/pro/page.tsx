"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AppShell from "@/components/AppShell";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, ChevronDown, ChevronUp } from "lucide-react";

const PRO_FEATURES = [
  {
    title: "チャレンジ目標",
    desc: "「今月100km走る」など期間累計でゴール設定。達成できなければ課金。最高難度の縛り。",
    img: "/stickman-assets/stickman-08.png",
    tag: "CHALLENGE",
    color: "#FFF5EE",
  },
  {
    title: "エスカレーション",
    desc: "サボるたびに罰金が自動で上がる。連続失敗で倍になっていく。やるしかない仕組み。",
    img: "/stickman-assets/stickman-03.png",
    tag: "ESCALATION",
    color: "#FFF5EE",
  },
  {
    title: "クーリング期間",
    desc: "設定後N週間は目標を変更・削除不可。逃げ道を自分で塞ぐ、本気の宣言。",
    img: "/stickman-assets/stickman-06.png",
    tag: "COOLING",
    color: "#FFF5EE",
  },
  {
    title: "目標ロック",
    desc: "単発目標の直前キャンセルを封印。「やっぱりやめた」が使えなくなる。",
    img: "/stickman-assets/stickman-07.png",
    tag: "LOCK",
    color: "#FFF5EE",
  },
];

const COMPARE_ROWS = [
  { label: "GPS ランニング計測", free: true, pro: true },
  { label: "罰金ゴール設定", free: true, pro: true },
  { label: "月1回スキップ", free: true, pro: true },
  { label: "チャレンジ目標", free: false, pro: true },
  { label: "エスカレーション（罰金自動増加）", free: false, pro: true },
  { label: "クーリング期間", free: false, pro: true },
  { label: "目標ロック", free: false, pro: true },
];

const FAQ_ITEMS = [
  {
    q: "解約はいつでもできますか？",
    a: "はい、いつでも解約できます。「プランを管理する」から Stripe のカスタマーポータルへ進み、数タップで完了します。解約後も期間終了まで PRO 機能をご利用いただけます。",
  },
  {
    q: "年額プランはいつ請求されますか？",
    a: "加入日から1年ごとに自動更新されます。更新7日前に Stripe からメールでご案内が届きます。",
  },
  {
    q: "月額から年額に変更できますか？",
    a: "「プランを管理する」からいつでも変更できます。差額は日割りで精算されます。",
  },
  {
    q: "カード情報の変更はできますか？",
    a: "「プランを管理する」のカスタマーポータルからカード情報を更新できます。",
  },
];

export default function ProPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [cardInfo, setCardInfo] = useState<{ brand: string; last4: string } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setChecking(false); return; }
      supabase.from("users").select("is_subscribed").eq("id", user.id).single()
        .then(({ data }) => {
          if (data?.is_subscribed) { setIsSubscribed(true); setChecking(false); return; }
          setChecking(false);
          fetch("/api/stripe/payment-method")
            .then((r) => r.json())
            .then((d: { card?: { brand: string; last4: string } }) => {
              if (d.card) setCardInfo(d.card);
            })
            .catch(() => {});
        });
    });
  }, [router]);

  async function handleDirectSubscribe() {
    setLoading(true);
    const res = await fetch("/api/stripe/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json() as { success?: boolean };
    if (data.success) window.location.href = "/pro/success";
    else setLoading(false);
  }

  async function handleCheckout() {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json() as { url?: string; success?: boolean };
    if (data.success) window.location.href = "/pro/success";
    else if (data.url) window.location.href = data.url;
    else setLoading(false);
  }

  return (
    <AppShell>
      <div style={{ background: "#FAFAFA", minHeight: "100vh" }}>

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

        {/* ═══ ヒーロー ═══ */}
        <div style={{ position: "relative", background: "white", overflow: "hidden", paddingBottom: "40px" }}>

          {/* 背景: 大きなオレンジ円 */}
          <div style={{
            position: "absolute", top: "-80px", right: "-80px",
            width: "300px", height: "300px",
            background: "radial-gradient(circle at center, #FFE8D6 0%, rgba(255,232,214,0) 70%)",
          }} />
          <div style={{
            position: "absolute", bottom: "-40px", left: "-60px",
            width: "200px", height: "200px",
            background: "radial-gradient(circle at center, #FFF5EE 0%, rgba(255,245,238,0) 70%)",
          }} />

          <div style={{ position: "relative", padding: "32px 24px 0" }}>

            {/* PRO ピル */}
            <div style={{ marginBottom: "20px" }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "5px",
                background: "linear-gradient(135deg, #FF6B00, #FF9500)",
                color: "white", fontSize: "10px", fontWeight: 900,
                letterSpacing: "0.18em", padding: "5px 14px", borderRadius: "99px",
                boxShadow: "0 4px 14px rgba(255,107,0,0.4)",
              }}>
                ★ PRO
              </span>
            </div>

            {/* メインコピー + 棒人間 */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: "0px", marginBottom: "24px" }}>
              <div style={{ flex: 1 }}>
                <h1 style={{
                  fontSize: "36px", fontWeight: 900, color: "#111111",
                  lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: "14px",
                }}>
                  本気の自分に、<br />
                  <span style={{ color: "#FF6B00" }}>なる。</span>
                </h1>
                <p style={{ fontSize: "14px", color: "#777777", lineHeight: 1.75 }}>
                  逃げ道を自分で塞ぐ。<br />
                  PRO 機能で、本物のコミットメントを。
                </p>
              </div>
              <div style={{ flexShrink: 0, marginBottom: "-8px" }}>
                <Image
                  src="/stickman-assets/stickman-02.png"
                  alt=""
                  width={110}
                  height={110}
                  style={{ width: 110, height: 110, objectFit: "contain" }}
                />
              </div>
            </div>

            {/* 価格表示 */}
            {!checking && !isSubscribed && (
              <div style={{
                background: "#F8F8F8", borderRadius: "14px", padding: "16px 20px",
                borderLeft: "4px solid #FF6B00",
              }}>
                <p style={{ fontSize: "11px", color: "#AAAAAA", marginBottom: "4px", fontWeight: 600 }}>月額わずか</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                  <span className="metric-value" style={{ fontSize: "38px", color: "#111111", lineHeight: 1 }}>¥480</span>
                  <span style={{ fontSize: "14px", color: "#888888" }}>/月</span>
                </div>
                <p style={{ fontSize: "12px", color: "#FF6B00", fontWeight: 600, marginTop: "5px" }}>
                  年額なら ¥4,800（2ヶ月分お得）
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ═══ FREE vs PRO 比較表 ═══ */}
        <div style={{ padding: "32px 16px 0" }}>
          <p style={{ fontSize: "10px", color: "#AAAAAA", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "14px" }}>
            FREE vs PRO
          </p>
          <div style={{ background: "white", borderRadius: "18px", overflow: "hidden", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
            {/* ヘッダー行 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 52px 64px", background: "#F8F8F8", padding: "12px 16px", borderBottom: "1px solid #F0F0F0" }}>
              <span style={{ fontSize: "11px", color: "#AAAAAA", fontWeight: 700 }}>機能</span>
              <span style={{ fontSize: "11px", color: "#888888", fontWeight: 700, textAlign: "center" }}>FREE</span>
              <span style={{ fontSize: "11px", color: "#FF6B00", fontWeight: 800, textAlign: "center" }}>PRO</span>
            </div>
            {COMPARE_ROWS.map((row, i) => (
              <div
                key={i}
                style={{
                  display: "grid", gridTemplateColumns: "1fr 52px 64px",
                  padding: "13px 16px",
                  borderBottom: i < COMPARE_ROWS.length - 1 ? "1px solid #F8F8F8" : "none",
                  background: !row.free && row.pro ? "#FFFBF8" : "white",
                }}
              >
                <span style={{ fontSize: "13px", color: "#333333", fontWeight: !row.free ? 600 : 400 }}>
                  {row.label}
                </span>
                <span style={{ textAlign: "center", fontSize: "15px", color: row.free ? "#22C55E" : "#DDDDDD" }}>
                  {row.free ? "✓" : "—"}
                </span>
                <span style={{ textAlign: "center", fontSize: "15px", color: "#FF6B00", fontWeight: 700 }}>
                  ✓
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ PRO 機能一覧 ═══ */}
        <div style={{ padding: "32px 16px 0" }}>
          <p style={{ fontSize: "10px", color: "#AAAAAA", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "16px" }}>
            PRO FEATURES
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {PRO_FEATURES.map((feature) => (
              <div
                key={feature.tag}
                style={{
                  background: "white", borderRadius: "16px",
                  padding: "16px", display: "flex", gap: "14px", alignItems: "center",
                  boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
                  border: "1px solid #F5F5F5",
                }}
              >
                <div style={{
                  flexShrink: 0, width: "68px", height: "68px",
                  background: "#FFF5EE", borderRadius: "14px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Image src={feature.img} alt="" width={52} height={52} style={{ width: 52, height: 52, objectFit: "contain" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "10px", color: "#FF6B00", fontWeight: 800, letterSpacing: "0.1em", marginBottom: "4px" }}>
                    {feature.tag}
                  </p>
                  <p style={{ fontSize: "15px", fontWeight: 700, color: "#111111", marginBottom: "5px" }}>
                    {feature.title}
                  </p>
                  <p style={{ fontSize: "12px", color: "#888888", lineHeight: 1.65 }}>
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ 料金プラン / 管理リンク ═══ */}
        {isSubscribed ? (
          <div style={{ padding: "32px 16px 0" }}>
            <a
              href="/pro/manage"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                minHeight: "52px", borderRadius: "14px",
                background: "linear-gradient(135deg, #FF6B00, #FF9500)",
                color: "white", fontSize: "15px", fontWeight: 800,
                textDecoration: "none",
                boxShadow: "0 6px 20px rgba(255,107,0,0.35)",
              }}
            >
              プランを管理する
            </a>
          </div>
        ) : (
        <div style={{ padding: "32px 16px 0" }}>
            <p style={{ fontSize: "10px", color: "#AAAAAA", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "16px" }}>
              PRICING
            </p>

            {/* 月額/年額 トグル */}
            <div style={{ display: "flex", background: "#EFEFEF", borderRadius: "12px", padding: "4px", marginBottom: "16px" }}>
              {(["monthly", "yearly"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlan(p)}
                  style={{
                    flex: 1, minHeight: "42px", borderRadius: "9px", border: "none", cursor: "pointer",
                    background: plan === p ? "white" : "transparent",
                    boxShadow: plan === p ? "0 1px 4px rgba(0,0,0,0.12)" : "none",
                    transition: "all 0.18s",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1px",
                  }}
                >
                  <span style={{ fontSize: "13px", fontWeight: plan === p ? 700 : 500, color: plan === p ? "#111111" : "#888888" }}>
                    {p === "monthly" ? "月額" : "年額"}
                  </span>
                  {p === "yearly" && (
                    <span style={{ fontSize: "9px", fontWeight: 700, color: plan === "yearly" ? "#FF6B00" : "#BBBBBB", letterSpacing: "0.04em" }}>
                      2ヶ月分お得
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* 価格カード */}
            <div style={{
              background: "white", borderRadius: "20px",
              padding: "28px 24px 24px",
              border: plan === "yearly" ? "2px solid #FF6B00" : "1.5px solid #F0F0F0",
              textAlign: "center", marginBottom: "16px",
              position: "relative", overflow: "hidden",
              boxShadow: plan === "yearly" ? "0 4px 20px rgba(255,107,0,0.12)" : "0 1px 8px rgba(0,0,0,0.05)",
              transition: "all 0.2s",
            }}>
              {plan === "yearly" && (
                <div style={{
                  position: "absolute", top: "0", right: "0",
                  background: "#FF6B00", color: "white",
                  fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em",
                  padding: "6px 16px",
                  borderBottomLeftRadius: "12px",
                }}>
                  BEST VALUE
                </div>
              )}

              <p style={{ fontSize: "12px", color: "#AAAAAA", fontWeight: 600, marginBottom: "10px" }}>
                {plan === "monthly" ? "月額" : "年額一括 / 月あたり"}
              </p>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "2px", marginBottom: "8px" }}>
                <span className="metric-value" style={{ fontSize: "54px", color: "#111111", lineHeight: 1, letterSpacing: "-0.02em" }}>
                  ¥{plan === "monthly" ? "480" : "400"}
                </span>
                <span style={{ fontSize: "16px", color: "#AAAAAA", fontWeight: 500 }}>/月</span>
              </div>
              {plan === "yearly" ? (
                <p style={{ fontSize: "13px", color: "#FF6B00", fontWeight: 700 }}>
                  年間 ¥4,800（¥960 お得）
                </p>
              ) : (
                <p style={{ fontSize: "12px", color: "#BBBBBB" }}>いつでも解約できます</p>
              )}
            </div>

            {cardInfo ? (
              <>
                {/* 登録済みカードで1タップ加入 */}
                <div style={{
                  background: "#F8F8F8", borderRadius: "14px", padding: "14px 16px",
                  display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px",
                }}>
                  <div style={{ width: "36px", height: "24px", background: "#1A1A2E", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: "8px", color: "white", fontWeight: 700, letterSpacing: "0.05em" }}>CARD</span>
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#111111", margin: 0 }}>
                      {cardInfo.brand.toUpperCase()} **** {cardInfo.last4}
                    </p>
                    <p style={{ fontSize: "11px", color: "#AAAAAA", margin: 0 }}>登録済みのカード</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowConfirm(true)}
                  disabled={loading}
                  style={{
                    width: "100%", minHeight: "56px",
                    background: loading ? "#E0E0E0" : "linear-gradient(135deg, #FF6B00 0%, #FF9500 100%)",
                    border: "none", borderRadius: "16px",
                    color: "white", fontSize: "16px", fontWeight: 800,
                    cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: loading ? "none" : "0 6px 24px rgba(255,107,0,0.45)",
                    transition: "all 0.2s", marginBottom: "10px",
                  }}
                >
                  {loading ? "処理中..." : `このカードで加入する — ¥${plan === "monthly" ? "480/月" : "4,800/年"}`}
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  style={{ width: "100%", background: "none", border: "none", fontSize: "13px", color: "#AAAAAA", cursor: "pointer", padding: "4px" }}
                >
                  別のカードで支払う
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  style={{
                    width: "100%", minHeight: "56px",
                    background: loading ? "#E0E0E0" : "linear-gradient(135deg, #FF6B00 0%, #FF9500 100%)",
                    border: "none", borderRadius: "16px",
                    color: "white", fontSize: "16px", fontWeight: 800,
                    cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: loading ? "none" : "0 6px 24px rgba(255,107,0,0.45)",
                    transition: "all 0.2s", marginBottom: "12px",
                  }}
                >
                  {loading ? "処理中..." : `PRO を始める — ¥${plan === "monthly" ? "480/月" : "4,800/年"}`}
                </button>
                <p style={{ fontSize: "11px", color: "#BBBBBB", textAlign: "center" }}>
                  Stripe による安全な決済 · いつでも解約可能
                </p>
              </>
            )}
          </div>

        )}

        {/* ═══ FAQ ═══ */}
        <div style={{ padding: "32px 16px 0" }}>
          <p style={{ fontSize: "10px", color: "#AAAAAA", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "14px" }}>
            FAQ
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} style={{ background: "white", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "16px", background: "none", border: "none", cursor: "pointer",
                    textAlign: "left", gap: "12px",
                  }}
                >
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "#111111", lineHeight: 1.5, flex: 1 }}>
                    {item.q}
                  </span>
                  {openFaq === i
                    ? <ChevronUp size={16} color="#AAAAAA" aria-hidden="true" />
                    : <ChevronDown size={16} color="#AAAAAA" aria-hidden="true" />
                  }
                </button>
                {openFaq === i && (
                  <div style={{ padding: "0 16px 16px" }}>
                    <p style={{ fontSize: "13px", color: "#666666", lineHeight: 1.8 }}>{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ═══ 底部 CTA ═══ */}
        {!isSubscribed && <div style={{ padding: "40px 16px calc(env(safe-area-inset-bottom) + 40px)", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
            <Image src="/stickman-assets/stickman-01.png" alt="" width={80} height={80} style={{ width: 80, height: 80, objectFit: "contain" }} />
          </div>
          <p style={{ fontSize: "20px", fontWeight: 900, color: "#111111", marginBottom: "8px", letterSpacing: "-0.01em" }}>
            さあ、本気で始めよう。
          </p>
          <p style={{ fontSize: "13px", color: "#888888", marginBottom: "28px", lineHeight: 1.6 }}>
            ¥480/月で、逃げない自分をつくる。
          </p>
          <button
            onClick={cardInfo ? () => setShowConfirm(true) : handleCheckout}
            disabled={loading}
            style={{
              width: "100%", minHeight: "56px",
              background: loading ? "#E0E0E0" : "linear-gradient(135deg, #FF6B00, #FF9500)",
              border: "none", borderRadius: "16px",
              color: "white", fontSize: "16px", fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 6px 24px rgba(255,107,0,0.4)",
            }}
          >
            {loading ? "処理中..." : "PRO を始める"}
          </button>
        </div>}

      </div>
      {!isSubscribed && showConfirm && (
        <>
          <div
            onClick={() => setShowConfirm(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 100 }}
          />
          <div style={{
            position: "fixed", bottom: 0, left: 0, right: 0,
            background: "white", borderRadius: "24px 24px 0 0",
            padding: "28px 24px calc(env(safe-area-inset-bottom) + 28px)",
            zIndex: 101,
            boxShadow: "0 -4px 32px rgba(0,0,0,0.12)",
          }}>
            <p style={{ fontSize: "18px", fontWeight: 800, color: "#111111", marginBottom: "20px", textAlign: "center" }}>
              PRO プランに加入しますか？
            </p>
            <div style={{
              background: "#F8F8F8", borderRadius: "12px", padding: "14px 16px",
              display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px",
            }}>
              <div style={{ width: "36px", height: "24px", background: "#1A1A2E", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: "8px", color: "white", fontWeight: 700 }}>CARD</span>
              </div>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "#111111" }}>
                {cardInfo!.brand.toUpperCase()} **** {cardInfo!.last4}
              </span>
            </div>
            <div style={{ background: "#FFF5EE", borderRadius: "12px", padding: "14px 16px", marginBottom: "24px", textAlign: "center" }}>
              <p style={{ fontSize: "22px", fontWeight: 900, color: "#FF6B00", margin: 0 }}>
                ¥{plan === "monthly" ? "480 / 月" : "4,800 / 年"}
              </p>
              <p style={{ fontSize: "11px", color: "#AAAAAA", margin: "4px 0 0" }}>いつでも解約できます</p>
            </div>
            <button
              onClick={() => { setShowConfirm(false); handleDirectSubscribe(); }}
              disabled={loading}
              style={{
                width: "100%", minHeight: "54px",
                background: "linear-gradient(135deg, #FF6B00, #FF9500)",
                border: "none", borderRadius: "14px",
                color: "white", fontSize: "16px", fontWeight: 800,
                cursor: "pointer", marginBottom: "10px",
                boxShadow: "0 4px 20px rgba(255,107,0,0.4)",
              }}
            >
              加入する
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              style={{
                width: "100%", minHeight: "48px",
                background: "none", border: "none",
                fontSize: "15px", color: "#888888", cursor: "pointer",
              }}
            >
              キャンセル
            </button>
          </div>
        </>
      )}
    </AppShell>
  );
}
