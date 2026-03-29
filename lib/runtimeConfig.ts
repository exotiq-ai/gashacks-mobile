export type RuntimeConfig = {
  appEnv: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  googleWebClientId: string;
  skipAuth: boolean;
};

type ConfigHealth = {
  appEnvPresent: boolean;
  supabaseUrlPresent: boolean;
  supabaseUrlLooksValid: boolean;
  supabaseAnonKeyPresent: boolean;
  supabaseAnonKeyLooksValid: boolean;
  googleClientIdPresent: boolean;
  googleClientIdLooksValid: boolean;
  ok: boolean;
};

function readEnv() {
  const skipAuthRaw = (process.env.EXPO_PUBLIC_SKIP_AUTH ?? "").toLowerCase();
  // Hardcoded fallbacks ensure the app works even if EAS env vars don't bake in
  return {
    appEnv: process.env.EXPO_PUBLIC_APP_ENV || "production",
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || "https://feicgarueqllkpzgewul.supabase.co",
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlaWNnYXJ1ZXFsbGtwemdld3VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNzUzOTgsImV4cCI6MjA4ODk1MTM5OH0.yjP0iBlBTVxHnw-Bu_e4wT3LvZGdsHwLINAcfm78FOM",
    googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || "",
    skipAuth: skipAuthRaw === "1" || skipAuthRaw === "true" || skipAuthRaw === "yes",
  };
}

export function getConfigHealth(): ConfigHealth {
  const env = readEnv();
  const health: ConfigHealth = {
    appEnvPresent: Boolean(env.appEnv),
    supabaseUrlPresent: Boolean(env.supabaseUrl),
    supabaseUrlLooksValid:
      env.supabaseUrl.startsWith("https://") && env.supabaseUrl.includes(".supabase.co"),
    supabaseAnonKeyPresent: Boolean(env.supabaseAnonKey),
    supabaseAnonKeyLooksValid:
      env.supabaseAnonKey.startsWith("sb_publishable_") ||
      env.supabaseAnonKey.startsWith("eyJ"),
    googleClientIdPresent: Boolean(env.googleWebClientId),
    googleClientIdLooksValid: env.googleWebClientId.endsWith(".apps.googleusercontent.com"),
    ok: false,
  };

  health.ok =
    health.appEnvPresent &&
    health.supabaseUrlPresent &&
    health.supabaseUrlLooksValid &&
    health.supabaseAnonKeyPresent &&
    health.supabaseAnonKeyLooksValid &&
    health.googleClientIdPresent &&
    health.googleClientIdLooksValid;

  return health;
}

export function getRuntimeConfig(): RuntimeConfig {
  const env = readEnv();
  return {
    appEnv: env.appEnv || "development",
    supabaseUrl: env.supabaseUrl,
    supabaseAnonKey: env.supabaseAnonKey,
    googleWebClientId: env.googleWebClientId,
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

  return issues;
}
