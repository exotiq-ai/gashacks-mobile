import { create } from "zustand";

export type Vehicle = {
  id: string;
  year?: number;
  make: string;
  model: string;
  trim?: string;
  tankCapacityGallons: number;
  currentTune?: string;
  isActive?: boolean;
};

type GarageState = {
  vehicles: Vehicle[];
  activeVehicleId: string | null;
  setVehicles: (vehicles: Vehicle[]) => void;
  addVehicle: (vehicle: Vehicle) => void;
  setActiveVehicle: (vehicleId: string) => void;
  getActiveVehicle: () => Vehicle | null;
};

export const useGarageStore = create<GarageState>((set, get) => ({
  vehicles: [],
  activeVehicleId: null,
  setVehicles: (vehicles) => {
    const currentActiveVehicleId = get().activeVehicleId;
    const preferredActiveVehicle =
      vehicles.find((vehicle) => vehicle.isActive) ??
      vehicles.find((vehicle) => vehicle.id === currentActiveVehicleId) ??
      vehicles[0] ??
      null;
    set({ vehicles, activeVehicleId: preferredActiveVehicle?.id ?? null });
  },
  addVehicle: (vehicle) => {
    const nextVehicles = [...get().vehicles, vehicle];
    const activeVehicleId = get().activeVehicleId ?? vehicle.id;
    set({ vehicles: nextVehicles, activeVehicleId });
  },
  setActiveVehicle: (vehicleId) => set({ activeVehicleId: vehicleId }),
  getActiveVehicle: () => {
    const state = get();
    return state.vehicles.find((vehicle) => vehicle.id === state.activeVehicleId) ?? null;
  },
}));
