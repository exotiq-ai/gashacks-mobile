import { colors, typography } from "@/constants/theme";
import { ReactNode } from "react";
import { StyleSheet, Text, TextStyle } from "react-native";

type Variant = "title" | "subtitle" | "body" | "caption";
type Tone = "primary" | "secondary" | "muted" | "accent";

type Props = {
  children: ReactNode;
  variant?: Variant;
  tone?: Tone;
  style?: TextStyle;
};

const variantStyles: Record<Variant, TextStyle> = {
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize["3xl"],
    lineHeight: 38,
  },
  subtitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.xl,
    lineHeight: 26,
  },
  body: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    lineHeight: 22,
  },
  caption: {
    fontFamily: typography.fontFamily.light,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
};

const toneStyles: Record<Tone, TextStyle> = {
  primary: { color: colors.text.primary },
  secondary: { color: colors.text.secondary },
  muted: { color: colors.text.muted },
  accent: { color: colors.accent.lime },
};

export function GHText({
  children,
  variant = "body",
  tone = "primary",
  style,
}: Props) {
  return (
    <Text style={[styles.base, variantStyles[variant], toneStyles[tone], style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
});
