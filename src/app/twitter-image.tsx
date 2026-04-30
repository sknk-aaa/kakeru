import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Kakeru(カケル)｜サボると課金されるランニングアプリ";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BASE = "https://www.kakeruapp.com";
const logoUrl  = `${BASE}/${encodeURIComponent("その他素材")}/${encodeURIComponent("走らなければ-transparent.png")}`;
const waveUrl  = `${BASE}/${encodeURIComponent("抽象画像")}/${encodeURIComponent("抽象画像2.png")}`;
const coinUrl  = `${BASE}/${encodeURIComponent("その他素材")}/${encodeURIComponent("課金焦り-transparent.png")}`;

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#111111",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* 背景: 波線（うっすら） */}
        <img
          src={waveUrl}
          alt=""
          style={{
            position: "absolute",
            bottom: "-30px",
            left: "-40px",
            width: "820px",
            opacity: 0.1,
          }}
        />

        {/* 左: メインコンテンツ */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "60px 48px 60px 80px",
            flex: 1,
          }}
        >
          {/* KAKERU ロゴ */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "#FF6B00",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: "white", fontWeight: 900, fontSize: "22px" }}>K</span>
            </div>
            <span style={{ color: "white", fontWeight: 700, fontSize: "22px" }}>カケル</span>
          </div>

          {/* ロゴタイプ（白パネル） */}
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              background: "white",
              borderRadius: "24px",
              padding: "28px 40px",
            }}
          >
            <img
              src={logoUrl}
              alt="走らなければ、課金される。"
              style={{ width: "460px", objectFit: "contain" }}
            />
          </div>

          {/* サブコピー + URL */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <span style={{ color: "#888888", fontSize: "21px", lineHeight: 1.5 }}>
              本気で習慣化したい人のランニングアプリ
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{ width: "28px", height: "3px", background: "#FF6B00", borderRadius: "2px" }}
              />
              <span style={{ color: "#555555", fontSize: "18px" }}>www.kakeruapp.com</span>
            </div>
          </div>
        </div>

        {/* 右: 課金焦りイラスト */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "360px",
            paddingRight: "48px",
          }}
        >
          <img
            src={coinUrl}
            alt=""
            style={{ width: "280px", objectFit: "contain" }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
