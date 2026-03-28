import { CostSavingsCard } from "@/components/ui/CostSavingsCard";
import { FillAnalytics } from "@/components/ui/FillAnalytics";
import { GHButton } from "@/components/ui/GHButton";
import { GHCard } from "@/components/ui/GHCard";
import { GHText } from "@/components/ui/GHText";
import { TelemetryDial } from "@/components/ui/TelemetryDial";
import { colors, spacing, typography } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { useEntitlements } from "@/hooks/useEntitlements";
import { fetchFillLogs, type FillLog } from "@/lib/data";
import { useGarageStore } from "@/lib/store";
import { Redirect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function HubScreen() {
  const { isAuthenticated, loading, signOut, user } = useAuth();
  const { isPro } = useEntitlements();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getActiveVehicle } = useGarageStore();
  const activeVehicle = getActiveVehicle();
  const [lastLog, setLastLog] = useState<FillLog | null>(null);
  const [allLogs, setAllLogs] = useState<FillLog[]>([]);
  const [logCount, setLogCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      fetchFillLogs(user.id).then((logs) => {
        setAllLogs(logs);
        setLogCount(logs.length);
        setLastLog(logs[0] ?? null);
      }).catch(() => {});
    }, [user?.id]),
  );

  if (!loading && !isAuthenticated) {
    return <Redirect href="/auth" />;
  }

  const lastEthanol = lastLog ? lastLog.resulting_ethanol_mix / 10 : 0;
  const lastOctane = lastLog ? lastLog.resulting_octane / 10 : 0;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 90 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <GHText variant="title" tone="accent">
            The Hub
          </GHText>
          <GHText tone="secondary">
            {activeVehicle
              ? `${activeVehicle.year ?? ""} ${activeVehicle.make} ${activeVehicle.model}`
              : "No vehicle selected"}
          </GHText>
        </View>
        <View style={[styles.planBadge, isPro ? styles.planBadgePro : styles.planBadgeFree]}>
          <GHText tone={isPro ? "accent" : "secondary"} style={styles.planText}>
            {isPro ? "PRO" : "FREE"}
          </GHText>
        </View>
      </View>

      {/* Quick Stats */}
      <Animated.View entering={FadeInDown.duration(300)}>
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <TelemetryDial
              label="Last Blend"
              value={lastLog ? `E${lastEthanol.toFixed(0)}` : "—"}
              caption={lastLog ? `${lastOctane.toFixed(1)} oct` : "No logs yet"}
            />
          </View>
          <View style={styles.gridItem}>
            <TelemetryDial
              label="Fill Logs"
              value={String(logCount)}
              caption={isPro ? "Unlimited" : `${Math.min(logCount, 10)}/10 free`}
            />
          </View>
        </View>
      </Animated.View>

      {/* Vehicle Card */}
      <Animated.View entering={FadeInDown.duration(300).delay(100)}>
        <GHCard style={styles.card}>
          <GHText variant="subtitle">
            {activeVehicle ? "Active Vehicle" : "Get Started"}
          </GHText>
          {activeVehicle ? (
            <>
              <GHText tone="secondary">
                {activeVehicle.year ?? ""} {activeVehicle.make} {activeVehicle.model}
                {activeVehicle.trim ? ` ${activeVehicle.trim}` : ""}
              </GHText>
              <GHText tone="muted" variant="caption">
                {activeVehicle.tankCapacityGallons} gal tank
                {activeVehicle.currentTune ? ` · ${activeVehicle.currentTune}` : ""}
              </GHText>
            </>
          ) : (
            <GHText tone="secondary">
              Add a vehicle in the Garage tab to get personalized calculations.
            </GHText>
          )}
          <GHButton
            label={activeVehicle ? "Go to Garage" : "Add Vehicle"}
            variant="secondary"
            onPress={() => router.push("/(tabs)/garage")}
            style={styles.action}
          />
        </GHCard>
      </Animated.View>

      {/* Quick Actions */}
      <Animated.View entering={FadeInDown.duration(300).delay(200)}>
        <GHCard style={styles.card}>
          <GHText variant="subtitle">Quick Actions</GHText>
          <GHButton
            label="Open Calculator"
            leftIcon="calculator-variant"
            onPress={() => router.push("/(tabs)/calculator")}
          />
          <GHButton
            label="View Fill Logs"
            leftIcon="clipboard-text-clock"
            variant="secondary"
            onPress={() => router.push("/(tabs)/logs")}
          />
        </GHCard>
      </Animated.View>

      {/* Cost Analytics */}
      {allLogs.length > 0 && (
        <Animated.View entering={FadeInDown.duration(300).delay(300)}>
          <CostSavingsCard logs={allLogs} />
        </Animated.View>
      )}

      {/* Fill Analytics (pro) */}
      {isPro && allLogs.length > 0 && (
        <FillAnalytics logs={allLogs} />
      )}

      {/* Account */}
      <Animated.View entering={FadeInDown.duration(300).delay(400)}>
        <GHCard style={styles.card}>
          <GHText variant="subtitle">Account</GHText>
          <GHText tone="secondary">{user?.email ?? "Signed in"}</GHText>
          {!isPro && (
            <GHText tone="muted" variant="caption">
              Upgrade to Pro for unlimited garage slots, full log history, and
              premium widgets.
            </GHText>
          )}
          <GHButton
            label="Sign out"
            variant="ghost"
            onPress={signOut}
            style={styles.action}
          />
        </GHCard>
      </Animated.View>
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
  planText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    letterSpacing: 1,
  },
  grid: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  gridItem: {
    flex: 1,
  },
  card: {
    gap: spacing.sm,
  },
  action: {
    marginTop: spacing.xs,
  },
});
