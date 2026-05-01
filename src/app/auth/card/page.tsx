"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CreditCard, Lock, ArrowLeft } from "lucide-react";

export default function CardPage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripeAvailable, setStripeAvailable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/stripe/setup-intent", { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        if (data.error === "Stripe not configured") {
          setStripeAvailable(false);
        } else if (data.error) {
          setError("初期化エラー: " + data.error);
        } else {
          setClientSecret(data.clientSecret);
        }
      })
      .catch(() => setStripeAvailable(false));
  }, []);

  if (!stripeAvailable) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <div className="w-14 h-14 rounded-full bg-[#FFF0E5] flex items-center justify-center mb-4">
          <CreditCard size={28} color="#FF6B00" />
        </div>
        <h1 className="text-xl font-bold text-center mb-2">クレジットカード登録</h1>
        <p className="text-text-sub text-center text-sm mb-6 leading-relaxed">
          Stripeのキーが設定されていません。<br />
          環境変数を設定後にカードを登録してください。
        </p>
        <button className="btn-primary w-full" onClick={() => router.push("/")}>
          スキップして進む（開発用）
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 pt-14 pb-10">
      <button
        onClick={() => router.back()}
        style={{
          position: "absolute", top: "12px", left: "12px",
          width: "36px", height: "36px",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "#F2F2F7", border: "none", borderRadius: "50%", cursor: "pointer",
        }}
        aria-label="戻る"
      >
        <ArrowLeft size={18} color="#555555" strokeWidth={2} />
      </button>

      {/* ヒーロー */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "28px", marginTop: "8px" }}>
        <Image
          src="/その他素材/クレカロック-transparent.png"
          alt=""
          width={120}
          height={120}
          style={{ objectFit: "contain", marginBottom: "16px" }}
          priority
        />
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#111111", marginBottom: "8px", textAlign: "center" }}>
          クレジットカードを登録
        </h1>
        <p style={{ fontSize: "14px", color: "#888888", textAlign: "center", lineHeight: 1.6 }}>
          目標未達成の場合、登録カードから<br />自動的に課金されます。
        </p>
      </div>

      {/* フォームカード */}
      <div className="card mb-3">
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px" }}>
          <Lock size={13} color="#888888" />
          <span style={{ fontSize: "12px", color: "#888888" }}>Stripe による安全な決済</span>
        </div>

        {clientSecret ? (
          <StripeCardForm
            clientSecret={clientSecret}
            onSuccess={() => router.push("/")}
            setError={setError}
            loading={loading}
            setLoading={setLoading}
          />
        ) : error ? null : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <div style={{ height: "12px", width: "60px", background: "#F0F0F0", borderRadius: "4px", marginBottom: "8px" }} className="animate-pulse" />
              <div style={{ height: "48px", background: "#F5F5F5", borderRadius: "8px" }} className="animate-pulse" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <div style={{ height: "12px", width: "48px", background: "#F0F0F0", borderRadius: "4px", marginBottom: "8px" }} className="animate-pulse" />
                <div style={{ height: "48px", background: "#F5F5F5", borderRadius: "8px" }} className="animate-pulse" />
              </div>
              <div>
                <div style={{ height: "12px", width: "80px", background: "#F0F0F0", borderRadius: "4px", marginBottom: "8px" }} className="animate-pulse" />
                <div style={{ height: "48px", background: "#F5F5F5", borderRadius: "8px" }} className="animate-pulse" />
              </div>
            </div>
          </div>
        )}
        {error && <p style={{ color: "#EF4444", fontSize: "13px", marginTop: "12px" }}>{error}</p>}
      </div>

      <p style={{ fontSize: "11px", color: "#BBBBBB", textAlign: "center", lineHeight: 1.7 }}>
        カード情報はStripeに直接送信され、当サービスのサーバーには保存されません。<br />
        Visa・Mastercard・JCB・American Express・Diners に対応
      </p>
    </div>
  );
}

function StripeCardForm({
  clientSecret,
  onSuccess,
  setError,
  loading,
  setLoading,
}: {
  clientSecret: string;
  onSuccess: () => void;
  setError: (e: string | null) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}) {
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const [stripeInstance, setStripeInstance] = useState<{
    stripe: import("@stripe/stripe-js").Stripe;
    cardNumber: import("@stripe/stripe-js").StripeCardNumberElement;
  } | null>(null);

  useEffect(() => {
    const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!pk) {
      setError("Stripe 公開キーが設定されていません");
      return;
    }

    import("@stripe/stripe-js").then(({ loadStripe }) => {
      loadStripe(pk).then((stripe) => {
        if (!stripe) {
          setError("Stripe の読み込みに失敗しました");
          return;
        }

        const elements = stripe.elements();
        const style = {
          base: {
            fontSize: "16px",
            color: "#111111",
            fontFamily: "sans-serif",
            "::placeholder": { color: "#AAAAAA" },
          },
          invalid: { color: "#EF4444" },
        };

        const cardNumber = elements.create("cardNumber", { style });
        const cardExpiry = elements.create("cardExpiry", { style });
        const cardCvc    = elements.create("cardCvc",    { style });

        cardNumber.mount("#card-number");
        cardExpiry.mount("#card-expiry");
        cardCvc.mount("#card-cvc");

        setStripeInstance({ stripe, cardNumber });
        setStripeLoaded(true);
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripeInstance) return;
    const { stripe, cardNumber } = stripeInstance;

    setLoading(true);
    setError(null);

    const { error: confirmError, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
      payment_method: { card: cardNumber },
    });

    if (confirmError) {
      setError(confirmError.message ?? "カードの確認に失敗しました");
      setLoading(false);
      return;
    }

    if (!setupIntent?.payment_method) {
      setError("カードの登録に失敗しました。もう一度お試しください。");
      setLoading(false);
      return;
    }

    const paymentMethodId =
      typeof setupIntent.payment_method === "string"
        ? setupIntent.payment_method
        : setupIntent.payment_method.id;

    const res = await fetch("/api/stripe/save-payment-method", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentMethodId }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(`保存エラー (${res.status}): ${data.error ?? "不明なエラー"}`);
      setLoading(false);
      return;
    }

    onSuccess();
  }

  const fieldStyle: React.CSSProperties = {
    border: "1.5px solid #E5E5E5",
    borderRadius: "8px",
    padding: "14px 16px",
    transition: "border-color 0.15s",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "12px",
    fontWeight: 600,
    color: "#555555",
    marginBottom: "6px",
    display: "block",
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* カード番号 */}
      <div style={{ marginBottom: "16px" }}>
        <label style={labelStyle}>カード番号</label>
        <div id="card-number" style={fieldStyle} />
      </div>

      {/* 有効期限 + セキュリティコード */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
        <div>
          <label style={labelStyle}>有効期限</label>
          <div id="card-expiry" style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>セキュリティコード</label>
          <div id="card-cvc" style={fieldStyle} />
        </div>
      </div>

      <button
        className="btn-primary w-full"
        type="submit"
        disabled={loading || !stripeLoaded}
      >
        {loading ? "登録中..." : "カードを登録する"}
      </button>
    </form>
  );
}
