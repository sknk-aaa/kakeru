import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date().toISOString().split("T")[0];

  // 今日以外・pending のみキャンセル可
  const { data, error } = await supabase
    .from("goal_instances")
    .update({ status: "cancelled" })
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("status", "pending")
    .neq("scheduled_date", today)
    .select()
    .single();

  if (error || !data) return NextResponse.json({ error: "キャンセルできません" }, { status: 400 });

  return NextResponse.json({ ok: true });
}
