"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Plus, X } from "lucide-react";
import PublicHamburger from "@/components/PublicHamburger";

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "本当に課金されるの？",
    a: "はい。設定した目標を当日23:59までに達成しなかった場合、設定した罰金額が自動で引き落とされます。目標を達成すれば一切課金されません。",
  },
  {
    q: "どのように課金されるの？",
    a: "目標を設定する際に、決済サービス「Stripe」を通じてクレジットカードを登録していただきます。罰金が発生した場合は毎日23:59に自動で引き落とされます。達成していれば課金されません。",
  },
  {
    q: "クレカ情報は安全？",
    a: "カード情報はカケルのサーバーには一切保存されません。国際的な決済サービス「Stripe」が暗号化して管理しており、世界中の企業が採用する高いセキュリティ基準（PCI DSS）に準拠しています。",
  },
  {
    q: "課金額は自分で決められる？",
    a: "はい、目標ごとに100円からペナルティ額を自由に設定できます。自分へのプレッシャーに合わせて調整してください。",
  },
  {
    q: "いきなり高額請求されない？",
    a: "されません。課金は「1日の未達成につき、設定した罰金額」だけです。たとえば罰金500円に設定した場合、1日サボっても500円のみ。まとめて請求されることはありません。",
  },
];

export default function LpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("show");
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );
    rootRef.current.querySelectorAll(".fi").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={rootRef} className="lp-root">
      <style dangerouslySetInnerHTML={{ __html: LP_CSS }} />

      {/* NAV */}
      <nav className="lp-nav">
        <div className="nav-logo">
          <img src="/stickman-assets/stickman-01.png" style={{ width: 28, height: 28, objectFit: "contain" }} alt="" />
          <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", letterSpacing: "0.06em" }}>KAKERU</span>
        </div>
        <div className="lp-mobile-nav">
          <PublicHamburger />
        </div>
        <div className="lp-pc-nav">
          <Link href="/howto">使い方</Link>
          <a href="#faq">よくある質問</a>
          <Link href="/terms">利用規約</Link>
          <Link href="/auth" className="btn-nav">今すぐ始める</Link>
        </div>
      </nav>

      {/* HERO */}
      <section id="hero">
        <div className="hero-bg">
          <img src="/抽象画像/抽象画像4.png" style={{ position: "absolute", width: 320, top: -60, right: -60, opacity: 0.55 }} alt="" />
          <img src="/抽象画像/抽象画像1.png" style={{ position: "absolute", width: 220, bottom: -40, left: -60, opacity: 0.45 }} alt="" />
          <img src="/抽象画像/抽象画像2.png" style={{ position: "absolute", width: 140, top: 240, left: 20, opacity: 0.32 }} alt="" />
          <img src="/抽象画像/抽象画像5.png" style={{ position: "absolute", width: 110, top: 60, right: 30, opacity: 0.25 }} alt="" />
        </div>

        <div style={{ position: "relative", zIndex: 1 }} className="hero-inner">
          <div className="hero-content">
            <h1 className="hero-tag">ランニング習慣化アプリ</h1>
            <img src="/その他素材/走らなければ-transparent.png" className="hero-run-img" style={{ width: "100%", maxWidth: 280, display: "block", marginBottom: 20 }} alt="走らなければ、課金される。" />
            <p className="hero-sub">
              自分に甘いあなたのための、<br />本気の習慣化アプリ。
            </p>
          </div>
          <div className="hero-visual">
            <div className="phone-mock hero-phone">
              <div className="phone-mock-notch" />
              <div className="phone-mock-screen">
                <div className="phone-slider-track">
                  <img src="/スクショ/IMG_3735.PNG" alt="アプリ画面" />
                  <img src="/スクショ/IMG_3735.PNG" alt="アプリ画面" />
                  <img src="/スクショ/IMG_3735.PNG" alt="アプリ画面" />
                  <img src="/スクショ/IMG_3735.PNG" alt="アプリ画面" />
                  <img src="/スクショ/IMG_3735.PNG" alt="アプリ画面" />
                  <img src="/スクショ/IMG_3735.PNG" alt="アプリ画面" />
                </div>
              </div>
            </div>
          </div>
          <div className="hero-cta">
            <Link href="/auth" className="btn-primary">今すぐ始める（無料） →</Link>
            <Link href="/auth" className="btn-login">ログインはこちら →</Link>
          </div>
        </div>
      </section>

      <div className="wave" style={{ background: "#FEFCFA" }}>
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" height={60}>
          <path d="M0,20 C240,60 480,0 720,35 C960,60 1200,5 1440,25 L1440,60 L0,60 Z" fill="#FFFFFF" />
        </svg>
      </div>

      {/* TARGET */}
      <section id="target" style={{ background: "#FFFFFF" }}>
        <img src="/抽象画像/抽象画像3.png" className="abs-bg" style={{ width: 240, top: 40, left: -80, opacity: 0.28 }} alt="" />
        <img src="/抽象画像/抽象画像5.png" className="abs-bg" style={{ width: 180, bottom: 30, right: -60, opacity: 0.32 }} alt="" />
        <img src="/抽象画像/抽象画像1.png" className="abs-bg" style={{ width: 120, top: 80, right: 60, opacity: 0.18 }} alt="" />
        <div className="rel" style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <div className="s-label fi">FOR YOU</div>
          <h2 className="s-title fi" style={{ marginBottom: 28 }}>こんなあなたへ</h2>
          <p className="target-body fi">
            ほんとうは走りたいのに<br />
            ジョギングを習慣にしたいのに<br />
            思うように続かない。
          </p>
          <p className="target-body fi d2" style={{ marginTop: 20 }}>
            走り始めても、3日で挫折してしまう。<br />
            せっかく続いても、すぐサボってしまう。
          </p>
          <p className="target-conclusion fi d3">
            『Kakeru』を使えば、<br />もうそんなことはできません。
          </p>
        </div>
      </section>

      <div className="wave" style={{ background: "#FFFFFF" }}>
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" height={60}>
          <path d="M0,30 C300,55 700,5 1000,30 C1200,45 1340,15 1440,30 L1440,60 L0,60 Z" fill="#FEFCFA" />
        </svg>
      </div>

      {/* FEATURES */}
      <section id="features" style={{ background: "#FEFCFA" }}>
        <img src="/抽象画像/抽象画像6.png" className="abs-bg" style={{ width: 260, top: 0, right: -90, opacity: 0.32 }} alt="" />
        <img src="/抽象画像/抽象画像4.png" className="abs-bg" style={{ width: 200, bottom: 40, left: -80, opacity: 0.28 }} alt="" />
        <img src="/抽象画像/抽象画像2.png" className="abs-bg" style={{ width: 130, top: 200, left: 40, opacity: 0.2 }} alt="" />
        <div className="rel">
          <div className="s-label fi">FEATURES</div>
          <h2 className="s-title fi">3つの特徴</h2>

          <div className="feat-grid">
            <div className="feat-card fi d1">
              <div className="feat-icon">
                <img src="/その他素材/ターゲット.png" alt="目標を設定" />
              </div>
              <div>
                <div className="feat-catch">目標を設定する</div>
                <div className="feat-desc">距離・時間・罰金額を自分で決める。<br />続けやすい設計。</div>
              </div>
            </div>

            <div className="feat-card fi d2">
              <div className="feat-icon">
                <img src="/stickman-assets/stickman-05.png" alt="走れば無料" />
              </div>
              <div>
                <div className="feat-catch">走れば無料</div>
                <div className="feat-desc">目標を達成し続ければ、<br />お金は1円もかからない。</div>
              </div>
            </div>

            <div className="feat-card fi d3">
              <div className="feat-icon">
                <img src="/その他素材/山-transparent.png" alt="記録で振り返る" />
              </div>
              <div>
                <div className="feat-catch">記録で振り返る</div>
                <div className="feat-desc">達成率・走行距離・コースが<br />一目で確認できる。</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="wave" style={{ background: "#FEFCFA" }}>
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" height={60}>
          <path d="M0,40 C300,0 720,55 1080,20 C1250,5 1380,45 1440,30 L1440,60 L0,60 Z" fill="#FFFFFF" />
        </svg>
      </div>

      {/* HOW IT WORKS */}
      <section id="how" style={{ background: "#FFFFFF" }}>
        <img src="/抽象画像/抽象画像2.png" className="abs-bg" style={{ width: 280, top: -20, right: -80, opacity: 0.35 }} alt="" />
        <img src="/抽象画像/抽象画像3.png" className="abs-bg" style={{ width: 200, top: 360, left: -70, opacity: 0.28 }} alt="" />
        <img src="/抽象画像/抽象画像6.png" className="abs-bg" style={{ width: 160, bottom: 80, right: -40, opacity: 0.22 }} alt="" />
        <div className="rel">
          <div className="s-label fi">HOW IT WORKS</div>
          <h2 className="s-title fi">使い方</h2>
          <div className="how-dots fi"><span /><span /><span /></div>

          <div className="how-steps">
            <div className="how-step fi d1">
              <div className="how-step-visual">
                <div className="phone-mock how-phone">
                  <div className="phone-mock-notch" />
                  <div className="phone-mock-screen">
                    <img src="/スクショ/IMG_3735.PNG" alt="目標を設定" />
                  </div>
                </div>
              </div>
              <div className="how-step-text">
                <div className="how-step-num"><span className="how-step-num-badge">1</span>目標を設定する</div>
                <div className="how-step-title">距離・時間・<br />罰金額を決める</div>
                <p className="how-step-desc">曜日ごとに走る目標と、未達成時に課金される金額を設定してください。「サボらない」と覚悟を決めたら、続けやすい習慣の第一歩です。</p>
              </div>
            </div>

            <div className="how-step fi d2">
              <div className="how-step-visual">
                <div className="phone-mock how-phone">
                  <div className="phone-mock-notch" />
                  <div className="phone-mock-screen">
                    <img src="/スクショ/IMG_3735.PNG" alt="走って達成" />
                  </div>
                </div>
              </div>
              <div className="how-step-text">
                <div className="how-step-num"><span className="how-step-num-badge">2</span>スマホを持って走る</div>
                <div className="how-step-title">GPSで自動計測<br />達成判定もおまかせ</div>
                <p className="how-step-desc">スタートボタンを押して走り出すだけ。距離・ペース・コースが自動で記録され、目標達成も自動で判定されます。</p>
              </div>
            </div>

            <div className="how-step fi d3">
              <div className="how-step-visual">
                <div className="phone-mock how-phone">
                  <div className="phone-mock-notch" />
                  <div className="phone-mock-screen">
                    <img src="/スクショ/IMG_3735.PNG" alt="課金" />
                  </div>
                </div>
              </div>
              <div className="how-step-text">
                <div className="how-step-num"><span className="how-step-num-badge">3</span>走らなければ自動で課金</div>
                <div className="how-step-title">達成しなければ<br />設定額を自動引き落とし</div>
                <p className="how-step-desc">23:59 までに目標を達成できなかった場合、登録カードから設定した罰金額が自動で引き落とされます。逆に走れば、課金は一切ありません。</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="wave" style={{ background: "#FFFFFF" }}>
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" height={60}>
          <path d="M0,40 C300,0 700,55 1000,20 C1200,5 1340,50 1440,30 L1440,60 L0,60 Z" fill="#1C1008" />
        </svg>
      </div>

      {/* WHY */}
      <section id="why" style={{ background: "#1C1008" }}>
        <img src="/抽象画像/抽象画像5.png" className="abs-bg" style={{ width: 260, bottom: -40, right: -60, opacity: 0.1 }} alt="" />
        <div className="rel">
          <div className="s-label fi">THE SCIENCE</div>
          <h2 className="s-title fi" style={{ color: "white" }}>なぜ、ペナルティが効くのか</h2>

          <div className="why-vs fi">
            <div className="vs a">
              <img src="/stickman-assets/stickman-14.png" style={{ width: 80, margin: "0 auto 12px", display: "block", filter: "brightness(0) invert(1)", opacity: 0.5 }} alt="" />
              <div className="vs-label">従来の動機</div>
              <div className="vs-text">走れば<br />健康になる</div>
            </div>
            <div className="vs b">
              <img src="/stickman-assets/stickman-12.png" style={{ width: 80, margin: "0 auto 12px", display: "block", filter: "brightness(0) invert(1)" }} alt="" />
              <div className="vs-label">KAKERUの動機</div>
              <div className="vs-text">走らなければ<br />¥500 失う</div>
            </div>
          </div>

          <p className="why-note fi">
            人は「得ること」より<strong>「失うこと」</strong>に強く反応します——<strong>損失回避</strong>と呼ばれる心理です。KAKERUはこれを活用し、習慣化の壁を下げます。
          </p>
          <div style={{ textAlign: "center", marginTop: 20 }} className="fi">
            <img src="/その他素材/だから続く！-transparent.png" style={{ width: 140 }} alt="だから続く！" />
          </div>
        </div>
      </section>

      <div className="wave" style={{ background: "#1C1008" }}>
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" height={60}>
          <path d="M0,35 C200,0 500,60 800,25 C1050,5 1280,50 1440,20 L1440,60 L0,60 Z" fill="#FFFFFF" />
        </svg>
      </div>

      {/* FAQ */}
      <section id="faq" style={{ background: "#FFFFFF" }}>
        <img src="/抽象画像/抽象画像1.png" className="abs-bg" style={{ width: 220, top: 20, left: -70, opacity: 0.25 }} alt="" />
        <img src="/抽象画像/抽象画像4.png" className="abs-bg" style={{ width: 180, bottom: 60, right: -60, opacity: 0.22 }} alt="" />
        <div className="s-label fi">FAQ</div>
        <h2 className="s-title fi">よくある質問</h2>

        <div className="faq-list fi">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className={`faq-item${openFaq === i ? " open" : ""}`}>
              <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div className="faq-q-icon">Q</div>
                <span className="faq-q-text">{item.q}</span>
                <span className="faq-ic">
                  {openFaq === i
                    ? <X size={17} strokeWidth={2} />
                    : <Plus size={17} strokeWidth={2} />}
                </span>
              </button>
              <div className="faq-a">
                <div className="faq-a-icon">A</div>
                <p>{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ background: "#FFFFFF" }}>
        <img src="/抽象画像/抽象画像3.png" className="abs-bg" style={{ width: 240, top: -40, right: -70, opacity: 0.3 }} alt="" />
        <img src="/抽象画像/抽象画像6.png" className="abs-bg" style={{ width: 200, bottom: 80, left: -80, opacity: 0.26 }} alt="" />
        <img src="/抽象画像/抽象画像2.png" className="abs-bg" style={{ width: 120, top: 280, right: 30, opacity: 0.2 }} alt="" />
        <div className="rel">
          <div className="s-label fi">PRICING</div>
          <h2 className="s-title fi">料金プラン</h2>

          <div className="pricing-intro fi">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
              <circle cx="9" cy="9" r="8" stroke="#F97316" strokeWidth="1.5" />
              <line x1="9" y1="8" x2="9" y2="13" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />
              <circle cx="9" cy="5.5" r="1" fill="#F97316" />
            </svg>
            <p>罰金額は¥100から自由に設定できます。走り続ければ課金は一切ありません。</p>
          </div>

          <div className="plan-cards">
            <div className="plan free fi d1">
              <div className="plan-label">FREE</div>
              <div className="plan-price"><span>¥</span>0</div>
              <div className="plan-period">完全無料・ずっと無料</div>
              <ul className="plan-list">
                <li><span className="ck">✓</span> GPS ランニング計測</li>
                <li><span className="ck">✓</span> 繰り返し・単発目標</li>
                <li><span className="ck">✓</span> 月1回スキップ・雨天スキップ</li>
                <li><span className="ck">✓</span> 記録・統計・軌跡マップ</li>
                <li><span className="dk">—</span> チャレンジ目標</li>
                <li><span className="dk">—</span> エスカレーション</li>
                <li><span className="dk">—</span> クーリング期間・目標ロック</li>
              </ul>
            </div>

            <div className="plan pro fi d2">
              <div className="plan-label">PRO</div>
              <div className="plan-price"><span>¥</span>480<span style={{ fontSize: 16, opacity: 0.6 }}>/月</span></div>
              <div className="plan-period">年額 ¥4,800（2ヶ月分お得）・いつでも解約可</div>
              <ul className="plan-list">
                <li><span className="ck">✓</span> FREEの全機能</li>
                <li><span className="ck">✓</span> チャレンジ目標（期間累積達成）</li>
                <li><span className="ck">✓</span> エスカレーション（連続失敗で罰金増加）</li>
                <li><span className="ck">✓</span> クーリング期間（目標変更を禁止）</li>
                <li><span className="ck">✓</span> 目標ロック（永久に変更・停止不可）</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div className="wave" style={{ background: "#FFFFFF" }}>
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" height={60}>
          <path d="M0,40 C360,0 720,60 1080,20 C1250,5 1380,45 1440,25 L1440,60 L0,60 Z" fill="#F97316" />
        </svg>
      </div>

      {/* CTA */}
      <section id="cta" style={{ paddingTop: 0 }}>
        <img src="/抽象画像/抽象画像3.png" className="abs-bg" style={{ width: 240, top: -40, right: -60, opacity: 0.18 }} alt="" />
        <img src="/抽象画像/抽象画像5.png" className="abs-bg" style={{ width: 180, bottom: 40, left: -70, opacity: 0.16 }} alt="" />
        <img src="/抽象画像/抽象画像1.png" className="abs-bg" style={{ width: 130, top: 80, left: 30, opacity: 0.12 }} alt="" />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <img src="/stickman-assets/stickman-02.png" style={{ width: 160, filter: "brightness(0) invert(1)" }} alt="" />
          </div>
          <div className="s-label">GET STARTED</div>
          <h2 className="s-title">さあ、今日から<br />変わろう。</h2>
          <p className="cta-sub">走るあなたを、KAKERUが全力でサポートします。</p>
          <Link href="/auth" className="btn-cta">今すぐ始める（無料） →</Link>
          <p className="cta-fine">目標を設定しない限り課金なし。クレジットカード登録が必要です。</p>
        </div>
      </section>

      <div className="wave" style={{ background: "#F97316" }}>
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" height={60}>
          <path d="M0,20 C200,60 500,0 800,40 C1050,65 1280,10 1440,35 L1440,60 L0,60 Z" fill="#1C1008" />
        </svg>
      </div>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="footer-logo">
          <img src="/stickman-assets/stickman-01.png" alt="" style={{ width: 22, height: 22, objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.75 }} />
          <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", letterSpacing: "0.06em" }}>KAKERU</span>
        </div>
        <div className="footer-links">
          <Link href="/privacy">プライバシーポリシー</Link>
          <Link href="/terms">利用規約</Link>
          <Link href="/contact">お問い合わせ</Link>
          <Link href="/tokusho">運営会社</Link>
        </div>
        <div className="footer-copy">© 2026 KAKERU. All rights reserved.</div>
      </footer>
    </div>
  );
}

