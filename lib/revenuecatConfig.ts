export type RevenueCatRuntimeConfig = {
  revenueCatIosKey: string;
  revenueCatAndroidKey: string;
  revenueCatEntitlementId: string;
};

export type RevenueCatPlatform = "ios" | "android" | "web" | "windows" | "macos";

export type RevenueCatConfig = {
  apiKey: string;
  entitlementId: string;
  configured: boolean;
  error?: string;
};

export function resolveRevenueCatConfig(
  platform: RevenueCatPlatform,
  runtimeConfig: RevenueCatRuntimeConfig,
): RevenueCatConfig {
  const entitlementId = runtimeConfig.revenueCatEntitlementId.trim();
  if (!entitlementId) {
    return {
      apiKey: "",
      entitlementId,
      configured: false,
      error: "EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID is missing",
    };
  }

  if (platform !== "ios" && platform !== "android") {
    return {
      apiKey: "",
      entitlementId,
      configured: false,
      error: `RevenueCat is not supported on ${platform}`,
    };
  }

  const keyName =
    platform === "ios" ? "EXPO_PUBLIC_REVENUECAT_IOS_KEY" : "EXPO_PUBLIC_REVENUECAT_ANDROID_KEY";
  const apiKey =
    platform === "ios"
      ? runtimeConfig.revenueCatIosKey.trim()
      : runtimeConfig.revenueCatAndroidKey.trim();

  if (!apiKey) {
    return {
      apiKey: "",
      entitlementId,
      configured: false,
      error: `${keyName} is missing`,
    };
  }

  return {
    apiKey,
    entitlementId,
    configured: true,
  };
}
