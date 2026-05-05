"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface Props {
  triggerRun: 1 | 3;
  onClose: () => void;
}

export default function InstallPromptModal({ triggerRun, onClose }: Props) {
  const [platform, setPlatform] = useState<"ios" | "chrome" | null>(null);

  useEffect(() => {
    const lsKey = `pwa_install_shown_r${triggerRun}`;
    if (localStorage.getItem(lsKey)) { onClose(); return; }

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) { onClose(); return; }

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      setPlatform("ios");
    } else if ((window as unknown as { __pwaPrompt?: unknown }).__pwaPrompt) {
      setPlatform("chrome");
    } else {
      onClose();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClose() {
    localStorage.setItem(`pwa_install_shown_r${triggerRun}`, "1");
    onClose();
  }

  async function handleInstall() {
    const prompt = (window as unknown as { __pwaPrompt?: { prompt: () => void; userChoice: Promise<unknown> } }).__pwaPrompt;
    if (!prompt) { handleClose(); return; }
    prompt.prompt();
    await prompt.userChoice;
    (window as unknown as { __pwaPrompt?: unknown }).__pwaPrompt = null;
    handleClose();
  }

  if (!platform) return null;

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(0,0,0,0.5)" }}
      onClick={handleClose}
    >
      <div
        style={{ background: "white", borderRadius: "20px 20px 0 0", padding: `28px 24px calc(env(safe-area-inset-bottom) + 28px)`, width: "100%", maxWidth: "480px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <Image src="/icon-192.png" alt="" width={52} height={52} style={{ width: 52, height: 52, borderRadius: "12px" }} />
            <div>
              <p style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#111111" }}>ホーム画面に追加する</p>
              <p style={{ margin: "3px 0 0", fontSize: "13px", color: "#888888" }}>カケル</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", marginTop: "2px", lineHeight: 1 }}
          >
            <X size={18} color="#BBBBBB" />
          </button>
        </div>

        <p style={{ fontSize: "15px", color: "#555555", lineHeight: 1.75, marginBottom: "24px" }}>
          ホーム画面に追加すると、アプリのようにすぐ起動できます。走る前のハードルをさらに下げましょう。
        </p>

        {platform === "ios" && (
          <div style={{ background: "#F8F8F8", borderRadius: "12px", padding: "16px 18px", marginBottom: "20px" }}>
            <p style={{ margin: "0 0 12px", fontSize: "11px", fontWeight: 700, color: "#888888", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Safariでの追加方法
            </p>
            {(
              [
                ["1", '画面下部の「共有」ボタン（□↑）をタップ'],
                ["2", '「ホーム画面に追加」を選択'],
                ["3", '右上の「追加」をタップ'],
              ] as const
            ).map(([num, text]) => (
              <div key={num} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                <span style={{
                  flexShrink: 0, width: "22px", height: "22px",
                  background: "#FF6B00", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px", fontWeight: 700, color: "white",
                }}>{num}</span>
                <span style={{ fontSize: "14px", color: "#333333" }}>{text}</span>
              </div>
            ))}
          </div>
        )}

        {platform === "chrome" && (
          <button
            onClick={handleInstall}
            style={{
              width: "100%", background: "#FF6B00", color: "white",
              border: "none", borderRadius: "10px", padding: "16px",
              fontSize: "16px", fontWeight: 700, cursor: "pointer", marginBottom: "12px",
            }}
          >
            ホーム画面に追加する
          </button>
        )}

        <button
          onClick={handleClose}
          style={{ width: "100%", background: "none", border: "none", color: "#AAAAAA", fontSize: "15px", cursor: "pointer", padding: "12px" }}
        >
          後で
        </button>
      </div>
    </div>
  );
}
