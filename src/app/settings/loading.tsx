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

const sectionLabel: React.CSSProperties = {
  height: "10px", width: "26%", borderRadius: "999px", marginBottom: "10px",
};

function InputRow() {
  return (
    <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: "10px" }}>
      <div style={{ ...sh, flex: 1, height: "36px", borderRadius: "8px" }} />
      <div style={{ ...sh, width: "28px", height: "14px", borderRadius: "999px", flexShrink: 0 }} />
    </div>
  );
}

function ToggleRow({ last = false }: { last?: boolean }) {
  return (
    <>
      {!last && <div style={{ height: "1px", background: "#F5F5F5", marginLeft: "18px" }} />}
      <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ ...sh, height: "13px", width: "52%", borderRadius: "999px" }} />
        <div style={{ ...sh, width: "44px", height: "26px", borderRadius: "999px" }} />
      </div>
    </>
  );
}

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

          {/* プロフィール */}
          <div style={{ ...sh, ...sectionLabel }} />
          <div style={{ ...card, marginBottom: "14px" }}>
            <div style={{ padding: "18px 18px 16px" }}>
              <div style={{ ...sh, height: "9px", width: "32%", borderRadius: "999px", marginBottom: "8px" }} />
              <div style={{ ...sh, height: "15px", width: "58%", borderRadius: "999px" }} />
            </div>
            <div style={{ height: "1px", background: "#F5F5F5" }} />
            <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ ...sh, flex: 1, height: "13px", borderRadius: "999px" }} />
              <div style={{ ...sh, width: "16px", height: "16px", borderRadius: "4px", flexShrink: 0 }} />
            </div>
          </div>

          {/* 体重 */}
          <div style={{ ...sh, ...sectionLabel }} />
          <div style={{ ...card, marginBottom: "14px" }}>
            <InputRow />
          </div>

          {/* 月間目標距離 */}
          <div style={{ ...sh, ...sectionLabel }} />
          <div style={{ ...card, marginBottom: "14px" }}>
            <InputRow />
          </div>

          {/* 地域 */}
          <div style={{ ...sh, ...sectionLabel }} />
          <div style={{ ...card, marginBottom: "14px" }}>
            <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ ...sh, height: "15px", width: "100px", borderRadius: "999px", marginBottom: "6px" }} />
                <div style={{ ...sh, height: "10px", width: "60px", borderRadius: "999px" }} />
              </div>
              <div style={{ ...sh, height: "13px", width: "52px", borderRadius: "999px" }} />
            </div>
          </div>

          {/* 通知 */}
          <div style={{ ...sh, ...sectionLabel }} />
          <div style={{ ...card, marginBottom: "14px" }}>
            <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ ...sh, height: "13px", width: "52%", borderRadius: "999px" }} />
              <div style={{ ...sh, width: "44px", height: "26px", borderRadius: "999px" }} />
            </div>
            <ToggleRow last />
          </div>

          {/* 支払い方法 */}
          <div style={{ ...sh, ...sectionLabel }} />
          <div style={{ ...card }}>
            <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ ...sh, width: "36px", height: "24px", borderRadius: "6px", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ ...sh, height: "13px", width: "55%", borderRadius: "999px" }} />
              </div>
              <div style={{ ...sh, width: "52px", height: "13px", borderRadius: "999px", flexShrink: 0 }} />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
