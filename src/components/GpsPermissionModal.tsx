"use client";

import { MapPin } from "lucide-react";

interface Props {
  onAllow: () => void;
  onClose: () => void;
}

export default function GpsPermissionModal({ onAllow, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40">
      <div
        className="w-full max-w-md bg-white rounded-t-2xl p-6"
        style={{ paddingBottom: "calc(80px + env(safe-area-inset-bottom))" }}
      >
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-[#FFF0E5] flex items-center justify-center">
            <MapPin size={28} color="#FF6B00" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-center text-[#111111] mb-2">
          位置情報の許可が必要です
        </h2>
        <p className="text-[#888888] text-center text-[15px] mb-6 leading-relaxed">
          走行距離を計測するために位置情報を使います。
          許可しないと計測できません。
        </p>
        <button className="btn-primary w-full mb-3" onClick={onAllow}>
          許可して計測を開始する
        </button>
        <button className="btn-secondary w-full" onClick={onClose}>
          キャンセル
        </button>
      </div>
    </div>
  );
}
