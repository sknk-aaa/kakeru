export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const offset = parseInt(searchParams.get("offset") ?? "0");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "10"), 20);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("runs")
    .select("id, distance_km, duration_seconds, pace_seconds_per_km, calories, started_at")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const hasMore = (data?.length ?? 0) === limit;
  return Response.json({ runs: data ?? [], hasMore });
}
