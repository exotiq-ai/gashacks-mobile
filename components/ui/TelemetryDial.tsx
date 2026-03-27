import { colors, spacing, typography } from "@/constants/theme";
import { StyleSheet, View } from "react-native";
import { GHText } from "./GHText";

type Props = {
  label: string;
  value: string;
  caption?: string;
};

export function TelemetryDial({ label, value, caption }: Props) {
  return (
    <View style={styles.container}>
      <GHText style={styles.label} tone="secondary">
        {label}
      </GHText>
      <GHText style={styles.value}>{value}</GHText>
      {caption ? (
        <GHText style={styles.caption} tone="muted">
          {caption}
        </GHText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.tertiary,
    borderColor: colors.glass.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.xs,
  },
  label: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    fontFamily: typography.fontFamily.medium,
  },
  value: {
    color: colors.accent.lime,
    fontSize: typography.fontSize["2xl"],
    lineHeight: 28,
    fontFamily: typography.fontFamily.bold,
  },
  caption: {
    fontSize: 11,
  },
});
