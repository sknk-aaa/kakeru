export const dynamic = "force-dynamic";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data } = await supabase
    .from("users")
    .select("weight_kg, monthly_distance_goal_km, stripe_payment_method_id, notify_morning, notify_evening, city_name, location_lat, location_lng")
    .eq("id", user.id)
    .single();

  return (
    <AppShell>
      <SettingsClient
        initialData={{
          userId: user.id,
          email: user.email ?? "",
          isEmailUser: user.app_metadata?.provider === "email",
          weightKg: data?.weight_kg ?? null,
          monthlyGoalKm: data?.monthly_distance_goal_km ?? null,
          hasCard: Boolean(data?.stripe_payment_method_id),
          notifyMorning: data?.notify_morning ?? true,
          notifyEvening: data?.notify_evening ?? true,
          cityName: data?.city_name ?? "",
          locationLat: data?.location_lat ?? null,
          locationLng: data?.location_lng ?? null,
        }}
      />
    </AppShell>
  );
}
