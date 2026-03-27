export const FREE_LIMITS = {
  maxVehicles: 1,
  maxLogsVisible: 10,
} as const;

export type EntitlementSnapshot = {
  isPro: boolean;
  maxVehicles: number;
  maxLogsVisible: number;
};

export function resolveEntitlements(isPro: boolean): EntitlementSnapshot {
  if (isPro) {
    return {
      isPro: true,
      maxVehicles: Number.POSITIVE_INFINITY,
      maxLogsVisible: Number.POSITIVE_INFINITY,
    };
  }

  return {
    isPro: false,
    maxVehicles: FREE_LIMITS.maxVehicles,
    maxLogsVisible: FREE_LIMITS.maxLogsVisible,
  };
}

export function canAddVehicle(currentVehicleCount: number, entitlements: EntitlementSnapshot) {
  return currentVehicleCount < entitlements.maxVehicles;
}

export function applyLogVisibilityLimit<T>(items: T[], entitlements: EntitlementSnapshot): T[] {
  if (entitlements.maxLogsVisible === Number.POSITIVE_INFINITY) {
    return items;
  }
  return items.slice(0, entitlements.maxLogsVisible);
}
