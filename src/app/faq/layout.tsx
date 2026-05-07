import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "よくある質問（FAQ）｜Kakeru（カケル）ランニング習慣化アプリ",
  description: "Kakeruのよくある質問。「本当に課金されるの？」「続かないランニングを続けられる？」「ダイエット・痩せたい人に向いてる？」「三日坊主を強制的に防げる？」などお答えします。",
  alternates: {
    canonical: "https://www.kakeruapp.com/faq",
  },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
