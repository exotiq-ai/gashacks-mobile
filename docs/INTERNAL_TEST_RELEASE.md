# Internal Test Release Runbook

This runbook prepares internal distributions for iOS (TestFlight internal) and Android (Play internal track).

## 1) Prerequisites

- Apple Developer account + App Store Connect app created.
- Google Play Console app created.
- EAS account logged in: `npx eas login`.
- Supabase project configured with:
  - tables/migration from `supabase/migrations/0001_phase1_foundation.sql`
  - auth providers (Email/Google/Apple) configured.

## 2) Environment setup

Create `.env` from one of:
- `.env.preview.example` for internal test builds
- `.env.production.example` for release candidates

Required keys:
- `EXPO_PUBLIC_APP_ENV`
- `EXPO_PUBLIC_SKIP_AUTH=false`
- `EXPO_PUBLIC_UNLOCK_PRO_FOR_TESTING=false`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- `EXPO_PUBLIC_RECEIPT_SCAN_API_URL`
- `EXPO_PUBLIC_STATIONS_API_URL`
- `EXPO_PUBLIC_ACCOUNT_DELETE_API_URL`
- `EXPO_PUBLIC_REVENUECAT_IOS_KEY`
- `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`
- `EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID`

Server-side Netlify environment variables:
- `OPENAI_API_KEY` for receipt scanning
- `NREL_API_KEY` for station lookup
- `SUPABASE_SERVICE_ROLE_KEY` for full account deletion

## 3) Local validation before cloud build

Run:

```bash
npm run verify:release
```

Expected:
- TypeScript passes.
- Unit and Netlify function tests pass.
- Expo SDK health passes.
- Web export completes.
- Playwright mobile-web smoke checks pass.

## 4) Build internal binaries

Preview builds use EAS remote app versioning with auto-increment enabled, so each TestFlight / Play internal-track build gets a new native build number.

iOS internal preview build:

```bash
npm run build:preview:ios
```

Android internal preview build:

```bash
npm run build:preview:android
```

## 5) Submit internal builds

iOS:

```bash
npm run submit:preview:ios
```

Android:

```bash
npm run submit:preview:android
```

## 6) Internal QA smoke checklist

- Store console prep:
  - Review `docs/STORE_SUBMISSION_METADATA.md`
  - Replace all `TBD` store metadata values before production submission
  - Confirm public privacy, terms, support, and marketing URLs
- Auth:
  - Email sign up/login
  - Google sign in
  - Apple sign in (iOS device)
  - Terms of Service and Privacy Policy open from the sign-up screen
- Garage:
  - Add vehicle
  - Set active vehicle
  - Free account upgrade prompt opens the paywall after one vehicle
- Mission Control:
  - Input validation
  - Save blend configuration
- Logs:
  - New saved blend appears in list
- Pro gating:
  - Free user sees limit prompts
  - Pro user bypasses limits
- Subscriptions:
  - Paywall loads store prices from RevenueCat only
  - Purchase cancellation does not unlock Pro
  - Restore purchases works for a known active subscriber
- Account deletion:
  - Delete Account requires a signed-in session
  - Delete Account requires typing `DELETE` before the destructive action enables
  - Netlify deletion function removes app data and the Supabase auth user
