import Link from "next/link";
import { ChevronLeft } from "lucide-react";

const CONTACT_EMAIL = "kakeruapp.official@gmail.com";
const UPDATED_AT = "2026年4月23日";

const ROWS = [
  { label: "販売業者", value: "金子蒼天" },
  { label: "運営責任者", value: "金子蒼天" },
  { label: "所在地", value: "※請求があった場合は遅滞なく開示します" },
  { label: "電話番号", value: "※請求があった場合は遅滞なく開示します" },
  { label: "メールアドレス", value: CONTACT_EMAIL },
  { label: "販売価格", value: "各目標に対してユーザーが設定した罰金額（100円以上、上限なし）\n※目標未達成時のみ課金されます" },
  { label: "販売価格以外の費用", value: "インターネット接続に必要な通信費はお客様のご負担となります" },
  { label: "支払方法", value: "クレジットカード（Visa・Mastercard・JCB・American Express・Diners Club）" },
  { label: "支払時期", value: "目標が未達成と判定された翌日以降に自動引き落とし" },
  { label: "サービス提供時期", value: "アカウント登録・クレジットカード登録完了後、即時利用可能" },
  { label: "キャンセル・返金ポリシー", value: "ユーザー自身が設定した目標に対する罰金の返金は原則行いません。\nシステム障害等による誤課金が発生した場合は、お問い合わせ窓口までご連絡ください。" },
  { label: "動作環境", value: "インターネット接続環境およびGPS機能を備えたスマートフォン・タブレット\n推奨ブラウザ：Safari・Chrome最新版" },
];

export default function TokushoPage() {
  return (
    <div style={{ background: "#F2F2F7", minHeight: "100vh" }}>
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #E5E5E5",
        padding: "0 16px", height: "54px",
        display: "flex", alignItems: "center", gap: "8px",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", color: "#FF6B00", textDecoration: "none", fontSize: "15px", fontWeight: 500 }}>
          <ChevronLeft size={20} color="#FF6B00" /> 戻る
        </Link>
      </div>

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "24px 20px 48px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#111111", marginBottom: "6px" }}>特定商取引法に基づく表記</h1>
        <p style={{ fontSize: "13px", color: "#AAAAAA", marginBottom: "32px" }}>最終更新日：{UPDATED_AT}</p>

        <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          {ROWS.map((row, idx) => (
            <div key={row.label}>
              {idx > 0 && <div style={{ height: "1px", background: "#F2F2F2" }} />}
              <div style={{ display: "flex", gap: "16px", padding: "16px 20px" }}>
                <div style={{ width: "120px", flexShrink: 0 }}>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#888888" }}>{row.label}</span>
                </div>
                <div style={{ flex: 1 }}>
                  {row.value.split("\n").map((line, i) => (
                    <p key={i} style={{ fontSize: "14px", color: "#111111", lineHeight: 1.7, margin: 0 }}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: "12px", color: "#AAAAAA", marginTop: "20px", lineHeight: 1.7, paddingLeft: "4px" }}>
          ※本表記は特定商取引法第11条および第12条に基づくものです。
        </p>
      </div>
    </div>
  );
}
