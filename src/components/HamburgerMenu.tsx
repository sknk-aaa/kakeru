"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, Shield, FileText, Receipt, MessageCircle, HelpCircle, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const MAIN_PAGES = ["/", "/goals", "/records", "/settings"];

const SUPPORT_ITEMS = [
  { href: "/faq", label: "よくある質問", icon: HelpCircle },
  { href: "/contact", label: "お問い合わせ", icon: MessageCircle },
];

const LEGAL_ITEMS = [
  { href: "/privacy", label: "プライバシーポリシー", icon: Shield },
  { href: "/terms", label: "利用規約", icon: FileText },
  { href: "/tokusho", label: "特定商取引法に基づく表記", icon: Receipt },
];

export default function HamburgerMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("users").select("is_subscribed").eq("id", user.id).single()
        .then(({ data }) => { if (data?.is_subscribed) setIsSubscribed(true); });
    });
  }, []);

  if (!MAIN_PAGES.includes(pathname)) return null;

  return (
    <>
      {/* ハンバーガーボタン */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          top: "9px",
          left: "12px",
          zIndex: 30,
          width: "36px",
          height: "36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "none",
          border: "none",
          cursor: "pointer",
          borderRadius: "8px",
        }}
        aria-label="メニューを開く"
      >
        <Menu size={22} color="#888888" strokeWidth={2} />
      </button>

      {/* オーバーレイ */}
      {open && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 40, display: "flex" }}
          onClick={() => setOpen(false)}
        >
          {/* ドロワー */}
          <div
            style={{
              width: "260px",
              height: "100%",
              background: "white",
              boxShadow: "4px 0 24px rgba(0,0,0,0.12)",
              display: "flex",
              flexDirection: "column",
              paddingTop: "env(safe-area-inset-top)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ドロワーヘッダー */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #F2F2F2" }}>
              <span style={{ fontSize: "16px", fontWeight: 800, color: "#FF6B00", letterSpacing: "-0.3px" }}>カケル</span>
              <button
                onClick={() => setOpen(false)}
                style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", background: "#F2F2F7", border: "none", borderRadius: "8px", cursor: "pointer" }}
              >
                <X size={16} color="#888888" />
              </button>
            </div>

            {/* メニュー項目 */}
            <div style={{ padding: "12px 0", flex: 1 }}>

              {/* PRO セクション */}
              <Link
                href={isSubscribed ? "/pro/manage" : "/pro"}
                onClick={() => setOpen(false)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 20px", textDecoration: "none",
                  background: isSubscribed ? "linear-gradient(135deg, #FFF5EE, #FFF0E5)" : "transparent",
                  borderBottom: "1px solid #F2F2F2",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{
                    display: "inline-block",
                    background: "linear-gradient(135deg, #FF6B00, #FF9500)",
                    color: "white", fontSize: "9px", fontWeight: 900,
                    letterSpacing: "0.12em", padding: "3px 8px", borderRadius: "99px",
                  }}>
                    ★ PRO
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "#111111" }}>
                    {isSubscribed ? "PRO プラン利用中" : "PRO プランに加入する"}
                  </span>
                </div>
                <ChevronRight size={15} color="#CCCCCC" />
              </Link>

              <p style={{ fontSize: "10px", color: "#AAAAAA", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", padding: "12px 20px 4px" }}>
                サポート
              </p>
              {SUPPORT_ITEMS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "13px 20px", color: "#333333", textDecoration: "none" }}
                >
                  <Icon size={17} color="#888888" strokeWidth={1.8} />
                  <span style={{ fontSize: "14px", fontWeight: 500 }}>{label}</span>
                </Link>
              ))}
              <p style={{ fontSize: "10px", color: "#AAAAAA", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", padding: "16px 20px 4px" }}>
                法的情報
              </p>
              {LEGAL_ITEMS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "13px 20px", color: "#333333", textDecoration: "none" }}
                >
                  <Icon size={17} color="#888888" strokeWidth={1.8} />
                  <span style={{ fontSize: "14px", fontWeight: 500 }}>{label}</span>
                </Link>
              ))}
            </div>

            {/* バージョン */}
            <div style={{ padding: "16px 20px", borderTop: "1px solid #F2F2F2" }}>
              <p style={{ fontSize: "11px", color: "#CCCCCC" }}>www.kakeruapp.com</p>
            </div>
          </div>

          {/* 背景暗幕 */}
          <div style={{ flex: 1, background: "rgba(0,0,0,0.35)" }} />
        </div>
      )}
    </>
  );
}
