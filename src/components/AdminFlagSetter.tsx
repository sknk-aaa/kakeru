"use client";

import { useEffect } from "react";

export default function AdminFlagSetter() {
  useEffect(() => {
    fetch("/api/admin/check")
      .then((r) => r.json())
      .then(({ isAdmin }: { isAdmin: boolean }) => {
        if (isAdmin) {
          localStorage.setItem("__kakeru_admin", "1");
        }
      })
      .catch(() => {});
  }, []);
  return null;
}
