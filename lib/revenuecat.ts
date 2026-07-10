import Purchases, {
  type CustomerInfo,
  type PurchasesOffering,
  LOG_LEVEL,
} from "react-native-purchases";
import { Platform } from "react-native";
import { getRuntimeConfig } from "./runtimeConfig";
import { resolveRevenueCatConfig } from "./revenuecatConfig";

export type RCOffering = PurchasesOffering;

let _configured = false;
let _lastConfigError: string | null = null;
let _lastSyncedAppUserId: string | null = null;

export function configureRevenueCat() {
  if (_configured) return;
  const runtimeConfig = getRuntimeConfig();
  const config = resolveRevenueCatConfig(Platform.OS, runtimeConfig);
  if (!config.configured) {
    _lastConfigError = config.error ?? "RevenueCat is not configured";
    console.warn(`[RevenueCat] ${_lastConfigError}`);
    return;
  }

  Purchases.setLogLevel(runtimeConfig.appEnv === "production" ? LOG_LEVEL.WARN : LOG_LEVEL.DEBUG);
  Purchases.configure({ apiKey: config.apiKey });
  _configured = true;
  _lastConfigError = null;
}

export async function checkProEntitlement(): Promise<boolean> {
  configureRevenueCat();
  if (_lastConfigError) return false;
  try {
    const config = resolveRevenueCatConfig(Platform.OS, getRuntimeConfig());
    const customerInfo: CustomerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active[config.entitlementId] !== undefined;
  } catch {
    return false;
  }
}

export async function syncRevenueCatUser(appUserId: string | null | undefined): Promise<void> {
  configureRevenueCat();
  if (_lastConfigError || !appUserId || _lastSyncedAppUserId === appUserId) return;

  try {
    await Purchases.logIn(appUserId);
    _lastSyncedAppUserId = appUserId;
  } catch {
    // Entitlement checks handle unavailable RevenueCat state without blocking the app.
  }
}

export async function getOfferings(): Promise<PurchasesOffering | null> {
  configureRevenueCat();
  if (_lastConfigError) return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current ?? null;
  } catch {
    return null;
  }
}

export async function purchasePackage(
  packageToPurchase: NonNullable<PurchasesOffering["monthly"] | PurchasesOffering["annual"]>,
): Promise<{ success: boolean; isPro: boolean; error?: string }> {
  configureRevenueCat();
  if (_lastConfigError) return { success: false, isPro: false, error: _lastConfigError };
  try {
    const config = resolveRevenueCatConfig(Platform.OS, getRuntimeConfig());
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    const isPro = customerInfo.entitlements.active[config.entitlementId] !== undefined;
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
  configureRevenueCat();
  if (_lastConfigError) return { success: false, isPro: false, error: _lastConfigError };
  try {
    const config = resolveRevenueCatConfig(Platform.OS, getRuntimeConfig());
    const customerInfo = await Purchases.restorePurchases();
    const isPro = customerInfo.entitlements.active[config.entitlementId] !== undefined;
    return { success: true, isPro };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Restore failed";
    return { success: false, isPro: false, error: message };
  }
}
