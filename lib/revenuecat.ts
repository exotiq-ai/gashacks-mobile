import Purchases, {
  type CustomerInfo,
  type PurchasesOffering,
  LOG_LEVEL,
} from "react-native-purchases";
import { Platform } from "react-native";

const API_KEY_IOS = "test_VzOXyirGzgqMKrsEUZILQBCJLTu";
const API_KEY_ANDROID = "test_VzOXyirGzgqMKrsEUZILQBCJLTu";
const ENTITLEMENT_ID = "Gas Hacks Pro";

export type RCOffering = PurchasesOffering;

let _configured = false;

export function configureRevenueCat() {
  if (_configured) return;
  const apiKey = Platform.OS === "ios" ? API_KEY_IOS : API_KEY_ANDROID;
  Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  Purchases.configure({ apiKey });
  _configured = true;
}

export async function checkProEntitlement(): Promise<boolean> {
  try {
    const customerInfo: CustomerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch {
    return false;
  }
}

export async function getOfferings(): Promise<PurchasesOffering | null> {
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
  try {
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
    const customerInfo = await Purchases.restorePurchases();
    const isPro = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    return { success: true, isPro };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Restore failed";
    return { success: false, isPro: false, error: message };
  }
}
