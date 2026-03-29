import { GHCard } from "@/components/ui/GHCard";
import { GHText } from "@/components/ui/GHText";
import { colors, spacing, typography } from "@/constants/theme";
import type { FillLog } from "@/lib/data";
import { dollars, fixed } from "@/lib/format";
import { StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

type FillAnalyticsProps = {
  logs: FillLog[];
};

type MonthlyData = {
  label: string;
  totalCost: number;
  e85Gallons: number;
  fillCount: number;
};

const PREMIUM_PRICE_PER_GALLON = 4.5; // avg premium gas price estimate

function buildMonthlyData(logs: FillLog[]): MonthlyData[] {
  const map: Record<string, MonthlyData> = {};

  for (const log of logs) {
    const date = new Date(log.created_at);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

    if (!map[key]) {
      map[key] = { label, totalCost: 0, e85Gallons: 0, fillCount: 0 };
    }
    map[key].totalCost += log.total_cost ?? 0;
    map[key].e85Gallons += log.e85_gallons ?? 0;
    map[key].fillCount += 1;
  }

  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([, v]) => v);
}

function computeSummary(logs: FillLog[]) {
  const totalE85 = logs.reduce((sum, l) => sum + (l.e85_gallons ?? 0), 0);
  const totalCost = logs.reduce((sum, l) => sum + (l.total_cost ?? 0), 0);
  const premiumEquivCost = totalE85 * PREMIUM_PRICE_PER_GALLON;
  const estimatedSavings = premiumEquivCost - totalCost;
  const avgCostPerFill = logs.length > 0 ? totalCost / logs.length : 0;

  return { totalE85, totalCost, estimatedSavings, avgCostPerFill };
}

export function FillAnalytics({ logs }: FillAnalyticsProps) {
  if (logs.length === 0) return null;

  const monthly = buildMonthlyData(logs);
  const { totalE85, totalCost, estimatedSavings, avgCostPerFill } = computeSummary(logs);
  const maxCost = Math.max(...monthly.map((m) => m.totalCost), 1);

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(50)}>
      <GHCard style={styles.card}>
        <GHText variant="subtitle">Fill Analytics</GHText>

        {/* Summary tiles */}
        <View style={styles.tilesRow}>
          <View style={styles.tile}>
            <GHText tone="accent" style={styles.tileValue}>
              {fixed(totalE85, 1)}
            </GHText>
            <GHText tone="muted" variant="caption">
              Total E85 gal
            </GHText>
          </View>
          <View style={styles.tileDivider} />
          <View style={styles.tile}>
            <GHText tone="accent" style={styles.tileValue}>
              {dollars(avgCostPerFill, 2)}
            </GHText>
            <GHText tone="muted" variant="caption">
              Avg per fill
            </GHText>
          </View>
          <View style={styles.tileDivider} />
          <View style={styles.tile}>
            <GHText
              style={[styles.tileValue, { color: estimatedSavings > 0 ? colors.status.success : colors.text.secondary }]}
            >
              {estimatedSavings > 0 ? `+$${fixed(estimatedSavings, 0)}` : "—"}
            </GHText>
            <GHText tone="muted" variant="caption">
              Est. savings
            </GHText>
          </View>
        </View>

        {/* Monthly chart */}
        {monthly.length > 1 && (
          <View style={styles.chartSection}>
            <GHText tone="secondary" variant="caption" style={styles.chartLabel}>
              Monthly spend (last 6 months)
            </GHText>
            <View style={styles.chart}>
              {monthly.map((m, i) => {
                const barHeight = maxCost > 0 ? Math.max((m.totalCost / maxCost) * 80, 4) : 4;
                return (
                  <View key={i} style={styles.barGroup}>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: barHeight,
                            backgroundColor: i === monthly.length - 1
                              ? colors.accent.lime
                              : "rgba(213, 254, 124, 0.35)",
                          },
                        ]}
                      />
                    </View>
                    <GHText tone="muted" variant="caption" style={styles.barLabel}>
                      {m.label}
                    </GHText>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <GHText tone="muted" variant="caption">
            Total spent: {dollars(totalCost, 2)} across {logs.length} fill{logs.length !== 1 ? "s" : ""}
          </GHText>
        </View>
      </GHCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  tilesRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  tile: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  tileDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.glass.border,
  },
  tileValue: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
  },
  chartSection: {
    gap: spacing.sm,
  },
  chartLabel: {
    letterSpacing: 0.5,
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.xs,
    height: 96,
  },
  barGroup: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacing.xs,
    height: "100%",
  },
  barTrack: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 9,
    textAlign: "center",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.glass.border,
    paddingTop: spacing.sm,
  },
});
