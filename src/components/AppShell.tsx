import BottomNav from "./BottomNav";
import HamburgerMenu from "./HamburgerMenu";
import SideNav from "./SideNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#F2F2F7", minHeight: "100vh" }}>
      <SideNav />
      <div style={{ maxWidth: "480px", margin: "0 auto", minHeight: "100vh", background: "#F2F2F7", position: "relative" }}>
        <HamburgerMenu />
        <main className="pb-[calc(64px+env(safe-area-inset-bottom))] sm:pb-6">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
