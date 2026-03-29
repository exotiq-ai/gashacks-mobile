import { colors, spacing, typography } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GHButton } from "./GHButton";
import { GHCard } from "./GHCard";
import { GHText } from "./GHText";
import { Modal, ScrollView, StyleSheet, View } from "react-native";

type Props = {
  visible: boolean;
  onAccept: () => void;
};

export function SafetyDisclaimer({ visible, onAccept }: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="alert-circle" size={48} color={colors.status.warning} />
          </View>
          <GHText variant="title" tone="accent" style={styles.title}>
            Safety First
          </GHText>
          <GHText tone="secondary" style={styles.subtitle}>
            Before you start blending
          </GHText>

          <GHCard style={styles.card}>
            <GHText variant="subtitle" style={styles.cardTitle}>
              Important Disclaimer
            </GHText>
            <GHText tone="secondary" style={styles.body}>
              Gas Hacks is for informational purposes only. The fuel blend
              calculations provided are estimates and should not be considered
              professional automotive advice.
            </GHText>
          </GHCard>

          <GHCard style={styles.card}>
            <GHText variant="subtitle" style={styles.cardTitle}>
              Risks of Ethanol Blending
            </GHText>
            <View style={styles.list}>
              {[
                "Engine damage if your fuel system isn't ethanol-compatible",
                "Reduced performance with incorrect blends",
                "Warranty violations on unmodified vehicles",
                "Emissions compliance issues in some states",
                "Cold start issues with high ethanol in winter",
              ].map((item, i) => (
                <View key={i} style={styles.listItem}>
                  <GHText tone="accent" style={styles.bullet}>
                    •
                  </GHText>
                  <GHText tone="secondary" style={styles.listText}>
                    {item}
                  </GHText>
                </View>
              ))}
            </View>
          </GHCard>

          <GHCard style={styles.card}>
            <GHText variant="subtitle" style={styles.cardTitle}>
              Before Modifying Fuel
            </GHText>
            <GHText tone="secondary" style={styles.body}>
              Consult a qualified tuner or automotive professional. Ensure your
              fuel system (injectors, pump, lines, seals) can handle ethanol.
              Check your vehicle warranty terms. Start with lower blends and
              work up gradually.
            </GHText>
          </GHCard>

          <GHText tone="muted" variant="caption" style={styles.legal}>
            Exotiq Inc. is not responsible for any damage to vehicles or injury
            resulting from use of this app. By continuing, you acknowledge and
            accept all risks.
          </GHText>

          <GHButton
            label="I Understand — Let's Go"
            onPress={onAccept}
            style={styles.acceptBtn}
          />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scroll: {
    padding: spacing.lg,
    paddingTop: 60,
    paddingBottom: 40,
    gap: spacing.md,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  card: {
    gap: spacing.sm,
  },
  cardTitle: {
    color: colors.text.primary,
  },
  body: {
    lineHeight: 22,
  },
  list: {
    gap: spacing.xs,
  },
  listItem: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start",
  },
  bullet: {
    fontSize: 16,
    lineHeight: 22,
  },
  listText: {
    flex: 1,
    lineHeight: 22,
  },
  legal: {
    textAlign: "center",
    marginTop: spacing.sm,
  },
  acceptBtn: {
    marginTop: spacing.md,
  },
});
