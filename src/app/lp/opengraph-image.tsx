import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";
export const alt = "Kakeru(カケル)｜サボると課金されるランニングアプリ";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function toDataUri(relativePath: string): string {
  const data = readFileSync(join(process.cwd(), "public", relativePath));
  return `data:image/png;base64,${data.toString("base64")}`;
}

export default function Image() {
  const fontJp = readFileSync(join(process.cwd(), "public/fonts/noto-sans-jp-jp-900.woff"));
  const fontLatin = readFileSync(join(process.cwd(), "public/fonts/noto-sans-jp-latin-900.woff"));
  const fontBarlow = readFileSync(join(process.cwd(), "public/fonts/barlow-condensed-italic-900.woff"));

  const blob1 = toDataUri("抽象画像/抽象画像1.png");
  const blob4 = toDataUri("抽象画像/抽象画像4.png");
  const icon = toDataUri("角丸アイコン.png");
  const catchcopy = toDataUri("その他素材/走らなければ-transparent.png");
  const step1img = toDataUri("stickman-assets/stickman-13.png");
  const step2img = toDataUri("stickman-assets/stickman-05.png");
  const step3img = toDataUri("stickman-assets/stickman-12.png");

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: 1200,
          height: 630,
          background: "#FEFCFA",
          overflow: "hidden",
          position: "relative",
          fontFamily: "'NotoSansJP'",
        }}
      >
        {/* 背景装飾 blob1: 右上 */}
        <img
          src={blob1}
          style={{ position: "absolute", width: 360, height: 360, top: -140, right: -100, opacity: 0.12 }}
        />
        {/* 背景装飾 blob2: 右下 */}
        <img
          src={blob1}
          style={{ position: "absolute", width: 260, height: 260, bottom: -40, right: 40, opacity: 0.09 }}
        />
        {/* 背景装飾 blob3: 左下 */}
        <img
          src={blob4}
          style={{ position: "absolute", width: 280, height: 280, bottom: -60, left: -60, opacity: 0.10 }}
        />

        {/* ヘッダー */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "28px 72px 0",
            flexShrink: 0,
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img
              src={icon}
              style={{ width: 44, height: 44, borderRadius: 11 }}
            />
            <span style={{ fontSize: 30, fontWeight: 900, fontStyle: "italic", color: "#1C1008", letterSpacing: 4, fontFamily: "'BarlowCondensed'" }}>
              KAKERU
            </span>
          </div>
          <span style={{ fontSize: 15, fontWeight: 500, color: "#6B5236", letterSpacing: "0.02em" }}>
            自分に甘いあなたのための、ランニング習慣化アプリ。
          </span>
        </div>

        {/* キャッチコピー */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px 0 0",
            flexShrink: 0,
            position: "relative",
          }}
        >
          <img src={catchcopy} style={{ height: 140 }} />
        </div>

        {/* 水平区切り線 */}
        <div
          style={{
            height: 1.5,
            background: "#EDE0CC",
            margin: "10px 72px 0",
            flexShrink: 0,
            position: "relative",
          }}
        />

        {/* 3ステップ */}
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "stretch",
            padding: "0 48px",
            position: "relative",
          }}
        >
          {/* STEP 01 */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px 20px 16px",
              gap: 8,
            }}
          >
            <img src={step1img} style={{ width: 230, height: 230, objectFit: "contain" }} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 900, color: "#F97316", letterSpacing: 3 }}>STEP 01</span>
              <span style={{ fontSize: 28, fontWeight: 900, color: "#1C1008", letterSpacing: -0.3 }}>目標を設定する</span>
            </div>
          </div>

          {/* 縦区切り線 */}
          <div style={{ width: 1.5, background: "#EDE0CC", alignSelf: "stretch", margin: "15% 0" }} />

          {/* STEP 02 */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px 20px 16px",
              gap: 8,
            }}
          >
            <img src={step2img} style={{ width: 230, height: 230, objectFit: "contain" }} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 900, color: "#F97316", letterSpacing: 3 }}>STEP 02</span>
              <span style={{ fontSize: 28, fontWeight: 900, color: "#1C1008", letterSpacing: -0.3 }}>スマホを持って走る</span>
            </div>
          </div>

          {/* 縦区切り線 */}
          <div style={{ width: 1.5, background: "#EDE0CC", alignSelf: "stretch", margin: "15% 0" }} />

          {/* STEP 03 */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px 20px 16px",
              gap: 8,
            }}
          >
            <img src={step3img} style={{ width: 230, height: 230, objectFit: "contain" }} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 900, color: "#F97316", letterSpacing: 3 }}>STEP 03</span>
              <span style={{ fontSize: 28, fontWeight: 900, color: "#1C1008", letterSpacing: -0.3 }}>走らなければ自動で課金</span>
            </div>
          </div>
        </div>

        {/* 下部オレンジライン */}
        <div style={{ height: 6, background: "#F97316", flexShrink: 0 }} />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "NotoSansJP", data: fontLatin, weight: 900, style: "normal" },
        { name: "NotoSansJP", data: fontJp, weight: 900, style: "normal" },
        { name: "BarlowCondensed", data: fontBarlow, weight: 900, style: "italic" },
      ],
    }
  );
}
