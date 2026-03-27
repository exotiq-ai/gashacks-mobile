import { colors, spacing, typography } from "@/constants/theme";
import { GHButton } from "./GHButton";
import { GHText } from "./GHText";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Dimensions, Modal, Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from "react-native-reanimated";

const { width } = Dimensions.get("window");

type Step = {
  emoji: string;
  title: string;
  description: string;
};

const STEPS: Step[] = [
  {
    emoji: "🏎️",
    title: "Add Your Ride",
    description:
      "Start by adding your vehicle in the Garage. We've got 55+ performance cars pre-loaded with correct tank sizes.",
  },
  {
    emoji: "🧮",
    title: "Calculate Your Blend",
    description:
      "Set your current tank level, current E-mix, and target blend. Gas Hacks tells you exactly how many gallons of E85 and pump gas to add.",
  },
  {
    emoji: "⛽",
    title: "Fill Up Smart",
    description:
      "At the pump, follow the fill instructions. Pump E85 first, then top off with premium. Easy.",
  },
  {
    emoji: "📋",
    title: "Track Everything",
    description:
      "Save every fill to your logbook. Track your blends, costs, and octane over time. Your data, always accessible.",
  },
  {
    emoji: "🚀",
    title: "You're Ready",
    description:
      "That's it. Calculate, fill, log, repeat. Welcome to Gas Hacks.",
  },
];

type Props = {
  visible: boolean;
  onComplete: () => void;
};

export function OnboardingWalkthrough({ visible, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const next = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isLast) {
      onComplete();
      setStep(0);
    } else {
      setStep((s) => s + 1);
    }
  };

  const skip = () => {
    onComplete();
    setStep(0);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={false}>
      <View style={styles.container}>
        <View style={styles.skipRow}>
          {!isLast && (
            <Pressable onPress={skip}>
              <GHText tone="muted" style={styles.skipText}>
                Skip
              </GHText>
            </Pressable>
          )}
        </View>

        <View style={styles.content}>
          <Animated.View
            key={step}
            entering={SlideInRight.duration(300)}
            exiting={SlideOutLeft.duration(200)}
            style={styles.stepContent}
          >
            <GHText style={styles.emoji}>{current.emoji}</GHText>
            <GHText variant="title" tone="accent" style={styles.title}>
              {current.title}
            </GHText>
            <GHText tone="secondary" style={styles.description}>
              {current.description}
            </GHText>
          </Animated.View>
        </View>

        {/* Progress dots */}
        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === step && styles.dotActive]}
            />
          ))}
        </View>

        <View style={styles.actions}>
          <GHButton
            label={isLast ? "Let's Go 🏁" : "Next"}
            onPress={next}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    justifyContent: "space-between",
    paddingVertical: 60,
    paddingHorizontal: spacing.lg,
  },
  skipRow: {
    alignItems: "flex-end",
    minHeight: 30,
  },
  skipText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 16,
    padding: spacing.sm,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  stepContent: {
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  emoji: {
    fontSize: 72,
  },
  title: {
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    lineHeight: 24,
    fontSize: 16,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.background.tertiary,
  },
  dotActive: {
    backgroundColor: colors.accent.lime,
    width: 24,
  },
  actions: {
    gap: spacing.sm,
  },
});
