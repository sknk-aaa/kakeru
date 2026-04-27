import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRainy } from "@/lib/prefectures";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { goalInstanceId } = await request.json();

  const { data: userData } = await supabase
    .from("users")
    .select("location_lat, location_lng")
    .eq("id", user.id)
    .single();

  if (!userData?.location_lat || !userData?.location_lng) {
    return NextResponse.json({ error: "地域が設定されていません" }, { status: 400 });
  }

  const rainy = await checkRainy(userData.location_lat, userData.location_lng);
  if (!rainy) return NextResponse.json({ error: "現在地は雨ではありません" }, { status: 400 });

  const today = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split("T")[0];

  const { data: instance } = await supabase
    .from("goal_instances")
    .select("scheduled_date, status, user_id")
    .eq("id", goalInstanceId)
    .single();

  if (!instance || instance.user_id !== user.id || instance.scheduled_date !== today || instance.status !== "pending") {
    return NextResponse.json({ error: "スキップできません" }, { status: 400 });
  }

  await supabase.from("goal_instances").update({ status: "skipped" }).eq("id", goalInstanceId);

  return NextResponse.json({ success: true });
}
