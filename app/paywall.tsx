import { GHButton } from "@/components/ui/GHButton";
import { GHCard } from "@/components/ui/GHCard";
import { GHText } from "@/components/ui/GHText";
import { colors, spacing, typography } from "@/constants/theme";
import * as Haptics from "expo-haptics";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

type Plan = "monthly" | "annual";

const FEATURES = [
  { emoji: "🏎️", title: "Unlimited Vehicles", desc: "Add your entire fleet" },
  { emoji: "📋", title: "Full Log History", desc: "Never lose a fill record" },
  { emoji: "📸", title: "Receipt Scanning", desc: "Auto-log from pump receipts" },
  { emoji: "📊", title: "Cost Analytics", desc: "Track savings vs premium gas" },
  { emoji: "⭐", title: "Station Favorites", desc: "Save your go-to E85 spots" },
  { emoji: "📤", title: "Export to CSV", desc: "Download your data anytime" },
];

export default function PaywallScreen() {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan>("annual");
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = async () => {
    setPurchasing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    // TODO: RevenueCat purchase flow
    // For now, show placeholder
    setTimeout(() => {
      setPurchasing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1500);
  };

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
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <GHText tone={plan === "monthly" ? "accent" : "secondary"} style={styles.planPrice}>
              $4.99
            </GHText>
            <GHText tone="muted" variant="caption">
              per month
            </GHText>
          </Pressable>

          <Pressable
            style={[styles.planOption, plan === "annual" && styles.planOptionActive]}
            onPress={() => {
              setPlan("annual");
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            {plan === "annual" && (
              <View style={styles.saveBadge}>
                <GHText style={styles.saveBadgeText}>SAVE 50%</GHText>
              </View>
            )}
            <GHText tone={plan === "annual" ? "accent" : "secondary"} style={styles.planPrice}>
              $29.99
            </GHText>
            <GHText tone="muted" variant="caption">
              per year ($2.50/mo)
            </GHText>
          </Pressable>
        </View>

        {/* CTA */}
        <GHButton
          label={purchasing ? "Processing..." : `Subscribe — ${plan === "monthly" ? "$4.99/mo" : "$29.99/yr"}`}
          onPress={() => void handlePurchase()}
          loading={purchasing}
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
