import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Kakeru(カケル)｜サボると課金されるランニングアプリ";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#111111",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px 90px",
          fontFamily: "sans-serif",
        }}
      >
        {/* ロゴ */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "56px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              background: "#FF6B00",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: "white", fontWeight: 900, fontSize: "26px" }}>K</span>
          </div>
          <span style={{ color: "white", fontWeight: 700, fontSize: "26px", letterSpacing: "-0.5px" }}>
            カケル
          </span>
        </div>

        {/* メインコピー */}
        <div style={{ display: "flex", flexDirection: "column", marginBottom: "28px" }}>
          <span
            style={{
              color: "white",
              fontWeight: 900,
              fontSize: "72px",
              lineHeight: 1.1,
              letterSpacing: "-2px",
            }}
          >
            走らなければ、
          </span>
          <span
            style={{
              color: "#FF6B00",
              fontWeight: 900,
              fontSize: "72px",
              lineHeight: 1.1,
              letterSpacing: "-2px",
            }}
          >
            課金される。
          </span>
        </div>

        {/* サブコピー */}
        <span style={{ color: "#888888", fontSize: "26px", lineHeight: 1.5, marginBottom: "56px" }}>
          本気で習慣化したい人のランニングアプリ
        </span>

        {/* 区切り線 + URL */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "32px", height: "3px", background: "#FF6B00", borderRadius: "2px" }} />
          <span style={{ color: "#555555", fontSize: "20px" }}>www.kakeruapp.com</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
