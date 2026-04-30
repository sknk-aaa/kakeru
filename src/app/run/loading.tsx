import AppShell from "@/components/AppShell";

const sh: React.CSSProperties = {
  background: "linear-gradient(90deg, #EFEFF4 25%, #E4E4EB 50%, #EFEFF4 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.4s infinite linear",
};

export default function Loading() {
  return (
    <AppShell>
      <div style={{ background: "#F2F2F7", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

        {/* マップ領域 */}
        <div style={{ flex: 1, minHeight: "52vh", background: "linear-gradient(90deg, #E8E8EE 25%, #E0E0E8 50%, #E8E8EE 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.8s infinite linear", position: "relative" }}>
          {/* GPS中心マーカー風プレースホルダー */}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(255,107,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "rgba(255,107,0,0.3)" }} />
            </div>
          </div>
        </div>

        {/* 下部コントロール */}
        <div style={{ background: "white", borderRadius: "24px 24px 0 0", padding: "24px 20px 36px", boxShadow: "0 -4px 20px rgba(0,0,0,0.08)" }}>
          {/* GPS ステータス */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
            <div style={{ ...sh, height: "14px", width: "48%", borderRadius: "999px" }} />
          </div>
          {/* スタートボタン */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ width: "88px", height: "88px", borderRadius: "50%", background: "linear-gradient(90deg, #FFE0CC 25%, #FFD4B8 50%, #FFE0CC 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite linear" }} />
          </div>
          {/* サブテキスト */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: "14px" }}>
            <div style={{ ...sh, height: "11px", width: "36%", borderRadius: "999px" }} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
