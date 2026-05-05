"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PenaltyModal from "@/components/PenaltyModal";

const PREVIEW_PENALTY = {
  id: "preview-penalty",
  amount: 1500,
  goalSummary: "3km・30分",
};

export default function PenaltyModalPreviewPage() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      router.replace("/");
    }
  }, [router]);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #FFFFFF 0%, #FFF9F5 46%, #F7F7FA 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <button
        className="btn-primary"
        style={{ minHeight: "52px", padding: "0 24px" }}
        onClick={() => setOpen(true)}
      >
        モーダルを表示
      </button>

      {open && (
        <PenaltyModal
          penalty={PREVIEW_PENALTY}
          onClose={() => setOpen(false)}
        />
      )}
    </main>
  );
}
