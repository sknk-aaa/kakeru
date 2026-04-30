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
  overflow: "hidden",
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
          {/* ＋ボタン */}
          <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "white", border: "1px solid rgba(255,107,0,0.14)", boxShadow: "0 8px 22px rgba(255,107,0,0.15)" }} />
        </div>

        <div style={{ padding: "16px 16px 24px" }}>

          {/* セクションラベル */}
          <div style={{ ...sh, height: "10px", width: "28%", borderRadius: "999px", marginBottom: "12px" }} />

          {/* 目標カード × 2 */}
          {[0, 1].map(i => (
            <div key={i} style={{ ...card, marginBottom: "12px" }}>
              <div style={{ padding: "17px 16px", display: "flex", alignItems: "flex-start", gap: "14px" }}>
                {/* アイコン */}
                <div style={{ ...sh, width: "50px", height: "50px", borderRadius: "16px", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  {/* タイトル */}
                  <div style={{ ...sh, height: "14px", width: "60%", borderRadius: "999px", marginBottom: "10px" }} />
                  {/* サブ */}
                  <div style={{ ...sh, height: "10px", width: "42%", borderRadius: "999px", marginBottom: "14px" }} />
                  {/* 曜日ドット */}
                  <div style={{ display: "flex", gap: "6px" }}>
                    {[0, 1, 2, 3, 4, 5, 6].map(d => (
                      <div key={d} style={{ ...sh, width: "22px", height: "22px", borderRadius: "50%" }} />
                    ))}
                  </div>
                </div>
              </div>
              {/* プログレスバー */}
              <div style={{ height: "1px", background: "#F5F5F5" }} />
              <div style={{ padding: "12px 16px" }}>
                <div style={{ ...sh, height: "6px", borderRadius: "999px" }} />
              </div>
            </div>
          ))}

          {/* 過去の目標セクション */}
          <div style={{ ...sh, height: "10px", width: "34%", borderRadius: "999px", marginTop: "8px", marginBottom: "12px" }} />
          <div style={{ ...card }}>
            {[0, 1].map(i => (
              <div key={i}>
                {i > 0 && <div style={{ height: "1px", background: "#F5F5F5" }} />}
                <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ ...sh, width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ ...sh, height: "12px", width: "50%", borderRadius: "999px" }} />
                  </div>
                  <div style={{ ...sh, width: "16px", height: "16px", borderRadius: "4px", flexShrink: 0 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
