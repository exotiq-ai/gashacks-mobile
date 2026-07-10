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
};

type ConfigHealth = {
  appEnvPresent: boolean;
  production: boolean;
  supabaseUrlPresent: boolean;
  supabaseUrlLooksValid: boolean;
  supabaseAnonKeyPresent: boolean;
  supabaseAnonKeyLooksValid: boolean;
  googleClientIdPresent: boolean;
  googleClientIdLooksValid: boolean;
  receiptScanApiUrlPresent: boolean;
  receiptScanApiUrlLooksValid: boolean;
  stationsApiUrlPresent: boolean;
  stationsApiUrlLooksValid: boolean;
  accountDeleteApiUrlPresent: boolean;
  accountDeleteApiUrlLooksValid: boolean;
  revenueCatIosKeyPresent: boolean;
  revenueCatAndroidKeyPresent: boolean;
  revenueCatEntitlementIdPresent: boolean;
  skipAuthDisabledForProduction: boolean;
  ok: boolean;
};

const DEFAULT_REVENUECAT_ENTITLEMENT_ID = "Gas Hacks Pro";
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

function looksLikeHttpsUrl(value: string) {
  return value.startsWith("https://");
}

function readEnv() {
  const appEnv = process.env.EXPO_PUBLIC_APP_ENV || "development";
  const production = isProduction(appEnv);
  const skipAuthRequested = truthyEnv(process.env.EXPO_PUBLIC_SKIP_AUTH);

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
    skipAuth: production ? false : skipAuthRequested,
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
    googleClientIdPresent: Boolean(env.googleWebClientId),
    googleClientIdLooksValid: env.googleWebClientId.endsWith(".apps.googleusercontent.com"),
    receiptScanApiUrlPresent: Boolean(env.receiptScanApiUrl),
    receiptScanApiUrlLooksValid: !env.receiptScanApiUrl || looksLikeHttpsUrl(env.receiptScanApiUrl),
    stationsApiUrlPresent: Boolean(env.stationsApiUrl),
    stationsApiUrlLooksValid: !env.stationsApiUrl || looksLikeHttpsUrl(env.stationsApiUrl),
    accountDeleteApiUrlPresent: Boolean(env.accountDeleteApiUrl),
    accountDeleteApiUrlLooksValid: !env.accountDeleteApiUrl || looksLikeHttpsUrl(env.accountDeleteApiUrl),
    revenueCatIosKeyPresent: Boolean(env.revenueCatIosKey),
    revenueCatAndroidKeyPresent: Boolean(env.revenueCatAndroidKey),
    revenueCatEntitlementIdPresent: Boolean(env.revenueCatEntitlementId),
    skipAuthDisabledForProduction: !env.production || !env.skipAuthRequested,
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
    health.skipAuthDisabledForProduction;

  health.ok = env.production
    ? commonOk &&
      health.receiptScanApiUrlPresent &&
      health.receiptScanApiUrlLooksValid &&
      health.stationsApiUrlPresent &&
      health.stationsApiUrlLooksValid &&
      health.accountDeleteApiUrlPresent &&
      health.accountDeleteApiUrlLooksValid &&
      health.revenueCatIosKeyPresent &&
      health.revenueCatAndroidKeyPresent &&
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
  if (!health.googleClientIdPresent) issues.push("EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is missing");
  if (health.googleClientIdPresent && !health.googleClientIdLooksValid) {
    issues.push("EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID format is unexpected");
  }
  if (health.production && !health.receiptScanApiUrlPresent) {
    issues.push("EXPO_PUBLIC_RECEIPT_SCAN_API_URL is missing");
  }
  if (health.receiptScanApiUrlPresent && !health.receiptScanApiUrlLooksValid) {
    issues.push("EXPO_PUBLIC_RECEIPT_SCAN_API_URL must start with https://");
  }
  if (health.production && !health.stationsApiUrlPresent) {
    issues.push("EXPO_PUBLIC_STATIONS_API_URL is missing");
  }
  if (health.stationsApiUrlPresent && !health.stationsApiUrlLooksValid) {
    issues.push("EXPO_PUBLIC_STATIONS_API_URL must start with https://");
  }
  if (health.production && !health.accountDeleteApiUrlPresent) {
    issues.push("EXPO_PUBLIC_ACCOUNT_DELETE_API_URL is missing");
  }
  if (health.accountDeleteApiUrlPresent && !health.accountDeleteApiUrlLooksValid) {
    issues.push("EXPO_PUBLIC_ACCOUNT_DELETE_API_URL must start with https://");
  }
  if (health.production && !health.revenueCatIosKeyPresent) {
    issues.push("EXPO_PUBLIC_REVENUECAT_IOS_KEY is missing");
  }
  if (health.production && !health.revenueCatAndroidKeyPresent) {
    issues.push("EXPO_PUBLIC_REVENUECAT_ANDROID_KEY is missing");
  }
  if (!health.revenueCatEntitlementIdPresent) {
    issues.push("EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID is missing");
  }
  if (!health.skipAuthDisabledForProduction) {
    issues.push("EXPO_PUBLIC_SKIP_AUTH cannot be enabled in production");
  }

  return issues;
}
