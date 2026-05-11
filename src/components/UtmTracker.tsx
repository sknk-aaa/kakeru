"use client";

import { useEffect } from "react";

type Captured = {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer: string | null;
  landing_path: string | null;
};

export default function UtmTracker() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const params = url.searchParams;
    const captured: Captured = {
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
      referrer: document.referrer || null,
      landing_path: url.pathname || null,
    };
    const newHasUtm = !!(captured.utm_source || captured.utm_medium || captured.utm_campaign);

    const storedStr = localStorage.getItem("kakeru_utm");
    const stored: Captured | null = storedStr ? (() => {
      try { return JSON.parse(storedStr) as Captured; } catch { return null; }
    })() : null;
    const storedHasUtm = !!(stored?.utm_source || stored?.utm_medium || stored?.utm_campaign);

    if (!stored || (newHasUtm && !storedHasUtm)) {
      localStorage.setItem("kakeru_utm", JSON.stringify(captured));
      localStorage.removeItem("kakeru_utm_synced");
    }

    const toSend = localStorage.getItem("kakeru_utm");
    if (toSend && !localStorage.getItem("kakeru_utm_synced")) {
      fetch("/api/users/utm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: toSend,
      }).then((r) => {
        if (r.ok) localStorage.setItem("kakeru_utm_synced", "1");
      }).catch(() => {});
    }
  }, []);

  return null;
}
