export type RuntimeConfig = {
  appEnv: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  googleWebClientId: string;
  receiptScanApiUrl: string;
  stationsApiUrl: string;
  accountDeleteApiUrl: string;
  revenueCatIosKey: string;
  revenueCatAndroidKey: string;
  revenueCatEntitlementId: string;
  skipAuth: boolean;
  unlockProForTesting: boolean;
};

type ConfigHealth = {
  appEnvPresent: boolean;
  production: boolean;
  supabaseUrlPresent: boolean;
  supabaseUrlLooksValid: boolean;
  supabaseAnonKeyPresent: boolean;
  supabaseAnonKeyLooksValid: boolean;
  supabaseAnonKeyLooksPlaceholder: boolean;
  googleClientIdPresent: boolean;
  googleClientIdLooksValid: boolean;
  googleClientIdLooksPlaceholder: boolean;
  receiptScanApiUrlPresent: boolean;
  receiptScanApiUrlLooksValid: boolean;
  receiptScanApiUrlUsesPreviewHost: boolean;
  stationsApiUrlPresent: boolean;
  stationsApiUrlLooksValid: boolean;
  stationsApiUrlUsesPreviewHost: boolean;
  accountDeleteApiUrlPresent: boolean;
  accountDeleteApiUrlLooksValid: boolean;
  accountDeleteApiUrlUsesPreviewHost: boolean;
  revenueCatIosKeyPresent: boolean;
  revenueCatIosKeyLooksPlaceholder: boolean;
  revenueCatAndroidKeyPresent: boolean;
  revenueCatAndroidKeyLooksPlaceholder: boolean;
  revenueCatEntitlementIdPresent: boolean;
  skipAuthDisabledForProduction: boolean;
  proTestingDisabledForProduction: boolean;
  ok: boolean;
};

const DEFAULT_REVENUECAT_ENTITLEMENT_ID = "pro";
const PREVIEW_SUPABASE_URL = "https://feicgarueqllkpzgewul.supabase.co";

function isProduction(appEnv: string) {
  return appEnv.trim().toLowerCase() === "production";
}

function envOrDefault(value: string | undefined, fallback: string, production: boolean) {
  if (value && value.trim().length > 0) return value.trim();
  return production ? "" : fallback;
}

