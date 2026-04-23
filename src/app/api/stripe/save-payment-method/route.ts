import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });

  const body = await request.json();
  // payment_method は string か PaymentMethod オブジェクトの場合がある
  const rawPm = body.paymentMethodId;
  const paymentMethodId: string = typeof rawPm === "string" ? rawPm : rawPm?.id;
  console.log("[save-pm] paymentMethodId:", paymentMethodId, "user:", user.id);

  if (!paymentMethodId) return NextResponse.json({ error: "paymentMethodId required" }, { status: 400 });

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  // Stripe から PM を取得して attach 済み顧客を確認
  let pm;
  try {
    pm = await stripe.paymentMethods.retrieve(paymentMethodId);
    console.log("[save-pm] pm.customer:", pm.customer);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[save-pm] retrieve error:", msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const customerId = typeof pm.customer === "string" ? pm.customer : pm.customer?.id ?? null;

  if (!customerId) {
    console.error("[save-pm] PM is not attached to any customer");
    return NextResponse.json({ error: "カードが顧客に紐付いていません。ページを再読み込みして再度お試しください。" }, { status: 400 });
  }

  // デフォルト支払い方法として設定
  try {
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });
    console.log("[save-pm] set default PM on customer:", customerId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[save-pm] customers.update error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  // DB 保存（email を含めて NOT NULL 制約を満たす）
  const { error: dbError } = await supabase
    .from("users")
    .upsert(
      {
        id: user.id,
        email: user.email!,
        stripe_customer_id: customerId,
        stripe_payment_method_id: paymentMethodId,
      },
      { onConflict: "id" }
    );

  if (dbError) {
    console.error("[save-pm] DB error:", dbError.message);
    return NextResponse.json({ error: "DB保存エラー: " + dbError.message }, { status: 500 });
  }

  console.log("[save-pm] success for user:", user.id);
  return NextResponse.json({ success: true });
}
