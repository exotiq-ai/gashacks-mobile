import { supabase } from "@/lib/supabase";
import { getRuntimeConfig } from "@/lib/runtimeConfig";
import { resetRevenueCatUser } from "@/lib/revenuecat";
import { parseSupabaseOAuthRedirect } from "@/lib/oauthRedirect";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { Session, User } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useState } from "react";

WebBrowser.maybeCompleteAuthSession();
const runtimeConfig = getRuntimeConfig();
const DEMO_USER_ID = "demo-user";

type UseAuthResult = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
};

export function configureGoogleClient(webClientId: string) {
  // Google auth in this app uses Supabase OAuth via WebBrowser.
  // Keep this function as a compatibility no-op for existing callers.
  void webClientId;
}

export function useAuth(): UseAuthResult {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const skipAuth = runtimeConfig.skipAuth;

  useEffect(() => {
    if (skipAuth) {
      setSession(null);
      setUser({
        id: DEMO_USER_ID,
        email: "demo@gashacks.app",
        app_metadata: {},
        user_metadata: {},
        aud: "authenticated",
        created_at: new Date(0).toISOString(),
      } as User);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [skipAuth]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    if (skipAuth) return;
    await resetRevenueCatUser();
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  }, [skipAuth]);

  const signInWithApple = useCallback(async () => {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      throw new Error("Apple Sign In failed to return identity token.");
    }

    const { error } = await supabase.auth.signInWithIdToken({
      provider: "apple",
      token: credential.identityToken,
    });

    if (error) {
      throw error;
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const redirectTo = Linking.createURL("/auth");
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      throw error;
    }

    if (!data?.url) {
      throw new Error("Google OAuth URL was not returned.");
    }

    const authResult = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (authResult.type !== "success") {
      throw new Error("Google sign-in was cancelled.");
    }

    const params = parseSupabaseOAuthRedirect(authResult.url);
    if (params.error) {
      throw new Error(params.errorDescription ?? params.error);
    }

    if (params.code) {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(params.code);
      if (exchangeError) {
        throw exchangeError;
      }
      return;
    }

    if (params.accessToken && params.refreshToken) {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: params.accessToken,
        refresh_token: params.refreshToken,
      });
      if (sessionError) {
        throw sessionError;
      }
      return;
    }

    throw new Error("Google sign-in did not return a session.");
  }, []);

  return useMemo(
    () => ({
      user,
      session,
      loading,
      isAuthenticated: skipAuth || Boolean(user),
      signInWithEmail,
      signUpWithEmail,
      signOut,
      signInWithApple,
      signInWithGoogle,
    }),
    [
      loading,
      session,
      signInWithApple,
      signInWithEmail,
      signInWithGoogle,
      signOut,
      signUpWithEmail,
      skipAuth,
      user,
    ]
  );
}
