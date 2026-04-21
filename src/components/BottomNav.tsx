"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Target, Play, BarChart2, Settings } from "lucide-react";

const tabs = [
  { href: "/", label: "ホーム", icon: Home },
  { href: "/goals", label: "目標", icon: Target },
  { href: "/run", label: "計測", icon: Play },
  { href: "/records", label: "記録", icon: BarChart2 },
  { href: "/settings", label: "設定", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E5E5E5]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px]"
              style={{ color: active ? "#FF6B00" : "#888888" }}
            >
              <Icon size={21} strokeWidth={active ? 2.5 : 2} />
              <span style={{ fontSize: "9px", fontWeight: active ? 700 : 500, lineHeight: 1 }}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
