import { GHButton } from "@/components/ui/GHButton";
import { GHCard } from "@/components/ui/GHCard";
import { GHText } from "@/components/ui/GHText";
import { colors, spacing, typography } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { useEntitlements } from "@/hooks/useEntitlements";
import { deleteAccountWithToken } from "@/lib/accountDeletion";
import { restorePurchases } from "@/lib/revenuecat";
import * as Haptics from "expo-haptics";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Constants from "expo-constants";

const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";

export default function SettingsScreen() {
  const { user, session, signOut } = useAuth();
  const { isPro, refresh } = useEntitlements();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [deleting, setDeleting] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const handleRestore = async () => {
    setRestoring(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const result = await restorePurchases();
      if (result.isPro) {
        await refresh();
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Restored!", "Your Pro subscription has been restored.");
      } else {
        Alert.alert("Nothing to Restore", "No active Pro subscription found.");
      }
    } catch {
      Alert.alert("Restore Failed", "Please try again later.");
    } finally {
      setRestoring(false);
    }
  };

  const openDeleteConfirm = () => {
    setDeleteConfirmText("");
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirm = () => {
    if (deleting) return;
    setShowDeleteConfirm(false);
    setDeleteConfirmText("");
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim() !== "DELETE") return;

    setDeleting(true);
    try {
      if (!session?.access_token) {
        throw new Error("Please sign in again before deleting your account.");
      }

      const result = await deleteAccountWithToken(session.access_token);
      if (!result.success) {
        throw new Error(result.error ?? "Failed to delete account.");
      }

      setShowDeleteConfirm(false);
      setDeleteConfirmText("");
      await signOut();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Failed to delete account. Please try again.",
      );
    } finally {
      setDeleting(false);
    }
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
      </GHCard>

      {/* Subscription */}
      <GHCard style={styles.card}>
        <GHText variant="subtitle">Subscription</GHText>
        <View style={styles.row}>
          <GHText tone="secondary">Current Plan</GHText>
          <View style={[styles.planBadge, isPro ? styles.planBadgePro : styles.planBadgeFree]}>
            <GHText tone={isPro ? "accent" : "secondary"} style={styles.planText}>
              {isPro ? "PRO" : "FREE"}
            </GHText>
          </View>
        </View>
        {isPro ? (
          <>
            <GHText tone="muted" variant="caption">
              You have full access to all Gas Hacks Pro features. Manage your subscription in your device's App Store or Play Store settings.
            </GHText>
            <GHButton
              label={restoring ? "Restoring..." : "Restore Purchases"}
              icon="restore"
              variant="secondary"
              onPress={() => void handleRestore()}
              loading={restoring}
            />
          </>
        ) : (
          <>
            <GHText tone="muted" variant="caption">
              Upgrade to Pro for unlimited vehicles, full log history, station finder, and more.
            </GHText>
            <GHButton
              label="Upgrade to Pro"
              icon="lock-open-variant"
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push("/paywall" as Href);
              }}
            />
            <GHButton
              label={restoring ? "Restoring..." : "Restore Purchases"}
              icon="restore"
              variant="ghost"
              onPress={() => void handleRestore()}
              loading={restoring}
            />
          </>
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
          icon="shield-account"
          variant="ghost"
          onPress={() => router.push("/privacy" as Href)}
        />
        <GHButton
          label="Terms of Service"
          icon="file-document-outline"
          variant="ghost"
          onPress={() => router.push("/terms" as Href)}
        />
        <GHButton
          label="Contact Support"
          icon="email-outline"
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
        icon="logout"
        variant="secondary"
        onPress={async () => {
          try {
            await signOut();
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } catch (err) {
            Alert.alert(
              "Sign Out Failed",
              err instanceof Error ? err.message : "Please try again.",
            );
          }
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
          icon="trash-can-outline"
          variant="ghost"
          onPress={openDeleteConfirm}
          loading={deleting}
          style={styles.deleteBtn}
        />
      </GHCard>

      <Modal
        visible={showDeleteConfirm}
        animationType="fade"
        transparent
        onRequestClose={closeDeleteConfirm}
      >
        <View style={styles.modalBackdrop}>
          <GHCard style={styles.deleteModal}>
            <GHText variant="subtitle" style={styles.dangerTitle}>
              Delete Account
            </GHText>
            <GHText tone="secondary">
              This permanently deletes your profile, vehicles, and fill logs.
              Your subscription must still be managed in the App Store or Play
              Store.
            </GHText>
            <GHText tone="muted" variant="caption">
              Type DELETE to confirm.
            </GHText>
            <TextInput
              accessibilityLabel="Account deletion confirmation"
              value={deleteConfirmText}
              onChangeText={setDeleteConfirmText}
              autoCapitalize="characters"
              autoCorrect={false}
              placeholder="DELETE"
              placeholderTextColor={colors.text.muted}
              style={styles.confirmInput}
            />
            <View style={styles.modalActions}>
              <GHButton
                label="Cancel"
                icon="close"
                variant="ghost"
                onPress={closeDeleteConfirm}
                disabled={deleting}
                style={styles.modalButton}
              />
              <GHButton
                label={deleting ? "Deleting..." : "Delete Everything"}
                icon="trash-can-outline"
                variant="secondary"
                onPress={() => void handleDeleteAccount()}
                disabled={deleteConfirmText.trim() !== "DELETE"}
                loading={deleting}
                style={[styles.modalButton, styles.deleteBtn]}
              />
            </View>
          </GHCard>
        </View>
      </Modal>
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.76)",
    justifyContent: "center",
    padding: spacing.lg,
  },
  deleteModal: {
    gap: spacing.md,
  },
  confirmInput: {
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.45)",
    backgroundColor: colors.background.tertiary,
    color: colors.text.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontFamily: typography.fontFamily.semibold,
    fontSize: 16,
    letterSpacing: 1,
  },
  modalActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  modalButton: {
    flex: 1,
  },
});
