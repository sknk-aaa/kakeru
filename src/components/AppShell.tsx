import BottomNav from "./BottomNav";
import HamburgerMenu from "./HamburgerMenu";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "#F2F2F7" }}>
      <HamburgerMenu />
      <main className="pb-[calc(64px+env(safe-area-inset-bottom))]">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
