import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.kakeruapp.com";
  return [
    { url: base,                   lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${base}/lp`,           lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${base}/howto`,        lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/faq`,          lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/privacy`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/terms`,        lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/tokusho`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];
}
