"use client";

const PRO_PRODUCT_ID = "com.kakeru.app.pro.monthly";
const REVENUECAT_API_KEY = "appl_cAeecpmNAdUxmvFKwwhUYgMEKkH";

export function isCapacitorIOS(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (window as { Capacitor?: { isNativePlatform?: () => boolean; getPlatform?: () => string } }).Capacitor;
  return !!cap?.isNativePlatform?.() && cap?.getPlatform?.() === "ios";
}

let configured = false;

export async function ensureRevenueCatConfigured(userId: string) {
  if (!isCapacitorIOS()) return;
  const { Purchases, LOG_LEVEL } = await import("@revenuecat/purchases-capacitor");
  if (!configured) {
    await Purchases.setLogLevel({ level: LOG_LEVEL.WARN });
    await Purchases.configure({ apiKey: REVENUECAT_API_KEY, appUserID: userId });
    configured = true;
  } else {
    await Purchases.logIn({ appUserID: userId });
  }
}

async function syncSubscriptionToBackend(): Promise<boolean> {
  try {
    const res = await fetch("/api/iap/sync", { method: "POST" });
    if (!res.ok) return false;
    const data = (await res.json()) as { is_subscribed?: boolean };
    return !!data.is_subscribed;
  } catch (e) {
    console.error("[IAP] sync failed", e);
    return false;
  }
}

async function pollSyncUntilActive(maxAttempts = 5, intervalMs = 1500): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    const ok = await syncSubscriptionToBackend();
    if (ok) return true;
    if (i < maxAttempts - 1) await new Promise(r => setTimeout(r, intervalMs));
  }
  return false;
}

export async function purchaseProMonthly(userId: string): Promise<"success" | "cancelled" | "error"> {
  if (!isCapacitorIOS()) return "error";
  try {
    const { Purchases, PURCHASES_ERROR_CODE } = await import("@revenuecat/purchases-capacitor");
    await ensureRevenueCatConfigured(userId);
    const { products } = await Purchases.getProducts({ productIdentifiers: [PRO_PRODUCT_ID] });
    if (!products.length) {
      alert("[KAKERU] サブスクリプション商品が取得できません");
      return "error";
    }
    try {
      await Purchases.purchaseStoreProduct({ product: products[0] });
      const synced = await pollSyncUntilActive();
      if (!synced) {
        alert("[KAKERU] 購入は成功しましたがサーバー反映に失敗しました。アプリを再起動して「購入を復元する」を押してください。");
        return "error";
      }
      return "success";
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) return "cancelled";
      throw err;
    }
  } catch (e) {
    console.error("[IAP] purchase failed", e);
    alert(`[KAKERU] 購入処理に失敗: ${(e as Error)?.message ?? e}`);
    return "error";
  }
}

export async function restoreProPurchases(userId: string): Promise<boolean> {
  if (!isCapacitorIOS()) return false;
  try {
    const { Purchases } = await import("@revenuecat/purchases-capacitor");
    await ensureRevenueCatConfigured(userId);
    await Purchases.restorePurchases();
    return await pollSyncUntilActive();
  } catch (e) {
    console.error("[IAP] restore failed", e);
    return false;
  }
}
