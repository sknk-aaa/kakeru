import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { goalInstanceId } = await request.json();

  const { data: userData } = await supabase
    .from("users")
    .select("skip_count_this_month")
    .eq("id", user.id)
    .single();

  if ((userData?.skip_count_this_month ?? 0) >= 1) {
    return NextResponse.json({ error: "スキップ回数の上限に達しています" }, { status: 400 });
  }

  const today = new Date().toISOString().split("T")[0];

  const { data: instance } = await supabase
    .from("goal_instances")
    .select("scheduled_date, status")
    .eq("id", goalInstanceId)
    .eq("user_id", user.id)
    .single();

  if (!instance || instance.scheduled_date !== today || instance.status !== "pending") {
    return NextResponse.json({ error: "スキップできません" }, { status: 400 });
  }

  await Promise.all([
    supabase
      .from("goal_instances")
      .update({ status: "skipped" })
      .eq("id", goalInstanceId),
    supabase
      .from("users")
      .update({ skip_count_this_month: (userData?.skip_count_this_month ?? 0) + 1 })
      .eq("id", user.id),
  ]);

  return NextResponse.json({ success: true });
}
