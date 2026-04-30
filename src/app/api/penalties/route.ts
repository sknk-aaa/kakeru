export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("penalties")
    .select("id, amount, charged_at, status, goal_instances(goals(title))")
    .eq("user_id", user.id)
    .eq("status", "charged")
    .order("charged_at", { ascending: false });

  return Response.json({ penalties: data ?? [] });
}
