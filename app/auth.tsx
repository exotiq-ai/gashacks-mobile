import { GHButton } from "@/components/ui/GHButton";
import { GHCard } from "@/components/ui/GHCard";
import { GHText } from "@/components/ui/GHText";
import { colors, spacing } from "@/constants/theme";
import { configureGoogleClient, useAuth } from "@/hooks/useAuth";
import { getConfigHealth, getConfigIssues, getRuntimeConfig } from "@/lib/runtimeConfig";
import { supabase } from "@/lib/supabase";
import * as Linking from "expo-linking";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";

export default function AuthScreen() {
  const { isAuthenticated, loading, signInWithApple, signInWithGoogle, signInWithEmail, signUpWithEmail } =
    useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [healthMessage, setHealthMessage] = useState<string | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  const runtimeConfig = getRuntimeConfig();
  const checks = getConfigHealth();
  const configIssues = getConfigIssues();

  useEffect(() => {
    const webClientId = runtimeConfig.googleWebClientId;
    if (webClientId) {
      configureGoogleClient(webClientId);
    }
  }, [runtimeConfig.googleWebClientId]);

  if (!loading && isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  const submitEmail = async () => {
    setSubmitting(true);
    setError(null);
    try {
      if (authMode === "signup") {
        await signUpWithEmail(email.trim(), password);
      } else {
        await signInWithEmail(email.trim(), password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitApple = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await signInWithApple();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Apple sign-in failed.";
      if (message.includes("Provider") && message.includes("is not enabled")) {
        setError("Apple Sign-In is not enabled in Supabase Auth providers yet.");
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const submitGoogle = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const runHealthCheck = async () => {
    setHealthLoading(true);
    setHealthMessage(null);
    try {
      const sessionResult = await supabase.auth.getSession();
      if (sessionResult.error) {
        throw sessionResult.error;
      }

      const redirectTo = Linking.createURL("/auth");
      const googleResult = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (googleResult.error) {
        throw googleResult.error;
      }

      if (!googleResult.data?.url) {
        throw new Error("Google OAuth URL did not generate.");
      }

      setHealthMessage("Config health check passed. Supabase session bootstrap + Google OAuth URL generation both succeeded.");
    } catch (err) {
      setHealthMessage(err instanceof Error ? `Health check failed: ${err.message}` : "Health check failed.");
    } finally {
      setHealthLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <GHText variant="title">Create Account</GHText>
        <GHText tone="secondary">Join Gas Hacks Pro</GHText>
      </View>

      <GHCard style={styles.card}>
        <GHButton
          label="Continue with Apple"
          variant="secondary"
          onPress={() => void submitApple()}
          loading={submitting}
        />
        <GHButton
          label="Continue with Google"
          variant="secondary"
          onPress={() => void submitGoogle()}
          loading={submitting}
        />

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <GHText tone="muted">OR</GHText>
          <View style={styles.divider} />
        </View>

        <TextInput
          placeholder="Email"
          placeholderTextColor={colors.text.muted}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor={colors.text.muted}
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
        {error ? <GHText tone="secondary">{error}</GHText> : null}
        <GHButton
          label={authMode === "signup" ? "Sign up with Email" : "Log in with Email"}
          onPress={() => void submitEmail()}
          loading={submitting}
        />
        <GHButton
          label={authMode === "signup" ? "Already have an account? Log in" : "Need an account? Sign up"}
          variant="ghost"
          onPress={() => setAuthMode(prev => (prev === "signup" ? "login" : "signup"))}
        />
      </GHCard>

      <GHCard style={styles.card}>
        <GHText variant="subtitle">Config Health</GHText>
        <CheckItem label="Supabase URL present" ok={checks.supabaseUrlPresent} />
        <CheckItem label="Supabase URL format valid" ok={checks.supabaseUrlLooksValid} />
        <CheckItem label="Supabase key present" ok={checks.supabaseAnonKeyPresent} />
        <CheckItem label="Supabase key format valid" ok={checks.supabaseAnonKeyLooksValid} />
        <CheckItem label="Google client ID present" ok={checks.googleClientIdPresent} />
        <CheckItem label="Google client ID format valid" ok={checks.googleClientIdLooksValid} />
        <CheckItem label="Runtime config complete" ok={checks.ok} />
        <GHButton
          label="Run Runtime Health Check"
          variant="secondary"
          onPress={() => void runHealthCheck()}
          loading={healthLoading}
        />
        {healthMessage ? <GHText tone="secondary">{healthMessage}</GHText> : null}
        {configIssues.length > 0 ? (
          <View style={styles.issuesList}>
            {configIssues.map((issue) => (
              <GHText key={issue} tone="secondary">
                - {issue}
              </GHText>
            ))}
          </View>
        ) : null}
      </GHCard>
    </ScrollView>
  );
}

function CheckItem({ label, ok }: { label: string; ok: boolean }) {
  return (
    <View style={styles.checkRow}>
      <GHText tone={ok ? "accent" : "secondary"}>{ok ? "PASS" : "FAIL"}</GHText>
      <GHText tone="secondary">{label}</GHText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing["2xl"],
  },
  header: {
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  card: {
    gap: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.glass.border,
    backgroundColor: colors.background.tertiary,
    color: colors.text.primary,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.glass.border,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  issuesList: {
    gap: spacing.xs,
  },
});
