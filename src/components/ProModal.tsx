"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { X } from "lucide-react";

interface Props {
  featureName: string;
  description: string;
  onClose: () => void;
}

export default function ProModal({ featureName, description, onClose }: Props) {
  const router = useRouter();

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end" }}
      onClick={onClose}
    >
      <div
        style={{ background: "white", borderRadius: "24px 24px 0 0", padding: "28px 24px calc(env(safe-area-inset-bottom) + 32px)", width: "100%", position: "relative" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          aria-label="閉じる"
          style={{ position: "absolute", top: "20px", right: "20px", width: "32px", height: "32px", borderRadius: "50%", background: "#F2F2F7", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
        >
          <X size={16} color="#888888" aria-hidden="true" />
        </button>

        {/* ドラッグハンドル */}
        <div style={{ width: "36px", height: "4px", background: "#E5E5E5", borderRadius: "2px", margin: "0 auto 20px" }} />

        {/* 棒人間イラスト */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
          <Image
            src="/stickman-assets/stickman-02.png"
            alt=""
            width={80}
            height={80}
            style={{ width: 80, height: 80, objectFit: "contain" }}
          />
        </div>

        {/* PRO バッジ */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
          <span style={{ background: "linear-gradient(135deg, #FF6B00, #FF9500)", color: "white", fontSize: "11px", fontWeight: 800, letterSpacing: "0.1em", padding: "4px 12px", borderRadius: "99px" }}>
            PRO
          </span>
        </div>

        <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#111111", textAlign: "center", marginBottom: "8px" }}>
          {featureName}
        </h2>
        <p style={{ fontSize: "14px", color: "#888888", textAlign: "center", lineHeight: 1.7, marginBottom: "28px" }}>
          {description}
        </p>

        <button
          onClick={() => router.push("/pro")}
          style={{ width: "100%", minHeight: "52px", background: "linear-gradient(135deg, #FF6B00, #FF9500)", border: "none", borderRadius: "14px", color: "white", fontSize: "16px", fontWeight: 800, cursor: "pointer", marginBottom: "14px", boxShadow: "0 4px 16px rgba(255,107,0,0.35)" }}
        >
          PRO にする — ¥480/月〜
        </button>

        <button
          onClick={onClose}
          style={{ width: "100%", background: "none", border: "none", fontSize: "14px", color: "#AAAAAA", cursor: "pointer", padding: "4px" }}
        >
          後で
        </button>
      </div>
    </div>
  );
}
