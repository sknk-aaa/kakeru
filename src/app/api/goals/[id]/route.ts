import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const updates: Record<string, unknown> = {};
  if (body.distance_km !== undefined) updates.distance_km = body.distance_km ? parseFloat(body.distance_km) : null;
  if (body.duration_minutes !== undefined) updates.duration_minutes = body.duration_minutes ? parseInt(body.duration_minutes) : null;
  if (body.penalty_amount !== undefined) updates.penalty_amount = parseInt(body.penalty_amount);
  if (body.days_of_week !== undefined) updates.days_of_week = body.days_of_week;

  const { error } = await supabase.from("goals").update(updates).eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date().toISOString().split("T")[0];

  // 目標を非アクティブ化
  const { error: goalError } = await supabase
    .from("goals")
    .update({ is_active: false })
    .eq("id", id)
    .eq("user_id", user.id);
  if (goalError) return NextResponse.json({ error: goalError.message }, { status: 500 });

  // 今日以降のpendingインスタンスをキャンセル
  await supabase
    .from("goal_instances")
    .update({ status: "cancelled" })
    .eq("goal_id", id)
    .eq("status", "pending")
    .gte("scheduled_date", today);

  return NextResponse.json({ ok: true });
}
