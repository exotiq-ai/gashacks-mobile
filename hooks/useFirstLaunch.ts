import { useCallback, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

const DISCLAIMER_KEY = "gas_hacks_disclaimer_accepted";
const ONBOARDING_KEY = "gas_hacks_onboarding_complete";

const inMemoryStore = new Map<string, string>();

function getLocalStorage() {
  try {
    if (typeof globalThis.localStorage !== "undefined") {
      return globalThis.localStorage;
    }
  } catch {
    // Access can fail in restricted browser contexts.
  }
  return null;
}

async function getFirstLaunchItem(key: string) {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    const localStorage = getLocalStorage();
    if (localStorage) return localStorage.getItem(key);
    return inMemoryStore.get(key) ?? null;
  }
}

async function setFirstLaunchItem(key: string, value: string) {
  try {
    await SecureStore.setItemAsync(key, value);
    return;
  } catch {
    const localStorage = getLocalStorage();
    if (localStorage) {
      localStorage.setItem(key, value);
      return;
    }
    inMemoryStore.set(key, value);
  }
}

export function useFirstLaunch() {
  const [disclaimerAccepted, setDisclaimerAccepted] = useState<boolean | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    Promise.all([
      getFirstLaunchItem(DISCLAIMER_KEY),
      getFirstLaunchItem(ONBOARDING_KEY),
    ])
      .then(([disc, onb]) => {
        setDisclaimerAccepted(disc === "true");
        setOnboardingComplete(onb === "true");
      })
      .catch(() => {
        setDisclaimerAccepted(false);
        setOnboardingComplete(false);
      });
  }, []);

  const acceptDisclaimer = useCallback(async () => {
    await setFirstLaunchItem(DISCLAIMER_KEY, "true");
    setDisclaimerAccepted(true);
  }, []);

  const completeOnboarding = useCallback(async () => {
    await setFirstLaunchItem(ONBOARDING_KEY, "true");
    setOnboardingComplete(true);
  }, []);

  return {
    disclaimerAccepted,
    onboardingComplete,
    acceptDisclaimer,
    completeOnboarding,
    loading: disclaimerAccepted === null || onboardingComplete === null,
  };
}
