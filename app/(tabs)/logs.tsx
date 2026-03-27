import { GHCard } from "@/components/ui/GHCard";
import { GHText } from "@/components/ui/GHText";
import { colors, spacing } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { useEntitlements } from "@/hooks/useEntitlements";
import { fetchFillLogs, type FillLog } from "@/lib/data";
import { applyLogVisibilityLimit } from "@/lib/entitlements";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";

type TargetFilter = "all" | "e30" | "e50" | "e85";

export default function LogsScreen() {
  const { user } = useAuth();
  const { isPro, entitlements } = useEntitlements();
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
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      void loadLogs();
    }, [loadLogs])
  );

  const { filteredLogs, byTargetCount } = useMemo(() => {
    const byTarget = logs.filter((item) => {
      if (filter === "all") return true;
      const target = Math.round(item.target_ethanol_mix / 10);
      if (filter === "e30") return target >= 25 && target < 40;
      if (filter === "e50") return target >= 40 && target < 70;
      if (filter === "e85") return target >= 70;
      return true;
    });

    return {
      byTargetCount: byTarget.length,
      filteredLogs: applyLogVisibilityLimit(byTarget, entitlements),
    };
  }, [entitlements, filter, logs]);

  const truncatedByPlan = !isPro && filteredLogs.length < byTargetCount;

  return (
    <View style={styles.container}>
      <GHText variant="title">Logs</GHText>
      <GHText tone="secondary">Blend history synchronized to Supabase.</GHText>
      <View style={styles.filterRow}>
        <FilterChip label="All" active={filter === "all"} onPress={() => setFilter("all")} />
        <FilterChip label="E30" active={filter === "e30"} onPress={() => setFilter("e30")} />
        <FilterChip label="E50" active={filter === "e50"} onPress={() => setFilter("e50")} />
        <FilterChip label="E85+" active={filter === "e85"} onPress={() => setFilter("e85")} />
      </View>
      {error ? <GHText style={styles.errorText}>{error}</GHText> : null}
      {truncatedByPlan ? (
        <GHCard style={styles.card}>
          <GHText tone="secondary">
            Free plan shows latest {entitlements.maxLogsVisible} logs. Upgrade to Pro for full history.
          </GHText>
        </GHCard>
      ) : null}
      <FlatList
        data={filteredLogs}
        contentContainerStyle={styles.list}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <GHCard style={styles.card}>
            <GHText tone="secondary">
              {loading ? "Loading logs..." : "No logs yet. Save a blend from Mission Control."}
            </GHText>
          </GHCard>
        }
        renderItem={({ item }) => (
          <GHCard style={styles.card}>
            <GHText variant="subtitle">E{Math.round(item.target_ethanol_mix / 10)} Target</GHText>
            <GHText tone="secondary">
              {Number(item.e85_gallons ?? 0).toFixed(2)} gal E85 +{" "}
              {Number(item.pump_gas_gallons ?? 0).toFixed(2)} gal pump gas
            </GHText>
            <GHText tone="secondary">
              Result E{(item.resulting_ethanol_mix / 10).toFixed(1)} | Oct{" "}
              {(item.resulting_octane / 10).toFixed(1)} |{" "}
              {new Date(item.created_at).toLocaleDateString()}
            </GHText>
          </GHCard>
        )}
      />
    </View>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.filterChip, active ? styles.filterChipActive : null]}
    >
      <GHText tone={active ? "accent" : "secondary"}>{label}</GHText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  list: {
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filterRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.glass.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background.tertiary,
  },
  filterChipActive: {
    borderColor: "rgba(213, 254, 124, 0.35)",
    backgroundColor: "rgba(213, 254, 124, 0.08)",
  },
  card: {
    gap: spacing.xs,
  },
  errorText: {
    color: colors.status.error,
  },
});
