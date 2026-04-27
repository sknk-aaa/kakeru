"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, CheckCircle } from "lucide-react";
import AppShell from "@/components/AppShell";

export default function ContactPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setEmail(user.email);
    });
  }, []);

  async function handleSubmit() {
    if (!body.trim()) return;
    setStatus("loading");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    setStatus(res.ok ? "done" : "error");
  }

  return (
    <AppShell>
      <div>
        <div style={{ padding: "20px 20px 12px", display: "flex", alignItems: "center", gap: "4px" }}>
          <button
            onClick={() => router.back()}
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: "#FF6B00", fontSize: "15px", fontWeight: 500 }}
          >
            <ChevronLeft size={20} color="#FF6B00" /> 戻る
          </button>
        </div>

        <div style={{ padding: "0 16px 24px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111111", marginBottom: "6px" }}>お問い合わせ</h1>
          <p style={{ fontSize: "13px", color: "#AAAAAA", marginBottom: "24px" }}>
            ご意見・ご要望・バグ報告などをお気軽にどうぞ。
          </p>

          {status === "done" ? (
            <div style={{ background: "white", borderRadius: "16px", padding: "40px 20px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <CheckCircle size={48} color="#22C55E" style={{ marginBottom: "16px" }} />
              <p style={{ fontSize: "17px", fontWeight: 700, color: "#111111", marginBottom: "8px" }}>送信しました</p>
              <p style={{ fontSize: "14px", color: "#888888" }}>お問い合わせありがとうございます。</p>
            </div>
          ) : (
            <>
              <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", marginBottom: "16px" }}>
                <div style={{ padding: "14px 16px", borderBottom: "1px solid #F2F2F2" }}>
                  <p style={{ fontSize: "11px", color: "#AAAAAA", marginBottom: "4px" }}>メールアドレス</p>
                  <p style={{ fontSize: "15px", color: "#888888" }}>{email || "..."}</p>
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <p style={{ fontSize: "11px", color: "#AAAAAA", marginBottom: "8px" }}>お問い合わせ内容</p>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="内容を入力してください"
                    rows={7}
                    style={{
                      width: "100%",
                      border: "none",
                      outline: "none",
                      fontSize: "15px",
                      color: "#111111",
                      background: "transparent",
                      resize: "none",
                      lineHeight: 1.6,
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {status === "error" && (
                <p style={{ fontSize: "14px", color: "#EF4444", marginBottom: "12px" }}>
                  送信に失敗しました。もう一度お試しください。
                </p>
              )}

              <button
                className="btn-primary"
                style={{ width: "100%" }}
                onClick={handleSubmit}
                disabled={status === "loading" || !body.trim()}
              >
                {status === "loading" ? "送信中..." : "送信する"}
              </button>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
