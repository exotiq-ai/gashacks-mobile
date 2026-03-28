import { Platform } from "react-native";
import { getRuntimeConfig } from "./runtimeConfig";

const API_KEY_IOS = "test_VzOXyirGzgqMKrsEUZILQBCJLTu";
const API_KEY_ANDROID = "test_VzOXyirGzgqMKrsEUZILQBCJLTu";
const ENTITLEMENT_ID = "Gas Hacks Pro";

// Lazy-load react-native-purchases to avoid crash when native module is unavailable
let _Purchases: any = null;
let _configured = false;
let _available = true;

async function getPurchases() {
  if (_Purchases) return _Purchases;
  try {
    const mod = await import("react-native-purchases");
    _Purchases = mod.default;
    return _Purchases;
  } catch {
    _available = false;
    return null;
  }
}

export type RCOffering = any;

export async function configureRevenueCat() {
  if (_configured || !_available) return;
  try {
    const Purchases = await getPurchases();
    if (!Purchases) return;
    const apiKey = Platform.OS === "ios" ? API_KEY_IOS : API_KEY_ANDROID;
    Purchases.configure({ apiKey });
    _configured = true;
  } catch {
    _available = false;
  }
}

export async function checkProEntitlement(): Promise<boolean> {
  const config = getRuntimeConfig();
  if (config.skipAuth) return false; // Demo mode — treat as free
  try {
    const Purchases = await getPurchases();
    if (!Purchases) return false;
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch {
    return false;
  }
}

export async function getOfferings(): Promise<any | null> {
  try {
    const Purchases = await getPurchases();
    if (!Purchases) return null;
    const offerings = await Purchases.getOfferings();
    return offerings.current ?? null;
  } catch {
    return null;
  }
}

export async function purchasePackage(
  packageToPurchase: any,
): Promise<{ success: boolean; isPro: boolean; error?: string }> {
  try {
    const Purchases = await getPurchases();
    if (!Purchases) return { success: false, isPro: false, error: "Purchases not available" };
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    const isPro = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    return { success: true, isPro };
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "userCancelled" in err &&
      (err as { userCancelled: boolean }).userCancelled
    ) {
      return { success: false, isPro: false };
    }
    const message = err instanceof Error ? err.message : "Purchase failed";
    return { success: false, isPro: false, error: message };
  }
}

export async function restorePurchases(): Promise<{ success: boolean; isPro: boolean; error?: string }> {
  try {
    const Purchases = await getPurchases();
    if (!Purchases) return { success: false, isPro: false, error: "Purchases not available" };
    const customerInfo = await Purchases.restorePurchases();
    const isPro = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    return { success: true, isPro };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Restore failed";
    return { success: false, isPro: false, error: message };
  }
}
