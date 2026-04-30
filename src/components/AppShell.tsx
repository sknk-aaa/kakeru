import BottomNav from "./BottomNav";
import HamburgerMenu from "./HamburgerMenu";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#F2F2F7", minHeight: "100vh" }}>
      <div style={{ maxWidth: "480px", margin: "0 auto", minHeight: "100vh", background: "#F2F2F7", position: "relative" }}>
        <HamburgerMenu />
        <main className="pb-[calc(64px+env(safe-area-inset-bottom))]">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
