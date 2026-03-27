# Supabase Auth Setup (Phase 1)

Project target:
- `https://feicgarueqllkpzgewul.supabase.co`

## 1) Enable auth providers in Supabase

In Supabase Dashboard, open `Authentication -> Providers` and enable:
- Email
- Apple
- Google

## 2) Configure app URL + deep link redirect

In `Authentication -> URL Configuration`:
- Site URL: `gashacksmobile://auth`
- Additional Redirect URLs:
  - `gashacksmobile://auth`
  - `com.exotiq.gashacks://auth` (optional, if you use this scheme in native builds)

## 3) Apple provider setup

In Apple Developer:
- Create Service ID for Supabase redirect
- Create Sign In with Apple key (`.p8`)
- Add callback URL shown by Supabase provider panel

In Supabase Apple provider settings:
- Add Services ID
- Add Team ID
- Add Key ID
- Upload `.p8` content

## 4) Google provider setup

In Google Cloud Console:
- Create OAuth client for web/native as required
- Add Supabase callback URL from provider panel

In Supabase Google provider settings:
- Add client ID / client secret

In local mobile env:
- Set `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` in `.env`

## 5) Apply DB migration

Run SQL from:
- `supabase/migrations/0001_phase1_foundation.sql`

This sets up:
- `profiles`
- `vehicles`
- `fill_logs`
- `favorite_stations`
- Profile auto-create trigger on `auth.users`
- RLS policies for user-owned access

## 6) Local environment

Copy `.env.example` to `.env` and fill:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
