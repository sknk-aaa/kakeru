"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, Download, FileText, HelpCircle, LogOut, MessageCircle, Receipt, Shield, X, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const SUPPORT_ITEMS = [
  { href: "/faq", label: "よくある質問", icon: HelpCircle },
  { href: "/contact", label: "お問い合わせ", icon: MessageCircle },
];

const LEGAL_ITEMS = [
  { href: "/privacy", label: "プライバシーポリシー", icon: Shield },
  { href: "/terms", label: "利用規約", icon: FileText },
  { href: "/tokusho", label: "特定商取引法に基づく表記", icon: Receipt },
];

export default function HamburgerDrawer({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isInstalled] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches
  );

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUserEmail(user.email ?? null);
      supabase
        .from("users")
        .select("is_subscribed")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.is_subscribed) setIsSubscribed(true);
        });
    });
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    onClose();
    router.push("/auth");
    router.refresh();
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 40, display: "flex" }}
      onClick={onClose}
    >
      <div
        className="hamburger-drawer-panel"
        style={{
          height: "100%",
          background: "white",
          boxShadow: "4px 0 24px rgba(0,0,0,0.12)",
          display: "flex",
          flexDirection: "column",
          paddingTop: "env(safe-area-inset-top)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <Image src="/stickman-assets/stickman-01.png" alt="" width={20} height={20} style={{ objectFit: "contain" }} />
            <span style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 900, fontStyle: "italic", color: "#FF6B00", letterSpacing: "0.06em" }}>KAKERU</span>
          </div>
          <button
            onClick={onClose}
            style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", background: "#F2F2F7", border: "none", borderRadius: "8px", cursor: "pointer" }}
            aria-label="メニューを閉じる"
          >
            <X size={16} color="#888888" />
          </button>
        </div>

        <div style={{ margin: "0 14px 14px", background: "#F9F9FB", borderRadius: "16px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, #FF6B00, #FF9500)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: "16px", fontWeight: 800, color: "white" }}>
              {(userEmail ?? "?")[0].toUpperCase()}
            </span>
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "#111111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {userEmail ?? ""}
            </p>
            {isSubscribed !== null && (
              <div style={{ marginTop: "4px" }}>
                {isSubscribed ? (
                  <span style={{
                    display: "inline-block",
                    background: "linear-gradient(135deg, #FF6B00, #FF9500)",
                    color: "white", fontSize: "10px", fontWeight: 900,
                    letterSpacing: "0.1em", padding: "2px 9px", borderRadius: "99px",
                  }}>★ PRO</span>
                ) : (
                  <span style={{
                    display: "inline-block",
                    background: "#EBEBF0", color: "#999999",
                    fontSize: "10px", fontWeight: 700,
                    letterSpacing: "0.08em", padding: "2px 9px", borderRadius: "99px",
                  }}>FREE</span>
                )}
              </div>
            )}
          </div>
        </div>

        {isSubscribed === false && (
          <div style={{ margin: "0 14px 14px" }}>
            <Link href="/pro" onClick={onClose} style={{ textDecoration: "none" }}>
              <div style={{
                background: "linear-gradient(135deg, #FF6B00, #FF9500)",
                borderRadius: "14px", padding: "14px 16px",
                display: "flex", alignItems: "center", gap: "10px",
              }}>
                <Zap size={18} color="white" fill="white" />
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 800, color: "white", letterSpacing: "0.02em" }}>PROにアップグレード</p>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.8)", marginTop: "2px" }}>全機能を解放する</p>
                </div>
              </div>
            </Link>
          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto" }}>
          <p style={{ fontSize: "10px", color: "#BBBBBB", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", padding: "4px 20px 4px" }}>
            Plan
          </p>
          <Link
            href={isSubscribed === true ? "/pro/manage" : "/pro"}
            onClick={onClose}
            style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 20px", color: "#333333", textDecoration: "none" }}
          >
            <CreditCard size={17} color="#FF6B00" strokeWidth={1.8} />
            <span style={{ fontSize: "14px", fontWeight: 500 }}>
              {isSubscribed === true ? "プラン管理" : "プレミアムプラン"}
            </span>
          </Link>

          <div style={{ height: "1px", background: "#F2F2F2", margin: "4px 0" }} />

          <p style={{ fontSize: "10px", color: "#BBBBBB", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", padding: "8px 20px 4px" }}>
            Support
          </p>
          {!isInstalled && (
            <Link
              href="/install"
              onClick={onClose}
              style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 20px", color: "#333333", textDecoration: "none" }}
            >
              <Download size={17} color="#FF6B00" strokeWidth={1.8} />
              <span style={{ fontSize: "14px", fontWeight: 500 }}>ホーム画面に追加</span>
            </Link>
          )}
          {SUPPORT_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 20px", color: "#333333", textDecoration: "none" }}
            >
              <Icon size={17} color="#FF6B00" strokeWidth={1.8} />
              <span style={{ fontSize: "14px", fontWeight: 500 }}>{label}</span>
            </Link>
          ))}

          <div style={{ height: "1px", background: "#F2F2F2", margin: "4px 0" }} />

          <p style={{ fontSize: "10px", color: "#BBBBBB", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", padding: "8px 20px 4px" }}>
            Legal
          </p>
          {LEGAL_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 20px", color: "#555555", textDecoration: "none" }}
            >
              <Icon size={17} color="#BBBBBB" strokeWidth={1.8} />
              <span style={{ fontSize: "13px", fontWeight: 400 }}>{label}</span>
            </Link>
          ))}
        </div>

        <button
          onClick={handleLogout}
          style={{
            display: "flex", alignItems: "center", gap: "12px",
            padding: "13px 20px", width: "100%",
            background: "none", border: "none",
            borderTop: "1px solid #F2F2F2", cursor: "pointer",
          }}
        >
          <LogOut size={17} color="#EF4444" strokeWidth={1.8} />
          <span style={{ fontSize: "14px", fontWeight: 500, color: "#EF4444" }}>ログアウト</span>
        </button>

        <div style={{ padding: "16px 20px calc(env(safe-area-inset-bottom) + 72px)", borderTop: "1px solid #F2F2F2" }}>
          <p style={{ fontSize: "11px", color: "#CCCCCC" }}>www.kakeruapp.com</p>
        </div>
      </div>

      <div style={{ flex: 1, background: "rgba(0,0,0,0.35)" }} />
    </div>
  );
}
