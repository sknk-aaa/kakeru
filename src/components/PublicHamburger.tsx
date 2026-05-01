"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import dynamicImport from "next/dynamic";

const HamburgerDrawer = dynamicImport(() => import("./HamburgerDrawer"), { ssr: false, loading: () => null });

const LINK_STYLE: React.CSSProperties = {
  borderBottom: "1px solid #EDE0CC",
  padding: "16px 0",
  fontSize: "15px",
  fontWeight: 700,
  textDecoration: "none",
  color: "#1C1008",
  display: "block",
};

export default function PublicHamburger() {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    createClient().auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session);
    });
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}
        aria-label="メニューを開く"
      >
        <Menu size={22} color="#555" strokeWidth={2} />
      </button>

      {open && isLoggedIn && (
        <HamburgerDrawer onClose={() => setOpen(false)} />
      )}

      {open && !isLoggedIn && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 300 }}
          onClick={() => setOpen(false)}
        >
          <div
            style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 280, background: "white", zIndex: 301, padding: "24px 20px", display: "flex", flexDirection: "column" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Image src="/stickman-assets/stickman-01.png" width={22} height={22} alt="" style={{ objectFit: "contain" }} />
                <span style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 900, fontStyle: "italic", color: "#FF6B00", letterSpacing: "0.06em" }}>KAKERU</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: "#F2F2F7", border: "none", borderRadius: 8, cursor: "pointer" }}
                aria-label="メニューを閉じる"
              >
                <X size={16} color="#888888" />
              </button>
            </div>

            <nav style={{ flex: 1 }}>
              <Link href="/howto" style={LINK_STYLE} onClick={() => setOpen(false)}>使い方</Link>
              <Link href="/faq" style={LINK_STYLE} onClick={() => setOpen(false)}>よくある質問</Link>
              <Link href="/privacy" style={LINK_STYLE} onClick={() => setOpen(false)}>プライバシーポリシー</Link>
              <Link href="/terms" style={LINK_STYLE} onClick={() => setOpen(false)}>利用規約</Link>
              <Link href="/lp" style={LINK_STYLE} onClick={() => setOpen(false)}>このアプリについて</Link>
            </nav>

            <Link
              href="/auth"
              className="btn-primary"
              onClick={() => setOpen(false)}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 24 }}
            >
              今すぐ始める（無料）
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
