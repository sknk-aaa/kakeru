type RouteLoadingShellProps = {
  action?: boolean;
  compact?: boolean;
};

const cardStyle: React.CSSProperties = {
  background: "white",
  borderRadius: "22px",
  boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
  overflow: "hidden",
};

const shimmerStyle: React.CSSProperties = {
  background: "linear-gradient(90deg, #EFEFF4 25%, #E4E4EB 50%, #EFEFF4 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.4s infinite linear",
  borderRadius: "999px",
};

function SkeletonCard({ compact = false }: { compact?: boolean }) {
  return (
    <div style={{ ...cardStyle, padding: compact ? "16px" : "20px", marginBottom: "14px" }}>
      <div style={{ ...shimmerStyle, height: "12px", width: "34%", marginBottom: "16px" }} />
      <div style={{ ...shimmerStyle, height: compact ? "14px" : "18px", width: "82%", marginBottom: "10px" }} />
      <div style={{ ...shimmerStyle, height: "12px", width: "56%" }} />
    </div>
  );
}

export default function RouteLoadingShell({ action = false, compact = false }: RouteLoadingShellProps) {
  return (
    <div style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #FFF9F5 46%, #F7F7FA 100%)", minHeight: "100vh" }}>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "rgba(255,255,255,0.88)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(235,235,235,0.75)",
        padding: "0 16px 0 56px", height: "60px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#FFF0E5" }} />
          <span style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 900, fontStyle: "italic", color: "#FF6B00", letterSpacing: "0.06em" }}>KAKERU</span>
        </div>
        {action && (
          <div style={{
            width: "42px", height: "42px", borderRadius: "50%",
            background: "white", border: "1px solid rgba(255,107,0,0.14)",
            boxShadow: "0 8px 22px rgba(255,107,0,0.15)",
          }} />
        )}
      </div>

      <div style={{ padding: "16px 14px 104px" }}>
        <SkeletonCard compact={compact} />
        <SkeletonCard compact={compact} />
        <div style={{ ...cardStyle, padding: "18px", marginBottom: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", alignItems: "end", height: "112px" }}>
            {[48, 72, 38, 92].map((height, index) => (
              <div key={index} style={{
                height,
                borderRadius: "10px 10px 4px 4px",
                background: index === 3
                  ? "linear-gradient(90deg, #FFE1C7 25%, #FFD4B0 50%, #FFE1C7 75%)"
                  : "linear-gradient(90deg, #ECECF1 25%, #E4E4E9 50%, #ECECF1 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.4s infinite linear",
                animationDelay: `${index * 0.1}s`,
              }} />
            ))}
          </div>
        </div>
        <SkeletonCard compact />
      </div>
    </div>
  );
}
