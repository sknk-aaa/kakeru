import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

function diffDays(dateStr: string, todayStr: string): number {
  return Math.ceil(
    (new Date(dateStr + "T00:00:00").getTime() - new Date(todayStr + "T00:00:00").getTime()) / (1000 * 60 * 60 * 24)
  );
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: goal } = await supabase.from("goals").select("is_locked, user_id, type, lock_days_before, cooling_weeks, created_at").eq("id", id).single();
  if (!goal || goal.user_id !== user.id) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (goal.is_locked) return NextResponse.json({ error: "locked" }, { status: 403 });
  if (goal.type === "challenge") return NextResponse.json({ error: "challenge goals cannot be edited" }, { status: 403 });

  if (goal.cooling_weeks != null) {
    const lockUntil = new Date(new Date(goal.created_at).getTime() + goal.cooling_weeks * 7 * 24 * 60 * 60 * 1000);
    const now = new Date(Date.now() + 9 * 60 * 60 * 1000);
    if (lockUntil > now) return NextResponse.json({ error: "cooling_period" }, { status: 403 });
  }

  if (goal.lock_days_before != null) {
    const today = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split("T")[0];
    const { data: nextInstance } = await supabase
      .from("goal_instances")
      .select("scheduled_date")
      .eq("goal_id", id)
      .eq("status", "pending")
      .gte("scheduled_date", today)
      .order("scheduled_date")
      .limit(1)
      .maybeSingle();
    if (nextInstance && diffDays(nextInstance.scheduled_date, today) <= goal.lock_days_before) {
      return NextResponse.json({ error: "locked" }, { status: 403 });
    }
  }

  const body = await req.json();
  const updates: Record<string, unknown> = {};
  if (body.distance_km !== undefined) updates.distance_km = body.distance_km ? parseFloat(body.distance_km) : null;
  if (body.duration_minutes !== undefined) updates.duration_minutes = body.duration_minutes ? parseInt(body.duration_minutes) : null;
  if (body.penalty_amount !== undefined) updates.penalty_amount = parseInt(body.penalty_amount);
  if (body.days_of_week !== undefined) updates.days_of_week = body.days_of_week;
  if (body.escalation_type !== undefined) updates.escalation_type = body.escalation_type || null;
  if (body.escalation_value !== undefined) updates.escalation_value = body.escalation_value ? parseFloat(body.escalation_value) : null;

  const { error } = await supabase.from("goals").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: goal } = await supabase.from("goals").select("is_locked, user_id, type, lock_days_before, cooling_weeks, created_at").eq("id", id).single();
  if (!goal || goal.user_id !== user.id) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (goal.is_locked) return NextResponse.json({ error: "locked" }, { status: 403 });
  if (goal.type === "challenge") return NextResponse.json({ error: "challenge goals cannot be stopped" }, { status: 403 });

  if (goal.cooling_weeks != null) {
    const lockUntil = new Date(new Date(goal.created_at).getTime() + goal.cooling_weeks * 7 * 24 * 60 * 60 * 1000);
    const now = new Date(Date.now() + 9 * 60 * 60 * 1000);
    if (lockUntil > now) return NextResponse.json({ error: "cooling_period" }, { status: 403 });
  }

  if (goal.lock_days_before != null) {
    const today = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split("T")[0];
    const { data: nextInstance } = await supabase
      .from("goal_instances")
      .select("scheduled_date")
      .eq("goal_id", id)
      .eq("status", "pending")
      .gte("scheduled_date", today)
      .order("scheduled_date")
      .limit(1)
      .maybeSingle();
    if (nextInstance && diffDays(nextInstance.scheduled_date, today) <= goal.lock_days_before) {
      return NextResponse.json({ error: "locked" }, { status: 403 });
    }
  }

  const today = new Date().toISOString().split("T")[0];
  const { error: goalError } = await supabase.from("goals").update({ is_active: false }).eq("id", id);
  if (goalError) return NextResponse.json({ error: goalError.message }, { status: 500 });

  await supabase
    .from("goal_instances")
    .update({ status: "cancelled" })
    .eq("goal_id", id)
    .eq("status", "pending")
    .gt("scheduled_date", today);

  return NextResponse.json({ ok: true });
}
