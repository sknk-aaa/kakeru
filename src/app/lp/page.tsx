"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const FAQ_ITEMS: { q: string; a: string }[] = [
  { q: "本当にカードに引き落とされますか？", a: "はい。当日23:59までに目標を達成しなかった場合、設定した罰金額が自動で引き落とされます。" },
  { q: "試しに使いたいだけのとき、課金されますか？", a: "目標を設定しない限り課金はされません。安心してお試しください。" },
  { q: "体調不良や雨の日はどうなりますか？", a: "月1回のスキップ機能があります。また、居住地域の天気が雨の場合は、スキップ回数を消費せずに罰金なしで休めます。" },
  { q: "カード情報は安全ですか？", a: "カード情報はKAKERUのサーバーには保存されません。国際的な決済サービス「Stripe」が管理します。" },
  { q: "PROプランはいつでも解約できますか？", a: "はい、いつでも解約できます。解約後も期間終了までPRO機能を利用できます。" },
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
        <Link href="/auth" className="btn-nav">今すぐ始める</Link>
      </nav>

      {/* HERO */}
      <section id="hero">
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
          <img src="/抽象画像/抽象画像4.png" style={{ position: "absolute", width: 260, top: -30, right: -70, opacity: 0.45 }} alt="" />
          <img src="/抽象画像/抽象画像1.png" style={{ position: "absolute", width: 180, bottom: 40, left: -50, opacity: 0.35 }} alt="" />
        </div>

        <div style={{ position: "relative", zIndex: 1 }} className="hero-inner">
          <div className="hero-content">
            <div className="hero-tag">ランニング習慣化アプリ</div>
            <img src="/その他素材/走らなければ-transparent.png" style={{ width: "100%", maxWidth: 340, display: "block", marginBottom: 20 }} alt="走らなければ、課金される。" />
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
              <p className="hero-sub" style={{ marginBottom: 0, flex: 1 }}>
                自分に甘いあなたのための、<br />本気の習慣化アプリ。
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                <img src="/stickman-assets/stickman-14.png" style={{ width: 52 }} alt="" />
                <svg width="18" height="18" viewBox="0 0 36 36" fill="none">
                  <circle cx="18" cy="18" r="17" stroke="#FFD9B0" strokeWidth="2" />
                  <path d="M13 18h12M20 13l5 5-5 5" stroke="#F97316" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <img src="/stickman-assets/stickman-02.png" style={{ width: 52 }} alt="" />
              </div>
            </div>
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

      {/* HOW IT WORKS */}
      <section id="how" style={{ background: "#FFFFFF" }}>
        <img src="/抽象画像/抽象画像2.png" className="abs-bg" style={{ width: 220, top: 20, right: -60, opacity: 0.22 }} alt="" />
        <div className="rel">
          <div className="s-label fi">HOW IT WORKS</div>
          <h2 className="s-title fi">仕組みはシンプル</h2>

          <div className="how-steps">
            <div className="how-step fi d1">
              <img src="/stickman-assets/stickman-13.png" className="how-step-img" alt="目標を設定" />
              <div className="how-step-text">
                <div className="how-step-num">STEP 01</div>
                <div className="how-step-title">目標を設定する</div>
                <p className="how-step-desc">曜日・距離・時間・罰金額を自分で決める。</p>
              </div>
            </div>

            <div className="how-step reverse fi d2">
              <img src="/stickman-assets/stickman-05.png" className="how-step-img" alt="走って達成" />
              <div className="how-step-text">
                <div className="how-step-num">STEP 02</div>
                <div className="how-step-title">スマホを持って走る</div>
                <p className="how-step-desc">GPSが距離・ペースを自動計測。達成すると自動で判定。</p>
              </div>
            </div>

            <div className="how-step fi d3">
              <img src="/stickman-assets/stickman-12.png" className="how-step-img" alt="課金" />
              <div className="how-step-text">
                <div className="how-step-num">STEP 03</div>
                <div className="how-step-title">走らなければ<br />自動で課金</div>
                <p className="how-step-desc">23:59までに未達成だと、設定した罰金が自動引き落とし。</p>
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
          <h2 className="s-title fi" style={{ color: "white" }}>なぜ、罰金が効くのか</h2>

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
          <path d="M0,35 C200,0 500,60 800,25 C1050,5 1280,50 1440,20 L1440,60 L0,60 Z" fill="#FEFCFA" />
        </svg>
      </div>

      {/* FEATURES */}
      <section id="features" style={{ background: "#FEFCFA" }}>
        <div className="rel">
          <div className="s-label fi">FEATURES</div>
          <h2 className="s-title fi">走り続けるための<br />すべてが揃っている</h2>

          <div className="feat-grid">
            <div className="feat-card fi d1">
              <div className="feat-icon">
                <img src="/その他素材/地図っぽい-transparent.png" alt="GPS計測" />
              </div>
              <div>
                <div className="feat-catch">GPS自動計測</div>
                <div className="feat-desc">距離・ペース・カロリーをリアルタイムで記録</div>
              </div>
            </div>

            <div className="feat-card fi d2">
              <div className="feat-icon">
                <img src="/stickman-assets/stickman-17.png" alt="雨天スキップ" />
              </div>
              <div>
                <div className="feat-catch">スキップ機能</div>
                <div className="feat-desc">月1回・雨天は罰金なしで休める</div>
              </div>
            </div>

            <div className="feat-card fi d3">
              <div className="feat-icon">
                <img src="/その他素材/山-transparent.png" alt="記録・統計" />
              </div>
              <div>
                <div className="feat-catch">記録・統計</div>
                <div className="feat-desc">達成率・走行距離・罰金履歴を一目で確認</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="wave" style={{ background: "#FEFCFA" }}>
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" height={60}>
          <path d="M0,25 C360,60 720,0 1080,40 C1250,60 1380,15 1440,30 L1440,60 L0,60 Z" fill="#FFFFFF" />
        </svg>
      </div>

      {/* PRICING */}
      <section id="pricing" style={{ background: "#FFFFFF" }}>
        <img src="/抽象画像/抽象画像3.png" className="abs-bg" style={{ width: 220, top: -30, right: -50, opacity: 0.28 }} alt="" />
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
          <path d="M0,30 C240,60 600,0 900,45 C1100,65 1300,10 1440,30 L1440,60 L0,60 Z" fill="#FFFFFF" />
        </svg>
      </div>

      {/* FAQ */}
      <section id="faq" style={{ background: "#FFFFFF" }}>
        <div className="s-label fi">FAQ</div>
        <h2 className="s-title fi">よくある質問</h2>

        <div className="faq-list fi">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className={`faq-item${openFaq === i ? " open" : ""}`}>
              <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {item.q}
                <span className="faq-ic">▼</span>
              </button>
              <div className="faq-a">{item.a}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="wave" style={{ background: "#FFFFFF" }}>
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" height={60}>
          <path d="M0,40 C360,0 720,60 1080,20 C1250,5 1380,45 1440,25 L1440,60 L0,60 Z" fill="#F97316" />
        </svg>
      </div>

      {/* CTA */}
      <section id="cta" style={{ paddingTop: 0 }}>
        <img src="/抽象画像/抽象画像3.png" className="abs-bg" style={{ width: 240, top: -40, right: -60, opacity: 0.15 }} alt="" />
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
}

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
@media (min-width: 700px) {
  .lp-root .hero-inner { flex-direction: row; align-items: center; gap: 40px; }
  .lp-root section {
    padding-left: max(24px, calc((100% - 900px) / 2));
    padding-right: max(24px, calc((100% - 900px) / 2));
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
.lp-root .how-steps { display: flex; flex-direction: column; gap: 0; margin-top: 48px; }
.lp-root .how-step {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 0; align-items: center;
  padding: 40px 0;
  border-bottom: 1.5px solid var(--border);
}
.lp-root .how-step:last-child { border-bottom: none; }
.lp-root .how-step.reverse { direction: rtl; }
.lp-root .how-step.reverse > * { direction: ltr; }
.lp-root .how-step-img { width: 100%; max-width: 160px; margin: 0 auto; display: block; }
.lp-root .how-step-text { padding: 0 8px; }
.lp-root .how-step-num { font-size: 11px; font-weight: 900; letter-spacing: 3px; color: var(--orange); margin-bottom: 10px; }
.lp-root .how-step-title { font-size: 20px; font-weight: 900; margin-bottom: 8px; line-height: 1.3; }
.lp-root .how-step-desc { font-size: 13px; color: var(--text-sub); line-height: 1.8; }

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
.lp-root .faq-list { display: flex; flex-direction: column; margin-top: 48px; }
.lp-root .faq-item { border-bottom: 1.5px solid var(--border); }
.lp-root .faq-q {
  width: 100%; background: none; border: none; padding: 20px 0;
  text-align: left; font-family: inherit; font-size: 15px; font-weight: 700;
  cursor: pointer; display: flex; justify-content: space-between;
  align-items: center; color: var(--dark); gap: 12px;
}
.lp-root .faq-ic {
  width: 26px; height: 26px; border-radius: 50%;
  background: var(--orange-light); color: var(--orange);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; flex-shrink: 0; transition: transform 0.3s;
}
.lp-root .faq-item.open .faq-ic { transform: rotate(180deg); }
.lp-root .faq-a {
  max-height: 0; overflow: hidden;
  transition: max-height 0.35s ease, padding 0.3s;
  font-size: 14px; color: var(--text-sub); line-height: 1.85;
}
.lp-root .faq-item.open .faq-a { max-height: 300px; padding-bottom: 20px; }

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
`;
