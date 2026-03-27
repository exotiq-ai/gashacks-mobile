import { GHButton } from "@/components/ui/GHButton";
import { GHCard } from "@/components/ui/GHCard";
import { GHText } from "@/components/ui/GHText";
import { colors, spacing } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { useEntitlements } from "@/hooks/useEntitlements";
import {
  createVehicle,
  fetchVehicles,
  setActiveVehicle as setActiveVehicleRemote,
} from "@/lib/data";
import { canAddVehicle } from "@/lib/entitlements";
import { useGarageStore } from "@/lib/store";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";

export default function GarageScreen() {
  const { user } = useAuth();
  const { isPro, entitlements } = useEntitlements();
  const { vehicles, setVehicles, setActiveVehicle, activeVehicleId } = useGarageStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [tankCapacity, setTankCapacity] = useState("15");
  const [tune, setTune] = useState("");

  const loadGarage = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchVehicles(user.id);
      setVehicles(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load garage.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadGarage();
  }, [user]);

  const addVehicle = async () => {
    if (!user) return;
    if (!canAddVehicle(vehicles.length, entitlements)) {
      setError("Free plan limit reached. Upgrade to Pro for unlimited vehicles.");
      return;
    }
    if (!make.trim() || !model.trim() || Number(tankCapacity) <= 0) {
      setError("Make, model, and tank capacity are required.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await createVehicle({
        userId: user.id,
        year: year ? Number(year) : undefined,
        make: make.trim(),
        model: model.trim(),
        tankCapacityGallons: Number(tankCapacity),
        currentTune: tune.trim() || undefined,
      });
      setYear("");
      setMake("");
      setModel("");
      setTankCapacity("15");
      setTune("");
      await loadGarage();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add vehicle.");
    } finally {
      setSaving(false);
    }
  };

  const activateVehicle = async (vehicleId: string) => {
    if (!user) return;
    try {
      await setActiveVehicleRemote(user.id, vehicleId);
      setActiveVehicle(vehicleId);
      await loadGarage();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set active vehicle.");
    }
  };

  const empty = useMemo(() => vehicles.length === 0, [vehicles.length]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <GHText variant="title">Garage</GHText>
      <GHText tone="secondary">Manage your vehicle roster and active tune target.</GHText>
      {!isPro ? (
        <GHCard style={styles.card}>
          <GHText variant="subtitle">Free Plan Limits</GHText>
          <GHText tone="secondary">
            You can add up to {entitlements.maxVehicles} vehicle on the free plan.
          </GHText>
          <GHButton label="Upgrade to Pro" variant="secondary" onPress={() => setError("Pro checkout will be enabled in next phase.")} />
        </GHCard>
      ) : null}

      <GHCard style={styles.card}>
        <GHText variant="subtitle">Add Vehicle</GHText>
        <Field placeholder="Year (optional)" value={year} setValue={setYear} numeric />
        <Field placeholder="Make" value={make} setValue={setMake} />
        <Field placeholder="Model" value={model} setValue={setModel} />
        <Field
          placeholder="Tank Capacity (gal)"
          value={tankCapacity}
          setValue={setTankCapacity}
          numeric
        />
        <Field placeholder="Current Tune (optional)" value={tune} setValue={setTune} />
        {error ? <GHText style={styles.errorText}>{error}</GHText> : null}
        <GHButton
          label="Add Vehicle"
          onPress={() => void addVehicle()}
          loading={saving}
          disabled={!canAddVehicle(vehicles.length, entitlements)}
        />
      </GHCard>

      {empty ? (
        <GHCard>
          <GHText tone="secondary">
            {loading ? "Loading garage..." : "No vehicles yet. Add your first build."}
          </GHText>
        </GHCard>
      ) : (
        vehicles.map((vehicle) => (
          <GHCard key={vehicle.id} style={styles.card}>
            <GHText variant="subtitle">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </GHText>
            <GHText tone="secondary">
              {vehicle.tankCapacityGallons.toFixed(1)} gal | Tune {vehicle.currentTune ?? "N/A"}
            </GHText>
            <View style={styles.row}>
              <GHButton
                label={activeVehicleId === vehicle.id ? "Active" : "Set Active"}
                variant={activeVehicleId === vehicle.id ? "primary" : "secondary"}
                onPress={() => void activateVehicle(vehicle.id)}
              />
            </View>
          </GHCard>
        ))
      )}
    </ScrollView>
  );
}

function Field({
  placeholder,
  value,
  setValue,
  numeric = false,
}: {
  placeholder: string;
  value: string;
  setValue: (next: string) => void;
  numeric?: boolean;
}) {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={colors.text.muted}
      value={value}
      onChangeText={setValue}
      keyboardType={numeric ? "decimal-pad" : "default"}
      style={styles.input}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    gap: spacing.sm,
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
  row: {
    marginTop: spacing.xs,
  },
  errorText: {
    color: colors.status.error,
  },
});
