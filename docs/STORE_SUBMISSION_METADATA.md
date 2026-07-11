# Gas Hacks Store Submission Metadata

Last updated: 2026-07-10

Use this packet when creating or updating the App Store Connect and Google Play Console listings. Replace every `TBD` before production submission.

## App Identity

- App name: Gas Hacks
- Subtitle / short description: Ethanol blend calculator and fill log for performance cars.
- Bundle ID: `com.exotiq.gashacks`
- Android package: `com.exotiq.gashacks`
- SKU / internal app ID: `gashacks-mobile`
- Primary category: Utilities
- Secondary category: Auto & Vehicles
- Content rights: The app does not use third-party copyrighted content in the listing unless screenshots include user-supplied data.
- Encryption: Standard Apple/Google platform encryption only. `ITSAppUsesNonExemptEncryption` is set to `false`.

## Listing Copy

### App Store Subtitle

Ethanol blending and fill logs.

### Google Play Short Description

Calculate ethanol blends, manage vehicles, scan receipts, and track fill logs.

### Full Description

Gas Hacks helps performance-car owners plan ethanol fuel blends, manage vehicle tank specs, and keep clean fill logs.

Use the calculator to estimate pump gas and E85 mixtures, save vehicles in your garage, and keep a history of fills across devices. Optional receipt scanning can extract fill details from pump receipts you choose to upload, and station search helps you find nearby E85 options when you request a location lookup.

Gas Hacks is built for drivers who want organized fuel records, not guesswork.

Key features:

- Ethanol blend calculator for target mix planning
- Vehicle garage with tank-size presets
- Fill log history
- Receipt scanning for selected receipt images
- Nearby E85 station lookup
- Pro subscription for unlimited vehicles, full history, receipt scanning, station finder, analytics, and CSV export

Safety note: Gas Hacks provides estimates for informational purposes only. Always confirm your vehicle, fuel system, and tune are compatible with ethanol blends before using E85 or high-ethanol fuel.

## Keywords

ethanol, E85, fuel calculator, flex fuel, fuel log, performance car, gas mileage, receipt scanner, car maintenance, fill up, fuel blend

## Support And Legal URLs

- Support URL: `TBD`
- Marketing URL: `TBD`
- Privacy Policy URL: `TBD`
- Terms of Service URL: `TBD`
- Support email: `hello@exotiq.ai`

The in-app legal screens currently expose Privacy Policy and Terms of Service from auth and paywall surfaces. Public web URLs still need to be published before store submission.

## Subscription Metadata

- Subscription display name: Gas Hacks Pro
- Entitlement ID: `pro`
- Monthly product ID: `TBD`
- Annual product ID: `TBD`
- Review notes: Prices are loaded from RevenueCat/App Store/Play Store products. The app does not hardcode public subscription prices or savings claims.

### Subscription Description

Gas Hacks Pro unlocks unlimited vehicles, full fill-log history, receipt scanning, station finder, analytics, and CSV export.

### Review Screenshot Requirements

Capture screenshots showing:

- Paywall with monthly and annual products loaded from the store sandbox
- Restore Purchases button
- Privacy Policy and Terms of Service links on the paywall
- Pro-only feature unlock after purchase or restore

## App Review Notes

Suggested review note:

Gas Hacks is an ethanol blend calculator, vehicle garage, and fuel log. The app offers optional account creation and a Pro subscription through Apple App Store / Google Play billing. Receipt scanning is initiated only when the user selects or captures a receipt image. Location is requested only when the user searches for nearby E85 stations. Account deletion is available from Settings and removes app data plus the Supabase auth user when the backend deletion function is configured.

Test account:

- Email: `TBD`
- Password: `TBD`
- Subscription state: `TBD`

Do not submit until the test account has been validated on a real device against the production or release-candidate backend.

## Privacy Nutrition / Data Safety Draft

Validate these answers against the final production implementation before submission.

### Data Collected

- Email address: used for account creation and authentication.
- User ID: used for syncing user-owned app data and subscription identity.
- Vehicle information: make, model, year, tank size, and user-entered vehicle data.
- Fill log data: dates, fuel volumes, ethanol targets, saved calculations, and notes.
- Receipt images: user-selected images sent for receipt extraction only.
- Approximate location: requested only for nearby station search.
- Purchase information: subscription status and entitlement state through RevenueCat.
- Diagnostics: Expo/platform diagnostics if enabled by the release channel.

### Data Use

- App functionality
- Account management
- Purchase entitlement management
- Optional receipt extraction
- Optional nearby station lookup
- Diagnostics and app reliability, if enabled

### Data Not Used For

- Third-party advertising
- Cross-app tracking
- Selling personal data
- Continuous background location tracking

### Deletion

Users can request deletion in Settings. The backend deletion function must be configured with `SUPABASE_SERVICE_ROLE_KEY` before release so deletion removes app data and the Supabase auth account.

## Screenshot Shot List

Capture on iPhone 6.7", iPhone 6.5"/6.9" as required by Apple, and representative Android phone sizes:

- Mission Control calculator with realistic sample values
- Garage with one saved vehicle
- Logs with saved fill history
- Receipt scan entry point
- Station finder search results
- Paywall with live sandbox prices
- Settings with account, legal, restore, and delete-account affordances

Avoid screenshots showing placeholder keys, demo labels, fake testing copy, empty production states, or personal information.

## Pre-Submission Console Checklist

- App Store Connect app created for `com.exotiq.gashacks`.
- Google Play Console app created for `com.exotiq.gashacks`.
- Public privacy and terms URLs published and matching in-app legal copy.
- Support URL and support email verified.
- RevenueCat products and offerings match App Store / Play product IDs.
- Sandbox purchase, cancel, restore, and reinstall-restore pass on real devices.
- Account deletion passes on a real account and removes the Supabase auth user.
- Apple Sign In works on iOS with `G39773LD27.com.exotiq.gashacks`.
- Google Sign In works on Android and web redirect URLs.
- Camera, photo library, and location permission prompts match actual behavior.
