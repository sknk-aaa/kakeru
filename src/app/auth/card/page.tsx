"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
        <p className="text-[#888888] text-center text-sm mb-6 leading-relaxed">
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
    <div className="min-h-screen bg-white flex flex-col px-6 pt-16 pb-8">
      <button
        onClick={() => router.back()}
        style={{
          position: "fixed", top: "12px", left: "12px",
          width: "36px", height: "36px",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "#F2F2F7", border: "none", borderRadius: "50%", cursor: "pointer",
        }}
        aria-label="戻る"
      >
        <ArrowLeft size={18} color="#555555" strokeWidth={2} />
      </button>

      <div className="mb-8">
        <div className="w-14 h-14 rounded-full bg-[#FFF0E5] flex items-center justify-center mb-4">
          <CreditCard size={28} color="#FF6B00" />
        </div>
        <h1 className="text-2xl font-bold text-[#111111] mb-2">
          クレジットカードを登録
        </h1>
        <p className="text-[#888888] text-[15px] leading-relaxed">
          目標を未達成の場合、登録カードから自動的に課金されます。
        </p>
      </div>

      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={14} color="#888888" />
          <span className="text-xs text-[#888888]">Stripe による安全な決済</span>
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
          <div className="h-12 bg-[#F5F5F5] rounded-lg animate-pulse" />
        )}
        {error && <p className="text-[#EF4444] text-sm mt-3">{error}</p>}
      </div>

      <p className="text-xs text-[#888888] text-center leading-relaxed">
        カード情報はStripeに直接送信され、当サービスのサーバーには保存されません。
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
    cardElement: import("@stripe/stripe-js").StripeCardElement;
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

        // clientSecret なしで elements() を初期化（Card Element の正しい使い方）
        const elements = stripe.elements();
        const cardElement = elements.create("card", {
          style: {
            base: {
              fontSize: "16px",
              color: "#111111",
              fontFamily: "sans-serif",
              "::placeholder": { color: "#AAAAAA" },
            },
            invalid: { color: "#EF4444" },
          },
        });
        cardElement.mount("#card-element");
        setStripeInstance({ stripe, cardElement });
        setStripeLoaded(true);
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripeInstance) return;
    const { stripe, cardElement } = stripeInstance;

    setLoading(true);
    setError(null);

    const { error: confirmError, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
      payment_method: { card: cardElement },
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

    // payment_method は string か PaymentMethod オブジェクト
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

  return (
    <form onSubmit={handleSubmit}>
      <div
        id="card-element"
        className="border border-[#E5E5E5] rounded-lg px-4 py-4 min-h-[52px]"
      />
      <button
        className="btn-primary w-full mt-4"
        type="submit"
        disabled={loading || !stripeLoaded}
      >
        {loading ? "登録中..." : "カードを登録する"}
      </button>
    </form>
  );
}
