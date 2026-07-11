import { afterEach, describe, expect, it, vi } from "vitest";

type PurchasesMock = {
  configure: ReturnType<typeof vi.fn>;
  getCustomerInfo: ReturnType<typeof vi.fn>;
  getOfferings: ReturnType<typeof vi.fn>;
  logIn: ReturnType<typeof vi.fn>;
  logOut: ReturnType<typeof vi.fn>;
  purchasePackage: ReturnType<typeof vi.fn>;
  restorePurchases: ReturnType<typeof vi.fn>;
  setLogLevel: ReturnType<typeof vi.fn>;
};

const mocks = vi.hoisted(() => ({
  platform: { OS: "ios" as "ios" | "android" | "web" },
  purchases: {
    configure: vi.fn(),
    getCustomerInfo: vi.fn(),
    getOfferings: vi.fn(),
    logIn: vi.fn(),
    logOut: vi.fn(),
    purchasePackage: vi.fn(),
    restorePurchases: vi.fn(),
    setLogLevel: vi.fn(),
  },
}));

vi.mock("react-native", () => ({
  Platform: mocks.platform,
}));

vi.mock("react-native-purchases", () => ({
  default: mocks.purchases,
  LOG_LEVEL: {
    DEBUG: "DEBUG",
    WARN: "WARN",
  },
}));

function customerInfo(activeEntitlements: Record<string, unknown>) {
  return {
    entitlements: {
      active: activeEntitlements,
    },
  };
}

async function loadRevenueCat(platform: "ios" | "android" | "web" = "ios") {
  vi.resetModules();
  mocks.platform.OS = platform;
  vi.stubEnv("EXPO_PUBLIC_APP_ENV", "preview");
  vi.stubEnv("EXPO_PUBLIC_REVENUECAT_IOS_KEY", "appl_test_key");
  vi.stubEnv("EXPO_PUBLIC_REVENUECAT_ANDROID_KEY", "goog_test_key");
  vi.stubEnv("EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID", "pro");

  const revenuecat = await import("./revenuecat");
  return { purchases: mocks.purchases as PurchasesMock, revenuecat };
}

describe("revenuecat wrapper", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("detects the configured Pro entitlement after purchase", async () => {
    const { purchases, revenuecat } = await loadRevenueCat();
    purchases.purchasePackage.mockResolvedValue({
      customerInfo: customerInfo({ pro: {} }),
    });

    const result = await revenuecat.purchasePackage({} as never);

    expect(result).toEqual({ success: true, isPro: true });
    expect(purchases.configure).toHaveBeenCalledWith({ apiKey: "appl_test_key" });
  });

  it("does not unlock Pro when the purchase is cancelled", async () => {
    const { purchases, revenuecat } = await loadRevenueCat();
    purchases.purchasePackage.mockRejectedValue({ userCancelled: true });

    await expect(revenuecat.purchasePackage({} as never)).resolves.toEqual({
      success: false,
      isPro: false,
    });
  });

  it("returns purchase errors without throwing", async () => {
    const { purchases, revenuecat } = await loadRevenueCat();
    purchases.purchasePackage.mockRejectedValue(new Error("Store unavailable"));

    await expect(revenuecat.purchasePackage({} as never)).resolves.toEqual({
      success: false,
      isPro: false,
      error: "Store unavailable",
    });
  });

  it("detects restored Pro entitlements", async () => {
    const { purchases, revenuecat } = await loadRevenueCat("android");
    purchases.restorePurchases.mockResolvedValue(customerInfo({ pro: {} }));

    const result = await revenuecat.restorePurchases();

    expect(result).toEqual({ success: true, isPro: true });
    expect(purchases.configure).toHaveBeenCalledWith({ apiKey: "goog_test_key" });
  });

  it("returns null offerings when RevenueCat is unsupported", async () => {
    const { purchases, revenuecat } = await loadRevenueCat("web");

    await expect(revenuecat.getOfferings()).resolves.toBeNull();
    expect(purchases.getOfferings).not.toHaveBeenCalled();
  });
});
