"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Target, Timer, BarChart2, Settings } from "lucide-react";

const leftTabs = [
  { href: "/", label: "ホーム", icon: Home },
  { href: "/goals", label: "目標", icon: Target },
];
const rightTabs = [
  { href: "/records", label: "記録", icon: BarChart2 },
  { href: "/settings", label: "設定", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();
  const isRunActive = pathname === "/run" || pathname.startsWith("/run/");

  function isActive(href: string) {
    return pathname === href || (href !== "/" && pathname.startsWith(href));
  }

  function TabItem({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
    const active = isActive(href);
    return (
      <Link
        href={href}
        className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px]"
        style={{ color: active ? "#FF6B00" : "#888888" }}
      >
        <Icon size={21} strokeWidth={active ? 2.5 : 2} />
        <span style={{ fontSize: "9px", fontWeight: active ? 700 : 500, lineHeight: 1 }}>{label}</span>
      </Link>
    );
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E5E5E5]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)", overflow: "visible" }}
    >
      <div className="flex items-end" style={{ minHeight: "56px" }}>
        {leftTabs.map((tab) => <TabItem key={tab.href} {...tab} />)}

        {/* 計測ボタン（中央・突出） */}
        <div className="flex-1 flex flex-col items-center" style={{ marginBottom: "6px" }}>
          <Link href="/run" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "18px",
                background: isRunActive ? "#E55A00" : "#FF6B00",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 16px rgba(255, 107, 0, 0.45)",
                transform: "translateY(-14px)",
                transition: "transform 0.15s, background 0.15s",
              }}
            >
              <Timer size={26} color="white" strokeWidth={2} />
            </div>
            <span
              style={{
                fontSize: "9px",
                fontWeight: isRunActive ? 700 : 500,
                color: isRunActive ? "#FF6B00" : "#888888",
                lineHeight: 1,
                marginTop: "-10px",
              }}
            >
              計測
            </span>
          </Link>
        </div>

        {rightTabs.map((tab) => <TabItem key={tab.href} {...tab} />)}
      </div>
    </nav>
  );
}
