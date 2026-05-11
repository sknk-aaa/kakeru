"use client";

import { Analytics } from "@vercel/analytics/next";

export default function AnalyticsWithFilter() {
  return (
    <Analytics
      beforeSend={(event) => {
        if (typeof window !== "undefined" && localStorage.getItem("__kakeru_admin") === "1") {
          return null;
        }
        return event;
      }}
    />
  );
}
