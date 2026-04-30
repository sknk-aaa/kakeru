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
      {/* ハンバーガーボタン（スマホのみ表示） */}
      <div className="sm:hidden">
        <button
          onClick={() => setOpen(true)}
          style={{
            position: "fixed",
            top: "12px",
            left: "max(12px, calc(50vw - 192px))",
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
      </div>

      {open && <HamburgerDrawer onClose={() => setOpen(false)} />}
    </>
  );
}
