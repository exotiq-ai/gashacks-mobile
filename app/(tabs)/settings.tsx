import { GHButton } from "@/components/ui/GHButton";
import { GHCard } from "@/components/ui/GHCard";
import { GHText } from "@/components/ui/GHText";
import { colors, spacing, typography } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { useEntitlements } from "@/hooks/useEntitlements";
import { supabase } from "@/lib/supabase";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Constants from "expo-constants";

const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { isPro } = useEntitlements();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account, vehicles, and all fill logs. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Everything",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              // Delete user data via Supabase (RLS cascades)
              if (user) {
                await supabase.from("fill_logs").delete().eq("user_id", user.id);
                await supabase.from("vehicles").delete().eq("user_id", user.id);
                await supabase.from("favorite_stations").delete().eq("user_id", user.id);
                await supabase.from("profiles").delete().eq("id", user.id);
              }
              await signOut();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch {
              Alert.alert("Error", "Failed to delete account. Please try again.");
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 90 }]}
      showsVerticalScrollIndicator={false}
    >
      <GHText variant="title" tone="accent">
        Settings
      </GHText>

      {/* Account */}
      <GHCard style={styles.card}>
        <GHText variant="subtitle">Account</GHText>
        <View style={styles.row}>
          <GHText tone="secondary">Email</GHText>
          <GHText tone="primary">{user?.email ?? "—"}</GHText>
        </View>
        <View style={styles.row}>
          <GHText tone="secondary">Plan</GHText>
          <View style={[styles.planBadge, isPro ? styles.planBadgePro : styles.planBadgeFree]}>
            <GHText tone={isPro ? "accent" : "secondary"} style={styles.planText}>
              {isPro ? "PRO" : "FREE"}
            </GHText>
          </View>
        </View>
        {!isPro && (
          <GHButton
            label="Upgrade to Pro"
            onPress={() => {
              // TODO: RevenueCat paywall
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}
          />
        )}
      </GHCard>

      {/* Preferences */}
      <GHCard style={styles.card}>
        <GHText variant="subtitle">Preferences</GHText>
        <View style={styles.row}>
          <GHText tone="secondary">Units</GHText>
          <GHText tone="muted">Gallons (US)</GHText>
        </View>
        <View style={styles.row}>
          <GHText tone="secondary">Theme</GHText>
          <GHText tone="muted">Dark</GHText>
        </View>
      </GHCard>

      {/* Legal */}
      <GHCard style={styles.card}>
        <GHText variant="subtitle">Legal</GHText>
        <GHButton
          label="Privacy Policy"
          variant="ghost"
          onPress={() => router.push("/privacy")}
        />
        <GHButton
          label="Terms of Service"
          variant="ghost"
          onPress={() => router.push("/terms")}
        />
        <GHButton
          label="Contact Support"
          variant="ghost"
          onPress={() => Linking.openURL("mailto:hello@exotiq.ai")}
        />
      </GHCard>

      {/* About */}
      <GHCard style={styles.card}>
        <GHText variant="subtitle">About</GHText>
        <View style={styles.row}>
          <GHText tone="secondary">Version</GHText>
          <GHText tone="muted">{APP_VERSION}</GHText>
        </View>
        <View style={styles.row}>
          <GHText tone="secondary">Built by</GHText>
          <GHText tone="muted">Exotiq Inc.</GHText>
        </View>
      </GHCard>

      {/* Sign Out */}
      <GHButton
        label="Sign Out"
        variant="secondary"
        onPress={() => {
          signOut();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }}
      />

      {/* Danger Zone */}
      <GHCard style={styles.dangerCard}>
        <GHText variant="subtitle" style={styles.dangerTitle}>
          Danger Zone
        </GHText>
        <GHText tone="secondary" variant="caption">
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </GHText>
        <GHButton
          label={deleting ? "Deleting..." : "Delete Account"}
          variant="ghost"
          onPress={handleDeleteAccount}
          loading={deleting}
          style={styles.deleteBtn}
        />
      </GHCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  planBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  planBadgeFree: {
    borderColor: colors.glass.border,
  },
  planBadgePro: {
    borderColor: colors.accent.lime,
    backgroundColor: "rgba(213, 254, 124, 0.08)",
  },
  planText: {
    fontSize: 11,
    fontFamily: typography.fontFamily.semibold,
    letterSpacing: 1,
  },
  dangerCard: {
    gap: spacing.sm,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  dangerTitle: {
    color: colors.status.error,
  },
  deleteBtn: {
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
});
