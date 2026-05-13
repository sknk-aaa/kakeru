import Link from "next/link";
import { ChevronLeft, Lock, AlertCircle } from "lucide-react";

const CONTACT_EMAIL = "kakeruapp.official@gmail.com";
const UPDATED_AT = "2026年4月23日";

const ROWS = [
  { label: "販売業者", value: "※請求があった場合は遅滞なく開示します" },
  { label: "運営責任者", value: "※請求があった場合は遅滞なく開示します" },
  { label: "所在地", value: "※請求があった場合は遅滞なく開示します" },
  { label: "電話番号", value: "※請求があった場合は遅滞なく開示します" },
  { label: "メールアドレス", value: CONTACT_EMAIL },
  { label: "販売価格", value: "各目標に対してユーザーが設定した課金額（100円以上、上限なし）\n※目標未達成時のみ課金されます" },
  { label: "販売価格以外の費用", value: "インターネット接続に必要な通信費はお客様のご負担となります" },
  { label: "支払方法", value: "クレジットカード（Visa・Mastercard・JCB・American Express・Diners Club）" },
  { label: "支払時期", value: "目標が未達成と判定された翌日以降に自動引き落とし" },
  { label: "サービス提供時期", value: "アカウント登録・クレジットカード登録完了後、即時利用可能" },
  { label: "キャンセル・返金ポリシー", value: "ユーザー自身が設定した目標に対するペナルティの返金は原則行いません。\nシステム障害等による誤課金が発生した場合は、お問い合わせ窓口までご連絡ください。" },
  { label: "動作環境", value: "インターネット接続環境およびGPS機能を備えたスマートフォン・タブレット\n推奨ブラウザ：Safari・Chrome最新版" },
];

