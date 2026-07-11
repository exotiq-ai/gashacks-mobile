import { colors, spacing, typography } from "@/constants/theme";
import { scanReceiptImage } from "@/lib/receiptScanner";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GHButton } from "./GHButton";
import { GHCard } from "./GHCard";
import { GHText } from "./GHText";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
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
  stationAddress: string | null;
  purchasedAt: string | null;
  ethanolPercent: number | null;
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
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  // Parsed/editable fields
  const [gallonsE85, setGallonsE85] = useState("");
  const [gallonsPump, setGallonsPump] = useState("");
  const [priceE85, setPriceE85] = useState("");
  const [pricePump, setPricePump] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [stationName, setStationName] = useState("");
  const [stationAddress, setStationAddress] = useState("");
  const [purchasedAt, setPurchasedAt] = useState("");
  const [ethanolPercent, setEthanolPercent] = useState("");

  const reset = () => {
    setMode("camera");
    setImageUri(null);
    setProcessing(false);
    setScanMessage(null);
    setGallonsE85("");
    setGallonsPump("");
    setPriceE85("");
    setPricePump("");
    setTotalCost("");
    setStationName("");
    setStationAddress("");
    setPurchasedAt("");
    setEthanolPercent("");
  };

  const applyScan = async (asset: ImagePicker.ImagePickerAsset) => {
    if (!asset.base64) {
      throw new Error("Receipt image was missing scan data.");
    }

    setImageUri(asset.uri);
    setProcessing(true);
    setScanMessage("Reading receipt...");
    const scanned = await scanReceiptImage({
      base64: asset.base64,
      mimeType: asset.mimeType ?? "image/jpeg",
    });

    setStationName(scanned.stationName ?? "");
    setStationAddress(scanned.stationAddress ?? "");
    setPurchasedAt(scanned.purchasedAt ?? "");
    setGallonsE85(scanned.gallonsE85 != null ? String(scanned.gallonsE85) : "");
    setGallonsPump(scanned.gallonsPump != null ? String(scanned.gallonsPump) : "");
    setPriceE85(scanned.pricePerGalE85 != null ? String(scanned.pricePerGalE85) : "");
    setPricePump(scanned.pricePerGalPump != null ? String(scanned.pricePerGalPump) : "");
    setTotalCost(scanned.totalCost != null ? String(scanned.totalCost) : "");
    setEthanolPercent(scanned.ethanolPercent != null ? String(scanned.ethanolPercent) : "");
    setScanMessage(`AI scan complete. Confidence ${Math.round(scanned.confidence * 100)}%. Review before saving.`);
    setMode("review");
  };

  const handlePickImage = async (source: "camera" | "library") => {
    if (!isPro) {
      Alert.alert("Pro Feature", "Receipt scanning is available with Gas Hacks Pro.");
      return;
    }

    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const permission =
        source === "camera"
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Permission Needed", "Allow photo access to scan a receipt, or enter it manually.");
        return;
      }

      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync({
              base64: true,
              quality: 0.82,
              allowsEditing: false,
            })
          : await ImagePicker.launchImageLibraryAsync({
              base64: true,
              quality: 0.82,
              allowsEditing: false,
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
            });

      if (result.canceled || !result.assets[0]) return;
      await applyScan(result.assets[0]);
    } catch (err) {
      setScanMessage(err instanceof Error ? err.message : "Receipt scan failed.");
      setMode("manual");
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirm = () => {
    const parseOptionalNumber = (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return null;
      const parsed = Number(trimmed);
      return Number.isFinite(parsed) ? parsed : null;
    };

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onConfirm({
      gallonsE85: parseOptionalNumber(gallonsE85),
      gallonsPump: parseOptionalNumber(gallonsPump),
      pricePerGalE85: parseOptionalNumber(priceE85),
      pricePerGalPump: parseOptionalNumber(pricePump),
      totalCost: parseOptionalNumber(totalCost),
      stationName: stationName.trim() || null,
      stationAddress: stationAddress.trim() || null,
      purchasedAt: purchasedAt.trim() || null,
      ethanolPercent: parseOptionalNumber(ethanolPercent),
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
          <GHText variant="title" tone="accent">
            Receipt
          </GHText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close receipt scanner"
            hitSlop={12}
            onPress={() => { reset(); onClose(); }}
            style={styles.closeBtn}
          >
            <MaterialCommunityIcons name="close" size={30} color={colors.text.secondary} />
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
                  <MaterialCommunityIcons name="receipt-text" size={58} color={colors.accent.lime} />
                  <GHText tone="secondary" style={styles.cameraText}>
                    Scan a pump receipt
                  </GHText>
                  <GHText tone="muted" variant="caption">
                    AI extracts station, gallons, prices, date, and total. You review everything before saving.
                  </GHText>
                </View>
                {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImage} />}
                {scanMessage && (
                  <GHText tone="muted" variant="caption" style={styles.scanMessage}>
                    {scanMessage}
                  </GHText>
                )}
                <GHButton
                  label={processing ? "Scanning..." : isPro ? "Take Photo" : "Pro Feature"}
                  icon={isPro ? "camera" : "lock"}
                  onPress={() => void handlePickImage("camera")}
                  disabled={!isPro || processing}
                  loading={processing}
                />
                <GHButton
                  label="Choose Photo"
                  icon="image-search"
                  variant="secondary"
                  onPress={() => void handlePickImage("library")}
                  disabled={!isPro || processing}
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
                {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImage} />}
                {scanMessage && (
                  <GHText tone="muted" variant="caption">
                    {scanMessage}
                  </GHText>
                )}

                <ReceiptField
                  label="Station Name"
                  value={stationName}
                  onChange={setStationName}
                  placeholder="Shell, RaceTrac, etc."
                />
                <ReceiptField
                  label="Station Address"
                  value={stationAddress}
                  onChange={setStationAddress}
                  placeholder="Street, city, state"
                />
                <ReceiptField
                  label="Date / Time"
                  value={purchasedAt}
                  onChange={setPurchasedAt}
                  placeholder="From receipt"
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
                <ReceiptField
                  label="Ethanol Content"
                  value={ethanolPercent}
                  onChange={setEthanolPercent}
                  placeholder="85"
                  numeric
                  suffix="%"
                />

                <View style={styles.totalRow}>
                  <GHText tone="secondary">Estimated Total</GHText>
                  <GHText tone="accent" style={styles.totalValue}>
                    ${computedTotal.toFixed(2)}
                  </GHText>
                </View>

                <ReceiptField
                  label="Actual Total (override)"
                  value={totalCost}
                  onChange={setTotalCost}
                  placeholder={computedTotal.toFixed(2)}
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
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  numeric?: boolean;
  prefix?: string;
  suffix?: string;
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
          accessibilityLabel={label}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.text.muted}
          keyboardType={numeric ? "decimal-pad" : "default"}
          style={[fieldStyles.input, prefix ? fieldStyles.inputWithPrefix : null]}
        />
        {suffix && (
          <GHText tone="muted" style={fieldStyles.suffix}>
            {suffix}
          </GHText>
        )}
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
  suffix: {
    position: "absolute",
    right: 12,
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
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
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
  cameraText: {
    textAlign: "center",
  },
  formCard: {
    gap: spacing.md,
  },
  previewImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    backgroundColor: colors.background.tertiary,
  },
  scanMessage: {
    textAlign: "center",
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
