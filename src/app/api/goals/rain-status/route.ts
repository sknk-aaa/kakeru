import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRainy } from "@/lib/prefectures";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: userData } = await supabase
    .from("users")
    .select("location_lat, location_lng")
    .eq("id", user.id)
    .single();

  if (userData?.location_lat == null || userData?.location_lng == null) {
    return NextResponse.json({ isRainy: false, hasLocation: false });
  }

  const isRainy = await checkRainy(userData.location_lat, userData.location_lng);
  return NextResponse.json({ isRainy, hasLocation: true });
}
