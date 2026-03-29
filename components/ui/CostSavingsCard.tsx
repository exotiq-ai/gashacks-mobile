import { colors, spacing, typography } from "@/constants/theme";
import { type FillLog } from "@/lib/data";
import { dollars, fixed } from "@/lib/format";
import { GHCard } from "./GHCard";
import { GHText } from "./GHText";
import { StyleSheet, View } from "react-native";

type Props = {
  logs: FillLog[];
};

// Assumes 93 octane pump gas at ~$4.50/gal average
const PUMP_GAS_AVG_PRICE = 4.5;
// E85 typically ~$3.00/gal
const E85_AVG_PRICE = 3.0;

export function CostSavingsCard({ logs }: Props) {
  if (logs.length === 0) return null;

  let totalE85Gal = 0;
  let totalPumpGal = 0;
  let totalActualCost = 0;
  let totalIfAllPump = 0;

  for (const log of logs) {
    const e85 = log.e85_gallons ?? 0;
    const pump = log.pump_gas_gallons ?? 0;
    totalE85Gal += e85;
    totalPumpGal += pump;

    // Actual cost (estimate if not recorded)
    const actualCost = log.total_cost
      ? Number(log.total_cost)
      : e85 * E85_AVG_PRICE + pump * PUMP_GAS_AVG_PRICE;
    totalActualCost += actualCost;

    // What it would have cost as all 93 octane pump gas
    totalIfAllPump += (e85 + pump) * PUMP_GAS_AVG_PRICE;
  }

  const savings = totalIfAllPump - totalActualCost;
  const totalGallons = totalE85Gal + totalPumpGal;
  const avgCostPerGal = totalGallons > 0 ? totalActualCost / totalGallons : 0;

  return (
    <GHCard style={styles.card}>
      <GHText variant="subtitle">Cost Analytics</GHText>
      <View style={styles.grid}>
        <View style={styles.stat}>
          <GHText tone="muted" variant="caption" style={styles.statLabel}>
            TOTAL FILLS
          </GHText>
          <GHText tone="accent" style={styles.statValue}>
            {logs.length}
          </GHText>
        </View>
        <View style={styles.stat}>
          <GHText tone="muted" variant="caption" style={styles.statLabel}>
            TOTAL GALLONS
          </GHText>
          <GHText tone="accent" style={styles.statValue}>
            {fixed(totalGallons, 0)}
          </GHText>
        </View>
        <View style={styles.stat}>
          <GHText tone="muted" variant="caption" style={styles.statLabel}>
            AVG $/GAL
          </GHText>
          <GHText tone="accent" style={styles.statValue}>
            {dollars(avgCostPerGal, 2)}
          </GHText>
        </View>
        <View style={styles.stat}>
          <GHText tone="muted" variant="caption" style={styles.statLabel}>
            EST. SAVED
          </GHText>
          <GHText
            tone={savings > 0 ? "accent" : "secondary"}
            style={styles.statValue}
          >
            {dollars(Math.max(0, savings), 0)}
          </GHText>
        </View>
      </View>
      <GHText tone="muted" variant="caption" style={styles.footnote}>
        Savings estimated vs buying all 93 octane at ~$4.50/gal
      </GHText>
    </GHCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  stat: {
    width: "47%",
    backgroundColor: colors.background.tertiary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.glass.border,
    padding: spacing.md,
    gap: 4,
  },
  statLabel: {
    letterSpacing: 1,
    fontSize: 10,
    fontFamily: typography.fontFamily.medium,
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
  },
  footnote: {
    textAlign: "center",
    marginTop: spacing.xs,
  },
});
