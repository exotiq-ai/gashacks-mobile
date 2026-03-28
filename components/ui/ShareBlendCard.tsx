import { GHText } from "@/components/ui/GHText";
import { colors, spacing, typography } from "@/constants/theme";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRef } from "react";
import { Alert, Share, StyleSheet, TouchableOpacity, View } from "react-native";
import ViewShot from "react-native-view-shot";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type ShareBlendCardProps = {
  vehicleName?: string;
  blendPercent: number;
  octane: number;
  e85Gallons: number;
  pumpGasGallons: number;
};

function BlendCardContent({
  vehicleName,
  blendPercent,
  octane,
  e85Gallons,
  pumpGasGallons,
}: ShareBlendCardProps) {
  const date = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <LinearGradient
      colors={["#141414", "#0a0a0a"]}
      style={styles.card}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.accentDot} />
        <GHText tone="muted" variant="caption" style={styles.brandLabel}>
          GAS HACKS
        </GHText>
        <GHText tone="muted" variant="caption">
          {date}
        </GHText>
      </View>

      {/* Blend result */}
      <View style={styles.blendRow}>
        <GHText style={styles.blendValue}>E{blendPercent.toFixed(0)}</GHText>
        <View style={styles.blendMeta}>
          <GHText style={styles.octaneValue}>{octane.toFixed(1)}</GHText>
          <GHText tone="muted" variant="caption">
            octane
          </GHText>
        </View>
      </View>

      {/* Fill breakdown */}
      <View style={styles.fillRow}>
        <View style={styles.fillBlock}>
          <GHText style={styles.fillValue}>{e85Gallons.toFixed(2)}</GHText>
          <GHText tone="muted" variant="caption">
            gal E85
          </GHText>
        </View>
        <View style={styles.fillSep} />
        <View style={styles.fillBlock}>
          <GHText style={styles.fillValue}>{pumpGasGallons.toFixed(2)}</GHText>
          <GHText tone="muted" variant="caption">
            gal premium
          </GHText>
        </View>
      </View>

      {/* Vehicle */}
      {vehicleName && (
        <GHText tone="secondary" variant="caption" style={styles.vehicleLabel}>
          {vehicleName}
        </GHText>
      )}

      {/* Border accent */}
      <View style={styles.cardBorder} />
    </LinearGradient>
  );
}

export function ShareBlendCard(props: ShareBlendCardProps) {
  const shotRef = useRef<ViewShot>(null);

  const handleShare = async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const uri = await shotRef.current?.capture?.();
      if (!uri) throw new Error("Capture failed");

      await Share.share({
        url: uri,
        message: `E${props.blendPercent.toFixed(0)} blend · ${props.octane.toFixed(1)} octane — built with Gas Hacks`,
      });
    } catch {
      Alert.alert("Share Failed", "Could not capture the blend card.");
    }
  };

  return (
    <View style={styles.wrapper}>
      <ViewShot ref={shotRef} options={{ format: "png", quality: 1.0 }}>
        <BlendCardContent {...props} />
      </ViewShot>

      <TouchableOpacity style={styles.shareButton} onPress={() => void handleShare()}>
        <MaterialCommunityIcons name="share-variant" size={18} color={colors.background.primary} />
        <GHText style={styles.shareLabel}>Share Blend</GHText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  card: {
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  accentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent.lime,
  },
  brandLabel: {
    flex: 1,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 2,
  },
  blendRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.md,
  },
  blendValue: {
    fontSize: 64,
    lineHeight: 72,
    fontFamily: typography.fontFamily.bold,
    color: colors.accent.lime,
  },
  blendMeta: {
    gap: 2,
    paddingBottom: spacing.sm,
  },
  octaneValue: {
    fontSize: typography.fontSize["2xl"],
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.primary,
  },
  fillRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  fillBlock: {
    gap: 2,
  },
  fillSep: {
    width: 1,
    height: 32,
    backgroundColor: colors.glass.border,
  },
  fillValue: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.primary,
  },
  vehicleLabel: {
    borderTopWidth: 1,
    borderTopColor: colors.glass.border,
    paddingTop: spacing.sm,
  },
  cardBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.accent.lime,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    backgroundColor: colors.accent.lime,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  shareLabel: {
    color: colors.background.primary,
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.sm,
  },
});
