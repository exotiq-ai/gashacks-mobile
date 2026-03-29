import { GHCard } from "@/components/ui/GHCard";
import { GHText } from "@/components/ui/GHText";
import { colors, spacing, typography } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { useEntitlements } from "@/hooks/useEntitlements";
import { fetchFillLogs, type FillLog } from "@/lib/data";
import { applyLogVisibilityLimit } from "@/lib/entitlements";
import { fixed } from "@/lib/format";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TargetFilter = "all" | "e30" | "e50" | "e85";

const FILTERS: { label: string; value: TargetFilter }[] = [
  { label: "All", value: "all" },
  { label: "E30", value: "e30" },
  { label: "E50", value: "e50" },
  { label: "E85", value: "e85" },
];

function filterRange(filter: TargetFilter): [number, number] {
  switch (filter) {
    case "e30": return [200, 400];
    case "e50": return [400, 700];
    case "e85": return [700, 1000];
    default: return [0, 1000];
  }
}

export default function LogsScreen() {
  const { user } = useAuth();
  const { isPro, entitlements } = useEntitlements();
  const insets = useSafeAreaInsets();
  const [logs, setLogs] = useState<FillLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TargetFilter>("all");

  const loadLogs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchFillLogs(user.id);
      setLogs(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load logs.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      void loadLogs();
    }, [loadLogs]),
  );

  const visible = useMemo(() => {
    const [lo, hi] = filterRange(filter);
    const filtered = logs.filter(
      (l) => l.target_ethanol_mix >= lo && l.target_ethanol_mix <= hi,
    );
    return applyLogVisibilityLimit(filtered, entitlements);
  }, [logs, filter, entitlements]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const renderLog = ({ item }: { item: FillLog }) => {
    const eMix = item.resulting_ethanol_mix / 10;
    const octane = item.resulting_octane / 10;
    const e85Gal = item.e85_gallons ?? 0;
    const pumpGal = item.pump_gas_gallons ?? 0;

    return (
      <GHCard style={styles.logCard}>
        <View style={styles.logHeader}>
          <GHText tone="accent" style={styles.logBlend}>
            E{fixed(eMix, 0)}
          </GHText>
          <GHText tone="muted" variant="caption">
            {formatDate(item.created_at)}
          </GHText>
        </View>
        <View style={styles.logStats}>
          <View style={styles.logStat}>
            <GHText tone="muted" variant="caption" style={styles.logStatLabel}>
              OCTANE
            </GHText>
            <GHText tone="secondary">{fixed(octane, 1)}</GHText>
          </View>
          <View style={styles.logDivider} />
          <View style={styles.logStat}>
            <GHText tone="muted" variant="caption" style={styles.logStatLabel}>
              E85
            </GHText>
            <GHText tone="secondary">{fixed(e85Gal, 1)}g</GHText>
          </View>
          <View style={styles.logDivider} />
          <View style={styles.logStat}>
            <GHText tone="muted" variant="caption" style={styles.logStatLabel}>
              PUMP
            </GHText>
            <GHText tone="secondary">{fixed(pumpGal, 1)}g</GHText>
          </View>
        </View>
        {item.station_name && (
          <View style={styles.stationRow}>
            <MaterialCommunityIcons name="map-marker" size={12} color={colors.text.muted} />
            <GHText tone="muted" variant="caption">
              {item.station_name}
            </GHText>
          </View>
        )}
      </GHCard>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <GHText variant="title" tone="accent">
          Fill Logs
        </GHText>
        <GHText tone="secondary">
          {logs.length} fill{logs.length !== 1 ? "s" : ""} recorded
        </GHText>
      </View>

      {/* Filter pills */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const isActive = filter === f.value;
          return (
            <Pressable
              key={f.value}
              style={[styles.filterPill, isActive && styles.filterPillActive]}
              onPress={() => {
                setFilter(f.value);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <GHText
                tone={isActive ? "accent" : "secondary"}
                style={styles.filterText}
              >
                {f.label}
              </GHText>
            </Pressable>
          );
        })}
      </View>

      {error && <GHText style={styles.errorText}>{error}</GHText>}

      {!loading && visible.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <MaterialCommunityIcons name="clipboard-text-clock" size={48} color={colors.text.secondary} />
          </View>
          <GHText tone="secondary" style={styles.emptyText}>
            {logs.length === 0
              ? "No fills logged yet. Save a blend from the Calculator to start tracking."
              : "No fills match this filter."}
          </GHText>
        </View>
      ) : (
        <FlatList
          data={visible}
          renderItem={renderLog}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            gap: spacing.sm,
            paddingBottom: insets.bottom + 90,
            paddingHorizontal: spacing.lg,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {!isPro && logs.length > 10 && (
        <View style={styles.upgradeBar}>
          <GHText tone="muted" variant="caption">
            Showing 10 of {logs.length} logs · Upgrade to Pro for full history
          </GHText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.xs,
  },
  filterRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  filterPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  filterPillActive: {
    borderColor: colors.accent.lime,
    backgroundColor: "rgba(213, 254, 124, 0.08)",
  },
  filterText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 13,
  },
  errorText: {
    color: colors.status.error,
    paddingHorizontal: spacing.lg,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  emptyIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.glass.background,
    borderWidth: 1,
    borderColor: colors.glass.border,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    textAlign: "center",
  },
  stationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  logCard: {
    gap: spacing.sm,
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logBlend: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
  },
  logStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  logStat: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  logStatLabel: {
    letterSpacing: 1,
    textTransform: "uppercase",
    fontSize: 10,
    fontFamily: typography.fontFamily.medium,
  },
  logDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.glass.border,
  },
  upgradeBar: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.glass.border,
  },
});
