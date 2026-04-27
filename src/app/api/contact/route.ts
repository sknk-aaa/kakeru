export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { buildEmailHtml } from "@/lib/emails";

const resend = new Resend(process.env.RESEND_API_KEY);
const TO_EMAIL = "kakeruapp.official@gmail.com";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { body } = await req.json();
  if (!body?.trim()) return Response.json({ error: "empty" }, { status: 400 });

  const html = buildEmailHtml(`
    <p style="font-size:14px;color:#333333;margin:0 0 8px;"><strong>送信者：</strong>${user.email}</p>
    <p style="font-size:14px;color:#333333;margin:0 0 12px;"><strong>内容：</strong></p>
    <p style="font-size:14px;color:#333333;white-space:pre-wrap;margin:0;line-height:1.7;">${body.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
  `);

  await resend.emails.send({
    from: "カケル <noreply@kakeruapp.com>",
    to: TO_EMAIL,
    subject: `【お問い合わせ】${user.email}`,
    html,
  });

  return Response.json({ ok: true });
}
