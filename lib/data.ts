import { supabase } from "@/lib/supabase";
import type { Vehicle } from "@/lib/store";

export type FillLog = {
  id: string;
  user_id: string;
  vehicle_id: string | null;
  tank_level_before: number;
  ethanol_mix_before: number;
  target_ethanol_mix: number;
  resulting_ethanol_mix: number;
  resulting_octane: number;
  e85_gallons: number | null;
  pump_gas_gallons: number | null;
  pump_gas_octane: number | null;
  e85_actual_ethanol: number | null;
  station_name: string | null;
  user_notes: string | null;
  total_cost: number | null;
  created_at: string;
};

export type ProfileEntitlement = {
  isPro: boolean;
};

type CreateVehicleInput = {
  userId: string;
  year?: number;
  make: string;
  model: string;
  trim?: string;
  tankCapacityGallons: number;
  currentTune?: string;
};

type CreateFillLogInput = {
  userId: string;
  vehicleId: string | null;
  tankLevelBefore: number;
  ethanolMixBefore: number;
  targetEthanolMix: number;
  resultingEthanolMix: number;
  resultingOctane: number;
  e85Gallons: number;
  pumpGasGallons: number;
  pumpGasOctane: number;
  e85ActualEthanol: number;
};

function mapVehicle(row: any): Vehicle {
  return {
    id: row.id,
    year: row.year ?? undefined,
    make: row.make,
    model: row.model,
    trim: row.trim ?? undefined,
    tankCapacityGallons: Number(row.tank_capacity_gallons),
    currentTune: row.current_tune ?? undefined,
    isActive: Boolean(row.is_active),
  };
}

export async function fetchVehicles(userId: string): Promise<Vehicle[]> {
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapVehicle);
}

export async function createVehicle(input: CreateVehicleInput): Promise<Vehicle> {
  const { data, error } = await supabase
    .from("vehicles")
    .insert({
      user_id: input.userId,
      year: input.year ?? null,
      make: input.make,
      model: input.model,
      trim: input.trim ?? null,
      tank_capacity_gallons: input.tankCapacityGallons,
      current_tune: input.currentTune ?? null,
      is_active: false,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapVehicle(data);
}

export async function setActiveVehicle(userId: string, vehicleId: string): Promise<void> {
  const { error: resetError } = await supabase
    .from("vehicles")
    .update({ is_active: false })
    .eq("user_id", userId);

  if (resetError) {
    throw resetError;
  }

  const { error: setError } = await supabase
    .from("vehicles")
    .update({ is_active: true })
    .eq("id", vehicleId)
    .eq("user_id", userId);

  if (setError) {
    throw setError;
  }
}

export async function fetchFillLogs(userId: string): Promise<FillLog[]> {
  const { data, error } = await supabase
    .from("fill_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw error;
  }

  return (data ?? []) as FillLog[];
}

export async function createFillLog(input: CreateFillLogInput): Promise<void> {
  const { error } = await supabase.from("fill_logs").insert({
    user_id: input.userId,
    vehicle_id: input.vehicleId,
    tank_level_before: input.tankLevelBefore,
    ethanol_mix_before: input.ethanolMixBefore,
    target_ethanol_mix: input.targetEthanolMix,
    resulting_ethanol_mix: input.resultingEthanolMix,
    resulting_octane: input.resultingOctane,
    e85_gallons: input.e85Gallons,
    pump_gas_gallons: input.pumpGasGallons,
    pump_gas_octane: input.pumpGasOctane,
    e85_actual_ethanol: input.e85ActualEthanol,
  });

  if (error) {
    throw error;
  }
}

export async function fetchProfileEntitlement(userId: string): Promise<ProfileEntitlement> {
  const { data, error } = await supabase
    .from("profiles")
    .select("is_pro")
    .eq("id", userId)
    .limit(1);

  if (error) {
    throw error;
  }

  return {
    isPro: Boolean(data?.[0]?.is_pro),
  };
}
