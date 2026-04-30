"use client";

import { useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Target, Timer, BarChart2, Settings } from "lucide-react";

const leftTabs = [
  { href: "/", label: "ホーム", icon: Home },
  { href: "/goals", label: "目標", icon: Target },
];
const rightTabs = [
  { href: "/records", label: "記録", icon: BarChart2 },
  { href: "/settings", label: "設定", icon: Settings },
];

const PREFETCH_HREFS = ["/", "/goals", "/run", "/records", "/settings"];

function TabItem({
  href,
  label,
  icon: Icon,
  active,
  onPrefetch,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  onPrefetch: (href: string) => void;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className="flex-1 flex flex-col items-center justify-center gap-1 pt-0.5 pb-4 min-h-14"
      style={{ color: active ? "#FF6B00" : "#888888" }}
      onPointerEnter={() => onPrefetch(href)}
      onFocus={() => onPrefetch(href)}
      onTouchStart={() => onPrefetch(href)}
    >
      <Icon size={24} strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
      <span style={{ fontSize: "10px", fontWeight: active ? 700 : 500, lineHeight: 1 }}>{label}</span>
    </Link>
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const prefetched = useRef(new Set<string>());
  const isRunActive = pathname === "/run" || pathname.startsWith("/run/");

  const prefetchRoute = useCallback((href: string) => {
    if (prefetched.current.has(href)) return;
    prefetched.current.add(href);
    router.prefetch(href);
  }, [router]);

  useEffect(() => {
    const win = window as Window & typeof globalThis & {
      requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    const prefetchAll = () => {
      PREFETCH_HREFS.forEach(prefetchRoute);
    };
    const scheduleIdle = win.requestIdleCallback;
    const usedIdleCallback = Boolean(scheduleIdle);
    const idleId = scheduleIdle
      ? scheduleIdle(prefetchAll, { timeout: 1800 })
      : window.setTimeout(prefetchAll, 450);

    return () => {
      if (usedIdleCallback && win.cancelIdleCallback) {
        win.cancelIdleCallback(idleId);
      } else {
        window.clearTimeout(idleId);
      }
    };
  }, [prefetchRoute]);

  function isActive(href: string) {
    return pathname === href || (href !== "/" && pathname.startsWith(href));
  }

  return (
    <nav
      className="fixed bottom-0 z-50 bg-white border-t border-border"
      style={{ left: "max(0px, calc(50vw - 240px))", width: "min(100vw, 480px)", paddingBottom: "env(safe-area-inset-bottom)", overflow: "visible", boxShadow: "0 -8px 28px rgba(0,0,0,0.05)" }}
    >
      <div className="flex items-end" style={{ minHeight: "58px" }}>
        {leftTabs.map((tab) => <TabItem key={tab.href} {...tab} active={isActive(tab.href)} onPrefetch={prefetchRoute} />)}

        {/* 計測ボタン（中央・突出） */}
        <div className="flex-1 flex flex-col items-center" style={{ marginBottom: "10px" }}>
          <Link
            href="/run"
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}
            onPointerEnter={() => prefetchRoute("/run")}
            onFocus={() => prefetchRoute("/run")}
            onTouchStart={() => prefetchRoute("/run")}
          >
            <div
              style={{
                width: "62px",
                height: "62px",
                borderRadius: "20px",
                background: isRunActive ? "linear-gradient(135deg, #E55A00, #FF7A1A)" : "linear-gradient(135deg, #FF6B00, #FF8A00)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 9px 24px rgba(255, 107, 0, 0.38)",
                transform: "translateY(-16px)",
                transition: "transform 0.15s, background 0.15s",
                border: "4px solid white",
              }}
            >
              <Timer size={27} color="white" strokeWidth={2.2} />
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

        {rightTabs.map((tab) => <TabItem key={tab.href} {...tab} active={isActive(tab.href)} onPrefetch={prefetchRoute} />)}
      </div>
    </nav>
  );
}
