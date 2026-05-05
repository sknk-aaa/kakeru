"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const SESSION_KEY = "kakeru_splash_shown";
const MIN_DISPLAY_MS = 1200;
const FADE_MS = 300;

export default function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as { standalone?: boolean }).standalone === true;
    if (!isStandalone) return;

    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, "1");

    setVisible(true);

    const fadeTimer = setTimeout(() => setFading(true), MIN_DISPLAY_MS);
    const hideTimer = setTimeout(() => setVisible(false), MIN_DISPLAY_MS + FADE_MS);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "white",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      opacity: fading ? 0 : 1,
      transition: `opacity ${FADE_MS}ms ease`,
      pointerEvents: "none",
    }}>
      <Image
        src="/stickman-assets/stickman-01.png"
        alt=""
        width={72} height={72}
        style={{ width: 72, height: 72, objectFit: "contain", marginBottom: "12px" }}
        priority
      />
      <span style={{
        fontFamily: "var(--font-display)",
        fontSize: "38px", fontWeight: 900, fontStyle: "italic",
        color: "#FF6B00", letterSpacing: "0.06em",
      }}>
        KAKERU
      </span>
    </div>
  );
}
