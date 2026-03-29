import { colors, spacing, typography } from "@/constants/theme";
import { fixed } from "@/lib/format";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { GHText } from "./GHText";

type Props = {
  tankLevel: number; // 0-100
  ethanolMix: number; // 0-100
  tankSize: number; // gallons
};

function getEthanolColor(mix: number): string {
  if (mix >= 70) return "#22c55e"; // high ethanol - green
  if (mix >= 40) return colors.accent.lime; // medium - lime
  if (mix >= 20) return "#f59e0b"; // low-medium - amber
  return "#ef4444"; // low/pump gas - red
}

function getEthanolLabel(mix: number): string {
  if (mix >= 70) return "HIGH E";
  if (mix >= 40) return "MID E";
  if (mix >= 20) return "LOW E";
  return "PUMP";
}

export function FuelGauge({ tankLevel, ethanolMix, tankSize }: Props) {
  const animatedLevel = useSharedValue(0);
  const ethColor = getEthanolColor(ethanolMix);

  useEffect(() => {
    animatedLevel.value = withSpring(Math.max(0, Math.min(100, tankLevel)), {
      damping: 15,
      stiffness: 80,
    });
  }, [tankLevel]);

  const fillHeight = useAnimatedStyle(() => ({
    height: `${animatedLevel.value}%`,
  }));

  const gallonsInTank = (tankLevel / 100) * tankSize;
  const emptyGallons = tankSize - gallonsInTank;

  return (
    <View style={styles.container}>
      <View style={styles.gaugeContainer}>
        {/* Tank outline */}
        <View style={styles.tank}>
          {/* Fuel fill */}
          <Animated.View
            style={[
              styles.fuel,
              fillHeight,
              { backgroundColor: ethColor },
            ]}
          />
          {/* Tick marks */}
          <View style={[styles.tick, { bottom: "25%" }]}>
            <View style={styles.tickLine} />
            <GHText style={styles.tickLabel} tone="muted">
              ¼
            </GHText>
          </View>
          <View style={[styles.tick, { bottom: "50%" }]}>
            <View style={styles.tickLine} />
            <GHText style={styles.tickLabel} tone="muted">
              ½
            </GHText>
          </View>
          <View style={[styles.tick, { bottom: "75%" }]}>
            <View style={styles.tickLine} />
            <GHText style={styles.tickLabel} tone="muted">
              ¾
            </GHText>
          </View>
        </View>

        {/* Level indicator */}
        <View style={styles.stats}>
          <GHText style={styles.levelPercent} tone="accent">
            {Math.round(tankLevel)}%
          </GHText>
          <GHText variant="caption" tone="secondary">
            {fixed(gallonsInTank, 1)} gal
          </GHText>
          <View style={[styles.ethBadge, { borderColor: ethColor }]}>
            <GHText
              style={[styles.ethBadgeText, { color: ethColor }]}
            >
              {getEthanolLabel(ethanolMix)}
            </GHText>
          </View>
          <GHText variant="caption" tone="muted">
            E{Math.round(ethanolMix)}
          </GHText>
          <View style={styles.spaceStat}>
            <GHText variant="caption" tone="muted">
              Room
            </GHText>
            <GHText variant="caption" tone="secondary">
              {fixed(emptyGallons, 1)}g
            </GHText>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  gaugeContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.md,
    height: 160,
  },
  tank: {
    width: 52,
    height: 150,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.glass.border,
    backgroundColor: colors.background.tertiary,
    overflow: "hidden",
    justifyContent: "flex-end",
    position: "relative",
  },
  fuel: {
    width: "100%",
    borderRadius: 10,
    opacity: 0.85,
  },
  tick: {
    position: "absolute",
    left: -2,
    right: -20,
    flexDirection: "row",
    alignItems: "center",
  },
  tickLine: {
    width: "100%",
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    flex: 1,
  },
  tickLabel: {
    fontSize: 9,
    marginLeft: 4,
    width: 14,
  },
  stats: {
    justifyContent: "flex-end",
    gap: spacing.xs,
    paddingBottom: 4,
  },
  levelPercent: {
    fontSize: typography.fontSize["2xl"],
    fontFamily: typography.fontFamily.bold,
    lineHeight: 28,
  },
  ethBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  ethBadgeText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.semibold,
    letterSpacing: 0.8,
  },
  spaceStat: {
    gap: 2,
  },
});
