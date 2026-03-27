import { colors, spacing, typography } from "@/constants/theme";
import { ActivityIndicator, Pressable, StyleSheet, ViewStyle } from "react-native";
import { GHText } from "./GHText";

type Variant = "primary" | "secondary" | "ghost";

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export function GHButton({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  style,
}: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
        style,
      ]}
      disabled={isDisabled}
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#111111" : colors.accent.lime} />
      ) : (
        <GHText
          variant="body"
          tone={variant === "primary" ? "muted" : "accent"}
          style={styles.label}
        >
          {label}
        </GHText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  label: {
    fontFamily: typography.fontFamily.semibold,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.45,
  },
});

const variantStyles: Record<Variant, ViewStyle> = {
  primary: {
    backgroundColor: colors.accent.lime,
  },
  secondary: {
    backgroundColor: colors.background.tertiary,
    borderColor: colors.glass.border,
    borderWidth: 1,
  },
  ghost: {
    backgroundColor: "transparent",
  },
};
