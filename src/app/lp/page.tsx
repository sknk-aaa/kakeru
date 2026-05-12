"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
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

const TARGET_MOCK_SLIDES = [
  {
    label: "目標を設定",
    title: "日付や距離、課金額を決める",
    desc: "曜日ごとに走る目標と、未達成時に課金される金額を設定します。",
    image: "/スクショ/目標作成画面スクショ.PNG",
    alt: "目標設定画面",
  },
  {
    label: "ランニングを開始",
    title: "スマホを持って走る",
    desc: "スタートボタンを押して走り出すだけ。GPSで距離やペースを記録します。",
    image: "/スクショ/ランニング画面スクショ.png",
    alt: "ランニング画面",
  },
  {
    label: "目標を達成",
    title: "達成判定もおまかせ",
    desc: "走行記録から目標達成を自動で判定します。達成すれば課金はありません。少し健康になります。",
    image: "/スクショ/目標達成画面スクショ.PNG",
    alt: "目標達成画面",
  },
  {
    label: "未達成時に課金",
    title: "走らなければ\n自動で課金",
    desc: "23:59までに未達成の場合、設定した金額が自動で引き落とされます。",
    image: "/スクショ/課金されました画面スクショ.png",
    alt: "課金時のモーダル",
  },
  {
    label: "記録を振り返る",
    title: "達成率や走行距離を確認",
    desc: "これまでのランニング記録や達成状況をあとから確認できます。",
    image: "/スクショ/記録画面スクショ.PNG",
    alt: "記録画面",
  },
  {
    label: "カードを登録",
    title: "決済情報は安全に管理",
    desc: "カード情報はStripeで安全に管理され、KAKERUには保存されません。",
    image: "/スクショ/クレカ登録画面スクショ.PNG",
    alt: "クレカ登録画面",
  },
];

const HOW_SLIDES = [
  TARGET_MOCK_SLIDES[0],
  TARGET_MOCK_SLIDES[1],
  TARGET_MOCK_SLIDES[2],
  TARGET_MOCK_SLIDES[4],
];

const MOBILE_HOW_SLIDES = [
  TARGET_MOCK_SLIDES[0],
  TARGET_MOCK_SLIDES[1],
  TARGET_MOCK_SLIDES[2],
  TARGET_MOCK_SLIDES[4],
  TARGET_MOCK_SLIDES[5],
];

const DESKTOP_HOW_SLIDES = HOW_SLIDES;

const FOR_YOU_MOCK_SLIDES = [
  TARGET_MOCK_SLIDES[0],
  TARGET_MOCK_SLIDES[1],
  TARGET_MOCK_SLIDES[2],
  TARGET_MOCK_SLIDES[4],
  TARGET_MOCK_SLIDES[5],
];

