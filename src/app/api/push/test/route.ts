import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  if (!process.env.VAPID_PRIVATE_KEY || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_EMAIL) {
    return NextResponse.json({ ok: false, error: "VAPID 設定が不足しています" }, { status: 500 });
  }

  const admin = createAdminClient();
  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", user.id);

  if (!subs || subs.length === 0) {
    return NextResponse.json({
      ok: false,
      error: "サブスクリプションが登録されていません。設定で通知を一度OFF→ONし直してください。",
    }, { status: 404 });
  }

  const webpush = (await import("web-push")).default;
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );

  const payload = JSON.stringify({
    title: "テスト通知 ✅",
    body: "プッシュ通知は正しく届いています。",
    url: "/settings",
  });

  const results: { endpoint: string; ok: boolean; error?: string }[] = [];
  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload,
      );
      results.push({ endpoint: sub.endpoint, ok: true });
    } catch (err) {
      const statusCode = (err as { statusCode?: number })?.statusCode;
      const message = (err as { body?: string; message?: string })?.body
        ?? (err as { message?: string })?.message
        ?? "unknown";
      if (statusCode === 410) {
        await admin.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
      }
      results.push({ endpoint: sub.endpoint, ok: false, error: `${statusCode ?? ""} ${message}`.trim() });
    }
  }

  const sent = results.filter((r) => r.ok).length;
  return NextResponse.json({
    ok: sent > 0,
    subscriptions: subs.length,
    sent,
    results,
  });
}
