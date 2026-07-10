import { afterEach, describe, expect, it, vi } from "vitest";
import { getConfigHealth, getConfigIssues, getRuntimeConfig } from "./runtimeConfig";

describe("runtime config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

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

  it("requires native release service configuration for production", () => {
    vi.stubEnv("EXPO_PUBLIC_APP_ENV", "production");
    vi.stubEnv("EXPO_PUBLIC_SUPABASE_URL", "https://feicgarueqllkpzgewul.supabase.co");
    vi.stubEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY", "sb_publishable_test");
    vi.stubEnv("EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID", "client.apps.googleusercontent.com");
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
});
