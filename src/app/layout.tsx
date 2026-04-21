import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, DM_Sans, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-jp",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "カケル — ランニング罰金アプリ",
  description: "目標を設定し、走らなければ課金される。",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "カケル",
  },
};

export const viewport: Viewport = {
  themeColor: "#FF6B00",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${barlowCondensed.variable} ${dmSans.variable} ${notoSansJP.variable} h-full`}
    >
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-full bg-white text-[#111111] font-body">
        {children}
      </body>
    </html>
  );
}
