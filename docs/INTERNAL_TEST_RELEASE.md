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
  - Email/password fields expose autofill and screen-reader labels
  - Google sign in
  - Google sign-in cancellation returns to auth without creating a session
  - Apple sign in button appears and works on supported iOS devices
  - Apple sign in button is absent on Android/web
  - Terms of Service and Privacy Policy open from the sign-up screen
- Garage:
  - Add vehicle
  - Set active vehicle
  - Free account upgrade prompt opens the paywall after one vehicle
  - Vehicle picker, make/model selectors, and manual entry toggle expose clear screen-reader labels and selected states
  - Manual vehicle entry fields expose clear screen-reader labels
- Mission Control:
  - Input validation
  - Save blend configuration
  - Receipt scan/manual entry preserves station name and total cost in Fill Logs
  - Manual receipt logging can be completed from Calculator and appears in Fill Logs
  - Receipt fields expose clear screen-reader labels
- Logs:
  - New saved blend appears in list
- Pro gating:
  - Free user sees limit prompts
  - Pro user bypasses limits
- Subscriptions:
  - Paywall loads store prices from RevenueCat only
  - Monthly and annual plan selectors expose selected state to assistive technology
  - Purchase cancellation does not unlock Pro
  - Purchase failures surface an error without unlocking Pro
  - Restore purchases works for a known active subscriber
- Account deletion:
  - Delete Account requires a signed-in session
  - Delete Account requires typing `DELETE` before the destructive action enables
  - Delete confirmation field exposes a clear screen-reader label
  - Network and backend deletion errors surface a clear user-facing error
  - Netlify deletion function removes app data and the Supabase auth user
- Native permissions:
  - iOS prompts match camera, selected photo, and when-in-use location behavior
  - Android manifest does not request microphone or background-location permissions
