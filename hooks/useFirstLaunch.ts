import { useCallback, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

const DISCLAIMER_KEY = "gas_hacks_disclaimer_accepted";
const ONBOARDING_KEY = "gas_hacks_onboarding_complete";

export function useFirstLaunch() {
  const [disclaimerAccepted, setDisclaimerAccepted] = useState<boolean | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    Promise.all([
      SecureStore.getItemAsync(DISCLAIMER_KEY),
      SecureStore.getItemAsync(ONBOARDING_KEY),
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
    await SecureStore.setItemAsync(DISCLAIMER_KEY, "true");
    setDisclaimerAccepted(true);
  }, []);

  const completeOnboarding = useCallback(async () => {
    await SecureStore.setItemAsync(ONBOARDING_KEY, "true");
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
