import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

function buildSummary(goal: { distance_km: number | null; duration_minutes: number | null; penalty_amount: number }): string {
  const parts: string[] = [];
  if (goal.distance_km) parts.push(`${goal.distance_km}km`);
  if (goal.duration_minutes) parts.push(`${goal.duration_minutes}分`);
  const target = parts.length ? parts.join("・") : "ランニング";
  return `🏃 ${target}（¥${goal.penalty_amount.toLocaleString("ja-JP")}）`;
}

function nextDateStr(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0].replace(/-/g, "");
}

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const admin = createAdminClient();

  const { data: userData } = await admin.from("users").select("id").eq("calendar_token", token).single();
  if (!userData) return new NextResponse("Not Found", { status: 404 });

  const today = new Date().toISOString().split("T")[0];
  const { data: instances } = await admin
    .from("goal_instances")
    .select("id, scheduled_date, goals(type, distance_km, duration_minutes, penalty_amount)")
    .eq("user_id", userData.id)
    .eq("status", "pending")
    .gte("scheduled_date", today)
    .order("scheduled_date") as {
      data: Array<{
        id: string;
        scheduled_date: string;
        goals: { type: string; distance_km: number | null; duration_minutes: number | null; penalty_amount: number } | null;
      }> | null;
    };

  const events: string[] = [];
  for (const instance of instances ?? []) {
    if (!instance.goals || instance.goals.type !== "oneoff") continue;
    const summary = buildSummary(instance.goals);
    const dtstart = instance.scheduled_date.replace(/-/g, "");
    const dtend = nextDateStr(instance.scheduled_date);
    events.push(
      [
        "BEGIN:VEVENT",
        `DTSTART;VALUE=DATE:${dtstart}`,
        `DTEND;VALUE=DATE:${dtend}`,
        `SUMMARY:${summary}`,
        `UID:kakeru-instance-${instance.id}@kakeru`,
        "END:VEVENT",
      ].join("\r\n")
    );
  }

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Kakeru//Goal Calendar//JA",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:カケル 目標カレンダー",
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "no-cache, no-store",
    },
  });
}
