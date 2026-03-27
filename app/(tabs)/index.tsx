import { GHButton } from "@/components/ui/GHButton";
import { GHCard } from "@/components/ui/GHCard";
import { GHText } from "@/components/ui/GHText";
import { TelemetryDial } from "@/components/ui/TelemetryDial";
import { colors, spacing } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { useEntitlements } from "@/hooks/useEntitlements";
import { Redirect } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function HubScreen() {
  const { isAuthenticated, loading, signOut, user } = useAuth();
  const { isPro } = useEntitlements();

  if (!loading && !isAuthenticated) {
    return <Redirect href="/auth" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <GHText variant="title" tone="accent">
            The Hub
          </GHText>
          <GHText tone="secondary">Performance dashboard</GHText>
        </View>
        <View style={[styles.planBadge, isPro ? styles.planBadgePro : styles.planBadgeFree]}>
          <GHText tone={isPro ? "accent" : "secondary"}>{isPro ? "PRO" : "FREE"}</GHText>
        </View>
      </View>

      <GHCard style={styles.card}>
        <GHText variant="subtitle">Fuel Level</GHText>
        <GHText style={styles.metric}>65%</GHText>
        <GHText tone="secondary">Est. range 184 mi | Full in 12.4 gal</GHText>
      </GHCard>

      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <TelemetryDial label="Ethanol" value="E82" caption="+3.2%" />
        </View>
        <View style={styles.gridItem}>
          <TelemetryDial label="Atmosphere" value="1240 DA" caption="78F / 36% RH" />
        </View>
      </View>

      <GHCard style={styles.card}>
        <GHText variant="subtitle">Account</GHText>
        <GHText tone="secondary">{user?.email ?? "Signed in"}</GHText>
        {!isPro ? (
          <GHText tone="secondary">
            Upgrade to Pro for unlimited garage slots, full log history, and premium widgets.
          </GHText>
        ) : (
          <GHText tone="secondary">Pro unlocked: unlimited access enabled.</GHText>
        )}
        <GHButton label="Sign out" variant="secondary" onPress={signOut} style={styles.action} />
      </GHCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xs,
  },
  planBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  planBadgeFree: {
    borderColor: colors.glass.border,
    backgroundColor: colors.background.tertiary,
  },
  planBadgePro: {
    borderColor: "rgba(213, 254, 124, 0.35)",
    backgroundColor: "rgba(213, 254, 124, 0.08)",
  },
  card: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  grid: {
    marginTop: spacing.md,
    flexDirection: "row",
    gap: spacing.sm,
  },
  gridItem: {
    flex: 1,
  },
  metric: {
    fontSize: 42,
    lineHeight: 48,
  },
  action: {
    marginTop: spacing.sm,
  },
});
