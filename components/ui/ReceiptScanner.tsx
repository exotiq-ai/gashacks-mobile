import { colors, spacing, typography } from "@/constants/theme";
import { dollars, fixed } from "@/lib/format";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GHButton } from "./GHButton";
import { GHCard } from "./GHCard";
import { GHText } from "./GHText";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

export type ScannedReceipt = {
  gallonsE85: number | null;
  gallonsPump: number | null;
  pricePerGalE85: number | null;
  pricePerGalPump: number | null;
  totalCost: number | null;
  stationName: string | null;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (data: ScannedReceipt) => void;
  isPro: boolean;
};

export function ReceiptScanner({ visible, onClose, onConfirm, isPro }: Props) {
  const [mode, setMode] = useState<"camera" | "manual" | "review">("camera");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Parsed/editable fields
  const [gallonsE85, setGallonsE85] = useState("");
  const [gallonsPump, setGallonsPump] = useState("");
  const [priceE85, setPriceE85] = useState("");
  const [pricePump, setPricePump] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [stationName, setStationName] = useState("");

  const reset = () => {
    setMode("camera");
    setImageUri(null);
    setProcessing(false);
    setGallonsE85("");
    setGallonsPump("");
    setPriceE85("");
    setPricePump("");
    setTotalCost("");
    setStationName("");
  };

  const handleCapture = async () => {
    if (!isPro) {
      Alert.alert("Pro Feature", "Receipt scanning is available with Gas Hacks Pro.");
      return;
    }

    // TODO: Integrate expo-camera or expo-image-picker
    // For now, go straight to manual entry as fallback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMode("manual");
  };

  const handleConfirm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onConfirm({
      gallonsE85: gallonsE85 ? Number(gallonsE85) : null,
      gallonsPump: gallonsPump ? Number(gallonsPump) : null,
      pricePerGalE85: priceE85 ? Number(priceE85) : null,
      pricePerGalPump: pricePump ? Number(pricePump) : null,
      totalCost: totalCost ? Number(totalCost) : null,
      stationName: stationName || null,
    });
    reset();
    onClose();
  };

  const computedTotal = (() => {
    const e85 = (Number(gallonsE85) || 0) * (Number(priceE85) || 0);
    const pump = (Number(gallonsPump) || 0) * (Number(pricePump) || 0);
    return e85 + pump;
  })();

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTitle}>
            <MaterialCommunityIcons name="camera" size={24} color={colors.accent.lime} />
            <GHText variant="title" tone="accent">
              Receipt
            </GHText>
          </View>
          <Pressable onPress={() => { reset(); onClose(); }}>
            <GHText tone="secondary" style={styles.closeBtn}>
              ✕
            </GHText>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {mode === "camera" && (
            <Animated.View entering={FadeIn.duration(300)}>
              <GHCard style={styles.cameraCard}>
                <View style={styles.cameraPlaceholder}>
                  <View style={styles.cameraIconContainer}>
                    <MaterialCommunityIcons name="camera" size={48} color={colors.text.secondary} />
                  </View>
                  <GHText tone="secondary" style={styles.cameraText}>
                    Take a photo of your pump receipt
                  </GHText>
                  <GHText tone="muted" variant="caption">
                    We'll extract gallons, prices, and total automatically
                  </GHText>
                </View>
                <GHButton
                  label={isPro ? "Scan Receipt" : "Pro Feature"}
                  leftIcon={isPro ? "camera" : "lock"}
                  onPress={() => void handleCapture()}
                  disabled={!isPro}
                />
                <GHButton
                  label="Enter Manually Instead"
                  variant="secondary"
                  onPress={() => setMode("manual")}
                />
              </GHCard>
            </Animated.View>
          )}

          {(mode === "manual" || mode === "review") && (
            <Animated.View entering={FadeInDown.duration(300)}>
              <GHCard style={styles.formCard}>
                <GHText variant="subtitle">Fill Details</GHText>

                <ReceiptField
                  label="Station Name"
                  value={stationName}
                  onChange={setStationName}
                  placeholder="Shell, RaceTrac, etc."
                />
                <ReceiptField
                  label="E85 Gallons"
                  value={gallonsE85}
                  onChange={setGallonsE85}
                  placeholder="0.00"
                  numeric
                />
                <ReceiptField
                  label="E85 Price/gal"
                  value={priceE85}
                  onChange={setPriceE85}
                  placeholder="0.00"
                  numeric
                  prefix="$"
                />
                <ReceiptField
                  label="Pump Gas Gallons"
                  value={gallonsPump}
                  onChange={setGallonsPump}
                  placeholder="0.00"
                  numeric
                />
                <ReceiptField
                  label="Pump Gas Price/gal"
                  value={pricePump}
                  onChange={setPricePump}
                  placeholder="0.00"
                  numeric
                  prefix="$"
                />

                <View style={styles.totalRow}>
                  <GHText tone="secondary">Estimated Total</GHText>
                  <GHText tone="accent" style={styles.totalValue}>
                    {dollars(computedTotal, 2)}
                  </GHText>
                </View>

                <ReceiptField
                  label="Actual Total (override)"
                  value={totalCost}
                  onChange={setTotalCost}
                  placeholder={fixed(computedTotal, 2)}
                  numeric
                  prefix="$"
                />
              </GHCard>

              <View style={styles.actions}>
                <GHButton
                  label="Save Fill"
                  onPress={handleConfirm}
                />
                <GHButton
                  label="Cancel"
                  variant="ghost"
                  onPress={() => { reset(); onClose(); }}
                />
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

function ReceiptField({
  label,
  value,
  onChange,
  placeholder,
  numeric,
  prefix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  numeric?: boolean;
  prefix?: string;
}) {
  return (
    <View style={fieldStyles.container}>
      <GHText tone="secondary" variant="caption" style={fieldStyles.label}>
        {label}
      </GHText>
      <View style={fieldStyles.inputRow}>
        {prefix && (
          <GHText tone="muted" style={fieldStyles.prefix}>
            {prefix}
          </GHText>
        )}
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.text.muted}
          keyboardType={numeric ? "decimal-pad" : "default"}
          style={[fieldStyles.input, prefix ? fieldStyles.inputWithPrefix : null]}
        />
      </View>
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  container: { gap: 4 },
  label: {
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontSize: 10,
    fontFamily: typography.fontFamily.medium,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  prefix: {
    position: "absolute",
    left: 12,
    zIndex: 1,
    fontSize: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.glass.border,
    backgroundColor: colors.background.tertiary,
    color: colors.text.primary,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontFamily: typography.fontFamily.regular,
    fontSize: 16,
  },
  inputWithPrefix: {
    paddingLeft: 28,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    paddingTop: 60,
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  closeBtn: {
    fontSize: 24,
    padding: spacing.sm,
  },
  scroll: {
    padding: spacing.lg,
    paddingTop: 0,
    gap: spacing.md,
    paddingBottom: 40,
  },
  cameraCard: {
    gap: spacing.md,
    alignItems: "center",
  },
  cameraPlaceholder: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  cameraIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.glass.background,
    borderWidth: 1,
    borderColor: colors.glass.border,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraText: {
    textAlign: "center",
  },
  formCard: {
    gap: spacing.md,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.glass.border,
  },
  totalValue: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
