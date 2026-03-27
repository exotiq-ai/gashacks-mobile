import { GHButton } from "@/components/ui/GHButton";
import { GHCard } from "@/components/ui/GHCard";
import { GHText } from "@/components/ui/GHText";
import { colors, spacing } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { calculateBlend } from "@/lib/calculator";
import { createFillLog } from "@/lib/data";
import { useGarageStore } from "@/lib/store";
import * as Haptics from "expo-haptics";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

export default function CalculatorScreen() {
  const { user } = useAuth();
  const { getActiveVehicle } = useGarageStore();
  const activeVehicle = getActiveVehicle();
  const [tankSize, setTankSize] = useState("15");
  const [currentLevel, setCurrentLevel] = useState("25");
  const [currentEthanol, setCurrentEthanol] = useState("10");
  const [targetEthanol, setTargetEthanol] = useState("30");
  const [pumpGasEthanol, setPumpGasEthanol] = useState("10");
  const [ethanolFuelPercent, setEthanolFuelPercent] = useState("85");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!activeVehicle) return;
    setTankSize(String(activeVehicle.tankCapacityGallons));
    const tune = activeVehicle.currentTune ?? "";
    const parsed = tune.match(/e(\d{1,2})/i);
    if (parsed?.[1]) {
      setTargetEthanol(parsed[1]);
    }
  }, [activeVehicle?.id]);

  const parsed = useMemo(
    () => ({
      tankSize: Number(tankSize),
      currentLevel: Number(currentLevel),
      currentEthanol: Number(currentEthanol),
      targetEthanol: Number(targetEthanol),
      pumpGasEthanol: Number(pumpGasEthanol),
      ethanolFuelPercent: Number(ethanolFuelPercent),
    }),
    [currentEthanol, currentLevel, ethanolFuelPercent, pumpGasEthanol, tankSize, targetEthanol]
  );

  const validationError = useMemo(() => {
    if (!Number.isFinite(parsed.tankSize) || parsed.tankSize <= 0) {
      return "Tank size must be greater than 0 gallons.";
    }
    if (parsed.currentLevel < 0 || parsed.currentLevel > 100) {
      return "Current tank level must be between 0 and 100%.";
    }
    if (parsed.currentEthanol < 0 || parsed.currentEthanol > 100) {
      return "Current E-mix must be between 0 and 100%.";
    }
    if (parsed.targetEthanol < 0 || parsed.targetEthanol > 100) {
      return "Target E-mix must be between 0 and 100%.";
    }
    if (parsed.pumpGasEthanol < 0 || parsed.pumpGasEthanol > 100) {
      return "Pump gas ethanol must be between 0 and 100%.";
    }
    if (parsed.ethanolFuelPercent < 0 || parsed.ethanolFuelPercent > 100) {
      return "Actual E85 content must be between 0 and 100%.";
    }
    return null;
  }, [parsed]);

  const result = useMemo(() => {
    if (validationError) {
      return null;
    }
    return calculateBlend({
      tankSize: parsed.tankSize,
      currentLevel: parsed.currentLevel,
      currentEthanol: parsed.currentEthanol,
      targetEthanol: parsed.targetEthanol,
      pumpGasEthanol: parsed.pumpGasEthanol,
      ethanolFuelPercent: parsed.ethanolFuelPercent,
    });
  }, [parsed, validationError]);

  const saveBlend = async () => {
    if (!user || !result || validationError) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      await createFillLog({
        userId: user.id,
        vehicleId: activeVehicle?.id ?? null,
        tankLevelBefore: Math.round(parsed.currentLevel * 10),
        ethanolMixBefore: Math.round(parsed.currentEthanol * 10),
        targetEthanolMix: Math.round(parsed.targetEthanol * 10),
        resultingEthanolMix: Math.round(result.resultingMix * 10),
        resultingOctane: Math.round(result.octaneRating * 10),
        e85Gallons: result.ethanolToAdd,
        pumpGasGallons: result.pumpGasToAdd,
        pumpGasOctane: 93,
        e85ActualEthanol: Math.round(parsed.ethanolFuelPercent * 10),
      });
      setSaveMessage("Blend saved to logbook.");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      setSaveMessage(err instanceof Error ? err.message : "Failed to save blend.");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <GHText variant="title">Mission Control</GHText>
      {activeVehicle ? (
        <GHText tone="secondary">
          Active: {activeVehicle.year ?? ""} {activeVehicle.make} {activeVehicle.model}
        </GHText>
      ) : (
        <GHText tone="secondary">No active vehicle selected. Using manual inputs.</GHText>
      )}
      <GHCard style={styles.card}>
        <Field label="Tank Size (gal)" value={tankSize} setValue={setTankSize} />
        <Field label="Current Tank Level (%)" value={currentLevel} setValue={setCurrentLevel} />
        <Field label="Current E-Mix (%)" value={currentEthanol} setValue={setCurrentEthanol} />
        <Field label="Target E-Mix (%)" value={targetEthanol} setValue={setTargetEthanol} />
        <Field label="Pump Gas Ethanol (%)" value={pumpGasEthanol} setValue={setPumpGasEthanol} />
        <Field
          label="Actual E85 Content (%)"
          value={ethanolFuelPercent}
          setValue={setEthanolFuelPercent}
        />
        <GHButton
          label="Recalculate"
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        />
        {validationError ? (
          <GHText style={styles.errorText}>Input fault: {validationError}</GHText>
        ) : null}
      </GHCard>

      <GHCard style={styles.card}>
        <View style={styles.splitBlock}>
          <GHText variant="subtitle">Pump First</GHText>
          <GHText style={styles.metricValue}>{result ? result.ethanolToAdd.toFixed(2) : "--"}</GHText>
          <GHText tone="secondary">gal E85 ethanol</GHText>
        </View>
        <View style={styles.splitDivider} />
        <View style={styles.splitBlock}>
          <GHText variant="subtitle">Then Top Off</GHText>
          <GHText style={styles.metricValue}>{result ? result.pumpGasToAdd.toFixed(2) : "--"}</GHText>
          <GHText tone="secondary">gal premium pump gas</GHText>
        </View>
        {result ? (
          <GHText tone="secondary">
            Blend outcome: E{result.resultingMix.toFixed(1)} | {result.octaneRating.toFixed(1)} octane
          </GHText>
        ) : null}
        {result && !result.canFillToTarget && result.errorMessage ? (
          <GHText tone="secondary">{result.errorMessage}</GHText>
        ) : null}
        <GHButton
          label="Save Blend Configuration"
          onPress={() => void saveBlend()}
          loading={saving}
          disabled={!user || !result || Boolean(validationError)}
        />
        {saveMessage ? <GHText tone="secondary">{saveMessage}</GHText> : null}
      </GHCard>
    </View>
  );
}

function Field({
  label,
  value,
  setValue,
}: {
  label: string;
  value: string;
  setValue: (next: string) => void;
}) {
  return (
    <View style={styles.field}>
      <GHText tone="secondary">{label}</GHText>
      <TextInput
        value={value}
        onChangeText={setValue}
        keyboardType="decimal-pad"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    gap: spacing.sm,
  },
  field: {
    gap: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.glass.border,
    backgroundColor: colors.background.tertiary,
    color: colors.text.primary,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  splitBlock: {
    alignItems: "center",
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  splitDivider: {
    height: 1,
    backgroundColor: colors.glass.border,
  },
  metricValue: {
    fontSize: 64,
    lineHeight: 72,
    color: colors.accent.lime,
  },
  errorText: {
    color: colors.status.error,
  },
});
