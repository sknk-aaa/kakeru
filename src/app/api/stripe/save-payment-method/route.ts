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

  const admin = createAdminClient();
  const { data: userData } = await admin
    .from("users")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!userData?.stripe_customer_id) {
    return NextResponse.json({ error: "Customer not found" }, { status: 400 });
  }

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    await stripe.customers.update(userData.stripe_customer_id, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Stripe customers.update failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  await admin
    .from("users")
    .update({ stripe_payment_method_id: paymentMethodId })
    .eq("id", user.id);

  return NextResponse.json({ success: true });
}
