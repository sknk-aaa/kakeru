"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function BackButton({ loggedInHref = "/goals" }: { loggedInHref?: string }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    createClient().auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session);
    });
  }, []);

  const href = isLoggedIn ? loggedInHref : "/lp";

  return (
    <Link
      href={href}
      style={{ display: "flex", alignItems: "center", color: "#FF6B00", textDecoration: "none", fontSize: "15px", fontWeight: 500 }}
    >
      <ChevronLeft size={20} color="#FF6B00" /> 戻る
    </Link>
  );
}
