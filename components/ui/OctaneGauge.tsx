import { colors, spacing, typography } from "@/constants/theme";
import { fixed } from "@/lib/format";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolateColor,
} from "react-native-reanimated";
import { GHText } from "./GHText";

type Props = {
  octane: number; // typically 87-105
  size?: number;
};

const MIN_OCTANE = 87;
const MAX_OCTANE = 105;

function getOctaneColor(octane: number): string {
  if (octane >= 100) return "#22c55e";
  if (octane >= 95) return colors.accent.lime;
  if (octane >= 91) return "#f59e0b";
  return "#ef4444";
}

function getOctaneLabel(octane: number): string {
  if (octane >= 100) return "RACE";
  if (octane >= 95) return "HIGH";
  if (octane >= 91) return "PREM";
  return "REG";
}

export function OctaneGauge({ octane, size = 130 }: Props) {
  const fraction =
    Math.max(0, Math.min(1, (octane - MIN_OCTANE) / (MAX_OCTANE - MIN_OCTANE)));
  const ringColor = getOctaneColor(octane);

  const animatedFraction = useSharedValue(0);

  useEffect(() => {
    animatedFraction.value = withSpring(fraction, {
      damping: 14,
      stiffness: 60,
    });
  }, [fraction]);

  // Build segmented ring using 12 segments
  const segments = 12;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Ring segments */}
      <View style={[styles.ring, { width: size, height: size }]}>
        {Array.from({ length: segments }).map((_, i) => {
          const segFraction = i / segments;
          const isActive = segFraction < fraction;
          const angle = -135 + (i / segments) * 270;

          return (
            <View
              key={i}
              style={[
                styles.segment,
                {
                  width: 6,
                  height: 18,
                  backgroundColor: isActive ? ringColor : colors.background.tertiary,
                  position: "absolute",
                  left: size / 2 - 3,
                  top: 0,
                  transformOrigin: `3px ${size / 2}px`,
                  transform: [{ rotate: `${angle}deg` }],
                  borderRadius: 3,
                  opacity: isActive ? 1 : 0.3,
                },
              ]}
            />
          );
        })}
      </View>
      {/* Center content */}
      <View style={styles.centerLabel}>
        <GHText style={[styles.octaneValue, { color: ringColor }]}>
          {fixed(octane, 1)}
        </GHText>
        <GHText style={styles.octaneUnit} tone="muted">
          OCTANE
        </GHText>
        <View style={[styles.gradeBadge, { borderColor: ringColor }]}>
          <GHText style={[styles.gradeText, { color: ringColor }]}>
            {getOctaneLabel(octane)}
          </GHText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
  },
  segment: {},
  centerLabel: {
    alignItems: "center",
    gap: 2,
  },
  octaneValue: {
    fontSize: typography.fontSize["2xl"],
    fontFamily: typography.fontFamily.bold,
    lineHeight: 28,
  },
  octaneUnit: {
    fontSize: 9,
    fontFamily: typography.fontFamily.medium,
    letterSpacing: 1.8,
    textTransform: "uppercase",
  },
  gradeBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  gradeText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.semibold,
    letterSpacing: 1,
  },
});
