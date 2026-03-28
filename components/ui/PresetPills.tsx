import { colors, spacing, typography } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { GHText } from "./GHText";

export type Preset = {
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  targetEthanol: number;
};

const PRESETS: Preset[] = [
  { label: "Track Day", icon: "flag-checkered", targetEthanol: 85 },
  { label: "Daily", icon: "car", targetEthanol: 30 },
  { label: "Economy", icon: "currency-usd", targetEthanol: 10 },
  { label: "Winter", icon: "snowflake", targetEthanol: 20 },
  { label: "E50", icon: "lightning-bolt", targetEthanol: 50 },
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
            <MaterialCommunityIcons
              name={preset.icon}
              size={20}
              color={isActive ? colors.accent.lime : colors.text.secondary}
            />
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
  pillLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.sm,
  },
  pillSub: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
  },
});
