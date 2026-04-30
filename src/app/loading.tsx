import AppShell from "@/components/AppShell";

const sh: React.CSSProperties = {
  background: "linear-gradient(90deg, #EFEFF4 25%, #E4E4EB 50%, #EFEFF4 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.4s infinite linear",
};

export default function Loading() {
  return (
    <AppShell>
      <div style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #FFF9F5 46%, #F7F7FA 100%)", minHeight: "100vh" }}>

        {/* ヘッダー */}
        <div style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(255,255,255,0.88)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(235,235,235,0.75)", padding: "0 16px 0 56px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#FFF0E5" }} />
            <span style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 900, fontStyle: "italic", color: "#FF6B00", letterSpacing: "0.06em" }}>KAKERU</span>
          </div>
          <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "white", border: "1px solid rgba(255,107,0,0.14)", boxShadow: "0 8px 22px rgba(255,107,0,0.15)" }} />
        </div>

        <div style={{ padding: "18px 14px 104px" }}>

          {/* 今日のミッションカード */}
          <div style={{ background: "linear-gradient(135deg, #FFF5EE 0%, #FFFFFF 58%)", borderRadius: "24px", padding: "22px 20px 20px", marginBottom: "18px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <div style={{ ...sh, height: "10px", width: "38%", borderRadius: "999px", marginBottom: "20px" }} />
            <div style={{ ...sh, height: "56px", width: "50%", borderRadius: "12px", marginBottom: "20px" }} />
            <div style={{ ...sh, height: "8px", borderRadius: "999px", marginBottom: "8px" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ ...sh, height: "10px", width: "28%", borderRadius: "999px" }} />
              <div style={{ ...sh, height: "10px", width: "18%", borderRadius: "999px" }} />
            </div>
          </div>

          {/* 統計グリッド (3列) */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "20px" }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ background: "white", borderRadius: "18px", padding: "13px 8px 12px", boxShadow: "0 8px 24px rgba(0,0,0,0.06)", minHeight: "108px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <div style={{ ...sh, width: "26px", height: "26px", borderRadius: "50%" }} />
                <div style={{ ...sh, height: "9px", width: "65%", borderRadius: "999px" }} />
                <div style={{ ...sh, height: "20px", width: "72%", borderRadius: "8px" }} />
              </div>
            ))}
          </div>

          {/* セクションラベル */}
          <div style={{ ...sh, height: "11px", width: "32%", borderRadius: "999px", marginBottom: "12px" }} />

          {/* 週の目標リスト */}
          {[0, 1].map(i => (
            <div key={i} style={{ background: "white", borderRadius: "16px", marginBottom: "10px", padding: "16px 14px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ ...sh, width: "44px", height: "44px", borderRadius: "12px", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ ...sh, height: "13px", width: "55%", borderRadius: "999px", marginBottom: "8px" }} />
                <div style={{ ...sh, height: "10px", width: "38%", borderRadius: "999px" }} />
              </div>
              <div style={{ ...sh, height: "36px", width: "58px", borderRadius: "10px", flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
