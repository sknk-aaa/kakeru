import Image from "next/image";
import BackButton from "@/components/BackButton";

export default function HowToPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA" }}>
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(255,255,255,0.92)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid #EDE0CC",
        height: "56px", display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 20px",
      }}>
        <BackButton loggedInHref="/goals" />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Image src="/stickman-assets/stickman-01.png" width={22} height={22} alt="" style={{ objectFit: "contain" }} />
          <span style={{ fontFamily: "var(--font-display)", fontSize: "19px", fontWeight: 900, fontStyle: "italic", color: "#FF6B00", letterSpacing: "0.06em" }}>KAKERU</span>
        </div>
        <div style={{ width: 60 }} />
      </header>

      <main style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px" }}>
        <p style={{ color: "#888888", fontSize: "14px" }}>使い方ページは準備中です。</p>
      </main>
    </div>
  );
}
