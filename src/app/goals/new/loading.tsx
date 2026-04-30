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

        {/* 戻るヘッダー */}
        <div style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(255,255,255,0.88)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(235,235,235,0.75)", padding: "0 16px", height: "60px", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ ...sh, width: "32px", height: "32px", borderRadius: "10px" }} />
          <div style={{ ...sh, height: "14px", width: "36%", borderRadius: "999px" }} />
        </div>

        <div style={{ padding: "16px 14px 100px" }}>

          {/* 種類選択カード */}
          <div style={{ ...card, marginBottom: "14px" }}>
            <div style={{ padding: "18px 18px 8px" }}>
              <div style={{ ...sh, height: "10px", width: "28%", borderRadius: "999px", marginBottom: "16px" }} />
            </div>
            {[0, 1, 2].map(i => (
              <div key={i}>
                <div style={{ height: "1px", background: "#F5F5F5" }} />
                <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ ...sh, width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ ...sh, height: "13px", width: "42%", borderRadius: "999px", marginBottom: "6px" }} />
                    <div style={{ ...sh, height: "10px", width: "68%", borderRadius: "999px" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 距離入力カード */}
          <div style={{ ...card, padding: "18px", marginBottom: "14px" }}>
            <div style={{ ...sh, height: "10px", width: "28%", borderRadius: "999px", marginBottom: "14px" }} />
            <div style={{ ...sh, height: "52px", borderRadius: "10px" }} />
          </div>

          {/* 曜日選択カード */}
          <div style={{ ...card, padding: "18px", marginBottom: "14px" }}>
            <div style={{ ...sh, height: "10px", width: "24%", borderRadius: "999px", marginBottom: "16px" }} />
            <div style={{ display: "flex", gap: "8px" }}>
              {[0, 1, 2, 3, 4, 5, 6].map(d => (
                <div key={d} style={{ flex: 1, ...sh, height: "40px", borderRadius: "10px" }} />
              ))}
            </div>
          </div>

          {/* ペナルティ金額カード */}
          <div style={{ ...card, padding: "18px", marginBottom: "24px" }}>
            <div style={{ ...sh, height: "10px", width: "34%", borderRadius: "999px", marginBottom: "14px" }} />
            <div style={{ display: "flex", gap: "8px" }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ flex: 1, ...sh, height: "44px", borderRadius: "10px" }} />
              ))}
            </div>
          </div>

          {/* 送信ボタン */}
          <div style={{ ...sh, height: "52px", borderRadius: "10px" }} />
        </div>
      </div>
    </AppShell>
  );
}
