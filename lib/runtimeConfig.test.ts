import { afterEach, describe, expect, it, vi } from "vitest";
import { getConfigHealth, getConfigIssues, getRuntimeConfig } from "./runtimeConfig";

describe("runtime config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  const productionSupabaseAnonKey = "sb_publishable_livevalue";
  const productionGoogleClientId = "1234567890-production.apps.googleusercontent.com";
  const productionRevenueCatIosKey = "appl_livevalue";
  const productionRevenueCatAndroidKey = "goog_livevalue";

  it("does not silently fall back to production Supabase credentials", () => {
    vi.stubEnv("EXPO_PUBLIC_APP_ENV", "production");
    vi.stubEnv("EXPO_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY", "");
    vi.stubEnv("EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID", "");

    const config = getRuntimeConfig();
    const issues = getConfigIssues();

    expect(config.supabaseUrl).toBe("");
    expect(config.supabaseAnonKey).toBe("");
    expect(issues).toContain("EXPO_PUBLIC_SUPABASE_URL is missing");
    expect(issues).toContain("EXPO_PUBLIC_SUPABASE_ANON_KEY is missing");
  });

  it("prevents skip-auth tester mode in production", () => {
    vi.stubEnv("EXPO_PUBLIC_APP_ENV", "production");
    vi.stubEnv("EXPO_PUBLIC_SKIP_AUTH", "true");

    expect(getRuntimeConfig().skipAuth).toBe(false);
    expect(getConfigIssues()).toContain("EXPO_PUBLIC_SKIP_AUTH cannot be enabled in production");
  });

  it("prevents Pro tester mode in production", () => {
    vi.stubEnv("EXPO_PUBLIC_APP_ENV", "production");
    vi.stubEnv("EXPO_PUBLIC_UNLOCK_PRO_FOR_TESTING", "true");

    expect(getRuntimeConfig().unlockProForTesting).toBe(false);
    expect(getConfigIssues()).toContain(
      "EXPO_PUBLIC_UNLOCK_PRO_FOR_TESTING cannot be enabled in production",
    );
  });

  it("requires native release service configuration for production", () => {
    vi.stubEnv("EXPO_PUBLIC_APP_ENV", "production");
    vi.stubEnv("EXPO_PUBLIC_SUPABASE_URL", "https://feicgarueqllkpzgewul.supabase.co");
    vi.stubEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY", productionSupabaseAnonKey);
    vi.stubEnv("EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID", productionGoogleClientId);
    vi.stubEnv("EXPO_PUBLIC_RECEIPT_SCAN_API_URL", "");
    vi.stubEnv("EXPO_PUBLIC_STATIONS_API_URL", "");
    vi.stubEnv("EXPO_PUBLIC_ACCOUNT_DELETE_API_URL", "");
    vi.stubEnv("EXPO_PUBLIC_REVENUECAT_IOS_KEY", "");
    vi.stubEnv("EXPO_PUBLIC_REVENUECAT_ANDROID_KEY", "");

    const health = getConfigHealth();

    expect(health.ok).toBe(false);
    expect(getConfigIssues()).toEqual(
      expect.arrayContaining([
        "EXPO_PUBLIC_RECEIPT_SCAN_API_URL is missing",
        "EXPO_PUBLIC_STATIONS_API_URL is missing",
        "EXPO_PUBLIC_ACCOUNT_DELETE_API_URL is missing",
        "EXPO_PUBLIC_REVENUECAT_IOS_KEY is missing",
        "EXPO_PUBLIC_REVENUECAT_ANDROID_KEY is missing",
      ]),
    );
  });

  it("allows Netlify function paths for non-production web previews", () => {
    vi.stubEnv("EXPO_PUBLIC_APP_ENV", "preview");
    vi.stubEnv("EXPO_PUBLIC_SUPABASE_URL", "https://feicgarueqllkpzgewul.supabase.co");
    vi.stubEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY", "sb_publishable_test");
    vi.stubEnv("EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID", "client.apps.googleusercontent.com");
    vi.stubEnv("EXPO_PUBLIC_RECEIPT_SCAN_API_URL", "/.netlify/functions/receipt-scan");
    vi.stubEnv("EXPO_PUBLIC_STATIONS_API_URL", "/.netlify/functions/stations");
    vi.stubEnv("EXPO_PUBLIC_ACCOUNT_DELETE_API_URL", "/.netlify/functions/delete-account");

    const issues = getConfigIssues();

    expect(issues).not.toContain("EXPO_PUBLIC_RECEIPT_SCAN_API_URL must start with https://");
    expect(issues).not.toContain("EXPO_PUBLIC_STATIONS_API_URL must start with https://");
    expect(issues).not.toContain("EXPO_PUBLIC_ACCOUNT_DELETE_API_URL must start with https://");
  });

  it("requires absolute API URLs for production releases", () => {
    vi.stubEnv("EXPO_PUBLIC_APP_ENV", "production");
    vi.stubEnv("EXPO_PUBLIC_SUPABASE_URL", "https://feicgarueqllkpzgewul.supabase.co");
    vi.stubEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY", productionSupabaseAnonKey);
    vi.stubEnv("EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID", productionGoogleClientId);
    vi.stubEnv("EXPO_PUBLIC_RECEIPT_SCAN_API_URL", "/.netlify/functions/receipt-scan");
    vi.stubEnv("EXPO_PUBLIC_STATIONS_API_URL", "/.netlify/functions/stations");
    vi.stubEnv("EXPO_PUBLIC_ACCOUNT_DELETE_API_URL", "/.netlify/functions/delete-account");

    expect(getConfigIssues()).toEqual(
      expect.arrayContaining([
        "EXPO_PUBLIC_RECEIPT_SCAN_API_URL must start with https://",
        "EXPO_PUBLIC_STATIONS_API_URL must start with https://",
        "EXPO_PUBLIC_ACCOUNT_DELETE_API_URL must start with https://",
      ]),
    );
  });

  it("rejects preview API hosts for production releases", () => {
    vi.stubEnv("EXPO_PUBLIC_APP_ENV", "production");
    vi.stubEnv("EXPO_PUBLIC_SUPABASE_URL", "https://feicgarueqllkpzgewul.supabase.co");
    vi.stubEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY", productionSupabaseAnonKey);
    vi.stubEnv("EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID", productionGoogleClientId);
    vi.stubEnv(
      "EXPO_PUBLIC_RECEIPT_SCAN_API_URL",
      "https://gashacks-mobile-preview.netlify.app/.netlify/functions/receipt-scan",
    );
    vi.stubEnv(
      "EXPO_PUBLIC_STATIONS_API_URL",
      "https://gashacks-mobile-preview.netlify.app/.netlify/functions/stations",
    );
    vi.stubEnv(
      "EXPO_PUBLIC_ACCOUNT_DELETE_API_URL",
      "https://gashacks-mobile-preview.netlify.app/.netlify/functions/delete-account",
    );
    vi.stubEnv("EXPO_PUBLIC_REVENUECAT_IOS_KEY", productionRevenueCatIosKey);
    vi.stubEnv("EXPO_PUBLIC_REVENUECAT_ANDROID_KEY", productionRevenueCatAndroidKey);

    expect(getConfigHealth().ok).toBe(false);
    expect(getConfigIssues()).toEqual(
      expect.arrayContaining([
        "EXPO_PUBLIC_RECEIPT_SCAN_API_URL must not point at the preview Netlify host",
        "EXPO_PUBLIC_STATIONS_API_URL must not point at the preview Netlify host",
        "EXPO_PUBLIC_ACCOUNT_DELETE_API_URL must not point at the preview Netlify host",
      ]),
    );
  });

  it("rejects placeholder public keys for production releases", () => {
    vi.stubEnv("EXPO_PUBLIC_APP_ENV", "production");
    vi.stubEnv("EXPO_PUBLIC_SUPABASE_URL", "https://feicgarueqllkpzgewul.supabase.co");
    vi.stubEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY", "sb_publishable_test");
    vi.stubEnv("EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID", "client.apps.googleusercontent.com");
    vi.stubEnv("EXPO_PUBLIC_RECEIPT_SCAN_API_URL", "https://api.gashacks.app/receipt-scan");
    vi.stubEnv("EXPO_PUBLIC_STATIONS_API_URL", "https://api.gashacks.app/stations");
    vi.stubEnv("EXPO_PUBLIC_ACCOUNT_DELETE_API_URL", "https://api.gashacks.app/delete-account");
    vi.stubEnv("EXPO_PUBLIC_REVENUECAT_IOS_KEY", "appl_test");
    vi.stubEnv("EXPO_PUBLIC_REVENUECAT_ANDROID_KEY", "goog_test");

    expect(getConfigHealth().ok).toBe(false);
    expect(getConfigIssues()).toEqual(
      expect.arrayContaining([
        "EXPO_PUBLIC_SUPABASE_ANON_KEY must not be a placeholder or test value",
        "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID must not be a placeholder or test value",
        "EXPO_PUBLIC_REVENUECAT_IOS_KEY must not be a placeholder or test value",
        "EXPO_PUBLIC_REVENUECAT_ANDROID_KEY must not be a placeholder or test value",
      ]),
    );
  });
});
