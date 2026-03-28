import { useAuth } from "@/hooks/useAuth";
import { checkProEntitlement } from "@/lib/revenuecat";
import { resolveEntitlements } from "@/lib/entitlements";
import { getRuntimeConfig } from "@/lib/runtimeConfig";
import { useCallback, useEffect, useMemo, useState } from "react";

const runtimeConfig = getRuntimeConfig();

export function useEntitlements() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  // In demo/skip-auth mode, grant pro access so tester can preview everything
  const [isPro, setIsPro] = useState(runtimeConfig.skipAuth);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (runtimeConfig.skipAuth) {
      setIsPro(true);
      return;
    }
    if (!user) {
      setIsPro(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const pro = await checkProEntitlement();
      setIsPro(pro);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load entitlements.");
      setIsPro(false);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const entitlements = useMemo(() => resolveEntitlements(isPro), [isPro]);

  return {
    loading,
    error,
    isPro,
    entitlements,
    refresh,
  };
}
