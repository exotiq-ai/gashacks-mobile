import { GHButton } from "@/components/ui/GHButton";
import { GHCard } from "@/components/ui/GHCard";
import { GHText } from "@/components/ui/GHText";
import { colors, spacing, typography } from "@/constants/theme";
import { useEntitlements } from "@/hooks/useEntitlements";
import { getOfferings, purchasePackage, restorePurchases } from "@/lib/revenuecat";
import * as Haptics from "expo-haptics";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import type { PurchasesOffering, PurchasesPackage } from "react-native-purchases";

type Plan = "monthly" | "annual";

const FEATURES = [
  { emoji: "🏎️", title: "Unlimited Vehicles", desc: "Add your entire fleet" },
  { emoji: "📋", title: "Full Log History", desc: "Never lose a fill record" },
  { emoji: "📸", title: "Receipt Scanning", desc: "Auto-log from pump receipts" },
  { emoji: "📊", title: "Cost Analytics", desc: "Track savings vs premium gas" },
  { emoji: "📍", title: "Station Finder", desc: "All nearby E85 stations" },
  { emoji: "📤", title: "Export to CSV", desc: "Download your data anytime" },
];

export default function PaywallScreen() {
  const router = useRouter();
  const { refresh } = useEntitlements();
  const [plan, setPlan] = useState<Plan>("annual");
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);

  useEffect(() => {
    getOfferings().then(setOffering).catch(() => {});
  }, []);

  const getPackage = (): PurchasesPackage | null => {
    if (!offering) return null;
    return plan === "monthly" ? offering.monthly : offering.annual;
  };

  const handlePurchase = async () => {
    const pkg = getPackage();
    setPurchasing(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      const result = pkg
        ? await purchasePackage(pkg)
        : { success: false, isPro: false, error: "No package available" };

      if (result.success && result.isPro) {
        await refresh();
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.back();
      } else if (result.error) {
        Alert.alert("Purchase Failed", result.error);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const result = await restorePurchases();
      if (result.isPro) {
        await refresh();
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Restored!", "Your Pro subscription has been restored.");
        router.back();
      } else {
        Alert.alert("Nothing to Restore", "No active Pro subscription found.");
      }
    } catch {
      Alert.alert("Restore Failed", "Please try again later.");
    } finally {
      setRestoring(false);
    }
  };

  const monthlyPrice = offering?.monthly?.product.priceString ?? "$2.99";
  const annualPrice = offering?.annual?.product.priceString ?? "$19.99";

  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: true }} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        {/* Hero */}
        <View style={styles.hero}>
          <GHText style={styles.heroEmoji}>⚡</GHText>
          <GHText variant="title" tone="accent">
            Go Pro
          </GHText>
          <GHText tone="secondary" style={styles.heroSub}>
            Unlock the full Gas Hacks experience
          </GHText>
        </View>

        {/* Features */}
        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.featureRow}>
              <GHText style={styles.featureEmoji}>{f.emoji}</GHText>
              <View style={styles.featureText}>
                <GHText tone="primary" style={styles.featureTitle}>
                  {f.title}
                </GHText>
                <GHText tone="muted" variant="caption">
                  {f.desc}
                </GHText>
              </View>
            </View>
          ))}
        </View>

        {/* Plan Toggle */}
        <View style={styles.planToggle}>
          <Pressable
            style={[styles.planOption, plan === "monthly" && styles.planOptionActive]}
            onPress={() => {
              setPlan("monthly");
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <GHText tone={plan === "monthly" ? "accent" : "secondary"} style={styles.planPrice}>
              {monthlyPrice}
            </GHText>
            <GHText tone="muted" variant="caption">
              per month
            </GHText>
          </Pressable>

          <Pressable
            style={[styles.planOption, plan === "annual" && styles.planOptionActive]}
            onPress={() => {
              setPlan("annual");
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <View style={styles.saveBadge}>
              <GHText style={styles.saveBadgeText}>SAVE 44%</GHText>
            </View>
            <GHText tone={plan === "annual" ? "accent" : "secondary"} style={styles.planPrice}>
              {annualPrice}
            </GHText>
            <GHText tone="muted" variant="caption">
              per year ($1.67/mo)
            </GHText>
          </Pressable>
        </View>

        {/* CTA */}
        <GHButton
          label={purchasing ? "Processing..." : `Subscribe — ${plan === "monthly" ? `${monthlyPrice}/mo` : `${annualPrice}/yr`}`}
          onPress={() => void handlePurchase()}
          loading={purchasing}
        />

        <GHButton
          label={restoring ? "Restoring..." : "Restore Purchases"}
          variant="secondary"
          onPress={() => void handleRestore()}
          loading={restoring}
        />

        <GHButton
          label="Maybe Later"
          variant="ghost"
          onPress={() => router.back()}
        />

        <GHText tone="muted" variant="caption" style={styles.legal}>
          Payment will be charged to your App Store or Play Store account.
          Subscription renews automatically unless cancelled at least 24 hours
          before the end of the current period. Manage subscriptions in your
          device settings.
        </GHText>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.lg,
  },
  hero: {
    alignItems: "center",
    gap: spacing.xs,
  },
  heroEmoji: {
    fontSize: 56,
  },
  heroSub: {
    textAlign: "center",
  },
  features: {
    gap: spacing.md,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  featureEmoji: {
    fontSize: 28,
    width: 40,
    textAlign: "center",
  },
  featureText: {
    flex: 1,
    gap: 2,
  },
  featureTitle: {
    fontFamily: typography.fontFamily.semibold,
  },
  planToggle: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  planOption: {
    flex: 1,
    alignItems: "center",
    padding: spacing.md,
    paddingTop: spacing.lg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.glass.border,
    backgroundColor: colors.background.tertiary,
    gap: spacing.xs,
  },
  planOptionActive: {
    borderColor: colors.accent.lime,
    backgroundColor: "rgba(213, 254, 124, 0.06)",
  },
  planPrice: {
    fontSize: typography.fontSize["2xl"],
    fontFamily: typography.fontFamily.bold,
  },
  saveBadge: {
    position: "absolute",
    top: -10,
    backgroundColor: colors.accent.lime,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  saveBadgeText: {
    color: "#0a0a0a",
    fontSize: 10,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 0.8,
  },
  legal: {
    textAlign: "center",
    lineHeight: 18,
  },
});
