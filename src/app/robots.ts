import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/auth", "/privacy", "/terms", "/tokusho"],
      disallow: ["/api/", "/run", "/goals", "/records", "/settings", "/auth/card", "/auth/callback"],
    },
    sitemap: "https://www.kakeruapp.com/sitemap.xml",
  };
}
