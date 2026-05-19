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

export async function purchaseProMonthly(userId: string): Promise<"success" | "cancelled" | "error"> {
  if (!isCapacitorIOS()) return "error";
  try {
    const { Purchases, PURCHASES_ERROR_CODE } = await import("@revenuecat/purchases-capacitor");
    await ensureRevenueCatConfigured(userId);
    const { products } = await Purchases.getProducts({ productIdentifiers: [PRO_PRODUCT_ID] });
    if (!products.length) return "error";
    try {
      await Purchases.purchaseStoreProduct({ product: products[0] });
      return "success";
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) return "cancelled";
      throw err;
    }
  } catch (e) {
    console.error("[IAP] purchase failed", e);
    return "error";
  }
}

export async function restoreProPurchases(userId: string): Promise<boolean> {
  if (!isCapacitorIOS()) return false;
  try {
    const { Purchases } = await import("@revenuecat/purchases-capacitor");
    await ensureRevenueCatConfigured(userId);
    const customerInfo = await Purchases.restorePurchases();
    return !!customerInfo.customerInfo.entitlements.active["pro"];
  } catch (e) {
    console.error("[IAP] restore failed", e);
    return false;
  }
}
