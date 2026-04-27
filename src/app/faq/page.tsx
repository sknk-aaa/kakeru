"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, X } from "lucide-react";
import AppShell from "@/components/AppShell";

const FAQ_CATEGORIES = [
  {
    category: "使い方",
    items: [
      {
        q: "アプリ版はないの？",
        a: "専用アプリのインストールは不要です。ホーム画面に追加することで、アプリとまったく同じように使えます。アイコンをタップするだけでサッと起動できますよ。",
      },
      {
        q: "ホーム画面に追加する方法は？",
        a: "【iPhone の場合】\nSafari でカケルを開き、画面下部の共有ボタン（□↑）をタップ →「ホーム画面に追加」を選択してください。\n\n【Android の場合】\nChrome でカケルを開き、右上のメニュー（⋮）をタップ →「アプリをインストール」または「ホーム画面に追加」を選択してください。",
      },
      {
        q: "スキップは何回使えますか？",
        a: "通常のスキップは月に1回まで無料でご利用いただけます。\n\nまた、設定でお住まいの地域を登録しておくと「雨天スキップ」が使えるようになります。雨の日は通常のスキップ回数を消費せずに免除できますので、ぜひ活用してください。",
      },
      {
        q: "目標を一時的に止めたいです",
        a: "目標の編集ページ下部にある「この目標を停止する」から停止できます。翌日以降のスケジュールがキャンセルされ、課金も発生しなくなります。\n\nなお、PRO 機能のクーリング期間を設定している目標は、期間中は停止できません。あらかじめご了承ください。",
      },
      {
        q: "複数の目標を同時に設定できますか？",
        a: "はい、複数の目標を同時に設定できます。同じ日に目標が重なる場合は確認のメッセージが表示されますので、無理のないペースで設定してみてください。",
      },
    ],
  },
  {
    category: "課金について",
    items: [
      {
        q: "罰金はいつ引き落とされますか？",
        a: "毎日 23:59（日本時間）に当日の目標達成状況を確認し、未達成の場合に自動で課金されます。\n\n23 時台でも、計測を終了して記録が保存されていれば達成として判定されます。ギリギリまで諦めないでください！",
      },
      {
        q: "課金されたお金はどうなりますか？",
        a: "カケルのサービス運営・機能改善のために使用されます。ご支援いただいたおかげで、より使いやすいアプリを作り続けることができています。本当にありがとうございます。",
      },
    ],
  },
  {
    category: "計測・GPS",
    items: [
      {
        q: "トレッドミル（室内）は計測できますか？",
        a: "現在は GPS を使った屋外ランニングのみ対応しています。屋内ではGPS 信号が届かないため、トレッドミルの計測はできません。\n\nご要望としてしっかり受け止め、今後の改善の参考にさせていただきます。",
      },
      {
        q: "走ったのに達成と認識されませんでした",
        a: "ランニングの計測は、アプリ内の「走る」ページからスタートボタンを押してから開始されます。スタートせずに走り始めると記録されませんのでご注意ください。\n\nまた、GPS の精度は屋外の開けた場所で最も正確に動作します。建物の近くや地下では誤差が生じることがあります。",
      },
      {
        q: "計測中にアプリが落ちた場合は？",
        a: "アプリを再度開いていただければ、計測を再開できます。再開後も走行距離と経過時間は引き継がれますので、そのまま続けてゴールボタンを押してください。",
      },
    ],
  },
];

export default function FaqPage() {
  const router = useRouter();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  function toggleItem(key: string) {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <AppShell>
      <div>
        {/* ヘッダー */}
        <div style={{
          position: "sticky", top: 0, zIndex: 10,
          background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)",
          borderBottom: "1px solid #E5E5E5",
          padding: "0 16px", height: "54px",
          display: "flex", alignItems: "center",
        }}>
          <button
            onClick={() => router.back()}
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: "#FF6B00", fontSize: "15px", fontWeight: 500 }}
          >
            <ChevronLeft size={20} color="#FF6B00" /> 戻る
          </button>
        </div>

        <div style={{ padding: "24px 16px 48px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111111", marginBottom: "4px" }}>よくある質問</h1>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "#FF6B00", letterSpacing: "0.1em", marginBottom: "28px" }}>FAQ</p>

          {FAQ_CATEGORIES.map(({ category, items }) => (
            <div key={category} style={{ marginBottom: "28px" }}>
              <p style={{ fontSize: "10px", color: "#AAAAAA", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px", paddingLeft: "2px" }}>
                {category}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {items.map((item, idx) => {
                  const key = `${category}-${idx}`;
                  const isOpen = !!openItems[key];
                  return (
                    <div
                      key={key}
                      style={{ background: "white", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}
                    >
                      <button
                        onClick={() => toggleItem(key)}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
                      >
                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#FF6B00", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ fontSize: "11px", fontWeight: 800, color: "white", lineHeight: 1 }}>Q</span>
                        </div>
                        <span style={{ flex: 1, fontSize: "14px", fontWeight: 600, color: "#111111", lineHeight: 1.5 }}>{item.q}</span>
                        {isOpen
                          ? <X size={17} color="#BBBBBB" strokeWidth={2} style={{ flexShrink: 0 }} />
                          : <Plus size={17} color="#BBBBBB" strokeWidth={2} style={{ flexShrink: 0 }} />
                        }
                      </button>

                      {isOpen && (
                        <div style={{ display: "flex", gap: "12px", padding: "0 16px 16px" }}>
                          <div style={{ flexShrink: 0, paddingTop: "1px" }}>
                            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#FFF0E5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <span style={{ fontSize: "11px", fontWeight: 800, color: "#FF6B00", lineHeight: 1 }}>A</span>
                            </div>
                          </div>
                          <p style={{ flex: 1, fontSize: "14px", color: "#555555", lineHeight: 1.75, whiteSpace: "pre-line", paddingTop: "4px" }}>
                            {item.a}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <p style={{ fontSize: "12px", color: "#BBBBBB", textAlign: "center", marginTop: "8px" }}>
            解決しない場合はお問い合わせください
          </p>
        </div>
      </div>
    </AppShell>
  );
}