function truthyEnv(value: string | undefined) {
  const normalized = (value ?? "").toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

function looksLikeApiUrl(value: string, production: boolean) {
  if (value.startsWith("https://")) return true;
  return !production && value.startsWith("/.netlify/functions/");
}

function usesPreviewHost(value: string) {
  return value.includes("gashacks-mobile-preview.netlify.app");
}

function looksLikePlaceholder(value: string) {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return false;
  return (
    normalized.includes("placeholder") ||
    normalized.includes("your-") ||
    normalized.endsWith("_test") ||
    normalized === "test" ||
    normalized === "client.apps.googleusercontent.com"
  );
}

function readEnv() {
  const appEnv = process.env.EXPO_PUBLIC_APP_ENV || "development";
  const production = isProduction(appEnv);
  const skipAuthRequested = truthyEnv(process.env.EXPO_PUBLIC_SKIP_AUTH);
  const unlockProForTestingRequested = truthyEnv(process.env.EXPO_PUBLIC_UNLOCK_PRO_FOR_TESTING);

  return {
    appEnv,
    production,
    supabaseUrl: envOrDefault(
      process.env.EXPO_PUBLIC_SUPABASE_URL,
      PREVIEW_SUPABASE_URL,
      production,
    ),
    supabaseAnonKey: envOrDefault(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY, "", production),
    googleWebClientId: envOrDefault(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, "", production),
    receiptScanApiUrl: envOrDefault(process.env.EXPO_PUBLIC_RECEIPT_SCAN_API_URL, "", production),
    stationsApiUrl: envOrDefault(process.env.EXPO_PUBLIC_STATIONS_API_URL, "", production),
    accountDeleteApiUrl: envOrDefault(process.env.EXPO_PUBLIC_ACCOUNT_DELETE_API_URL, "", production),
    revenueCatIosKey: envOrDefault(process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY, "", production),
    revenueCatAndroidKey: envOrDefault(process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY, "", production),
    revenueCatEntitlementId:
      process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID?.trim() || DEFAULT_REVENUECAT_ENTITLEMENT_ID,
    skipAuthRequested,
    unlockProForTestingRequested,
    skipAuth: production ? false : skipAuthRequested,
    unlockProForTesting: production ? false : unlockProForTestingRequested,
  };
}

export function getConfigHealth(): ConfigHealth {
  const env = readEnv();
  const health: ConfigHealth = {
    appEnvPresent: Boolean(env.appEnv),
    production: env.production,
    supabaseUrlPresent: Boolean(env.supabaseUrl),
    supabaseUrlLooksValid:
      env.supabaseUrl.startsWith("https://") && env.supabaseUrl.includes(".supabase.co"),
    supabaseAnonKeyPresent: Boolean(env.supabaseAnonKey),
    supabaseAnonKeyLooksValid:
      env.supabaseAnonKey.startsWith("sb_publishable_") ||
      env.supabaseAnonKey.startsWith("eyJ"),
    supabaseAnonKeyLooksPlaceholder: looksLikePlaceholder(env.supabaseAnonKey),
    googleClientIdPresent: Boolean(env.googleWebClientId),
    googleClientIdLooksValid: env.googleWebClientId.endsWith(".apps.googleusercontent.com"),
    googleClientIdLooksPlaceholder: looksLikePlaceholder(env.googleWebClientId),
    receiptScanApiUrlPresent: Boolean(env.receiptScanApiUrl),
    receiptScanApiUrlLooksValid:
      !env.receiptScanApiUrl || looksLikeApiUrl(env.receiptScanApiUrl, env.production),
    receiptScanApiUrlUsesPreviewHost: usesPreviewHost(env.receiptScanApiUrl),
    stationsApiUrlPresent: Boolean(env.stationsApiUrl),
    stationsApiUrlLooksValid:
      !env.stationsApiUrl || looksLikeApiUrl(env.stationsApiUrl, env.production),
    stationsApiUrlUsesPreviewHost: usesPreviewHost(env.stationsApiUrl),
    accountDeleteApiUrlPresent: Boolean(env.accountDeleteApiUrl),
    accountDeleteApiUrlLooksValid:
      !env.accountDeleteApiUrl || looksLikeApiUrl(env.accountDeleteApiUrl, env.production),
    accountDeleteApiUrlUsesPreviewHost: usesPreviewHost(env.accountDeleteApiUrl),
    revenueCatIosKeyPresent: Boolean(env.revenueCatIosKey),
    revenueCatIosKeyLooksPlaceholder: looksLikePlaceholder(env.revenueCatIosKey),
    revenueCatAndroidKeyPresent: Boolean(env.revenueCatAndroidKey),
    revenueCatAndroidKeyLooksPlaceholder: looksLikePlaceholder(env.revenueCatAndroidKey),
    revenueCatEntitlementIdPresent: Boolean(env.revenueCatEntitlementId),
    skipAuthDisabledForProduction: !env.production || !env.skipAuthRequested,
    proTestingDisabledForProduction: !env.production || !env.unlockProForTestingRequested,
    ok: false,
  };

  const commonOk =
    health.appEnvPresent &&
    health.supabaseUrlPresent &&
    health.supabaseUrlLooksValid &&
    health.supabaseAnonKeyPresent &&
    health.supabaseAnonKeyLooksValid &&
    health.googleClientIdPresent &&
    health.googleClientIdLooksValid &&
    health.skipAuthDisabledForProduction &&
    health.proTestingDisabledForProduction;

  health.ok = env.production
    ? commonOk &&
      !health.supabaseAnonKeyLooksPlaceholder &&
      !health.googleClientIdLooksPlaceholder &&
      health.receiptScanApiUrlPresent &&
      health.receiptScanApiUrlLooksValid &&
      !health.receiptScanApiUrlUsesPreviewHost &&
      health.stationsApiUrlPresent &&
      health.stationsApiUrlLooksValid &&
      !health.stationsApiUrlUsesPreviewHost &&
      health.accountDeleteApiUrlPresent &&
      health.accountDeleteApiUrlLooksValid &&
      !health.accountDeleteApiUrlUsesPreviewHost &&
      health.revenueCatIosKeyPresent &&
      !health.revenueCatIosKeyLooksPlaceholder &&
      health.revenueCatAndroidKeyPresent &&
      !health.revenueCatAndroidKeyLooksPlaceholder &&
      health.revenueCatEntitlementIdPresent
    : commonOk;

  return health;
}

export function getRuntimeConfig(): RuntimeConfig {
  const env = readEnv();
  return {
    appEnv: env.appEnv || "development",
    supabaseUrl: env.supabaseUrl,
    supabaseAnonKey: env.supabaseAnonKey,
    googleWebClientId: env.googleWebClientId,
    receiptScanApiUrl: env.receiptScanApiUrl,
    stationsApiUrl: env.stationsApiUrl,
    accountDeleteApiUrl: env.accountDeleteApiUrl,
    revenueCatIosKey: env.revenueCatIosKey,
    revenueCatAndroidKey: env.revenueCatAndroidKey,
    revenueCatEntitlementId: env.revenueCatEntitlementId,
    skipAuth: env.skipAuth,
    unlockProForTesting: env.unlockProForTesting,
  };
}

export function getConfigIssues(): string[] {
  const health = getConfigHealth();
  const issues: string[] = [];

  if (!health.appEnvPresent) issues.push("EXPO_PUBLIC_APP_ENV is missing");
  if (!health.supabaseUrlPresent) issues.push("EXPO_PUBLIC_SUPABASE_URL is missing");
  if (health.supabaseUrlPresent && !health.supabaseUrlLooksValid) {
    issues.push("EXPO_PUBLIC_SUPABASE_URL is not a valid Supabase URL");
  }
  if (!health.supabaseAnonKeyPresent) issues.push("EXPO_PUBLIC_SUPABASE_ANON_KEY is missing");
  if (health.supabaseAnonKeyPresent && !health.supabaseAnonKeyLooksValid) {
    issues.push("EXPO_PUBLIC_SUPABASE_ANON_KEY format is unexpected");
  }
  if (health.production && health.supabaseAnonKeyLooksPlaceholder) {
    issues.push("EXPO_PUBLIC_SUPABASE_ANON_KEY must not be a placeholder or test value");
  }
  if (!health.googleClientIdPresent) issues.push("EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is missing");
  if (health.googleClientIdPresent && !health.googleClientIdLooksValid) {
    issues.push("EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID format is unexpected");
  }
  if (health.production && health.googleClientIdLooksPlaceholder) {
    issues.push("EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID must not be a placeholder or test value");
  }
  if (health.production && !health.receiptScanApiUrlPresent) {
    issues.push("EXPO_PUBLIC_RECEIPT_SCAN_API_URL is missing");
  }
  if (health.receiptScanApiUrlPresent && !health.receiptScanApiUrlLooksValid) {
    issues.push("EXPO_PUBLIC_RECEIPT_SCAN_API_URL must start with https://");
  }
  if (health.production && health.receiptScanApiUrlUsesPreviewHost) {
    issues.push("EXPO_PUBLIC_RECEIPT_SCAN_API_URL must not point at the preview Netlify host");
  }
  if (health.production && !health.stationsApiUrlPresent) {
    issues.push("EXPO_PUBLIC_STATIONS_API_URL is missing");
  }
  if (health.stationsApiUrlPresent && !health.stationsApiUrlLooksValid) {
    issues.push("EXPO_PUBLIC_STATIONS_API_URL must start with https://");
  }
  if (health.production && health.stationsApiUrlUsesPreviewHost) {
    issues.push("EXPO_PUBLIC_STATIONS_API_URL must not point at the preview Netlify host");
  }
  if (health.production && !health.accountDeleteApiUrlPresent) {
    issues.push("EXPO_PUBLIC_ACCOUNT_DELETE_API_URL is missing");
  }
  if (health.accountDeleteApiUrlPresent && !health.accountDeleteApiUrlLooksValid) {
    issues.push("EXPO_PUBLIC_ACCOUNT_DELETE_API_URL must start with https://");
  }
  if (health.production && health.accountDeleteApiUrlUsesPreviewHost) {
    issues.push("EXPO_PUBLIC_ACCOUNT_DELETE_API_URL must not point at the preview Netlify host");
  }
  if (health.production && !health.revenueCatIosKeyPresent) {
    issues.push("EXPO_PUBLIC_REVENUECAT_IOS_KEY is missing");
  }
  if (health.production && health.revenueCatIosKeyLooksPlaceholder) {
    issues.push("EXPO_PUBLIC_REVENUECAT_IOS_KEY must not be a placeholder or test value");
  }
  if (health.production && !health.revenueCatAndroidKeyPresent) {
    issues.push("EXPO_PUBLIC_REVENUECAT_ANDROID_KEY is missing");
  }
  if (health.production && health.revenueCatAndroidKeyLooksPlaceholder) {
    issues.push("EXPO_PUBLIC_REVENUECAT_ANDROID_KEY must not be a placeholder or test value");
  }
  if (!health.revenueCatEntitlementIdPresent) {
    issues.push("EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID is missing");
  }
  if (!health.skipAuthDisabledForProduction) {
    issues.push("EXPO_PUBLIC_SKIP_AUTH cannot be enabled in production");
  }
  if (!health.proTestingDisabledForProduction) {
    issues.push("EXPO_PUBLIC_UNLOCK_PRO_FOR_TESTING cannot be enabled in production");
  }

  return issues;
}
