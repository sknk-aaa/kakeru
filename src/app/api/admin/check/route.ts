import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ isAdmin: false });

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",").map((s) => s.trim()).filter(Boolean);

  return Response.json({ isAdmin: adminEmails.includes(user.email ?? "") });
}
