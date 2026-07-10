# Gas Hacks Store Readiness Report

Last updated: 2026-07-10

## Current Status

Gas Hacks mobile is closer to internal TestFlight and Play internal-track readiness, but it is not ready for production App Store or Play Store submission until the external service configuration is completed and verified on real devices.

## Verified Locally

- TypeScript passes: `npm run type-check`
- Unit tests pass: `npm test`
- Expo SDK health passes: `npx expo-doctor`
- Web export succeeds: `npx expo export -p web`
- E2E smoke tests pass: `npm run test:e2e`
- EAS archive inspection succeeds for iOS simulator and Android preview profiles.
- EAS Android preview pre-build inspection succeeds.

## Improvements Completed

- Removed hardcoded RevenueCat test keys from app code.
- Moved RevenueCat keys and entitlement ID to Expo public runtime config.
- Added production config health checks for Supabase, Google OAuth, receipt scanning, station lookup, RevenueCat, and skip-auth.
- Blocked `EXPO_PUBLIC_SKIP_AUTH` from enabling demo auth in production.
- Removed direct client-side OpenAI receipt scanning. Receipt AI now requires a configured server endpoint.
- Added Netlify receipt image validation for MIME type and payload size.
- Removed direct client-side NREL station key usage.
- Added a Netlify `stations` proxy function that keeps `NREL_API_KEY` server-side.
- Added iOS privacy strings for camera, location, and photo library usage.
- Aligned Expo SDK package versions so `expo-doctor` passes.
- Added Playwright E2E smoke coverage for onboarding, core tabs, paywall restore visibility, station manual search, and settings/legal/account deletion affordances.
- Updated env examples and internal test release runbook with required native release variables.
- Removed user-facing testing language from the paywall and station fallback states.
- Disabled the paywall purchase CTA when RevenueCat offerings are unavailable.
- Removed hardcoded subscription price copy from Settings.
- Added safe public EAS variables for development, preview, and production environments where values were known.

## Needs External Configuration

- Rotate any GitHub, Expo, Supabase, RevenueCat, OpenAI, and NREL keys that were pasted into chat.
- Configure remaining EAS environment variables after key rotation:
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY` in production
  - `EXPO_PUBLIC_REVENUECAT_IOS_KEY` in preview and production
  - `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` in preview and production
- Configure Netlify server-side variables:
  - `OPENAI_API_KEY`
  - `NREL_API_KEY`
- Confirm Supabase auth providers and redirect URLs for web, iOS, and Android.
- Confirm Apple Sign In capability for `com.exotiq.gashacks` and service configuration `G39773LD27.com.exotiq.gashacks`.
- Configure RevenueCat products, offerings, entitlements, sandbox testers, and App Store / Play Store integrations.

## Store Console Checklist

- App Store Connect app exists for bundle ID `com.exotiq.gashacks`.
- Google Play Console app exists for package `com.exotiq.gashacks`.
- Subscription group, monthly product, annual product, localized descriptions, pricing, and review screenshot are configured.
- Privacy policy URL, terms URL, support URL/email, and privacy nutrition answers are ready.
- App icons, screenshots, preview assets, category, age rating, and subscription metadata are ready.

## Remaining QA

- Run iOS simulator build with `npm run build:simulator:ios`.
- Run iOS TestFlight preview build with `npm run build:preview:ios`.
- Run Android internal preview build with `npm run build:preview:android`.
- Test on real iPhone:
  - Apple Sign In
  - Google Sign In
  - receipt photo picker/camera permission flow
  - location permission denial and success
  - subscription purchase, restore, cancellation, and reinstall restore
  - account deletion and Supabase auth cleanup
- Test on physical Android:
  - Google Sign In
  - receipt image flow
  - location search
  - Play Billing purchase and restore behavior

## Known Risks

- Account deletion currently deletes app data from Supabase tables and signs out. Full Supabase auth user deletion may require a privileged backend endpoint before App Review accepts the flow as complete deletion.
- Production EAS receipt and station URLs currently point at the preview Netlify domain. Replace with a production/custom domain before public launch.
- Local iOS EAS pre-build inspection is blocked on this machine because `fastlane` is not installed in PATH.
- Local npm audit still reports 11 moderate `uuid` findings through Expo tooling. `npm audit fix --force` would downgrade Expo to 46, so this needs Expo/upstream review instead of the forced fix.
- The Playwright E2E suite covers web smoke flows only. Native behavior still needs simulator/device validation.
