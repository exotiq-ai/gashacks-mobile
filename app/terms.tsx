import { GHText } from "@/components/ui/GHText";
import { colors, spacing } from "@/constants/theme";
import { Stack } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";

export default function TermsScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Terms of Service", headerShown: true }} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <GHText variant="title">Terms of Service</GHText>
        <GHText tone="muted" variant="caption">
          Last updated: March 2026
        </GHText>

        <GHText variant="subtitle" style={styles.heading}>
          Acceptance of Terms
        </GHText>
        <GHText tone="secondary" style={styles.body}>
          By using Gas Hacks, you agree to these terms. If you do not agree,
          do not use the app.
        </GHText>

        <GHText variant="subtitle" style={styles.heading}>
          The Service
        </GHText>
        <GHText tone="secondary" style={styles.body}>
          Gas Hacks is an ethanol blend calculator for performance vehicles. It
          provides estimated fuel blend calculations, vehicle garage management,
          and fill log tracking.
        </GHText>

        <GHText variant="subtitle" style={styles.heading}>
          ⚠️ Safety Disclaimer
        </GHText>
        <GHText tone="secondary" style={styles.body}>
          Gas Hacks is for informational purposes only. Calculations are
          estimates and should not be considered professional automotive advice.
          {"\n\n"}Improper fuel blending can cause engine damage, reduced
          performance, warranty violations, emissions violations, and safety
          hazards.
          {"\n\n"}Always consult a qualified automotive professional or tuner
          before modifying your vehicle's fuel system. Ensure your fuel system
          components are ethanol-compatible before using E85 or high-ethanol
          blends.
          {"\n\n"}Exotiq Inc. is not responsible for any damage to vehicles,
          property, or persons resulting from the use of this app.
        </GHText>

        <GHText variant="subtitle" style={styles.heading}>
          Subscriptions
        </GHText>
        <GHText tone="secondary" style={styles.body}>
          Gas Hacks offers a free tier and a Pro subscription. Pro subscriptions
          are billed through Apple App Store or Google Play Store. You can cancel
          at any time through your device's subscription settings. No refunds
          are provided for partial billing periods.
        </GHText>

        <GHText variant="subtitle" style={styles.heading}>
          User Content
        </GHText>
        <GHText tone="secondary" style={styles.body}>
          You retain ownership of all data you enter (vehicles, fill logs,
          notes). By using the service, you grant Exotiq Inc. a license to
          store and process this data to provide the service.
        </GHText>

        <GHText variant="subtitle" style={styles.heading}>
          Account Termination
        </GHText>
        <GHText tone="secondary" style={styles.body}>
          You may delete your account at any time from Settings. We reserve the
          right to terminate accounts that violate these terms.
        </GHText>

        <GHText variant="subtitle" style={styles.heading}>
          Limitation of Liability
        </GHText>
        <GHText tone="secondary" style={styles.body}>
          Gas Hacks is provided "as is" without warranty of any kind. Exotiq
          Inc. shall not be liable for any indirect, incidental, special, or
          consequential damages arising from use of the app.
        </GHText>

        <GHText variant="subtitle" style={styles.heading}>
          Contact
        </GHText>
        <GHText tone="secondary" style={styles.body}>
          Questions? Email hello@exotiq.ai
        </GHText>

        <GHText tone="muted" variant="caption" style={styles.footer}>
          © 2026 Exotiq Inc. All rights reserved.
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
    paddingBottom: 60,
    gap: spacing.sm,
  },
  heading: {
    marginTop: spacing.md,
  },
  body: {
    lineHeight: 22,
  },
  footer: {
    textAlign: "center",
    marginTop: spacing.xl,
  },
});