function StripeLogo() {
  return (
    <svg height="20" viewBox="0 0 60 25" xmlns="http://www.w3.org/2000/svg" aria-label="Stripe">
      <path
        d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a10.44 10.44 0 0 1-4.56 1.01c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.57zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.21c-2.23 0-3.66-.99-4.56-1.7l-.03 7.44-4.41.94V5.86h3.87l.23 1.7c.86-.99 2.3-2.09 4.62-2.09 4.06 0 6.5 3.54 6.5 7.57 0 4.39-2.65 7.17-6.22 7.17zm-1.05-10.68c-1.22 0-2.06.43-2.62 1.14l.03 4.62c.52.63 1.35 1.09 2.59 1.09 2 0 3.06-1.7 3.06-3.43 0-1.87-1.1-3.42-3.06-3.42zM28.1 4.65c-1.44 0-2.38-1-2.38-2.3C25.72 1 26.66 0 28.1 0s2.38 1 2.38 2.35c0 1.3-.94 2.3-2.38 2.3zm-2.21 15.36V5.86h4.42v14.15h-4.42zM22.27 20.01c-2.59 0-4.07-1.18-4.07-4.12V9.44h-2.23V5.86h2.23V1.57l4.42-.94v5.23h3.06v3.58h-3.06v5.84c0 1.06.39 1.47 1.34 1.47.62 0 1.3-.14 1.83-.37v3.44c-.74.36-1.89.59-3.52.59zm-11.62.2c-2.56 0-4.81-.96-6.34-2.53l2.69-2.68c.89.91 2.04 1.53 3.55 1.53 1.23 0 2.01-.45 2.01-1.2 0-.67-.53-1.04-2.46-1.51C7.17 13.11 5 12.08 5 9.3c0-2.92 2.46-4.14 5.03-4.14 2.11 0 3.98.8 5.21 2.09l-2.56 2.58c-.75-.7-1.73-1.15-2.78-1.15-1.06 0-1.73.37-1.73 1.04 0 .69.62.97 2.6 1.46 2.98.75 4.86 1.82 4.86 4.62 0 3.11-2.42 4.41-5.98 4.41z"
        fill="#635BFF"
      />
    </svg>
  );
}

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
        <p style={{ fontSize: "13px", color: "#AAAAAA", marginBottom: "24px" }}>最終更新日：{UPDATED_AT}</p>

        {/* 決済セキュリティボックス */}
        <div style={{
          background: "#FFFFFF",
          border: "1px solid #E5E5E5",
          borderRadius: "16px",
          padding: "16px 20px",
          marginBottom: "16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Lock size={15} color="#22C55E" strokeWidth={2.5} />
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#22C55E" }}>SSL暗号化通信</span>
            </div>
            <StripeLogo />
          </div>
          <p style={{ fontSize: "13px", color: "#555555", lineHeight: 1.7, margin: 0 }}>
            クレジットカード情報はKAKERUのサーバーには一切保存されません。決済処理はStripeが安全に行います。
          </p>
        </div>

        {/* 特商法テーブル */}
        <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          {ROWS.map((row, idx) => (
            <div key={row.label}>
              {idx > 0 && <div style={{ height: "1px", background: "#F2F2F2" }} />}
              <div style={{ display: "flex", gap: "16px", padding: "16px 20px" }}>
                <div style={{ width: "120px", flexShrink: 0 }}>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#888888" }}>{row.label}</span>
                </div>
                <div style={{ flex: 1 }}>
                  {row.label === "キャンセル・返金ポリシー" ? (
                    <>
                      <p style={{ fontSize: "14px", color: "#111111", lineHeight: 1.7, margin: "0 0 10px" }}>
                        ユーザー自身が設定した目標に対するペナルティの返金は原則行いません。
                      </p>
                      <div style={{
                        background: "#FFF7ED",
                        border: "1px solid #FFEDD5",
                        borderRadius: "10px",
                        padding: "12px 14px",
                        display: "flex",
                        gap: "10px",
                        alignItems: "flex-start",
                      }}>
                        <AlertCircle size={15} color="#F97316" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: "1px" }} />
                        <div>
                          <p style={{ fontSize: "13px", fontWeight: 600, color: "#111111", margin: "0 0 4px" }}>
                            誤課金が発生した場合
                          </p>
                          <p style={{ fontSize: "13px", color: "#555555", margin: "0 0 6px", lineHeight: 1.6 }}>
                            システム障害等による誤課金が発生した場合は、速やかにお問い合わせください。確認後、返金対応を行います。
                          </p>
                          <a
                            href={`mailto:${CONTACT_EMAIL}`}
                            style={{ fontSize: "13px", color: "#FF6B00", fontWeight: 600, textDecoration: "none" }}
                          >
                            {CONTACT_EMAIL}
                          </a>
                        </div>
                      </div>
                    </>
                  ) : (
                    row.value.split("\n").map((line, i) => (
                      <p key={i} style={{ fontSize: "14px", color: "#111111", lineHeight: 1.7, margin: 0 }}>{line}</p>
                    ))
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: "12px", color: "#AAAAAA", marginTop: "20px", lineHeight: 1.7, paddingLeft: "4px" }}>
          ※本表記は特定商取引法第11条および第12条に基づくものです。
        </p>

        {/* 問い合わせCTA */}
        <div style={{
          background: "white",
          border: "1px solid #E5E5E5",
          borderRadius: "16px",
          padding: "20px",
          marginTop: "16px",
          textAlign: "center",
        }}>
          <p style={{ fontSize: "15px", fontWeight: 700, color: "#111111", marginBottom: "4px" }}>ご不明な点はお気軽にどうぞ</p>
          <p style={{ fontSize: "13px", color: "#AAAAAA", marginBottom: "16px" }}>疑問・不安はいつでもお問い合わせください</p>
          <Link href="/contact" className="btn-primary" style={{ display: "inline-block", textDecoration: "none", padding: "0 32px" }}>
            お問い合わせフォームへ
          </Link>
        </div>
      </div>
    </div>
  );
}
