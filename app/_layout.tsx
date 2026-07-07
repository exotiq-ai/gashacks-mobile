import { OnboardingWalkthrough } from "@/components/ui/OnboardingWalkthrough";
import { SafetyDisclaimer } from "@/components/ui/SafetyDisclaimer";
import { useAuth } from "@/hooks/useAuth";
import { useFirstLaunch } from "@/hooks/useFirstLaunch";
import { fetchVehicles } from "@/lib/data";
import { useGarageStore } from "@/lib/store";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import {
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

export {
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const {
    disclaimerAccepted,
    onboardingComplete,
    acceptDisclaimer,
    completeOnboarding,
    loading: firstLaunchLoading,
  } = useFirstLaunch();

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && !firstLaunchLoading) {
      SplashScreen.hideAsync();
    }
  }, [loaded, firstLaunchLoading]);

  if (!loaded || firstLaunchLoading) {
    return null;
  }

  return (
    <>
      {/* Step 1: Safety disclaimer (must accept) */}
      <SafetyDisclaimer
        visible={!disclaimerAccepted}
        onAccept={acceptDisclaimer}
      />
      {/* Step 2: Feature walkthrough (can skip) */}
      {disclaimerAccepted && !onboardingComplete && (
        <OnboardingWalkthrough
          visible={true}
          onComplete={completeOnboarding}
        />
      )}
      {/* Step 3: Main app */}
      {disclaimerAccepted && onboardingComplete && <RootLayoutNav />}
    </>
  );
}

function RootLayoutNav() {
  return (
    <ThemeProvider value={DarkTheme}>
      <GarageBootstrap />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="privacy" options={{ headerShown: false }} />
        <Stack.Screen name="terms" options={{ headerShown: false }} />
        <Stack.Screen name="paywall" options={{ presentation: "modal", headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}

function GarageBootstrap() {
  const { user } = useAuth();
  const setVehicles = useGarageStore((state) => state.setVehicles);

  useEffect(() => {
    if (!user) return;
    fetchVehicles(user.id)
      .then(setVehicles)
      .catch(() => {
        // Garage screens show their own load errors; the bootstrap stays quiet.
      });
  }, [setVehicles, user?.id]);

  return null;
}