const LP_CSS = `
.lp-root, .lp-root *, .lp-root *::before, .lp-root *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.lp-root {
  --orange: #F97316;
  --orange-dark: #C85C0A;
  --orange-light: #FFF3E8;
  --orange-mid: #FFD9B0;
  --tan: #C4A47C;
  --tan-light: #F5EBD8;
  --bg: #FEFCFA;
  --dark: #1C1008;
  --text-sub: #6B5236;
  --text-light: #A8896A;
  --border: #EDE0CC;
  --white: #FFFFFF;
  font-family: var(--font-lp-noto), 'Noto Sans JP', sans-serif;
  background: var(--bg);
  color: var(--dark);
  overflow-x: hidden;
  min-height: 100vh;
}

html { scroll-behavior: smooth; }

/* NAV */
.lp-root .lp-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 200;
  height: 56px;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 20px;
  background: rgba(254,252,250,0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
}
.lp-root .nav-logo { display: flex; align-items: center; gap: 8px; font-size: 19px; font-weight: 900; }
.lp-root .btn-nav {
  background: var(--orange); color: white; border: none;
  padding: 9px 18px; border-radius: 100px;
  font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit;
  text-decoration: none;
}
.lp-root .lp-mobile-nav { display: flex; }
.lp-root .lp-pc-nav { display: none; }

/* SHARED */
.lp-root section { padding: 80px 24px; position: relative; overflow: hidden; }
.lp-root .s-label { font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--orange); margin-bottom: 10px; }
.lp-root .s-title { font-size: clamp(26px, 7vw, 40px); font-weight: 900; line-height: 1.15; letter-spacing: -0.5px; margin-bottom: 12px; }
.lp-root .s-desc { font-size: 15px; color: var(--text-sub); line-height: 1.8; }
.lp-root .abs-bg { position: absolute; pointer-events: none; z-index: 0; }
.lp-root .rel { position: relative; z-index: 1; }
.lp-root .wave { line-height: 0; margin-top: -1px; }
.lp-root .wave svg { display: block; width: 100%; }

/* FADE */
.lp-root .fi { opacity: 0; transform: translateY(20px); transition: opacity 0.5s ease, transform 0.5s ease; }
.lp-root .fi.d1 { transition-delay: 0.08s; }
.lp-root .fi.d2 { transition-delay: 0.16s; }
.lp-root .fi.d3 { transition-delay: 0.24s; }
.lp-root .fi.show { opacity: 1; transform: none; }

/* HERO */
.lp-root #hero {
  position: relative;
  padding: 96px 24px 56px;
  background: var(--bg);
  overflow: hidden;
}
.lp-root .hero-inner { display: flex; flex-direction: column; gap: 0; }
.lp-root .hero-content { flex: 1; }
.lp-root .hero-visual { display: flex; align-items: center; justify-content: center; }
.lp-root .hero-cta { display: block; }
@media (min-width: 700px) {
  .lp-root .lp-mobile-nav { display: none; }
  .lp-root .lp-pc-nav { display: flex; align-items: center; gap: 24px; }
  .lp-root .lp-pc-nav a { font-size: 14px; font-weight: 600; color: var(--text-sub); text-decoration: none; }
  .lp-root .lp-pc-nav a:hover { color: var(--dark); }
}

@media (min-width: 900px) {
  /* コンテナ幅 */
  .lp-root section {
    padding-left: max(48px, calc((100% - 1080px) / 2));
    padding-right: max(48px, calc((100% - 1080px) / 2));
  }

  /* HERO — 2カラム（中央揃え） */
  .lp-root #hero { padding-top: 120px; padding-bottom: 80px; }
  .lp-root .hero-inner {
    display: grid;
    grid-template-columns: 1fr 320px;
    grid-template-rows: auto auto;
    gap: 0 64px;
    max-width: 960px; margin: 0 auto; width: 100%;
  }
  .lp-root .hero-content { grid-column: 1; grid-row: 1; }
  .lp-root .hero-run-img { max-width: 400px; }
  .lp-root .hero-sub br { display: none; }
  .lp-root .hero-stickman-inline { display: none; }
  .lp-root .hero-visual { display: flex; grid-column: 2; grid-row: 1 / 3; align-items: center; justify-content: center; }
  .lp-root .hero-visual-img { width: 100%; max-width: 175px; object-fit: contain; }
  .lp-root .hero-cta { grid-column: 1 / -1; grid-row: 2; padding-top: 32px; }
  .lp-root .btn-primary { width: 100%; display: flex; }
  .lp-root .btn-login { text-align: center; }

  /* FEATURES — 横3列 */
  .lp-root .feat-grid { flex-direction: row; gap: 24px; }
  .lp-root .feat-card { flex: 1; }

  /* PRICING — 横2列 */
  .lp-root .plan-cards { flex-direction: row; align-items: stretch; gap: 20px; }
  .lp-root .plan { flex: 1; }
  .lp-root .plan.pro { transform: scale(1.02); }

  /* CTA */
  .lp-root .btn-cta { width: auto; padding: 17px 56px; }

  /* FAQ */
  .lp-root .faq-list { max-width: 760px; margin-left: auto; margin-right: auto; }

  /* FOOTER */
  .lp-root .lp-footer {
    flex-direction: row; justify-content: space-between; align-items: center;
    padding: 28px max(48px, calc((100% - 1080px) / 2));
  }
}
.lp-root .hero-tag {
  display: inline-flex; align-items: center; gap: 6px;
  background: var(--orange-light); border: 1.5px solid var(--orange-mid);
  border-radius: 100px; padding: 5px 14px;
  font-size: 12px; font-weight: 700; color: var(--orange-dark);
  margin-bottom: 24px; width: fit-content;
}
.lp-root .hero-h1 {
  font-size: clamp(46px, 13vw, 76px);
  font-weight: 900; line-height: 1.06; letter-spacing: -2px;
  margin-bottom: 20px;
}
.lp-root .hero-h1 .hi { color: var(--orange); }
.lp-root .hero-sub { font-size: 16px; color: var(--text-sub); line-height: 1.8; margin-bottom: 40px; }
.lp-root .btn-primary {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  background: var(--orange); color: white;
  padding: 17px 32px; border-radius: 100px;
  font-size: 17px; font-weight: 900; text-decoration: none;
  box-shadow: 0 8px 28px rgba(249,115,22,0.38);
  width: 100%;
}
.lp-root .btn-login { display: block; text-align: center; margin-top: 14px; font-size: 13px; color: var(--text-light); text-decoration: none; }

/* HOW IT WORKS */
.lp-root #how { background: #FFFFFF; }
.lp-root .how-steps { display: flex; flex-direction: column; gap: 72px; margin-top: 12px; }
.lp-root .how-step { display: flex; flex-direction: column; align-items: center; }
.lp-root .how-step-text { width: 100%; }

/* WHY */
.lp-root #why { background: var(--dark); color: white; }
.lp-root #why .s-label { color: var(--orange); }
.lp-root #why .s-title { color: white; }
.lp-root .why-vs { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 32px; }
.lp-root .vs { border-radius: 16px; padding: 20px 16px 20px; text-align: center; }
.lp-root .vs.a { background: rgba(255,255,255,0.06); border: 1.5px solid rgba(255,255,255,0.1); }
.lp-root .vs.b { background: var(--orange); }
.lp-root .vs-label { font-size: 10px; font-weight: 700; opacity: 0.55; margin-bottom: 8px; letter-spacing: 1px; text-transform: uppercase; }
.lp-root .vs-text { font-size: 14px; font-weight: 700; line-height: 1.6; }
.lp-root .vs.a .vs-text { opacity: 0.8; }
.lp-root .why-note {
  margin-top: 20px; font-size: 13px; color: rgba(255,255,255,0.5);
  line-height: 1.8; border-top: 1px solid rgba(255,255,255,0.08);
  padding-top: 20px;
}
.lp-root .why-note strong { color: rgba(255,255,255,0.85); }

/* FEATURES */
.lp-root #features { background: var(--bg); }
.lp-root .feat-grid { display: flex; flex-direction: column; gap: 20px; margin-top: 48px; }
.lp-root .feat-card {
  background: var(--white); border: 1.5px solid var(--border);
  border-radius: 24px; padding: 32px 24px;
  display: flex; flex-direction: column; align-items: center; text-align: center;
}
.lp-root .feat-icon { width: 140px; height: 140px; margin-bottom: 20px; display: flex; align-items: center; justify-content: center; }
.lp-root .feat-icon img { width: 100%; height: 100%; object-fit: contain; }
.lp-root .feat-catch { font-size: 18px; font-weight: 900; margin-bottom: 8px; line-height: 1.4; }
.lp-root .feat-desc { font-size: 14px; color: var(--text-sub); line-height: 1.8; }

/* PRICING */
.lp-root #pricing { background: #FFFFFF; }
.lp-root .pricing-intro {
  display: flex; align-items: flex-start; gap: 10px;
  background: var(--orange-light); border: 1.5px solid var(--orange-mid);
  border-radius: 14px; padding: 14px 16px; margin: 20px 0 32px;
}
.lp-root .pricing-intro p { font-size: 13px; font-weight: 700; color: var(--orange-dark); line-height: 1.6; }
.lp-root .plan-cards { display: flex; flex-direction: column; gap: 16px; }
.lp-root .plan { border-radius: 22px; padding: 26px 22px; }
.lp-root .plan.free { background: var(--bg); border: 1.5px solid var(--border); }
.lp-root .plan.pro { background: var(--dark); color: white; }
.lp-root .plan-label {
  font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
  padding: 4px 12px; border-radius: 100px; display: inline-block; margin-bottom: 16px;
}
.lp-root .plan.free .plan-label { background: var(--tan-light); color: var(--tan); }
.lp-root .plan.pro .plan-label { background: var(--orange); color: white; }
.lp-root .plan-price { font-size: 48px; font-weight: 900; letter-spacing: -2px; line-height: 1; margin-bottom: 4px; }
.lp-root .plan-price span { font-size: 18px; }
.lp-root .plan-period { font-size: 13px; margin-bottom: 22px; }
.lp-root .plan.free .plan-period { color: var(--text-sub); }
.lp-root .plan.pro .plan-period { color: rgba(255,255,255,0.5); }
.lp-root .plan-list { list-style: none; display: flex; flex-direction: column; gap: 10px; }
.lp-root .plan-list li { font-size: 14px; display: flex; gap: 10px; align-items: flex-start; line-height: 1.5; }
.lp-root .plan.free .plan-list li { color: var(--text-sub); }
.lp-root .plan.pro .plan-list li { color: rgba(255,255,255,0.75); }
.lp-root .ck { color: var(--orange); font-weight: 900; flex-shrink: 0; }
.lp-root .dk { color: var(--text-light); flex-shrink: 0; }

/* FAQ */
.lp-root #faq { background: #FFFFFF; }
.lp-root .faq-list { display: flex; flex-direction: column; margin-top: 48px; gap: 8px; }
.lp-root .faq-item { background: white; border-radius: 14px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }
.lp-root .faq-q {
  width: 100%; background: none; border: none; padding: 14px 16px;
  text-align: left; font-family: inherit; font-size: 14px; font-weight: 600;
  cursor: pointer; display: flex; align-items: center; color: var(--dark); gap: 12px;
}
.lp-root .faq-q-icon {
  width: 28px; height: 28px; border-radius: 50%; background: var(--orange);
  color: white; display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 800; flex-shrink: 0; line-height: 1;
}
.lp-root .faq-q-text { flex: 1; line-height: 1.5; }
.lp-root .faq-ic { color: #BBBBBB; flex-shrink: 0; display: flex; align-items: center; }
.lp-root .faq-a {
  max-height: 0; overflow: hidden;
  transition: max-height 0.35s ease;
  display: flex; align-items: flex-start; gap: 12px;
  padding: 0 16px;
  font-size: 14px; color: var(--text-sub); line-height: 1.75;
}
.lp-root .faq-item.open .faq-a { max-height: 300px; padding-bottom: 16px; }
.lp-root .faq-a-icon {
  width: 28px; height: 28px; border-radius: 50%; background: #FFF0E5;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 800; color: var(--orange);
  flex-shrink: 0; margin-top: 1px;
}
.lp-root .faq-a p { flex: 1; margin: 0; padding-top: 4px; }

/* CTA */
.lp-root #cta { background: var(--orange); color: white; text-align: center; padding: 80px 24px; }
.lp-root #cta .s-label { color: rgba(255,255,255,0.7); }
.lp-root #cta .s-title { color: white; }
.lp-root .cta-sub { font-size: 16px; opacity: 0.85; line-height: 1.75; margin-bottom: 36px; }
.lp-root .btn-cta {
  display: inline-flex; align-items: center; justify-content: center;
  background: white; color: var(--orange);
  padding: 17px 36px; border-radius: 100px;
  font-size: 17px; font-weight: 900; text-decoration: none; width: 100%;
  box-shadow: 0 10px 32px rgba(0,0,0,0.15);
}
.lp-root .cta-fine { font-size: 12px; opacity: 0.6; margin-top: 14px; }

/* FOOTER */
.lp-root .lp-footer { background: var(--dark); padding: 36px 24px; display: flex; flex-direction: column; gap: 18px; }
.lp-root .footer-logo { display: flex; align-items: center; gap: 8px; font-size: 17px; font-weight: 900; color: white; }
.lp-root .footer-links { display: flex; flex-wrap: wrap; gap: 14px; }
.lp-root .footer-links a { color: rgba(255,255,255,0.4); text-decoration: none; font-size: 13px; }
.lp-root .footer-copy { font-size: 12px; color: rgba(255,255,255,0.25); }

/* PHONE MOCK */
.lp-root .phone-mock {
  position: relative;
  width: 100%;
  max-width: 240px;
  aspect-ratio: 828 / 1792;
  background: linear-gradient(155deg, #1a1a1f 0%, #0a0a0d 50%, #1a1a1f 100%);
  border-radius: 42px;
  padding: 9px;
  box-shadow:
    0 30px 60px -20px rgba(20, 18, 25, 0.32),
    0 14px 28px rgba(20, 18, 25, 0.16),
    inset 0 0 0 1.5px rgba(255, 255, 255, 0.06);
  margin: 24px auto 0;
}
.lp-root .phone-mock-screen {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 34px;
  overflow: hidden;
  background: #fff;
}
.lp-root .phone-mock-screen > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.lp-root .phone-mock-notch {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: 38%;
  height: 18px;
  background: #06060a;
  border-radius: 100px;
  z-index: 3;
}
.lp-root .phone-mock::before {
  content: "";
  position: absolute;
  top: 86px;
  left: -2px;
  width: 3px;
  height: 32px;
  background: linear-gradient(90deg, #2a2a30, #0a0a0d);
  border-radius: 2px 0 0 2px;
}
.lp-root .phone-mock::after {
  content: "";
  position: absolute;
  top: 130px;
  left: -2px;
  width: 3px;
  height: 50px;
  background: linear-gradient(90deg, #2a2a30, #0a0a0d);
  border-radius: 2px 0 0 2px;
  box-shadow: 0 70px 0 0 #1a1a1f;
}

/* HERO PHONE: scrolling screenshot slider inside */
.lp-root .phone-slider-track {
  display: flex;
  width: 600%;
  height: 100%;
  animation: hero-slide 30s infinite;
}
.lp-root .phone-slider-track img {
  width: 16.6667%;
  height: 100%;
  object-fit: cover;
  flex-shrink: 0;
  display: block;
}
@keyframes hero-slide {
  0%, 13% { transform: translate3d(0, 0, 0); }
  17%, 30% { transform: translate3d(-16.6667%, 0, 0); }
  33%, 47% { transform: translate3d(-33.3333%, 0, 0); }
  50%, 63% { transform: translate3d(-50%, 0, 0); }
  67%, 80% { transform: translate3d(-66.6667%, 0, 0); }
  83%, 100% { transform: translate3d(-83.3333%, 0, 0); }
}

/* HERO BG */
.lp-root .hero-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

/* HOW STEP layout (vertical, phone-first, mezamee-style) */
.lp-root #how { padding-top: 96px; padding-bottom: 96px; }
.lp-root .how-dots {
  display: flex; justify-content: center; gap: 6px;
  margin: 4px 0 28px;
}
.lp-root .how-dots span {
  width: 8px; height: 8px; border-radius: 50%;
  background: #E3DAC9;
}
.lp-root .how-dots span:nth-child(2) { background: #F9C875; }
.lp-root .how-dots span:nth-child(3) { background: var(--orange); }
.lp-root .how-step-visual {
  display: flex; justify-content: center;
  margin-bottom: 28px;
}
.lp-root .how-step-num {
  display: flex; align-items: center; justify-content: center;
  gap: 10px; margin-bottom: 14px;
  font-size: 16px; font-weight: 800; color: var(--dark);
  letter-spacing: 0;
}
.lp-root .how-step-num-badge {
  display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--orange); color: white;
  font-size: 14px; font-weight: 900; flex-shrink: 0;
}
.lp-root .how-step-title {
  font-size: 22px; font-weight: 900; line-height: 1.35;
  margin-bottom: 14px; color: var(--dark); text-align: center;
}
.lp-root .how-step-desc {
  font-size: 14px; color: var(--text-sub);
  line-height: 1.85; text-align: center; max-width: 360px;
  margin: 0 auto;
}
@media (min-width: 900px) {
  .lp-root .phone-mock { max-width: 260px; }
}

/* TARGET */
.lp-root #target { background: #FFFFFF; padding: 90px 24px; }
.lp-root #target .s-title { font-family: var(--font-display, sans-serif); font-style: italic; letter-spacing: 0.01em; }
.lp-root .target-body { font-size: 16px; color: var(--text-sub); line-height: 1.95; font-weight: 500; }
.lp-root .target-conclusion { font-size: 19px; font-weight: 900; line-height: 1.7; margin-top: 36px; color: var(--dark); }
@media (min-width: 700px) {
  .lp-root .target-body { font-size: 17px; }
  .lp-root .target-conclusion { font-size: 22px; }
}
`;
