import AppShell from "@/components/AppShell";

const sh: React.CSSProperties = {
  background: "linear-gradient(90deg, #EFEFF4 25%, #E4E4EB 50%, #EFEFF4 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.4s infinite linear",
};

const card: React.CSSProperties = {
  background: "white",
  borderRadius: "22px",
  boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
};

export default function Loading() {
  return (
    <AppShell>
      <div style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #FFF9F5 46%, #F7F7FA 100%)", minHeight: "100vh" }}>

        {/* ヘッダー */}
        <div style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(255,255,255,0.88)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(235,235,235,0.75)", padding: "0 16px 0 56px", height: "60px", display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#FFF0E5" }} />
            <span style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 900, fontStyle: "italic", color: "#FF6B00", letterSpacing: "0.06em" }}>KAKERU</span>
          </div>
        </div>

        <div style={{ padding: "16px 14px 100px" }}>

          {/* 期間タブ */}
          <div style={{ background: "#E4E4EB", borderRadius: "12px", padding: "2px", display: "flex", marginBottom: "16px", gap: "2px" }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ flex: 1, height: "36px", borderRadius: "10px", background: i === 0 ? "white" : "transparent", boxShadow: i === 0 ? "0 1px 4px rgba(0,0,0,0.10)" : "none" }} />
            ))}
          </div>

          {/* 距離合計カード */}
          <div style={{ ...card, padding: "22px 20px", marginBottom: "14px" }}>
            <div style={{ ...sh, height: "10px", width: "30%", borderRadius: "999px", marginBottom: "14px" }} />
            <div style={{ ...sh, height: "52px", width: "52%", borderRadius: "12px", marginBottom: "18px" }} />
            <div style={{ ...sh, height: "7px", borderRadius: "4px" }} />
          </div>

          {/* 週別グラフ */}
          <div style={{ ...card, padding: "20px 18px", marginBottom: "14px" }}>
            <div style={{ ...sh, height: "10px", width: "35%", borderRadius: "999px", marginBottom: "16px" }} />
            <div style={{ display: "flex", alignItems: "flex-end", gap: "5px", height: "100px" }}>
              {[48, 72, 38, 60, 82, 45, 92].map((h, i) => (
                <div key={i} style={{ flex: 1, height: `${h}px`, borderRadius: "6px 6px 2px 2px", background: i === 6 ? "linear-gradient(90deg, #FFE1C7 25%, #FFD4B0 50%, #FFE1C7 75%)" : "linear-gradient(90deg, #ECECF1 25%, #E4E4E9 50%, #ECECF1 75%)", backgroundSize: "200% 100%", animation: `shimmer 1.4s infinite linear`, animationDelay: `${i * 0.08}s` }} />
              ))}
            </div>
          </div>

          {/* パーソナルベスト */}
          <div style={{ ...card, overflow: "hidden", marginBottom: "14px" }}>
            <div style={{ padding: "16px 18px 14px" }}>
              <div style={{ ...sh, height: "10px", width: "40%", borderRadius: "999px" }} />
            </div>
            <div style={{ height: "1px", background: "#F5F5F5" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
              {[0, 1].map(i => (
                <div key={i} style={{ padding: "16px 18px", borderRight: i === 0 ? "1px solid #F5F5F5" : "none" }}>
                  <div style={{ ...sh, height: "9px", width: "55%", borderRadius: "999px", marginBottom: "10px" }} />
                  <div style={{ ...sh, height: "28px", width: "70%", borderRadius: "8px" }} />
                </div>
              ))}
            </div>
          </div>

          {/* 累計 2列 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
            {[0, 1].map(i => (
              <div key={i} style={{ ...card, padding: "18px 16px" }}>
                <div style={{ ...sh, width: "18px", height: "18px", borderRadius: "4px", marginBottom: "10px" }} />
                <div style={{ ...sh, height: "9px", width: "60%", borderRadius: "999px", marginBottom: "8px" }} />
                <div style={{ ...sh, height: "22px", width: "75%", borderRadius: "8px" }} />
              </div>
            ))}
          </div>

          {/* 履歴ラベル */}
          <div style={{ ...sh, height: "10px", width: "18%", borderRadius: "999px", marginBottom: "12px" }} />

          {/* 履歴リスト */}
          <div style={{ ...card, overflow: "hidden" }}>
            {[0, 1, 2].map(i => (
              <div key={i}>
                {i > 0 && <div style={{ height: "1px", background: "#F5F5F5", marginLeft: "72px" }} />}
                <div style={{ display: "flex", alignItems: "center", padding: "16px", gap: "12px" }}>
                  <div style={{ width: "40px", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                    <div style={{ ...sh, height: "22px", width: "28px", borderRadius: "6px" }} />
                    <div style={{ ...sh, height: "10px", width: "32px", borderRadius: "999px" }} />
                  </div>
                  <div style={{ width: "1px", height: "32px", background: "#F0F0F0", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ ...sh, height: "22px", width: "45%", borderRadius: "8px" }} />
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ ...sh, height: "14px", width: "52px", borderRadius: "6px", marginBottom: "5px" }} />
                    <div style={{ ...sh, height: "10px", width: "40px", borderRadius: "999px" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
