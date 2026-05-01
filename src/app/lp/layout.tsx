import { Noto_Sans_JP } from "next/font/google";

const notoJp = Noto_Sans_JP({
  variable: "--font-lp-noto",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
});

export default function LpLayout({ children }: { children: React.ReactNode }) {
  return <div className={notoJp.variable}>{children}</div>;
}
