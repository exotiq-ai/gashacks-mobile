import { GHButton } from "@/components/ui/GHButton";
import { GHCard } from "@/components/ui/GHCard";
import { GHText } from "@/components/ui/GHText";
import { PremiumGate } from "@/components/ui/PremiumGate";
import { colors, spacing, typography } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEntitlements } from "@/hooks/useEntitlements";
import { buildMapsUrl, fetchNearbyE85Stations, getDistanceBadgeColor, type Station } from "@/lib/stations";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

const RADIUS_OPTIONS = [10, 25, 50, 100];

export default function StationsScreen() {
  const { isPro, entitlements } = useEntitlements();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [radiusMiles, setRadiusMiles] = useState(25);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setSearched(true);
    try {
      let lat: number;
      let lng: number;
      let label = "Your location";

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Location Required",
            "Enable location access to find nearby E85 stations. Using Denver, CO as fallback.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Open Settings", onPress: () => Linking.openSettings() },
            ],
          );
          // Fallback to Denver, CO for demo
          lat = 39.7392;
          lng = -104.9903;
          label = "Denver, CO (demo)";
        } else {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          lat = loc.coords.latitude;
          lng = loc.coords.longitude;

          try {
            const [geo] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
            label = geo ? `${geo.city ?? ""}, ${geo.region ?? ""}`.trim().replace(/^,\s*/, "") : "Your location";
          } catch {
            // Reverse geocode failed — no big deal
          }
        }
      } catch {
        // Location module not available (preview build) — use fallback
        lat = 39.7392;
        lng = -104.9903;
        label = "Denver, CO (demo)";
      }

      setLocationLabel(label);

      const results = await fetchNearbyE85Stations(lat, lng, radiusMiles);
      setStations(results);
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to fetch stations.");
    } finally {
      setLoading(false);
    }
  }, [radiusMiles]);

  const handleNavigate = (station: Station) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: `Navigate to ${station.name}`,
          options: ["Apple Maps", "Google Maps", "Waze", "Cancel"],
          cancelButtonIndex: 3,
        },
        (buttonIndex) => {
          if (buttonIndex === 3) return;
          const apps = ["apple", "google", "waze"] as const;
          void Linking.openURL(buildMapsUrl(station, apps[buttonIndex]));
        },
      );
    } else {
      Alert.alert(`Navigate to ${station.name}`, "Choose an app", [
        { text: "Google Maps", onPress: () => void Linking.openURL(buildMapsUrl(station, "google")) },
        { text: "Waze", onPress: () => void Linking.openURL(buildMapsUrl(station, "waze")) },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  const visibleStations = isPro
    ? stations
    : stations.slice(0, entitlements.maxStationsVisible);
  const hiddenCount = stations.length - visibleStations.length;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 90 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <GHText variant="title" tone="accent">
          Station Finder
        </GHText>
        <GHText tone="secondary">
          Find nearby E85 stations
        </GHText>
      </View>

      {/* Controls */}
      <GHCard style={styles.controls}>
        <GHText variant="subtitle" tone="secondary">
          Search Radius
        </GHText>
        <View style={styles.radiusRow}>
          {RADIUS_OPTIONS.map((r) => (
            <Pressable
              key={r}
              style={[styles.radiusPill, radiusMiles === r && styles.radiusPillActive]}
              onPress={() => {
                setRadiusMiles(r);
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <GHText
                tone={radiusMiles === r ? "accent" : "secondary"}
                variant="caption"
                style={styles.radiusPillText}
              >
                {r}mi
              </GHText>
            </Pressable>
          ))}
        </View>
        <GHButton
          label={loading ? "Locating..." : "Find E85 Near Me"}
          onPress={() => void handleSearch()}
          loading={loading}
        />
        {locationLabel && (
          <GHText tone="muted" variant="caption" style={styles.locationLabel}>
            Near: {locationLabel}
          </GHText>
        )}
      </GHCard>

      {/* Results */}
      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.accent.lime} />
          <GHText tone="secondary">Searching stations...</GHText>
        </View>
      )}

      {!loading && searched && stations.length === 0 && (
        <GHCard style={styles.emptyCard}>
          <View style={styles.emptyIconContainer}>
            <MaterialCommunityIcons name="gas-station" size={48} color={colors.text.secondary} />
          </View>
          <GHText variant="subtitle" style={{ textAlign: "center" }}>
            No stations found
          </GHText>
          <GHText tone="muted" variant="caption" style={{ textAlign: "center" }}>
            Try expanding your search radius
          </GHText>
        </GHCard>
      )}

      {visibleStations.map((station, idx) => (
        <Animated.View key={station.id} entering={FadeInDown.duration(300).delay(idx * 60)}>
          <Pressable onPress={() => handleNavigate(station)}>
            <GHCard style={styles.stationCard}>
              <View style={styles.stationHeader}>
                <View style={styles.stationNameRow}>
                  <MaterialCommunityIcons
                    name="gas-station"
                    size={18}
                    color={colors.accent.lime}
                  />
                  <GHText style={styles.stationName} numberOfLines={1}>
                    {station.name}
                  </GHText>
                </View>
                <View
                  style={[
                    styles.distanceBadge,
                    { backgroundColor: `${getDistanceBadgeColor(station.distanceMiles)}22`, borderColor: `${getDistanceBadgeColor(station.distanceMiles)}55` },
                  ]}
                >
                  <GHText
                    style={[styles.distanceText, { color: getDistanceBadgeColor(station.distanceMiles) }]}
                  >
                    {station.distanceMiles.toFixed(1)}mi
                  </GHText>
                </View>
              </View>

              <GHText tone="secondary" variant="caption">
                {station.address}, {station.city}, {station.state}
              </GHText>

              {station.e85BlenderPump && (
                <View style={styles.blenderBadge}>
                  <GHText style={styles.blenderText}>E85 Blender Pump</GHText>
                </View>
              )}

              <View style={styles.navigateRow}>
                <MaterialCommunityIcons name="navigation" size={14} color={colors.text.muted} />
                <GHText tone="muted" variant="caption">
                  Tap to navigate
                </GHText>
              </View>
            </GHCard>
          </Pressable>
        </Animated.View>
      ))}

      {/* Premium gate for hidden results */}
      {hiddenCount > 0 && (
        <PremiumGate
          title={`${hiddenCount} More Station${hiddenCount !== 1 ? "s" : ""} Nearby`}
          subtitle="Upgrade to Pro to see all E85 stations in your area"
          locked={true}
        >
          <GHCard style={styles.gatePreview}>
            {stations.slice(entitlements.maxStationsVisible, entitlements.maxStationsVisible + 2).map((s) => (
              <View key={s.id} style={styles.blurStation}>
                <GHText style={styles.stationName}>{s.name}</GHText>
                <GHText tone="secondary" variant="caption">{s.distanceMiles.toFixed(1)}mi away</GHText>
              </View>
            ))}
          </GHCard>
        </PremiumGate>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    gap: spacing.xs,
  },
  controls: {
    gap: spacing.md,
  },
  radiusRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  radiusPill: {
    flex: 1,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.glass.border,
    backgroundColor: colors.background.tertiary,
    alignItems: "center",
  },
  radiusPillActive: {
    borderColor: colors.accent.lime,
    backgroundColor: "rgba(213, 254, 124, 0.08)",
  },
  radiusPillText: {
    fontFamily: typography.fontFamily.semibold,
    letterSpacing: 0.5,
  },
  locationLabel: {
    textAlign: "center",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  emptyCard: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  emptyIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.glass.background,
    borderWidth: 1,
    borderColor: colors.glass.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stationCard: {
    gap: spacing.sm,
  },
  stationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  stationNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flex: 1,
  },
  stationName: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.base,
    flex: 1,
  },
  distanceBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  distanceText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.semibold,
  },
  blenderBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(213, 254, 124, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(213, 254, 124, 0.3)",
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  blenderText: {
    fontSize: 11,
    color: colors.accent.lime,
    fontFamily: typography.fontFamily.medium,
  },
  navigateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  gatePreview: {
    gap: spacing.sm,
  },
  blurStation: {
    gap: 2,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.border,
  },
});
