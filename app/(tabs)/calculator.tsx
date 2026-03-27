import { FuelGauge } from "@/components/ui/FuelGauge";
import { GHButton } from "@/components/ui/GHButton";
import { GHCard } from "@/components/ui/GHCard";
import { GHSlider } from "@/components/ui/GHSlider";
import { GHText } from "@/components/ui/GHText";
import { OctaneGauge } from "@/components/ui/OctaneGauge";
import { PresetPills, type Preset } from "@/components/ui/PresetPills";
import { colors, spacing, typography } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { calculateBlend } from "@/lib/calculator";
import { createFillLog } from "@/lib/data";
import { useGarageStore } from "@/lib/store";
import * as Haptics from "expo-haptics";
import { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";

export default function CalculatorScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { getActiveVehicle } = useGarageStore();
  const activeVehicle = getActiveVehicle();

  const [tankSize, setTankSize] = useState(15);
  const [currentLevel, setCurrentLevel] = useState(25);
  const [currentEthanol, setCurrentEthanol] = useState(10);
  const [targetEthanol, setTargetEthanol] = useState(30);
  const [pumpGasEthanol, setPumpGasEthanol] = useState(10);
  const [ethanolFuelPercent, setEthanolFuelPercent] = useState(85);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!activeVehicle) return;
    setTankSize(activeVehicle.tankCapacityGallons);
    const tune = activeVehicle.currentTune ?? "";
    const parsed = tune.match(/e(\d{1,2})/i);
    if (parsed?.[1]) {
      setTargetEthanol(Number(parsed[1]));
    }
  }, [activeVehicle?.id]);

  const result = useMemo(() => {
    return calculateBlend({
      tankSize,
      currentLevel,
      currentEthanol,
      targetEthanol,
      pumpGasEthanol,
      ethanolFuelPercent,
    });
  }, [tankSize, currentLevel, currentEthanol, targetEthanol, pumpGasEthanol, ethanolFuelPercent]);

  const handlePreset = (preset: Preset) => {
    setTargetEthanol(preset.targetEthanol);
  };

  const saveBlend = async () => {
    if (!user || !result || !result.canFillToTarget) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      await createFillLog({
        userId: user.id,
        vehicleId: activeVehicle?.id ?? null,
        tankLevelBefore: Math.round(currentLevel * 10),
        ethanolMixBefore: Math.round(currentEthanol * 10),
        targetEthanolMix: Math.round(targetEthanol * 10),
        resultingEthanolMix: Math.round(result.resultingMix * 10),
        resultingOctane: Math.round(result.octaneRating * 10),
        e85Gallons: result.ethanolToAdd,
        pumpGasGallons: result.pumpGasToAdd,
        pumpGasOctane: 93,
        e85ActualEthanol: Math.round(ethanolFuelPercent * 10),
      });
      setSaveMessage("Blend saved ✓");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      setSaveMessage(err instanceof Error ? err.message : "Failed to save.");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.container,
        { paddingBottom: insets.bottom + 90 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <GHText variant="title" tone="accent">
          Mission Control
        </GHText>
        {activeVehicle ? (
          <GHText tone="secondary">
            {activeVehicle.year ?? ""} {activeVehicle.make} {activeVehicle.model}
          </GHText>
        ) : (
          <GHText tone="muted" variant="caption">
            No vehicle selected · using manual inputs
          </GHText>
        )}
      </View>

      {/* Preset Quick Select */}
      <PresetPills activeTarget={targetEthanol} onSelect={handlePreset} />

      {/* Visual Dashboard */}
      <Animated.View entering={FadeInUp.duration(400)}>
        <GHCard style={styles.dashCard}>
          <View style={styles.gaugeRow}>
            <FuelGauge
              tankLevel={currentLevel}
              ethanolMix={currentEthanol}
              tankSize={tankSize}
            />
            <OctaneGauge octane={result.octaneRating || 91} />
          </View>
        </GHCard>
      </Animated.View>

      {/* Sliders */}
      <Animated.View entering={FadeInDown.duration(400).delay(100)}>
        <GHCard style={styles.slidersCard}>
          <GHText variant="subtitle" tone="secondary" style={styles.sectionTitle}>
            Tank Setup
          </GHText>
          <GHSlider
            label="Tank Size"
            value={tankSize}
            min={5}
            max={40}
            step={0.5}
            unit=" gal"
            onValueChange={setTankSize}
          />
          <GHSlider
            label="Current Level"
            value={currentLevel}
            min={0}
            max={100}
            step={5}
            unit="%"
            onValueChange={setCurrentLevel}
          />
          <GHSlider
            label="Current E-Mix"
            value={currentEthanol}
            min={0}
            max={100}
            step={1}
            unit="%"
            onValueChange={setCurrentEthanol}
          />
        </GHCard>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(400).delay(200)}>
        <GHCard style={styles.slidersCard}>
          <GHText variant="subtitle" tone="secondary" style={styles.sectionTitle}>
            Target Blend
          </GHText>
          <GHSlider
            label="Target E-Mix"
            value={targetEthanol}
            min={0}
            max={100}
            step={1}
            unit="%"
            onValueChange={setTargetEthanol}
          />
          <GHSlider
            label="Pump Gas Ethanol"
            value={pumpGasEthanol}
            min={0}
            max={15}
            step={1}
            unit="%"
            onValueChange={setPumpGasEthanol}
          />
          <GHSlider
            label="E85 Actual Content"
            value={ethanolFuelPercent}
            min={50}
            max={98}
            step={1}
            unit="%"
            onValueChange={setEthanolFuelPercent}
          />
        </GHCard>
      </Animated.View>

      {/* Results */}
      <Animated.View entering={FadeInDown.duration(400).delay(300)}>
        <GHCard style={styles.resultsCard}>
          {result.canFillToTarget ? (
            <>
              <GHText variant="subtitle" tone="secondary" style={styles.sectionTitle}>
                Fill Instructions
              </GHText>
              <View style={styles.resultRow}>
                <View style={styles.resultBlock}>
                  <GHText tone="muted" variant="caption" style={styles.resultLabel}>
                    PUMP FIRST
                  </GHText>
                  <GHText style={styles.resultValue}>
                    {result.ethanolToAdd.toFixed(2)}
                  </GHText>
                  <GHText tone="secondary" variant="caption">
                    gal E85
                  </GHText>
                </View>
                <View style={styles.resultDivider} />
                <View style={styles.resultBlock}>
                  <GHText tone="muted" variant="caption" style={styles.resultLabel}>
                    THEN TOP OFF
                  </GHText>
                  <GHText style={styles.resultValue}>
                    {result.pumpGasToAdd.toFixed(2)}
                  </GHText>
                  <GHText tone="secondary" variant="caption">
                    gal premium
                  </GHText>
                </View>
              </View>
              <View style={styles.outcomeRow}>
                <GHText tone="secondary" variant="caption">
                  Blend outcome:
                </GHText>
                <GHText tone="accent" style={styles.outcomeValue}>
                  E{result.resultingMix.toFixed(1)}
                </GHText>
                <GHText tone="muted">·</GHText>
                <GHText tone="accent" style={styles.outcomeValue}>
                  {result.octaneRating.toFixed(1)} oct
                </GHText>
              </View>
            </>
          ) : (
            <View style={styles.errorBlock}>
              <GHText tone="secondary" variant="body">
                ⚠️ {result.errorMessage}
              </GHText>
            </View>
          )}
        </GHCard>
      </Animated.View>

      {/* Save */}
      <GHButton
        label={saveMessage ?? "Save Blend Configuration"}
        onPress={() => void saveBlend()}
        loading={saving}
        disabled={!user || !result.canFillToTarget}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    gap: spacing.xs,
  },
  dashCard: {
    paddingVertical: spacing.lg,
  },
  gaugeRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  slidersCard: {
    gap: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  resultsCard: {
    gap: spacing.md,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  resultBlock: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
  },
  resultLabel: {
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontFamily: typography.fontFamily.medium,
  },
  resultValue: {
    fontSize: 48,
    lineHeight: 54,
    color: colors.accent.lime,
    fontFamily: typography.fontFamily.bold,
  },
  resultDivider: {
    width: 1,
    height: 60,
    backgroundColor: colors.glass.border,
  },
  outcomeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  outcomeValue: {
    fontFamily: typography.fontFamily.semibold,
  },
  errorBlock: {
    padding: spacing.md,
    alignItems: "center",
  },
});
