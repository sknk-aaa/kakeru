import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "カケル",
    short_name: "カケル",
    description: "ランニング罰金アプリ — 走らなければ課金される",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#FF6B00",
    orientation: "portrait",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