export default function LpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTargetMockSlide, setActiveTargetMockSlide] = useState(0);
  const [activeHowSlide, setActiveHowSlide] = useState(0);
  const [displayedHowTextSlide, setDisplayedHowTextSlide] = useState(0);
  const [isHowTextVisible, setIsHowTextVisible] = useState(true);
  const [howDragOffset, setHowDragOffset] = useState(0);
  const [isHowDragging, setIsHowDragging] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const howSliderRef = useRef<HTMLDivElement>(null);
  const isHowDraggingRef = useRef(false);
  const howDragStartXRef = useRef(0);
  const howDragOffsetRef = useRef(0);

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

  useEffect(() => {
    const hideTimer = window.setTimeout(() => {
      setIsHowTextVisible(false);
    }, 0);
    const swapTimer = window.setTimeout(() => {
      setDisplayedHowTextSlide(activeHowSlide);
      setIsHowTextVisible(true);
    }, 400);
    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(swapTimer);
    };
  }, [activeHowSlide]);

  const scrollToHowSlide = (index: number) => {
    setActiveHowSlide(index);
    setHowDragOffset(0);
  };

  const moveTargetMockSlide = (direction: 1 | -1) => {
    setActiveTargetMockSlide((current) => (
      (current + direction + FOR_YOU_MOCK_SLIDES.length) % FOR_YOU_MOCK_SLIDES.length
    ));
  };

  const handleHowPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const slider = howSliderRef.current;
    if (!slider) return;
    isHowDraggingRef.current = true;
    setIsHowDragging(true);
    setHowDragOffset(0);
    howDragOffsetRef.current = 0;
    howDragStartXRef.current = e.clientX;
    slider.setPointerCapture(e.pointerId);
  };

  const handleHowPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isHowDragging) return;
    const nextOffset = e.clientX - howDragStartXRef.current;
    howDragOffsetRef.current = nextOffset;
    setHowDragOffset(nextOffset);
  };

  const handleHowPointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    const slider = howSliderRef.current;
    if (!slider) return;
    const threshold = Math.min(90, slider.clientWidth * 0.18);
    if (howDragOffsetRef.current < -threshold) {
      setActiveHowSlide((current) => Math.min(current + 1, MOBILE_HOW_SLIDES.length - 1));
    } else if (howDragOffsetRef.current > threshold) {
      setActiveHowSlide((current) => Math.max(current - 1, 0));
    }
    isHowDraggingRef.current = false;
    setIsHowDragging(false);
    setHowDragOffset(0);
    howDragOffsetRef.current = 0;
    if (slider.hasPointerCapture(e.pointerId)) slider.releasePointerCapture(e.pointerId);
  };

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
          <div className="nav-socials" aria-label="SNSリンク">
            <a className="nav-social-icon" href="https://x.com/Kakeru_runApp" target="_blank" rel="noreferrer" aria-label="X">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M13.9 10.5 21.3 2h-1.8l-6.4 7.3L8 2H2l7.8 11.2L2 22h1.8l6.8-7.7L16 22h6l-8.1-11.5Zm-2.4 2.7-.8-1.1L4.5 3.3h2.6l5 7.1.8 1.1 6.6 9.3h-2.6l-5.4-7.6Z" />
              </svg>
            </a>
            <a className="nav-social-icon" href="https://www.youtube.com/channel/UCqPrg3o0GExIwmGQf5GkF5g" target="_blank" rel="noreferrer" aria-label="YouTube">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8ZM9.6 15.6V8.4L15.9 12l-6.3 3.6Z" />
              </svg>
            </a>
          </div>
          <Link href="/auth" className="btn-nav">今すぐ始める</Link>
        </div>
      </nav>

      {/* HERO */}
      <section id="hero">
        <div className="hero-bg">
          <img src="/抽象画像/抽象画像4.png" style={{ position: "absolute", width: 280, top: -40, right: -50, opacity: 0.86 }} alt="" />
          <img src="/抽象画像/抽象画像1.png" className="hero-bg-low" alt="" />
        </div>

        <div style={{ position: "relative", zIndex: 1 }} className="hero-inner">
          <div className="hero-content">
            <h1 className="hero-tag">ランニング習慣化アプリ</h1>
            <img src="/その他素材/走らなければ-transparent.png" className="hero-run-img" style={{ width: "100%", maxWidth: 280, display: "block", marginBottom: 20 }} alt="走らなければ、課金される。" />
            <div className="hero-sub-row">
              <p className="hero-sub">
                自分に甘いあなたのための、<br />本気の習慣化アプリ。
              </p>
              <div className="hero-before-after" aria-hidden="true">
                <img src="/stickman-assets/stickman-14.png" alt="" />
                <span className="hero-before-after-arrow">
                  <ArrowRight size={18} strokeWidth={2.4} />
                </span>
                <img src="/stickman-assets/stickman-02.png" alt="" />
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="phone-mock hero-phone">
              <div className="phone-mock-notch" />
              <div className="phone-mock-screen">
                <div className="phone-slider-track">
                  {TARGET_MOCK_SLIDES.map((slide) => (
                    <img src={slide.image} alt={slide.alt} key={`hero-${slide.label}`} />
                  ))}
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
        <img src="/抽象画像/抽象画像5.png" className="abs-bg" style={{ width: 200, bottom: 20, right: -70, opacity: 0.55 }} alt="" />
        <div className="rel target-layout" style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <div className="target-phone-col fi">
            <div className="target-mock-label-viewport">
              <div className="target-mock-step-num">
                <span className="how-step-num-badge">{activeTargetMockSlide + 1}</span>
                {FOR_YOU_MOCK_SLIDES[activeTargetMockSlide].label}
              </div>
            </div>
            <div className="phone-mock how-phone target-phone">
              <div className="phone-mock-notch" />
              <div className="phone-mock-screen">
                <img src={FOR_YOU_MOCK_SLIDES[activeTargetMockSlide].image} alt="" />
              </div>
            </div>
            <div className="target-mock-controls" aria-label="For You モック切り替え">
              <button type="button" onClick={() => moveTargetMockSlide(-1)} aria-label="前のスクリーンショット">
                <ChevronLeft size={18} strokeWidth={2.4} />
              </button>
              <div className="target-mock-dots">
                {FOR_YOU_MOCK_SLIDES.map((slide, i) => (
                  <button
                    key={`target-dot-${slide.label}`}
                    type="button"
                    className={activeTargetMockSlide === i ? "active" : ""}
                    onClick={() => setActiveTargetMockSlide(i)}
                    aria-label={`${i + 1}枚目: ${slide.label}`}
                    aria-current={activeTargetMockSlide === i ? "true" : undefined}
                  />
                ))}
              </div>
              <button type="button" onClick={() => moveTargetMockSlide(1)} aria-label="次のスクリーンショット">
                <ChevronRight size={18} strokeWidth={2.4} />
              </button>
            </div>
          </div>
          <div className="target-copy">
            <div className="s-label fi">FOR YOU</div>
            <h2 className="s-title fi" style={{ marginBottom: 28 }}>こんなあなたへ</h2>
            <p className="target-body fi">
              ダイエットをしたい、健康になりたいのに<br />
              ジョギング･ランニングを習慣にしたいのに<br />
              思うように続かない。
            </p>
            <p className="target-body fi d2" style={{ marginTop: 20 }}>
              ランニングアプリをインストールしたものの<br />結局使わなくなってしまう。
            </p>
            <p className="target-conclusion fi d3">
              『Kakeru』を使えば、<br />もうサボれない。挫折しない。<br />
            </p>
          </div>
        </div>
      </section>

      <div className="wave science-wave-top" style={{ background: "#FFFFFF" }}>
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" height={60}>
          <path d="M0,30 C300,55 700,5 1000,30 C1200,45 1340,15 1440,30 L1440,60 L0,60 Z" fill="#FEFCFA" />
        </svg>
      </div>

      {/* FEATURES */}
      <section id="features" style={{ background: "#FEFCFA" }}>
        <img src="/抽象画像/抽象画像2.png" className="abs-bg" style={{ width: 220, top: 20, right: -60, opacity: 0.52 }} alt="" />
        <div className="rel">
          <div className="s-label fi">FEATURES</div>
          <h2 className="s-title fi">3つの特徴</h2>

          <div className="feature-steps">
            <div className="feature-step fi d1">
              <img src="/stickman-assets/stickman-13.png" className="feature-step-img" alt="目標を設定" />
              <div className="feature-step-text">
                <div className="feature-step-num">STEP 01</div>
                <div className="feature-step-title">目標を設定</div>
                <p className="feature-step-desc">曜日や距離、課金額を自分で決められます。</p>
              </div>
            </div>

            <div className="feature-step reverse fi d2">
              <img src="/stickman-assets/stickman-02.png" className="feature-step-img" alt="走って達成" />
              <div className="feature-step-text">
                <div className="feature-step-num">STEP 02</div>
                <div className="feature-step-title">走れば無料</div>
                <p className="feature-step-desc">目標を達成すれば課金はされませんし、少しだけ健康になります。</p>
              </div>
            </div>

            <div className="feature-step fi d3">
              <img src="/stickman-assets/stickman-21.png" className="feature-step-img" alt="課金" />
              <div className="feature-step-text">
                <div className="feature-step-num">STEP 03</div>
                <div className="feature-step-title">記録で振り返る</div>
                <p className="feature-step-desc">走った記録を確認し、自分の成長を可視化できます。</p>
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
        <img src="/抽象画像/抽象画像3.png" className="abs-bg" style={{ width: 220, top: 280, left: -80, opacity: 0.52 }} alt="" />
        <div className="rel">
          <div className="s-label fi">HOW IT WORKS</div>
          <h2 className="s-title fi">使い方</h2>

          <div className={`how-text-panel fi${isHowTextVisible ? " visible" : ""}`}>
            <div className="how-step-num">
              <span className="how-step-num-badge">{displayedHowTextSlide + 1}</span>
              {MOBILE_HOW_SLIDES[displayedHowTextSlide].label}
            </div>
            <div className="how-step-title">
              {MOBILE_HOW_SLIDES[displayedHowTextSlide].title.split("\n").map((line, lineIndex, lines) => (
                <span key={line}>
                  {line}
                  {lineIndex < lines.length - 1 && <br />}
                </span>
              ))}
            </div>
            <p className="how-step-desc">{MOBILE_HOW_SLIDES[displayedHowTextSlide].desc}</p>
          </div>

          <div
            className="how-slider fi"
            ref={howSliderRef}
            onPointerDown={handleHowPointerDown}
            onPointerMove={handleHowPointerMove}
            onPointerUp={handleHowPointerEnd}
            onPointerCancel={handleHowPointerEnd}
            onPointerLeave={handleHowPointerEnd}
          >
            <div
              className={`how-track${isHowDragging ? " dragging" : ""}`}
              style={{ transform: `translateX(calc(${-activeHowSlide * 100}% + ${howDragOffset}px))` }}
            >
              {MOBILE_HOW_SLIDES.map((slide) => (
                <div className="how-slide" key={slide.label}>
                  <div className="how-step-visual">
                    <div className="phone-mock how-phone">
                      <div className="phone-mock-notch" />
                      <div className="phone-mock-screen">
                        <img src={slide.image} alt={slide.alt} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="how-slide-dots fi" aria-label="使い方スライド">
            {MOBILE_HOW_SLIDES.map((slide, i) => (
              <button
                key={slide.label}
                type="button"
                className={activeHowSlide === i ? "active" : ""}
                onClick={() => scrollToHowSlide(i)}
                aria-label={`${i + 1}枚目: ${slide.label}`}
                aria-current={activeHowSlide === i ? "true" : undefined}
              />
            ))}
          </div>

          <div className="how-desktop-list fi">
            {DESKTOP_HOW_SLIDES.map((slide, i) => (
              <div className={`how-desktop-step${i % 2 === 1 ? " reverse" : ""}`} key={`desktop-${slide.label}`}>
                <div className="how-step-visual">
                  <div className="phone-mock how-phone">
                    <div className="phone-mock-notch" />
                    <div className="phone-mock-screen">
                      <img src={slide.image} alt={slide.alt} />
                    </div>
                  </div>
                </div>
                <div className="how-step-text">
                  <div className="how-step-num">
                    <span className="how-step-num-badge">{i + 1}</span>
                    {slide.label}
                  </div>
                  <div className="how-step-title">
                    {slide.title.split("\n").map((line, lineIndex, lines) => (
                      <span key={`${slide.label}-${line}`}>
                        {line}
                        {lineIndex < lines.length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                  <p className="how-step-desc">{slide.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="wave science-wave-top" style={{ background: "#FFFFFF" }}>
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
            人は「得ること」より<strong>「失うこと」</strong>に強く反応します——<strong>損失回避</strong>と呼ばれる心理です。
            KAKERUはこの心理効果を活用し、ランニング習慣化の手助けをします。
          </p>
          <div style={{ textAlign: "center", marginTop: 20 }} className="fi">
            <img src="/その他素材/だから続く！-transparent.png" style={{ width: 140 }} alt="だから続く！" />
          </div>
        </div>
      </section>

      <div className="wave science-wave-bottom" style={{ background: "#1C1008" }}>
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" height={60}>
          <path d="M0,35 C200,0 500,60 800,25 C1050,5 1280,50 1440,20 L1440,60 L0,60 Z" fill="#FFFFFF" />
        </svg>
      </div>

      {/* FAQ */}
      <section id="faq" style={{ background: "#FFFFFF" }}>
        <img src="/抽象画像/抽象画像1.png" className="abs-bg" style={{ width: 180, top: 40, left: -60, opacity: 0.20 }} alt="" />
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

      {/* CTA */}
      <section id="cta" style={{ paddingTop: 0 }}>
        <img src="/抽象画像/抽象画像3.png" className="abs-bg" style={{ width: 200, top: -30, right: -50, opacity: 0.44 }} alt="" />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <img src="/stickman-assets/stickman-02.png" style={{ width: 160 }} alt="" />
          </div>
          <div className="s-label">GET STARTED</div>
          <h2 className="s-title">さあ、今日から<br />変わろう。</h2>
          <p className="cta-sub">走るあなたを、KAKERUが全力でサポートします。</p>
          <Link href="/auth" className="btn-cta">今すぐ始める（無料） →</Link>
          <p className="cta-fine">目標を設定しない限り課金なし。クレジットカード登録が必要です。</p>
        </div>
      </section>

      <div className="wave footer-wave" style={{ background: "#FFFFFF" }}>
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
  --orange-bright: #FF7A1A;
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
.lp-root .science-wave-top { margin-bottom: -4px; }
.lp-root .science-wave-bottom,
.lp-root .footer-wave {
  margin-top: -4px;
  margin-bottom: -4px;
}
.lp-root .science-wave-top svg,
.lp-root .science-wave-bottom svg,
.lp-root .footer-wave svg {
  height: 64px;
  transform: translateY(1px);
}

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
.lp-root .hero-visual { display: none; }
.lp-root .hero-cta { display: block; }
@media (min-width: 900px) {
  .lp-root .lp-nav {
    position: relative;
    top: auto;
    left: auto;
    right: auto;
    height: 88px;
    padding: 0 max(36px, calc((100% - 1160px) / 2));
    background: rgba(255,255,255,0.94);
  }
  .lp-root .nav-logo {
    gap: 12px;
    font-size: 24px;
  }
  .lp-root .nav-logo img {
    width: 34px !important;
    height: 34px !important;
  }
  .lp-root .lp-mobile-nav { display: none; }
  .lp-root .lp-pc-nav { display: flex; align-items: center; gap: 34px; }
  .lp-root .lp-pc-nav a {
    font-size: 16px;
    font-weight: 800;
    color: var(--text-sub);
    text-decoration: none;
    white-space: nowrap;
  }
  .lp-root .lp-pc-nav a:hover { color: var(--dark); }
  .lp-root .lp-pc-nav .btn-nav {
    color: white;
    padding: 13px 28px;
    font-size: 16px;
    font-weight: 900;
  }
  .lp-root .nav-socials {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .lp-root .nav-social-icon {
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--dark);
    flex-shrink: 0;
    transition: color 0.2s ease, transform 0.2s ease;
  }
  .lp-root .nav-social-icon:hover {
    color: var(--orange);
    transform: translateY(-1px);
  }
  .lp-root .nav-social-icon svg {
    display: block;
    width: 24px;
    height: 24px;
    fill: currentColor;
  }
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
  .lp-root .hero-visual {
    display: flex;
    grid-column: 2;
    grid-row: 1 / 3;
    align-items: center;
    justify-content: center;
  }
  .lp-root .hero-visual-img { width: 100%; max-width: 175px; object-fit: contain; }
  .lp-root .hero-cta { grid-column: 1 / -1; grid-row: 2; padding-top: 32px; }
  .lp-root .btn-primary { width: 100%; display: flex; }
  .lp-root .btn-login { text-align: center; }

  /* FEATURES — 横3列 */
  .lp-root .feat-grid { flex-direction: row; gap: 24px; }
  .lp-root .feat-card { flex: 1; }

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
.lp-root .hero-bg-low { display: none; }
.lp-root .hero-before-after { display: none; }
@media (max-width: 899px) {
  .lp-root #hero {
    padding: 96px 24px 56px;
    background: var(--bg);
  }
  .lp-root .hero-bg > img:first-child {
    width: 280px !important;
    top: -40px !important;
    right: -50px !important;
    opacity: 0.4 !important;
  }
  .lp-root .hero-bg-low {
    display: block;
    position: absolute;
    width: 180px;
    bottom: 40px;
    left: -20px;
    opacity: 0.35;
  }
  .lp-root .hero-run-img {
    max-width: 280px !important;
  }
  .lp-root .hero-sub-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 32px;
  }
  .lp-root .hero-sub {
    flex: 1;
    margin-bottom: 0;
  }
  .lp-root .hero-before-after {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }
  .lp-root .hero-before-after img {
    width: 66px;
    height: auto;
    object-fit: contain;
  }
  .lp-root .hero-before-after-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border: 2px solid #FFD9B0;
    border-radius: 50%;
    color: #F97316;
    flex-shrink: 0;
  }
  .lp-root .hero-cta .btn-primary {
    width: 100%;
  }
}
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
.lp-root .feature-steps { display: flex; flex-direction: column; gap: 0; margin-top: 48px; }
.lp-root .feature-step {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  align-items: center;
  padding: 40px 0;
  border-bottom: 1.5px solid var(--border);
}
.lp-root .feature-step:last-child { border-bottom: none; }
.lp-root .feature-step.reverse { direction: rtl; }
.lp-root .feature-step.reverse > * { direction: ltr; }
.lp-root .feature-step-img {
  width: 100%;
  max-width: 160px;
  margin: 0 auto;
  display: block;
}
.lp-root .feature-step-text { padding: 0 8px; }
.lp-root .feature-step-num {
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 3px;
  color: var(--orange);
  margin-bottom: 10px;
}
.lp-root .feature-step-title {
  font-size: 20px;
  font-weight: 900;
  margin-bottom: 8px;
  line-height: 1.3;
}
.lp-root .feature-step-desc {
  font-size: 13px;
  color: var(--text-sub);
  line-height: 1.8;
}
.lp-root .feat-grid { display: flex; flex-direction: column; gap: 20px; margin-top: 48px; }
.lp-root .feat-card {
  background: var(--white);
  border-radius: 24px; padding: 32px 24px;
  display: flex; flex-direction: column; align-items: center; text-align: center;
  box-shadow: 0 14px 32px -10px rgba(124, 92, 60, 0.14), 0 4px 12px rgba(124, 92, 60, 0.05);
}
.lp-root .feat-icon { width: 140px; height: 140px; margin-bottom: 20px; display: flex; align-items: center; justify-content: center; }
.lp-root .feat-icon img { width: 100%; height: 100%; object-fit: contain; }
.lp-root .feat-catch { font-size: 18px; font-weight: 900; margin-bottom: 8px; line-height: 1.4; }
.lp-root .feat-desc { font-size: 14px; color: var(--text-sub); line-height: 1.8; }

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
.lp-root #cta { background: #FFFFFF; color: var(--dark); text-align: center; padding: 80px 24px; }
.lp-root #cta .s-label { color: var(--orange); }
.lp-root #cta .s-title { color: var(--dark); }
.lp-root .cta-sub { font-size: 16px; color: var(--text-sub); line-height: 1.75; margin-bottom: 36px; }
.lp-root .btn-cta {
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--orange); color: white;
  padding: 13px 28px; border-radius: 100px;
  font-size: 15px; font-weight: 800; text-decoration: none; width: auto;
  box-shadow: 0 8px 24px rgba(249,115,22,0.22);
}
.lp-root .cta-fine { font-size: 12px; color: var(--text-light); margin-top: 14px; }

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
  max-width: 200px;
  aspect-ratio: 828 / 1792;
  background: linear-gradient(155deg, #1a1a1f 0%, #0a0a0d 50%, #1a1a1f 100%);
  border-radius: 38px;
  padding: 8px;
  box-shadow:
    0 26px 50px -18px rgba(20, 18, 25, 0.3),
    0 12px 24px rgba(20, 18, 25, 0.14),
    inset 0 0 0 1.5px rgba(255, 255, 255, 0.06);
  margin: 0 auto;
}
.lp-root .hero-phone {
  margin-top: 8px;
  margin-right: -10%;
  transform: rotate(2.5deg);
}
@media (min-width: 900px) {
  .lp-root .hero-phone {
    margin-top: 0;
    margin-right: 0;
    transform: none;
  }
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
/* HOW PHONE — light illustration mockup, wider proportion for visual balance */
.lp-root .how-phone {
  aspect-ratio: 1 / 2;
  max-width: 210px;
  background: #FFFFFF;
  padding: 10px;
  border: 1.5px solid #EDE3D0;
  border-radius: 38px;
  box-shadow:
    0 22px 44px -18px rgba(124, 92, 60, 0.18),
    0 8px 18px rgba(124, 92, 60, 0.07);
}
.lp-root .how-phone .phone-mock-screen {
  border-radius: 28px;
  box-shadow: inset 0 0 0 1px #F5EBD8;
}
.lp-root .how-phone .phone-mock-screen > img {
  object-position: top center;
}
.lp-root .how-phone .phone-mock-notch {
  background: #DECCAE;
  width: 26%;
  height: 5px;
  top: 20px;
  border-radius: 100px;
}
.lp-root .how-phone::before,
.lp-root .how-phone::after {
  display: none;
}
@media (min-width: 900px) {
  .lp-root .how-phone { max-width: 230px; }
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
.lp-root .how-text-panel {
  width: 100%;
  max-width: 380px;
  min-height: 178px;
  margin: 28px auto 28px;
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 0.40s ease, transform 0.14s ease;
}
.lp-root .how-text-panel.visible {
  opacity: 1;
  transform: none;
}
.lp-root .how-slider {
  overflow: hidden;
  cursor: grab;
  touch-action: pan-y;
  user-select: none;
}
.lp-root .how-slider:active { cursor: grabbing; }
.lp-root .how-track {
  display: flex;
  will-change: transform;
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
.lp-root .how-track.dragging {
  transition: none;
}
.lp-root .how-slide {
  flex: 0 0 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 0;
}
.lp-root .how-slide-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
}
.lp-root .how-slide-dots button {
  width: 8px;
  height: 8px;
  border: 0;
  border-radius: 50%;
  background: #E3DAC9;
  cursor: pointer;
  padding: 0;
  transition: width 0.2s ease, background-color 0.2s ease;
}
.lp-root .how-slide-dots button.active {
  width: 22px;
  border-radius: 999px;
  background: var(--orange);
}
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
  font-size: 16px; font-weight: 800; color: var(--orange-bright);
  letter-spacing: 0;
}
.lp-root .how-step-num-badge {
  display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--orange-bright); color: white;
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
.lp-root .how-desktop-list { display: none; }
@media (min-width: 900px) {
  .lp-root .phone-mock { max-width: 220px; }
  .lp-root .how-slider {
    max-width: 760px;
    margin-left: auto;
    margin-right: auto;
  }
  .lp-root .how-slide {
    flex-direction: row;
    justify-content: center;
    gap: 64px;
  }
  .lp-root .how-slide .how-step-text {
    flex: 1;
    margin-bottom: 0;
  }
  .lp-root .how-slide .how-step-visual {
    flex-shrink: 0;
    margin-bottom: 0;
  }
}

/* TARGET */
.lp-root #target { background: #FFFFFF; padding: 90px 24px; }
.lp-root #target .s-title { font-family: var(--font-display, sans-serif); font-style: italic; letter-spacing: 0.01em; }
.lp-root .target-body { font-size: 16px; color: var(--text-sub); line-height: 1.95; font-weight: 500; }
.lp-root .target-conclusion { font-size: 19px; font-weight: 900; line-height: 1.7; margin-top: 36px; color: var(--dark); }
.lp-root .target-phone-col { display: none; }
@media (min-width: 700px) {
  .lp-root .target-body { font-size: 17px; }
  .lp-root .target-conclusion { font-size: 22px; }
}

/* DESKTOP LAYOUT OVERRIDES (must come after default rules to win cascade) */
@media (min-width: 900px) {
  /* HERO — PCもコピー主役の中央構成 */
  .lp-root #hero {
    padding-top: 70px;
    padding-bottom: 88px;
  }
  .lp-root #hero .hero-bg-low {
    display: block;
    position: absolute;
    width: 220px;
    bottom: 40px;
    left: 4%;
    opacity: 0.8;
  }
  .lp-root .hero-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 760px;
    margin: 0 auto;
    text-align: center;
  }
  .lp-root .hero-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }
  .lp-root .hero-run-img {
    max-width: 460px !important;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 22px !important;
  }
  .lp-root .hero-sub br {
    display: inline;
  }
  .lp-root .hero-sub-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 28px;
    margin-bottom: 34px;
  }
  .lp-root .hero-sub {
    margin-bottom: 0;
    text-align: left;
  }
  .lp-root .hero-before-after {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
  .lp-root .hero-before-after img {
    width: 78px;
    height: auto;
    object-fit: contain;
  }
  .lp-root .hero-before-after-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: 2px solid #FFD9B0;
    border-radius: 50%;
    color: var(--orange);
    flex-shrink: 0;
  }
  .lp-root .hero-visual {
    display: none;
  }
  .lp-root .hero-cta {
    width: 100%;
    max-width: 430px;
    padding-top: 0;
  }
  .lp-root .hero-cta .btn-primary {
    width: 100%;
  }

  /* FOR YOU — PCだけ左モック、右本文の2カラム */
  .lp-root .target-layout {
    display: grid;
    grid-template-columns: minmax(240px, 320px) minmax(0, 1fr);
    align-items: center;
    gap: 72px;
    max-width: 920px !important;
    text-align: left !important;
  }
  .lp-root .target-phone-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .lp-root .target-mock-label-viewport {
    width: 100%;
    max-width: 300px;
    margin-bottom: 18px;
  }
  .lp-root .target-mock-step-num {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: var(--orange-bright);
    font-size: 16px;
    font-weight: 800;
    letter-spacing: 0;
    white-space: nowrap;
  }
  .lp-root .target-phone {
    max-width: 230px;
  }
  .lp-root .target-mock-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    margin-top: 22px;
  }
  .lp-root .target-mock-controls > button {
    width: 34px;
    height: 34px;
    border: 1.5px solid var(--border);
    border-radius: 50%;
    background: white;
    color: var(--orange-bright);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 8px 18px rgba(124, 92, 60, 0.08);
  }
  .lp-root .target-mock-dots {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .lp-root .target-mock-dots button {
    width: 8px;
    height: 8px;
    border: 0;
    border-radius: 999px;
    background: #E3DAC9;
    padding: 0;
    cursor: pointer;
    transition: width 0.2s ease, background-color 0.2s ease;
  }
  .lp-root .target-mock-dots button.active {
    width: 22px;
    background: var(--orange-bright);
  }
  .lp-root .target-copy .target-body {
    max-width: 520px;
  }

  /* FEATURES — PCで3つを横並びステップ化 */
  .lp-root .feature-steps {
    flex-direction: row;
    align-items: stretch;
    gap: 42px;
    max-width: 1040px;
    margin: 56px auto 0;
  }
  .lp-root .feature-step,
  .lp-root .feature-step.reverse {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 0;
    border-bottom: none;
    direction: ltr;
    text-align: center;
  }
  .lp-root .feature-step.reverse > * {
    direction: ltr;
  }
  .lp-root .feature-step-img {
    max-width: 150px;
    margin-bottom: 24px;
  }
  .lp-root .feature-step-text {
    padding: 0;
  }
  .lp-root .feature-step-title {
    font-size: 22px;
  }
  .lp-root .feature-step-desc {
    font-size: 14px;
    max-width: 250px;
    margin: 0 auto;
  }

  /* HOW IT WORKS — PCでスマホと説明を横並び（交互配置） */
  .lp-root .how-text-panel,
  .lp-root .how-slider,
  .lp-root .how-slide-dots {
    display: none;
  }
  .lp-root .how-desktop-list {
    display: flex;
    flex-direction: column;
    gap: 78px;
    max-width: 980px;
    margin: 58px auto 0;
  }
  .lp-root .how-desktop-step {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 72px;
  }
  .lp-root .how-desktop-step.reverse {
    flex-direction: row-reverse;
  }
  .lp-root .how-desktop-step .how-step-visual {
    margin-bottom: 0;
    flex: 0 0 340px;
  }
  .lp-root .how-desktop-step .how-phone {
    max-width: 300px;
  }
  .lp-root .how-desktop-step .how-step-text {
    flex: 1;
  }
  .lp-root .how-desktop-step .how-step-num {
    justify-content: flex-start;
  }
  .lp-root .how-desktop-step .how-step-title {
    text-align: left;
    font-size: 26px;
    line-height: 1.3;
  }
  .lp-root .how-desktop-step .how-step-desc {
    text-align: left;
    margin-left: 0;
    max-width: 420px;
  }

  /* FAQ — PCで2カラム */
  .lp-root #faq {
    padding-top: 110px;
    padding-bottom: 120px;
  }
  .lp-root #faq .s-label,
  .lp-root #faq .s-title {
    max-width: 960px;
    margin-left: auto;
    margin-right: auto;
  }
  .lp-root #faq .s-title {
    margin-bottom: 48px;
  }
  .lp-root .faq-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0 36px;
    max-width: 960px;
  }
  .lp-root .faq-item {
    border-radius: 0;
    box-shadow: none;
    border-bottom: 1.5px solid var(--border);
  }
  .lp-root .faq-q {
    min-height: 78px;
    padding: 20px 8px;
    font-size: 15px;
    font-weight: 800;
  }
  .lp-root .faq-a {
    padding-left: 8px;
    padding-right: 8px;
  }
  .lp-root .faq-item.open .faq-a {
    padding-bottom: 22px;
  }
}
`;
