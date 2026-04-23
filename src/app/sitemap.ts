import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.kakeruapp.com";
  return [
    { url: base,                   lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${base}/auth`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/privacy`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/terms`,        lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/tokusho`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];
}
