import type { SupabaseClient } from "@supabase/supabase-js";
import { buildEmailHtml, chargeBox, ctaButton } from "@/lib/emails";

export async function sendPenaltyChargedEmail(
  admin: SupabaseClient,
  opts: { penaltyId: string }
): Promise<{ sent: boolean; reason?: string }> {
  if (!process.env.RESEND_API_KEY) return { sent: false, reason: "no-resend-key" };

  const { data: penalty } = await admin
    .from("penalties")
    .select("user_id, amount, goal_instance_id")
    .eq("id", opts.penaltyId)
    .single() as { data: { user_id: string; amount: number; goal_instance_id: string | null } | null };

  if (!penalty) return { sent: false, reason: "no-penalty" };

  const { data: userData } = await admin
    .from("users").select("email").eq("id", penalty.user_id).single() as { data: { email: string } | null };

  if (!userData?.email) return { sent: false, reason: "no-email" };

  const { data: instanceData } = penalty.goal_instance_id
    ? await admin.from("goal_instances")
        .select("goals(distance_km, duration_minutes)")
        .eq("id", penalty.goal_instance_id).single() as unknown as { data: { goals: { distance_km: number | null; duration_minutes: number | null } | null } | null }
    : { data: null };

  const goal = instanceData?.goals ?? null;

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "カケル <noreply@kakeruapp.com>",
    to: userData.email,
    subject: `【カケル】課金のお知らせ — ¥${penalty.amount.toLocaleString()}`,
    html: buildEmailHtml(`
      <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#111111;">課金が完了しました。</p>
      <p style="margin:0 0 28px;font-size:15px;color:#555555;line-height:1.8;">
        いつもカケルをご利用いただきありがとうございます。<br>
        設定されたランニング目標が未達成のため、下記のとおり課金が発生しました。
      </p>
      ${chargeBox({
        amount: penalty.amount,
        distanceKm: goal?.distance_km ?? null,
        durationMinutes: goal?.duration_minutes ?? null,
        label: "課金内容",
        accentColor: "#111111",
      })}
      <p style="margin:0 0 28px;font-size:15px;color:#555555;line-height:1.8;">
        次回こそ一緒に達成しましょう。応援しています！
      </p>
      ${ctaButton("アプリを開く", "https://www.kakeruapp.com")}
    `),
  });
  return { sent: true };
}
