import { GHButton } from "@/components/ui/GHButton";
import { GHCard } from "@/components/ui/GHCard";
import { GHText } from "@/components/ui/GHText";
import { colors, spacing, typography } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import * as Haptics from "expo-haptics";
import { Redirect } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

export default function AuthScreen() {
  const { isAuthenticated, loading, signInWithApple, signInWithGoogle, signInWithEmail, signUpWithEmail } =
    useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!loading && isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (authMode === "login") {
        await signInWithEmail(email.trim(), password);
      } else {
        await signUpWithEmail(email.trim(), password);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSocial = async (method: "apple" | "google") => {
    setError(null);
    try {
      if (method === "apple") await signInWithApple();
      else await signInWithGoogle();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      setError(err instanceof Error ? err.message : `${method} sign-in failed.`);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand */}
        <View style={styles.brand}>
          <GHText style={styles.logo}>⛽</GHText>
          <GHText variant="title" tone="accent">
            Gas Hacks
          </GHText>
          <GHText tone="secondary">
            Premium ethanol blend calculator
          </GHText>
        </View>

        {/* Social Auth */}
        <View style={styles.socialRow}>
          <GHButton
            label="Continue with Apple"
            variant="secondary"
            onPress={() => void handleSocial("apple")}
            style={styles.socialBtn}
          />
          <GHButton
            label="Continue with Google"
            variant="secondary"
            onPress={() => void handleSocial("google")}
            style={styles.socialBtn}
          />
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <GHText tone="muted" variant="caption">
            or
          </GHText>
          <View style={styles.dividerLine} />
        </View>

        {/* Email Auth */}
        <GHCard style={styles.card}>
          <GHText variant="subtitle">
            {authMode === "login" ? "Sign In" : "Create Account"}
          </GHText>

          <View style={styles.field}>
            <GHText tone="secondary" variant="caption" style={styles.fieldLabel}>
              EMAIL
            </GHText>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.text.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <GHText tone="secondary" variant="caption" style={styles.fieldLabel}>
              PASSWORD
            </GHText>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.text.muted}
              secureTextEntry
              style={styles.input}
            />
          </View>

          {error && (
            <GHText style={styles.errorText}>{error}</GHText>
          )}

          <GHButton
            label={authMode === "login" ? "Sign In" : "Create Account"}
            onPress={() => void handleEmailAuth()}
            loading={submitting}
          />

          <GHButton
            label={
              authMode === "login"
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"
            }
            variant="ghost"
            onPress={() => {
              setAuthMode(authMode === "login" ? "signup" : "login");
              setError(null);
            }}
          />
        </GHCard>

        <GHText tone="muted" variant="caption" style={styles.terms}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </GHText>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    padding: spacing.lg,
    paddingTop: 80,
    gap: spacing.md,
  },
  brand: {
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  logo: {
    fontSize: 64,
  },
  socialRow: {
    gap: spacing.sm,
  },
  socialBtn: {},
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.glass.border,
  },
  card: {
    gap: spacing.md,
  },
  field: {
    gap: 4,
  },
  fieldLabel: {
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontSize: 10,
    fontFamily: typography.fontFamily.medium,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.glass.border,
    backgroundColor: colors.background.tertiary,
    color: colors.text.primary,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontFamily: typography.fontFamily.regular,
    fontSize: 16,
  },
  errorText: {
    color: colors.status.error,
    textAlign: "center",
  },
  terms: {
    textAlign: "center",
    marginTop: spacing.sm,
  },
});
