import { GHButton } from "@/components/ui/GHButton";
import { GHCard } from "@/components/ui/GHCard";
import { GHText } from "@/components/ui/GHText";
import { colors, spacing, typography } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { useEntitlements } from "@/hooks/useEntitlements";
import {
  createVehicle,
  fetchVehicles,
  setActiveVehicle as setActiveVehicleRemote,
} from "@/lib/data";
import { canAddVehicle } from "@/lib/entitlements";
import { MAKES, getModelsForMake, type VehicleTemplate } from "@/lib/vehicleDb";
import { useGarageStore } from "@/lib/store";
import * as Haptics from "expo-haptics";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

type AddMode = "pick" | "manual";

export default function GarageScreen() {
  const { user } = useAuth();
  const { isPro, entitlements } = useEntitlements();
  const { vehicles, setVehicles, setActiveVehicle, activeVehicleId } = useGarageStore();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addMode, setAddMode] = useState<AddMode>("pick");

  // Pick mode
  const [selectedMake, setSelectedMake] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<VehicleTemplate | null>(null);

  // Manual/shared fields
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [tankCapacity, setTankCapacity] = useState("15");
  const [tune, setTune] = useState("");

  const models = useMemo(
    () => (selectedMake ? getModelsForMake(selectedMake) : []),
    [selectedMake],
  );

  const loadGarage = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const v = await fetchVehicles(user.id);
      setVehicles(v);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load garage.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadGarage();
  }, [user?.id]);

  const handleActivate = async (vehicleId: string) => {
    if (!user) return;
    try {
      await setActiveVehicleRemote(user.id, vehicleId);
      setActiveVehicle(vehicleId);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
  };

  const handleAdd = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      let addMake = make;
      let addModel = model;
      let addTank = Number(tankCapacity);
      let addYear = year ? Number(year) : undefined;

      if (addMode === "pick" && selectedTemplate) {
        addMake = selectedTemplate.make;
        addModel = selectedTemplate.model;
        addTank = selectedTemplate.tankGallons;
      }

      if (!addMake || !addModel || addTank <= 0) {
        setError("Make, model, and tank size are required.");
        setSaving(false);
        return;
      }

      const created = await createVehicle({
        userId: user.id,
        year: addYear,
        make: addMake,
        model: addModel,
        tankCapacityGallons: addTank,
        currentTune: tune || undefined,
      });
      useGarageStore.getState().addVehicle(created);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add vehicle.");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setShowAdd(false);
    setSelectedMake(null);
    setSelectedTemplate(null);
    setYear("");
    setMake("");
    setModel("");
    setTankCapacity("15");
    setTune("");
    setAddMode("pick");
  };

  const canAdd = canAddVehicle(vehicles.length, entitlements);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 90 }]}
      showsVerticalScrollIndicator={false}
    >
      <GHText variant="title" tone="accent">
        Garage
      </GHText>
      <GHText tone="secondary">
        {vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""}
        {!isPro ? ` · ${vehicles.length}/1 free slot` : ""}
      </GHText>

      {error && (
        <GHText style={styles.errorText}>{error}</GHText>
      )}

      {/* Vehicle List */}
      {vehicles.length === 0 && !loading ? (
        <GHCard style={styles.emptyCard}>
          <View style={styles.emptyIconContainer}>
            <MaterialCommunityIcons name="car-sports" size={48} color={colors.text.secondary} />
          </View>
          <GHText tone="secondary" style={styles.emptyText}>
            No vehicles yet. Add your ride to get started.
          </GHText>
        </GHCard>
      ) : (
        vehicles.map((v) => {
          const isActive = v.id === activeVehicleId;
          return (
            <Animated.View key={v.id} entering={FadeInDown.duration(300)}>
              <Pressable onPress={() => handleActivate(v.id)}>
                <GHCard style={[styles.vehicleCard, isActive && styles.vehicleCardActive]}>
                  <View style={styles.vehicleHeader}>
                    <View style={{ flex: 1 }}>
                      <GHText variant="subtitle">
                        {v.year ?? ""} {v.make} {v.model}
                      </GHText>
                      <GHText tone="muted" variant="caption">
                        {v.tankCapacityGallons} gal
                        {v.currentTune ? ` · ${v.currentTune}` : ""}
                      </GHText>
                    </View>
                    {isActive && (
                      <View style={styles.activeBadge}>
                        <GHText tone="accent" style={styles.activeBadgeText}>
                          ACTIVE
                        </GHText>
                      </View>
                    )}
                  </View>
                </GHCard>
              </Pressable>
            </Animated.View>
          );
        })
      )}

      {/* Add Vehicle */}
      {!showAdd ? (
        <GHButton
          label={canAdd ? "+ Add Vehicle" : "Upgrade to Pro for more slots"}
          variant={canAdd ? "primary" : "secondary"}
          disabled={!canAdd}
          onPress={() => setShowAdd(true)}
        />
      ) : (
        <GHCard style={styles.addCard}>
          <GHText variant="subtitle">Add Vehicle</GHText>

          {/* Mode toggle */}
          <View style={styles.modeToggle}>
            <Pressable
              style={[styles.modeBtn, addMode === "pick" && styles.modeBtnActive]}
              onPress={() => setAddMode("pick")}
            >
              <GHText tone={addMode === "pick" ? "accent" : "secondary"} style={styles.modeLabel}>
                Pick Model
              </GHText>
            </Pressable>
            <Pressable
              style={[styles.modeBtn, addMode === "manual" && styles.modeBtnActive]}
              onPress={() => setAddMode("manual")}
            >
              <GHText tone={addMode === "manual" ? "accent" : "secondary"} style={styles.modeLabel}>
                Manual Entry
              </GHText>
            </Pressable>
          </View>

          {addMode === "pick" ? (
            <>
              {/* Make picker */}
              <GHText tone="secondary" variant="caption">
                Select Make
              </GHText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pillScroll}
              >
                {MAKES.map((m) => (
                  <Pressable
                    key={m}
                    style={[styles.pill, selectedMake === m && styles.pillActive]}
                    onPress={() => {
                      setSelectedMake(m);
                      setSelectedTemplate(null);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <GHText
                      tone={selectedMake === m ? "accent" : "primary"}
                      style={styles.pillText}
                    >
                      {m}
                    </GHText>
                  </Pressable>
                ))}
              </ScrollView>

              {/* Model picker */}
              {selectedMake && (
                <>
                  <GHText tone="secondary" variant="caption">
                    Select Model
                  </GHText>
                  {models.map((t) => {
                    const isSel = selectedTemplate?.model === t.model;
                    return (
                      <Pressable
                        key={t.model}
                        style={[styles.modelRow, isSel && styles.modelRowActive]}
                        onPress={() => {
                          setSelectedTemplate(t);
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <GHText tone={isSel ? "accent" : "primary"}>{t.model}</GHText>
                          <GHText tone="muted" variant="caption">
                            {t.years} · {t.tankGallons} gal{t.engine ? ` · ${t.engine}` : ""}
                          </GHText>
                        </View>
                        {isSel && <GHText tone="accent">✓</GHText>}
                      </Pressable>
                    );
                  })}
                </>
              )}
            </>
          ) : (
            <>
              <FieldInput label="Year" value={year} onChange={setYear} keyboardType="number-pad" />
              <FieldInput label="Make" value={make} onChange={setMake} />
              <FieldInput label="Model" value={model} onChange={setModel} />
              <FieldInput
                label="Tank Capacity (gal)"
                value={tankCapacity}
                onChange={setTankCapacity}
                keyboardType="decimal-pad"
              />
            </>
          )}

          <FieldInput
            label="Current Tune (optional)"
            value={tune}
            onChange={setTune}
            placeholder="e.g. Stage 2 E30"
          />

          <View style={styles.addActions}>
            <GHButton
              label="Cancel"
              variant="ghost"
              onPress={resetForm}
              style={{ flex: 1 }}
            />
            <GHButton
              label="Save"
              onPress={() => void handleAdd()}
              loading={saving}
              disabled={addMode === "pick" ? !selectedTemplate : !make || !model}
              style={{ flex: 1 }}
            />
          </View>
        </GHCard>
      )}
    </ScrollView>
  );
}

function FieldInput({
  label,
  value,
  onChange,
  placeholder,
  keyboardType = "default",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "number-pad" | "decimal-pad";
}) {
  return (
    <View style={fieldStyles.container}>
      <GHText tone="secondary" variant="caption" style={fieldStyles.label}>
        {label}
      </GHText>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.text.muted}
        keyboardType={keyboardType}
        style={fieldStyles.input}
      />
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  container: { gap: 4 },
  label: { textTransform: "uppercase", letterSpacing: 0.8, fontSize: 10 },
  input: {
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
});

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  errorText: {
    color: colors.status.error,
  },
  emptyCard: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  emptyIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.glass.background,
    borderWidth: 1,
    borderColor: colors.glass.border,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    textAlign: "center",
  },
  vehicleCard: {
    borderColor: colors.glass.border,
  },
  vehicleCardActive: {
    borderColor: colors.accent.lime,
  },
  vehicleHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  activeBadge: {
    borderWidth: 1,
    borderColor: colors.accent.lime,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  activeBadgeText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.semibold,
    letterSpacing: 1,
  },
  addCard: {
    gap: spacing.md,
  },
  modeToggle: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: colors.background.tertiary,
    borderRadius: 10,
    padding: 4,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: "center",
  },
  modeBtnActive: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  modeLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 13,
  },
  pillScroll: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pill: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.glass.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pillActive: {
    borderColor: colors.accent.lime,
    backgroundColor: "rgba(213, 254, 124, 0.08)",
  },
  pillText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 13,
  },
  modelRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: 10,
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  modelRowActive: {
    borderColor: colors.accent.lime,
    backgroundColor: "rgba(213, 254, 124, 0.06)",
  },
  addActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
});
