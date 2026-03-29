import { GHButton } from "@/components/ui/GHButton";
import { GHCard } from "@/components/ui/GHCard";
import { GHText } from "@/components/ui/GHText";
import { colors, spacing, typography } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { useBiometricAuth } from "@/hooks/useBiometricAuth";
import * as Haptics from "expo-haptics";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

export default function AuthScreen() {
  const { isAuthenticated, loading, signInWithApple, signInWithGoogle, signInWithEmail, signUpWithEmail } =
    useAuth();
  const biometric = useBiometricAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Auto-prompt biometrics if enabled
  useEffect(() => {
    if (!biometric.loading && biometric.isEnabled && biometric.isAvailable && !isAuthenticated) {
      biometric.authenticate("Unlock Gas Hacks").then((success) => {
        if (success) {
          // Session is already persisted by Supabase — biometric just gates access
          // The auth state will update via onAuthStateChange
        }
      });
    }
  }, [biometric.loading, biometric.isEnabled, biometric.isAvailable, isAuthenticated]);

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
      // Offer biometric setup after successful auth
      if (biometric.isAvailable && !biometric.isEnabled) {
        await biometric.enableBiometrics();
      }
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
      // Enable biometrics after social sign-in
      if (biometric.isAvailable && !biometric.isEnabled) {
        await biometric.enableBiometrics();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `${method} sign-in failed.`);
    }
  };

  const handleBiometricSignIn = async () => {
    const success = await biometric.authenticate("Sign in to Gas Hacks");
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="gas-station" size={48} color={colors.accent.lime} />
          </View>
          <GHText variant="title" tone="accent">
            Gas Hacks
          </GHText>
          <GHText tone="secondary">
            Premium ethanol blend calculator
          </GHText>
        </View>

        {/* Biometric quick sign-in */}
        {biometric.isEnabled && biometric.isAvailable && (
          <Pressable style={styles.biometricBtn} onPress={() => void handleBiometricSignIn()}>
            <MaterialCommunityIcons
              name={biometric.biometricType === "facial" ? "face-recognition" : "fingerprint"}
              size={32}
              color={colors.accent.lime}
            />
            <GHText tone="accent" style={styles.biometricLabel}>
              Sign in with {biometric.biometricLabel}
            </GHText>
          </Pressable>
        )}

        {/* Social Auth */}
        <View style={styles.socialRow}>
          {Platform.OS === "ios" && (
            <GHButton
              label="Continue with Apple"
              variant="secondary"
              leftIcon="apple"
              onPress={() => void handleSocial("apple")}
              style={styles.socialBtn}
            />
          )}
          <GHButton
            label="Continue with Google"
            variant="secondary"
            leftIcon="google"
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
              autoComplete="email"
              textContentType="emailAddress"
              importantForAutofill="yes"
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <GHText tone="secondary" variant="caption" style={styles.fieldLabel}>
              PASSWORD
            </GHText>
            <View style={styles.passwordRow}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.text.muted}
                secureTextEntry={!showPassword}
                autoComplete={authMode === "signup" ? "password-new" : "password"}
                textContentType={authMode === "signup" ? "newPassword" : "password"}
                importantForAutofill="yes"
                style={[styles.input, styles.passwordInput]}
              />
              <Pressable
                style={styles.eyeBtn}
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={12}
              >
                <MaterialCommunityIcons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={colors.text.muted}
                />
              </Pressable>
            </View>
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
  logoContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.glass.background,
    borderWidth: 1,
    borderColor: "rgba(213, 254, 124, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  biometricBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingVertical: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(213, 254, 124, 0.2)",
    backgroundColor: "rgba(213, 254, 124, 0.04)",
  },
  biometricLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.base,
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
  passwordRow: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
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
