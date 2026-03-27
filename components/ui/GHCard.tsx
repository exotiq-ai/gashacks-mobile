import { colors, spacing } from "@/constants/theme";
import { BlurView } from "expo-blur";
import { ReactNode } from "react";
import { Platform, StyleSheet, View, ViewStyle } from "react-native";

type Props = {
  children: ReactNode;
  style?: ViewStyle;
};

export function GHCard({ children, style }: Props) {
  if (Platform.OS === "ios") {
    return (
      <BlurView intensity={30} tint="dark" style={[styles.base, style]}>
        {children}
      </BlurView>
    );
  }

  return <View style={[styles.base, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.glass.background,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.glass.border,
    padding: spacing.md,
    overflow: "hidden",
  },
});
