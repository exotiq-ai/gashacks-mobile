import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Gas Hacks",
  owner: "gashacks",
  slug: "gas-hacks-mobile",
  scheme: "gashacksmobile",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "dark",
  plugins: [
    "expo-router",
    "expo-secure-store",
    "expo-apple-authentication",
  ],
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.exotiq.gashacks",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: "com.exotiq.gashacks",
    adaptiveIcon: {
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
      backgroundColor: "#0a0a0a",
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  extra: {
    eas: {
      projectId: "a25bec27-cf5c-4748-9c85-2e13fd4087b0",
    },
    appEnv: process.env.EXPO_PUBLIC_APP_ENV ?? "development",
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  },
  experiments: {
    typedRoutes: true,
  },
});
