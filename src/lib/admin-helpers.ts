export function extractDomain(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function classifySource(u: {
  utm_source: string | null;
  referrer: string | null;
  utm_captured_at: string | null;
}): string {
  if (!u.utm_captured_at) return "unknown";
  if (u.utm_source) return u.utm_source;
  const domain = extractDomain(u.referrer);
  if (domain) return domain;
  return "direct";
}
