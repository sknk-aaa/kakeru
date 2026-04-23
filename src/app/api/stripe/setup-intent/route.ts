import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });

  console.log("[setup-intent] user:", user.id, "email:", user.email);

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const { data: userData, error: dbReadError } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (dbReadError) console.log("[setup-intent] DB read:", dbReadError.message);

  let customerId = userData?.stripe_customer_id ?? null;
  console.log("[setup-intent] existing customerId:", customerId);

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    console.log("[setup-intent] created customer:", customerId);

    const { error: dbWriteError } = await supabase
      .from("users")
      .upsert(
        { id: user.id, email: user.email!, stripe_customer_id: customerId },
        { onConflict: "id" }
      );
    if (dbWriteError) console.error("[setup-intent] DB write error:", dbWriteError.message);
    else console.log("[setup-intent] saved customerId to DB");
  }

  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ["card"],
    usage: "off_session",
  });

  console.log("[setup-intent] created setupIntent:", setupIntent.id);
  return NextResponse.json({ clientSecret: setupIntent.client_secret });
}
