import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["stripe", "resend"],
  async headers() {
    return [
      {
        // API・静的ファイルを除くページルートに適用
        // no-store → no-cache に変更することで bfcache（戻る/進む高速復元）を有効化
        // private: CDN にキャッシュさせない / no-cache: 再表示時はサーバー再検証
        source: "/((?!api|_next).*)",
        headers: [
          { key: "Cache-Control", value: "private, no-cache" },
        ],
      },
    ];
  },
};

export default nextConfig;
