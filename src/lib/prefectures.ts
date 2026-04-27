export interface Prefecture {
  code: string;
  name: string;
  lat: number;
  lng: number;
}

export const PREFECTURES: Prefecture[] = [
  { code: "hokkaido", name: "北海道", lat: 43.0642, lng: 141.3469 },
  { code: "aomori", name: "青森県", lat: 40.8244, lng: 140.7400 },
  { code: "iwate", name: "岩手県", lat: 39.7036, lng: 141.1527 },
  { code: "miyagi", name: "宮城県", lat: 38.2688, lng: 140.8721 },
  { code: "akita", name: "秋田県", lat: 39.7186, lng: 140.1023 },
  { code: "yamagata", name: "山形県", lat: 38.2404, lng: 140.3633 },
  { code: "fukushima", name: "福島県", lat: 37.7500, lng: 140.4678 },
  { code: "ibaraki", name: "茨城県", lat: 36.3418, lng: 140.4468 },
  { code: "tochigi", name: "栃木県", lat: 36.5658, lng: 139.8836 },
  { code: "gunma", name: "群馬県", lat: 36.3911, lng: 139.0608 },
  { code: "saitama", name: "埼玉県", lat: 35.8570, lng: 139.6489 },
  { code: "chiba", name: "千葉県", lat: 35.6047, lng: 140.1233 },
  { code: "tokyo", name: "東京都", lat: 35.6895, lng: 139.6917 },
  { code: "kanagawa", name: "神奈川県", lat: 35.4473, lng: 139.6425 },
  { code: "niigata", name: "新潟県", lat: 37.9162, lng: 139.0364 },
  { code: "toyama", name: "富山県", lat: 36.6953, lng: 137.2113 },
  { code: "ishikawa", name: "石川県", lat: 36.5947, lng: 136.6256 },
  { code: "fukui", name: "福井県", lat: 36.0652, lng: 136.2216 },
  { code: "yamanashi", name: "山梨県", lat: 35.6635, lng: 138.5684 },
  { code: "nagano", name: "長野県", lat: 36.6513, lng: 138.1810 },
  { code: "gifu", name: "岐阜県", lat: 35.3912, lng: 136.7223 },
  { code: "shizuoka", name: "静岡県", lat: 34.9769, lng: 138.3831 },
  { code: "aichi", name: "愛知県", lat: 35.1802, lng: 136.9066 },
  { code: "mie", name: "三重県", lat: 34.7303, lng: 136.5086 },
  { code: "shiga", name: "滋賀県", lat: 35.0045, lng: 135.8686 },
  { code: "kyoto", name: "京都府", lat: 35.0211, lng: 135.7556 },
  { code: "osaka", name: "大阪府", lat: 34.6937, lng: 135.5022 },
  { code: "hyogo", name: "兵庫県", lat: 34.6913, lng: 135.1830 },
  { code: "nara", name: "奈良県", lat: 34.6851, lng: 135.8325 },
  { code: "wakayama", name: "和歌山県", lat: 34.2260, lng: 135.1675 },
  { code: "tottori", name: "鳥取県", lat: 35.5011, lng: 134.2351 },
  { code: "shimane", name: "島根県", lat: 35.4723, lng: 133.0505 },
  { code: "okayama", name: "岡山県", lat: 34.6618, lng: 133.9344 },
  { code: "hiroshima", name: "広島県", lat: 34.3963, lng: 132.4596 },
  { code: "yamaguchi", name: "山口県", lat: 34.1859, lng: 131.4706 },
  { code: "tokushima", name: "徳島県", lat: 34.0658, lng: 134.5594 },
  { code: "kagawa", name: "香川県", lat: 34.3401, lng: 134.0434 },
  { code: "ehime", name: "愛媛県", lat: 33.8417, lng: 132.7657 },
  { code: "kochi", name: "高知県", lat: 33.5597, lng: 133.5311 },
  { code: "fukuoka", name: "福岡県", lat: 33.6064, lng: 130.4183 },
  { code: "saga", name: "佐賀県", lat: 33.2494, lng: 130.2988 },
  { code: "nagasaki", name: "長崎県", lat: 32.7448, lng: 129.8737 },
  { code: "kumamoto", name: "熊本県", lat: 32.7898, lng: 130.7417 },
  { code: "oita", name: "大分県", lat: 33.2382, lng: 131.6126 },
  { code: "miyazaki", name: "宮崎県", lat: 31.9111, lng: 131.4239 },
  { code: "kagoshima", name: "鹿児島県", lat: 31.5602, lng: 130.5581 },
  { code: "okinawa", name: "沖縄県", lat: 26.2124, lng: 127.6809 },
];

export function getPrefectureByCode(code: string): Prefecture | undefined {
  return PREFECTURES.find((p) => p.code === code);
}

export async function checkRainy(lat: number, lng: number): Promise<boolean> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=weather_code&timezone=Asia%2FTokyo`,
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) return false;
    const data = await res.json() as { current?: { weather_code?: number } };
    const code = data.current?.weather_code ?? 0;
    return code >= 51;
  } catch {
    return false;
  }
}
