import { useCallback, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

const KEY = "gas_hacks_disclaimer_accepted";

export function useFirstLaunch() {
  const [accepted, setAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    SecureStore.getItemAsync(KEY)
      .then((val) => setAccepted(val === "true"))
      .catch(() => setAccepted(false));
  }, []);

  const accept = useCallback(async () => {
    await SecureStore.setItemAsync(KEY, "true");
    setAccepted(true);
  }, []);

  return { accepted, accept };
}
