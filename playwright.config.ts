import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: "http://127.0.0.1:8090",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "mobile-web",
      use: {
        ...devices["iPhone 14"],
      },
    },
  ],
  webServer: {
    command: "CI=1 EXPO_PUBLIC_APP_ENV=development EXPO_PUBLIC_SKIP_AUTH=true EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=test.apps.googleusercontent.com EXPO_PUBLIC_SUPABASE_URL=https://feicgarueqllkpzgewul.supabase.co EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_test npx expo start --web --port 8090",
    url: "http://127.0.0.1:8090",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
