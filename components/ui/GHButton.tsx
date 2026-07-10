import { colors, spacing, typography } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { GHText } from "./GHText";

type Variant = "primary" | "secondary" | "ghost";
type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

type Props = {
  label: string;
  onPress: () => void;
  icon?: IconName;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function GHButton({
  label,
  onPress,
  icon,
  variant = "primary",
  disabled = false,
  loading = false,
  style,
}: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
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
        <View style={styles.content}>
          {icon && (
            <MaterialCommunityIcons
              name={icon}
              size={18}
              color={variant === "primary" ? "#111111" : colors.accent.lime}
            />
          )}
          <GHText
            variant="body"
            tone={variant === "primary" ? "muted" : "accent"}
            style={styles.label}
          >
            {label}
          </GHText>
        </View>
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
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
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
