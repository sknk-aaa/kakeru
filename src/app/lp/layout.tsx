import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";

const notoJp = Noto_Sans_JP({
  variable: "--font-lp-noto",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kakeru(カケル)｜サボると課金されるランニングアプリ",
  description: "走らなければ、ペナルティ。Kakeruはランニング目標を達成できなければ自動課金されるアプリ。損失回避の心理で、本気の習慣化を実現。",
  alternates: {
    canonical: "https://www.kakeruapp.com/lp",
  },
  openGraph: {
    title: "Kakeru(カケル)｜サボると課金されるランニングアプリ",
    description: "走らなければ、ペナルティ。本気で習慣化したい人のランニングアプリ。",
    url: "https://www.kakeruapp.com/lp",
    siteName: "カケル",
    locale: "ja_JP",
    type: "website",
  },
};

const softwareAppSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Kakeru（カケル）",
  "description": "走らなければ課金されるランニング習慣化アプリ。目標未達成で罰金が自動引き落とし。",
  "applicationCategory": "HealthApplication",
  "operatingSystem": "iOS, Android",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY",
  },
  "url": "https://www.kakeruapp.com/lp",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "本当にカードに引き落とされますか？",
      "acceptedAnswer": { "@type": "Answer", "text": "はい。当日23:59までに目標を達成しなかった場合、設定した罰金額が自動で引き落とされます。" },
    },
    {
      "@type": "Question",
      "name": "試しに使いたいだけのとき、課金されますか？",
      "acceptedAnswer": { "@type": "Answer", "text": "目標を設定しない限り課金はされません。安心してお試しください。" },
    },
    {
      "@type": "Question",
      "name": "体調不良や雨の日はどうなりますか？",
      "acceptedAnswer": { "@type": "Answer", "text": "月1回のスキップ機能があります。また、居住地域の天気が雨の場合は、スキップ回数を消費せずに罰金なしで休めます。" },
    },
    {
      "@type": "Question",
      "name": "カード情報は安全ですか？",
      "acceptedAnswer": { "@type": "Answer", "text": "カード情報はKAKERUのサーバーには保存されません。国際的な決済サービス「Stripe」が管理します。" },
    },
    {
      "@type": "Question",
      "name": "PROプランはいつでも解約できますか？",
      "acceptedAnswer": { "@type": "Answer", "text": "はい、いつでも解約できます。解約後も期間終了までPRO機能を利用できます。" },
    },
  ],
};

export default function LpLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className={notoJp.variable}>{children}</div>
    </>
  );
}
