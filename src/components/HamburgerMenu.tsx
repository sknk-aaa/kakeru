"use client";

import { useState } from "react";
import dynamicImport from "next/dynamic";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

const MAIN_PAGES = ["/", "/goals", "/records", "/settings"];

const HamburgerDrawer = dynamicImport(() => import("./HamburgerDrawer"), {
  ssr: false,
  loading: () => null,
});

export default function HamburgerMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (!MAIN_PAGES.includes(pathname)) return null;

  return (
    <>
      {/* ハンバーガーボタン */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          top: "12px",
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

      {open && <HamburgerDrawer onClose={() => setOpen(false)} />}
    </>
  );
}
