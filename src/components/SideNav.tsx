"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Target, Timer, BarChart2, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: "/",         label: "ホーム", icon: Home },
  { href: "/goals",    label: "目標",   icon: Target },
  { href: "/run",      label: "計測",   icon: Timer },
  { href: "/records",  label: "記録",   icon: BarChart2 },
  { href: "/settings", label: "設定",   icon: Settings },
];

export default function SideNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || (href !== "/" && pathname.startsWith(href));
  }

  return (
    <nav
      className="hidden sm:flex"
      style={{
        position: "fixed",
        top: 0,
        left: "max(0px, calc(50vw - 264px))",
        width: "60px",
        height: "100dvh",
        background: "white",
        borderRight: "1px solid #E5E5E5",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "calc(env(safe-area-inset-top) + 14px)",
        paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)",
        zIndex: 30,
        boxShadow: "2px 0 10px rgba(0,0,0,0.04)",
      }}
    >
      {/* ロゴ */}
      <div style={{ marginBottom: "20px" }}>
        <Image src="/stickman-assets/stickman-01.png" alt="" width={26} height={26} style={{ objectFit: "contain" }} />
      </div>

      {/* ナビアイテム */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1, alignItems: "center" }}>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          const isRun = href === "/run";
          return (
            <Link
              key={href}
              href={href}
              title={label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "3px",
                width: "48px",
                height: "52px",
                borderRadius: "14px",
                background: isRun
                  ? active
                    ? "linear-gradient(135deg, #E55A00, #FF7A1A)"
                    : "linear-gradient(135deg, #FF6B00, #FF8A00)"
                  : active
                  ? "#FFF0E6"
                  : "transparent",
                textDecoration: "none",
                transition: "background 0.15s",
                boxShadow: isRun ? "0 4px 14px rgba(255,107,0,0.32)" : "none",
              }}
            >
              <Icon
                size={isRun ? 20 : 19}
                color={isRun ? "white" : active ? "#FF6B00" : "#999999"}
                strokeWidth={active ? 2.5 : 2}
              />
              {!isRun && (
                <span style={{
                  fontSize: "9px",
                  fontWeight: active ? 700 : 500,
                  color: active ? "#FF6B00" : "#999999",
                  lineHeight: 1,
                }}>
                  {label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
