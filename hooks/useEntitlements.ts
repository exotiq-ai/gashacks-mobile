import { useAuth } from "@/hooks/useAuth";
import { fetchProfileEntitlement } from "@/lib/data";
import { resolveEntitlements } from "@/lib/entitlements";
import { useCallback, useEffect, useMemo, useState } from "react";

export function useEntitlements() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setIsPro(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const entitlement = await fetchProfileEntitlement(user.id);
      setIsPro(entitlement.isPro);
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
