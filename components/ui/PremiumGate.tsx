import { GHButton } from "@/components/ui/GHButton";
import { GHText } from "@/components/ui/GHText";
import { colors, spacing, typography } from "@/constants/theme";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type PremiumGateProps = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  locked: boolean;
};

export function PremiumGate({
  title = "Pro Feature",
  subtitle = "Upgrade to unlock this feature",
  children,
  locked,
}: PremiumGateProps) {
  const router = useRouter();

  if (!locked) {
    return <>{children}</>;
  }

  return (
    <View style={styles.wrapper}>
      {/* Blurred content behind the lock */}
      <View style={styles.blurContainer} pointerEvents="none">
        {children}
        <BlurView intensity={18} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, styles.overlay]} />
      </View>

      {/* Lock overlay */}
      <View style={styles.lockOverlay}>
        <View style={styles.lockIconWrap}>
          <MaterialCommunityIcons
            name="lock"
            size={32}
            color={colors.accent.lime}
          />
        </View>
        <GHText style={styles.lockTitle}>{title}</GHText>
        <GHText tone="secondary" variant="caption" style={styles.lockSubtitle}>
          {subtitle}
        </GHText>
        <GHButton
          label="Go Pro"
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/paywall");
          }}
          style={styles.lockButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
  },
  blurContainer: {
    position: "relative",
  },
  overlay: {
    backgroundColor: "rgba(10, 10, 10, 0.45)",
    borderRadius: 16,
  },
  lockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.lg,
  },
  lockIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(213, 254, 124, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(213, 254, 124, 0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  lockTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    textAlign: "center",
  },
  lockSubtitle: {
    textAlign: "center",
  },
  lockButton: {
    marginTop: spacing.xs,
    minWidth: 140,
  },
});
