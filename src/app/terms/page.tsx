import BackButton from "@/components/BackButton";

const CONTACT_EMAIL = "kakeruapp.official@gmail.com";
const UPDATED_AT = "2026年4月23日";

export default function TermsPage() {
  return (
    <div style={{ background: "#F2F2F7", minHeight: "100vh" }}>
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #E5E5E5",
        padding: "0 16px", height: "54px",
        display: "flex", alignItems: "center", gap: "8px",
      }}>
        <BackButton />
      </div>

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "24px 20px 48px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#111111", marginBottom: "6px" }}>利用規約</h1>
        <p style={{ fontSize: "13px", color: "#AAAAAA", marginBottom: "32px" }}>最終更新日：{UPDATED_AT}</p>

        <Section title="1. サービスの概要">
          <p>カケル（以下「本サービス」）は、ユーザーがランニング目標を設定し、未達成の場合に事前登録したクレジットカードから自動的に罰金が課金されるWebアプリケーションです。</p>
          <p>本規約に同意の上でご利用ください。同意いただけない場合は、本サービスをご利用いただけません。</p>
        </Section>

        <Section title="2. 利用資格">
          <ul>
            <li>18歳以上の方（18歳未満の方は保護者の同意が必要）</li>
            <li>有効なクレジットカードを登録できる方</li>
            <li>日本国内に居住する方</li>
          </ul>
        </Section>

        <Section title="3. アカウント">
          <p>ユーザーはアカウント情報を正確に保ち、パスワード等を第三者に開示しないものとします。アカウントの不正利用による損害について、当サービスは責任を負いません。</p>
        </Section>

        <Section title="4. 課金・罰金の仕組み">
          <SubHeading>4-1. 目標設定</SubHeading>
          <p>ユーザーは曜日または日付を指定してランニング目標（距離・時間・罰金額）を設定できます。罰金額は100円以上でユーザーが任意に設定します。</p>
          <SubHeading>4-2. 達成判定</SubHeading>
          <p>設定した目標距離・目標時間の両方を同日中に達成した場合、目標達成となります。当日23時59分時点で未達成の場合は未達成と判定されます。</p>
          <SubHeading>4-3. 自動課金</SubHeading>
          <p>未達成と判定された場合、事前登録されたクレジットカードに対して設定された罰金額が自動的に請求されます。課金処理はStripe社を通じて行われます。</p>
          <SubHeading>4-4. スキップ</SubHeading>
          <p>月に1回のみ、罰金なしで目標をスキップできます。スキップは当日中に行う必要があります。</p>
          <SubHeading>4-5. 返金</SubHeading>
          <p>ユーザー自身が設定した目標に対する罰金の返金は原則行いません。ただし、システム障害等により誤って課金が発生した場合はこの限りではありません。</p>
        </Section>

        <Section title="5. 禁止事項">
          <ul>
            <li>虚偽の情報によるアカウント登録</li>
            <li>GPSデータの改ざんや不正な達成操作</li>
            <li>他のユーザーへの迷惑行為・嫌がらせ</li>
            <li>本サービスのリバースエンジニアリング・改ざん</li>
            <li>法令または公序良俗に違反する行為</li>
            <li>その他、当サービスが不適切と判断する行為</li>
          </ul>
        </Section>

        <Section title="6. サービスの変更・中断・終了">
          <p>当サービスは予告なくサービス内容を変更・中断・終了することがあります。これによりユーザーに損害が生じた場合でも、当サービスは責任を負いません。</p>
        </Section>

        <Section title="7. 免責事項">
          <ul>
            <li>本サービスはランニングによる健康効果を保証しません</li>
            <li>ランニング中の怪我・事故について当サービスは責任を負いません</li>
            <li>GPS精度の誤差による達成判定の誤りについて、当サービスは責任を負いません</li>
            <li>第三者サービス（Stripe等）の障害に起因する問題について、当サービスは責任を負いません</li>
          </ul>
        </Section>

        <Section title="8. 退会">
          <p>設定ページからいつでも退会できます。退会後は走行記録・目標・決済情報が削除されます。退会前に未処理の課金がある場合は、退会後も課金処理が行われることがあります。</p>
        </Section>

        <Section title="9. 準拠法・管轄裁判所">
          <p>本規約は日本法に準拠します。本サービスに関する紛争は、運営者の所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。</p>
        </Section>

        <Section title="10. お問い合わせ">
          <p>メール：<a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#FF6B00" }}>{CONTACT_EMAIL}</a></p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "28px" }}>
      <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#111111", marginBottom: "10px", paddingBottom: "6px", borderBottom: "1px solid #E5E5E5" }}>{title}</h2>
      <div style={{ fontSize: "14px", color: "#444444", lineHeight: 1.8, display: "flex", flexDirection: "column", gap: "6px" }}>
        {children}
      </div>
    </div>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <p style={{ fontWeight: 600, color: "#111111", marginTop: "10px", marginBottom: "2px" }}>{children}</p>;
}
