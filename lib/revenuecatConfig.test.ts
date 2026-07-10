import { describe, expect, it } from "vitest";
import { resolveRevenueCatConfig } from "./revenuecatConfig";

describe("resolveRevenueCatConfig", () => {
  it("selects platform keys from runtime config", () => {
    const config = resolveRevenueCatConfig("ios", {
      revenueCatIosKey: "appl_ios",
      revenueCatAndroidKey: "goog_android",
      revenueCatEntitlementId: "pro",
    });

    expect(config.apiKey).toBe("appl_ios");
    expect(config.entitlementId).toBe("pro");
    expect(config.configured).toBe(true);
  });

  it("reports missing platform keys before native configuration", () => {
    const config = resolveRevenueCatConfig("android", {
      revenueCatIosKey: "appl_ios",
      revenueCatAndroidKey: "",
      revenueCatEntitlementId: "pro",
    });

    expect(config.configured).toBe(false);
    expect(config.error).toBe("EXPO_PUBLIC_REVENUECAT_ANDROID_KEY is missing");
  });
});
