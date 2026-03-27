import { GHText } from "@/components/ui/GHText";
import { colors, spacing } from "@/constants/theme";
import { Stack } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";

export default function PrivacyScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Privacy Policy", headerShown: true }} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <GHText variant="title">Privacy Policy</GHText>
        <GHText tone="muted" variant="caption">
          Last updated: March 2026
        </GHText>

        <GHText variant="subtitle" style={styles.heading}>
          Information We Collect
        </GHText>
        <GHText tone="secondary" style={styles.body}>
          Gas Hacks collects the minimum data needed to provide the service:
          {"\n\n"}• Email address (for account creation)
          {"\n"}• Vehicle information you enter (make, model, tank size)
          {"\n"}• Fill log data you save (blend calculations, dates)
          {"\n"}• Authentication tokens (stored securely on device)
        </GHText>

        <GHText variant="subtitle" style={styles.heading}>
          How We Use Your Data
        </GHText>
        <GHText tone="secondary" style={styles.body}>
          Your data is used exclusively to provide Gas Hacks functionality:
          {"\n\n"}• Syncing your vehicle garage and fill logs across devices
          {"\n"}• Calculating ethanol blends based on your vehicle specs
          {"\n"}• Displaying your fill history and analytics
          {"\n\n"}We do not sell, share, or monetize your personal data. We do not
          run ads. We do not track your location.
        </GHText>

        <GHText variant="subtitle" style={styles.heading}>
          Data Storage
        </GHText>
        <GHText tone="secondary" style={styles.body}>
          Data is stored in Supabase (hosted on AWS) with row-level security.
          Only you can access your own data. Authentication tokens are stored
          in your device's secure keychain.
        </GHText>

        <GHText variant="subtitle" style={styles.heading}>
          Data Deletion
        </GHText>
        <GHText tone="secondary" style={styles.body}>
          You can delete your account and all associated data at any time from
          Settings → Delete Account. This action is immediate and irreversible.
          All vehicles, fill logs, and profile data will be permanently removed.
        </GHText>

        <GHText variant="subtitle" style={styles.heading}>
          Third-Party Services
        </GHText>
        <GHText tone="secondary" style={styles.body}>
          • Supabase (authentication and database)
          {"\n"}• Apple Sign In (if you choose this login method)
          {"\n"}• Google Sign In (if you choose this login method)
          {"\n"}• Expo (app updates and crash reporting)
        </GHText>

        <GHText variant="subtitle" style={styles.heading}>
          Contact
        </GHText>
        <GHText tone="secondary" style={styles.body}>
          Questions about privacy? Email hello@exotiq.ai
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
