import { colors, spacing, typography } from "@/constants/theme";
import * as Haptics from "expo-haptics";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { GHText } from "./GHText";

export type Preset = {
  label: string;
  emoji: string;
  targetEthanol: number;
};

const PRESETS: Preset[] = [
  { label: "Track Day", emoji: "🏁", targetEthanol: 85 },
  { label: "Daily", emoji: "🚗", targetEthanol: 30 },
  { label: "Economy", emoji: "💰", targetEthanol: 10 },
  { label: "Winter", emoji: "❄️", targetEthanol: 20 },
  { label: "E50", emoji: "⚡", targetEthanol: 50 },
];

type Props = {
  activeTarget: number;
  onSelect: (preset: Preset) => void;
};

export function PresetPills({ activeTarget, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      {PRESETS.map((preset) => {
        const isActive = Math.abs(preset.targetEthanol - activeTarget) < 1;
        return (
          <Pressable
            key={preset.label}
            style={[styles.pill, isActive && styles.pillActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onSelect(preset);
            }}
          >
            <GHText style={styles.emoji}>{preset.emoji}</GHText>
            <View>
              <GHText
                style={styles.pillLabel}
                tone={isActive ? "accent" : "primary"}
              >
                {preset.label}
              </GHText>
              <GHText style={styles.pillSub} tone="muted">
                E{preset.targetEthanol}
              </GHText>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.background.tertiary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.glass.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pillActive: {
    borderColor: colors.accent.lime,
    backgroundColor: "rgba(213, 254, 124, 0.08)",
  },
  emoji: {
    fontSize: 20,
  },
  pillLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.sm,
  },
  pillSub: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
  },
});
