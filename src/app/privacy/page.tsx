import BackButton from "@/components/BackButton";

const CONTACT_EMAIL = "kakeruapp.official@gmail.com";
const UPDATED_AT = "2026年4月23日";

export default function PrivacyPage() {
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
        <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#111111", marginBottom: "6px" }}>プライバシーポリシー</h1>
        <p style={{ fontSize: "13px", color: "#AAAAAA", marginBottom: "32px" }}>最終更新日：{UPDATED_AT}</p>

        <Section title="1. はじめに">
          <p>カケル（以下「本サービス」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。本ポリシーは、本サービスが収集する情報、その利用目的、および第三者への提供について説明します。</p>
        </Section>

        <Section title="2. 収集する情報">
          <SubHeading>2-1. ユーザーが提供する情報</SubHeading>
          <ul>
            <li>メールアドレス（アカウント登録時）</li>
            <li>体重（カロリー計算のため任意入力）</li>
            <li>クレジットカード情報（Stripe社が直接取得・管理。本サービスはカード番号を保存しません）</li>
          </ul>
          <SubHeading>2-2. 自動的に収集される情報</SubHeading>
          <ul>
            <li>位置情報（GPS）：ランニング計測中にのみ取得し、走行ルートとしてサーバーに保存します</li>
            <li>走行データ：距離・時間・ペース・カロリー・GPS軌跡</li>
            <li>アクセスログ：IPアドレス、ブラウザ情報、アクセス日時</li>
          </ul>
        </Section>

        <Section title="3. 利用目的">
          <ul>
            <li>サービスの提供・運営（目標管理・達成判定・課金処理）</li>
            <li>走行記録・統計の表示</li>
            <li>未達成時の自動課金処理</li>
            <li>サービスの改善および新機能の開発</li>
            <li>重要なお知らせの送信（サービス変更・障害など）</li>
          </ul>
        </Section>

        <Section title="4. 第三者への提供">
          <p>本サービスは、以下の場合を除き、ユーザーの個人情報を第三者に提供しません。</p>
          <ul>
            <li>法令に基づく開示要請があった場合</li>
            <li>ユーザー本人の同意がある場合</li>
          </ul>
          <SubHeading>利用する外部サービス</SubHeading>
          <ul>
            <li><strong>Stripe, Inc.</strong>：決済処理。クレジットカード情報はStripeが管理します。<a href="https://stripe.com/jp/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "#FF6B00" }}>Stripeプライバシーポリシー</a></li>
            <li><strong>Supabase, Inc.</strong>：データベース・認証基盤。ユーザーデータはSupabaseのサーバーに保存されます。</li>
            <li><strong>Google LLC</strong>：Googleアカウントによるログイン機能の提供。</li>
            <li><strong>Vercel, Inc.</strong>：サービスのホスティング。</li>
          </ul>
        </Section>

        <Section title="5. Cookieについて">
          <p>本サービスは、ログイン状態の維持のためにCookieおよびローカルストレージを使用します。ブラウザの設定によりCookieを無効にすることができますが、サービスが正常に動作しなくなる場合があります。</p>
        </Section>

        <Section title="6. 位置情報について">
          <p>本サービスはランニング計測時にデバイスのGPS機能を使用します。位置情報の取得はユーザーの許可を得た場合のみ行われます。取得した位置情報は走行ルートとして保存され、記録の表示に利用されます。</p>
        </Section>

        <Section title="7. データの保管と削除">
          <p>ユーザーデータはアカウント存続中保管されます。退会により、走行記録・目標データ・位置情報を含む全データを削除します。削除には最大30日かかる場合があります。</p>
        </Section>

        <Section title="8. 未成年者の利用">
          <p>本サービスは18歳以上の方を対象としています。18歳未満の方は、保護者の同意を得た上でご利用ください。</p>
        </Section>

        <Section title="9. プライバシーポリシーの変更">
          <p>本ポリシーは予告なく変更される場合があります。重要な変更がある場合はサービス内またはメールにてお知らせします。</p>
        </Section>

        <Section title="10. お問い合わせ">
          <p>個人情報の取り扱いに関するお問い合わせは下記までご連絡ください。</p>
          <p style={{ marginTop: "8px" }}>メール：<a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#FF6B00" }}>{CONTACT_EMAIL}</a></p>
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
