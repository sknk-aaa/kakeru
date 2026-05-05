"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import dynamicImport from "next/dynamic";

const HamburgerDrawer = dynamicImport(() => import("./HamburgerDrawer"), { ssr: false, loading: () => null });

const NAV_ITEMS = [
  { href: "/howto", label: "使い方" },
  { href: "/faq", label: "よくある質問" },
  { href: "/privacy", label: "プライバシーポリシー" },
  { href: "/terms", label: "利用規約" },
  { href: "/lp", label: "このアプリについて" },
];

export default function PublicHamburger() {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const canUseDocument = typeof document !== "undefined";

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
    }).catch(() => {
      setIsLoggedIn(false);
    });
  }, []);

  const publicDrawer = (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: "rgba(0,0,0,0.45)",
      }}
      onClick={() => setOpen(false)}
    >
      <div
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, width: 280,
          background: "#FFFFFF", zIndex: 9001,
          paddingTop: "calc(24px + env(safe-area-inset-top))",
          paddingBottom: "calc(24px + env(safe-area-inset-bottom))",
          paddingLeft: 20, paddingRight: 20,
          display: "flex", flexDirection: "column",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Image src="/stickman-assets/stickman-01.png" width={20} height={20} alt="" style={{ width: 20, height: 20, objectFit: "contain" }} />
            <span style={{ fontFamily: "var(--font-display)", fontSize: "17px", fontWeight: 900, fontStyle: "italic", color: "#FF6B00", letterSpacing: "0.06em" }}>KAKERU</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: "#F2F2F7", border: "none", borderRadius: 8, cursor: "pointer" }}
            aria-label="メニューを閉じる"
          >
            <X size={16} color="#888888" />
          </button>
        </div>

        {/* リンク一覧 */}
        <nav style={{ flex: 1 }}>
          {NAV_ITEMS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              style={{
                display: "block",
                borderBottom: "1px solid #EDE0CC",
                padding: "15px 0",
                fontSize: "15px",
                fontWeight: 700,
                textDecoration: "none",
                color: "#1C1008",
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <Link
          href="/auth"
          onClick={() => setOpen(false)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            marginTop: 24,
            background: "#FF6B00", color: "white",
            borderRadius: 100, padding: "15px 24px",
            fontSize: "15px", fontWeight: 800,
            textDecoration: "none",
          }}
        >
          今すぐ始める（無料）
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ background: "none", border: "none", cursor: "pointer", padding: "6px", display: "flex", alignItems: "center" }}
        aria-label="メニューを開く"
      >
        <Menu size={22} color="#555" strokeWidth={2} />
      </button>

      {canUseDocument && open && isLoggedIn === true && createPortal(
        <HamburgerDrawer onClose={() => setOpen(false)} />,
        document.body
      )}

      {canUseDocument && open && isLoggedIn === false && createPortal(
        publicDrawer,
        document.body
      )}
    </>
  );
}
