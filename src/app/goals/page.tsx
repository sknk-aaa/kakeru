export const dynamic = "force-dynamic";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import GoalsClient from "./GoalsClient";

export default async function GoalsPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <AppShell>
      <GoalsClient goals={goals ?? []} />
    </AppShell>
  );
}
