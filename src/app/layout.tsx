import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, DM_Sans } from "next/font/google";
import "./globals.css";
import SplashScreen from "@/components/SplashScreen";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["900"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kakeru(カケル)｜サボると課金されるランニングアプリ",
  description: "走らなければ、ペナルティ。ランニング目標を設定して達成できなければ課金されてしまう。本気で習慣化したい人のランニングアプリ。",
  keywords: ["ランニング", "習慣化", "罰金", "ペナルティ", "ランニングアプリ", "目標管理", "Kakeru", "カケル"],
  openGraph: {
    title: "Kakeru(カケル)｜サボると課金されるランニングアプリ",
    description: "走らなければ、ペナルティ。ランニング目標を設定して達成できなければ課金されてしまう。本気で習慣化したい人のランニングアプリ。",
    url: "https://www.kakeruapp.com",
    siteName: "カケル",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kakeru(カケル)｜サボると課金されるランニングアプリ",
    description: "走らなければ、ペナルティ。本気で習慣化したい人のランニングアプリ。",
  },
  alternates: {
    canonical: "https://www.kakeruapp.com",
  },
  metadataBase: new URL("https://www.kakeruapp.com"),
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/icon-192.png",
  },
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
      className={`${barlowCondensed.variable} ${dmSans.variable} h-full`}
    >
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <script dangerouslySetInnerHTML={{ __html: `window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__pwaPrompt=e;});` }} />
      </head>
      <body className="min-h-full bg-white text-[#111111] font-body">
        <SplashScreen />
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
