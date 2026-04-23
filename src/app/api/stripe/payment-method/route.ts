import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const admin = createAdminClient();
  const { data: userData } = await admin
    .from("users")
    .select("stripe_payment_method_id")
    .eq("id", user.id)
    .single();

  if (!userData?.stripe_payment_method_id) {
    return NextResponse.json({ card: null });
  }

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const pm = await stripe.paymentMethods.retrieve(userData.stripe_payment_method_id);

  return NextResponse.json({
    card: pm.card ? { brand: pm.card.brand, last4: pm.card.last4 } : null,
  });
}
