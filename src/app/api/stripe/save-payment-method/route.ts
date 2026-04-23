import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { paymentMethodId } = await request.json();
  if (!paymentMethodId) return NextResponse.json({ error: "paymentMethodId required" }, { status: 400 });

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const admin = createAdminClient();

  // PM が実際に attach されている顧客を Stripe から取得する
  let pm;
  try {
    pm = await stripe.paymentMethods.retrieve(paymentMethodId);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  let customerId = pm.customer as string | null | undefined;

  if (!customerId) {
    // SetupIntent なしで PM が作られた場合のフォールバック
    const { data: userData } = await admin
      .from("users")
      .select("stripe_customer_id, email")
      .eq("id", user.id)
      .single();

    customerId = userData?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userData?.email ?? user.email ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
    }

    await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
  }

  try {
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Stripe customers.update failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  await admin
    .from("users")
    .update({ stripe_customer_id: customerId, stripe_payment_method_id: paymentMethodId })
    .eq("id", user.id);

  return NextResponse.json({ success: true });
}
