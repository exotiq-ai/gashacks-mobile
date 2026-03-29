/**
 * Biometric authentication hook
 * - On first sign-in, offers to enable biometrics
 * - On subsequent launches, prompts Face ID / Touch ID / Fingerprint
 * - Falls back to normal auth if biometrics unavailable or declined
 */

import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useState } from "react";

const BIOMETRIC_ENABLED_KEY = "gh_biometric_enabled";
const SESSION_TOKEN_KEY = "gh_session_token";

type BiometricType = "fingerprint" | "facial" | "iris" | "none";

export function useBiometricAuth() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricType>("none");
  const [loading, setLoading] = useState(true);

  // Check device capabilities on mount
  useEffect(() => {
    (async () => {
      try {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setIsAvailable(compatible && enrolled);

        if (compatible && enrolled) {
          const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
          if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
            setBiometricType("facial");
          } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
            setBiometricType("fingerprint");
          } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
            setBiometricType("iris");
          }
        }

        // Check if user previously enabled biometrics
        const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
        setIsEnabled(enabled === "true");
      } catch {
        setIsAvailable(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /**
   * Prompt the user for biometric authentication.
   * Returns true if authenticated, false otherwise.
   */
  const authenticate = useCallback(async (reason?: string): Promise<boolean> => {
    if (!isAvailable) return false;

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason ?? "Sign in to Gas Hacks",
        cancelLabel: "Use password",
        disableDeviceFallback: false, // Allow PIN/pattern as fallback
      });
      return result.success;
    } catch {
      return false;
    }
  }, [isAvailable]);

  /**
   * Enable biometric login for this device.
   * Call after successful sign-in.
   */
  const enableBiometrics = useCallback(async (sessionToken?: string) => {
    try {
      await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, "true");
      if (sessionToken) {
        await SecureStore.setItemAsync(SESSION_TOKEN_KEY, sessionToken);
      }
      setIsEnabled(true);
    } catch {
      // SecureStore not available
    }
  }, []);

  /**
   * Disable biometric login.
   */
  const disableBiometrics = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
      await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
      setIsEnabled(false);
    } catch {
      // SecureStore not available
    }
  }, []);

  /**
   * Get stored session token (after biometric auth succeeds).
   */
  const getStoredSession = useCallback(async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(SESSION_TOKEN_KEY);
    } catch {
      return null;
    }
  }, []);

  /**
   * User-friendly label for the biometric type.
   */
  const biometricLabel =
    biometricType === "facial" ? "Face ID" :
    biometricType === "fingerprint" ? "Fingerprint" :
    biometricType === "iris" ? "Iris" : "Biometrics";

  return {
    isAvailable,
    isEnabled,
    biometricType,
    biometricLabel,
    loading,
    authenticate,
    enableBiometrics,
    disableBiometrics,
    getStoredSession,
  };
}
