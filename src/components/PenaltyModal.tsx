"use client";

import Image from "next/image";

interface Penalty {
  id: string;
  amount: number;
  goalTitle: string | null;
}

interface Props {
  penalty: Penalty;
  onClose: () => void;
}

export default function PenaltyModal({ penalty, onClose }: Props) {
  function handleClose() {
    localStorage.setItem(`kakeru_seen_penalty_${penalty.id}`, "1");
    onClose();
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "flex-end",
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: "24px 24px 0 0",
          width: "100%",
          padding: "0 20px calc(env(safe-area-inset-bottom) + 28px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
          <div style={{ width: "36px", height: "4px", background: "#E5E5E5", borderRadius: "2px" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "12px" }}>
          <Image
            src="/stickman-assets/stickman-11.png"
            alt=""
            width={100}
            height={100}
            style={{ objectFit: "contain", marginBottom: "16px" }}
          />

          <div style={{
            background: "#FFF5F5", borderRadius: "12px",
            padding: "10px 20px", marginBottom: "16px",
          }}>
            <p style={{ fontSize: "22px", fontWeight: 900, color: "#EF4444", textAlign: "center" }}>
              ¥{penalty.amount.toLocaleString()} が課金されました
            </p>
          </div>

          <p style={{ fontSize: "14px", color: "#555555", lineHeight: 1.7, textAlign: "center", marginBottom: "24px" }}>
            {penalty.goalTitle
              ? <>「{penalty.goalTitle}」を達成できませんでしたが、<br /></>
              : null}
            ペナルティ課金は次を頑張るモチベーションに変えましょう！<br />
            今週こそリベンジ！
          </p>

          <button
            className="btn-primary"
            style={{ width: "100%", minHeight: "52px" }}
            onClick={handleClose}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
