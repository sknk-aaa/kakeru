import BottomNav from "./BottomNav";
import HamburgerMenu from "./HamburgerMenu";
import SideNav from "./SideNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: "linear-gradient(160deg, #FFF4EE 0%, #F5F0F7 60%, #F2F2F7 100%)",
      minHeight: "100vh",
      position: "relative",
      overflow: "hidden",
    }}>
      <div
        className="hidden sm:block"
        style={{
          position: "absolute",
          top: "50%",
          left: "calc(50vw + 264px)",
          transform: "translateY(-50%) rotate(-12deg)",
          fontFamily: "var(--font-display, sans-serif)",
          fontSize: "96px",
          fontWeight: 900,
          color: "#FF6B00",
          opacity: 0.06,
          letterSpacing: "-0.02em",
          userSelect: "none",
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
      >
        KAKERU
      </div>
      <SideNav />
      <div className="app-content" style={{ maxWidth: "480px", margin: "0 auto", minHeight: "100vh", background: "#F2F2F7", position: "relative" }}>
        <HamburgerMenu />
        <main className="pb-[calc(64px+env(safe-area-inset-bottom))] sm:pb-6">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
