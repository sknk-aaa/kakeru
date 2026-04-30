import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function getUser() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/auth");
  return user;
}

export async function getUserProfile() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", session.user.id)
    .single();

  return data;
}
