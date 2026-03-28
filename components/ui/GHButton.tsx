import { colors, spacing, typography } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { GHText } from "./GHText";

type Variant = "primary" | "secondary" | "ghost";

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  leftIcon?: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
};

export function GHButton({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  style,
  leftIcon,
}: Props) {
  const isDisabled = disabled || loading;
  const textTone = variant === "primary" ? "muted" : "accent";
  const iconColor = variant === "primary" ? "#111111" : colors.accent.lime;
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
      ) : leftIcon ? (
        <View style={styles.iconRow}>
          <MaterialCommunityIcons name={leftIcon} size={18} color={iconColor} />
          <GHText variant="body" tone={textTone} style={styles.label}>
            {label}
          </GHText>
        </View>
      ) : (
        <GHText
          variant="body"
          tone={textTone}
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
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
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
