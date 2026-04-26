function header(): string {
  return `
    <tr>
      <td style="background-color:#111111;padding:24px 40px;text-align:center;">
        <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
          <tr>
            <td style="width:40px;height:40px;background-color:#FF6B00;border-radius:20px;text-align:center;vertical-align:middle;">
              <span style="color:white;font-size:20px;font-weight:900;line-height:40px;display:block;">K</span>
            </td>
            <td style="padding-left:12px;vertical-align:middle;">
              <span style="color:white;font-size:18px;font-weight:700;">カケル</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function footer(): string {
  return `
    <tr>
      <td style="background-color:#f8f8f8;padding:20px 40px;text-align:center;border-top:1px solid #eeeeee;">
        <p style="margin:0;font-size:12px;color:#aaaaaa;">
          カケル &nbsp;|&nbsp;
          <a href="https://www.kakeruapp.com" style="color:#aaaaaa;text-decoration:none;">www.kakeruapp.com</a>
        </p>
        <p style="margin:6px 0 0;font-size:11px;color:#cccccc;">このメールはシステムから自動送信されています。</p>
      </td>
    </tr>`;
}

export function buildEmailHtml(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background-color:#f2f2f7;font-family:'Helvetica Neue',Arial,'Hiragino Sans',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f2f2f7;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        ${header()}
        <tr>
          <td style="padding:36px 40px 32px;">
            ${bodyHtml}
          </td>
        </tr>
        ${footer()}
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function goalBox(opts: {
  distanceKm: number | null;
  durationMinutes: number | null;
  penaltyAmount: number | null;
  label?: string;
  accentColor?: string;
}): string {
  const { distanceKm, durationMinutes, penaltyAmount, label = "本日の目標", accentColor = "#FF6B00" } = opts;
  const rows = [
    distanceKm != null && `<p style="margin:4px 0;font-size:14px;color:#333333;">📍 距離：<strong>${distanceKm} km</strong></p>`,
    durationMinutes != null && `<p style="margin:4px 0;font-size:14px;color:#333333;">⏱ 時間：<strong>${durationMinutes} 分</strong></p>`,
    penaltyAmount != null && `<p style="margin:4px 0;font-size:14px;color:#333333;">💳 課金予定額：<strong>¥${penaltyAmount.toLocaleString()}</strong>（未達成の場合）</p>`,
  ].filter(Boolean).join("");

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f8f8;border-radius:10px;border-left:4px solid ${accentColor};margin-bottom:28px;">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:${accentColor};letter-spacing:0.1em;">${label}</p>
        ${rows}
      </td></tr>
    </table>`;
}

export function chargeBox(opts: {
  amount: number;
  distanceKm: number | null;
  durationMinutes: number | null;
  label?: string;
  accentColor?: string;
}): string {
  const { amount, distanceKm, durationMinutes, label = "課金内容", accentColor = "#111111" } = opts;
  const today = new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
  const rows = [
    `<p style="margin:4px 0;font-size:14px;color:#333333;">📅 課金日：<strong>${today}</strong></p>`,
    `<p style="margin:4px 0;font-size:14px;color:#333333;">💳 課金額：<strong>¥${amount.toLocaleString()}</strong></p>`,
    distanceKm != null && `<p style="margin:4px 0;font-size:14px;color:#333333;">📍 対象目標：<strong>${distanceKm} km</strong>${durationMinutes != null ? `・<strong>${durationMinutes} 分</strong>` : ""}（未達成）</p>`,
    distanceKm == null && durationMinutes != null && `<p style="margin:4px 0;font-size:14px;color:#333333;">📍 対象目標：<strong>${durationMinutes} 分</strong>（未達成）</p>`,
  ].filter(Boolean).join("");

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f8f8;border-radius:10px;border-left:4px solid ${accentColor};margin-bottom:28px;">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:${accentColor};letter-spacing:0.1em;">${label}</p>
        ${rows}
      </td></tr>
    </table>`;
}

export function ctaButton(text: string, href: string): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center" style="padding-top:4px;">
        <a href="${href}" style="display:inline-block;background-color:#FF6B00;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:8px;">${text}</a>
      </td></tr>
    </table>`;
}
