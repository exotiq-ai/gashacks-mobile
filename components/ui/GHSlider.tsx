import { colors, spacing, typography } from "@/constants/theme";
import * as Haptics from "expo-haptics";
import { useCallback, useRef } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { GHText } from "./GHText";

type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onValueChange: (value: number) => void;
  style?: ViewStyle;
};

export function GHSlider({
  label,
  value,
  min,
  max,
  step,
  unit = "",
  onValueChange,
  style,
}: Props) {
  const trackRef = useRef<View>(null);
  const trackWidth = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const snap = (v: number) => Math.round(v / step) * step;
  const fraction = max > min ? (value - min) / (max - min) : 0;

  const fillStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(100, fraction * 100))}%`,
  }));

  const thumbScale = useSharedValue(1);
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: thumbScale.value }],
    left: `${Math.max(0, Math.min(100, fraction * 100))}%`,
  }));

  const updateFromTouch = useCallback(
    (pageX: number) => {
      trackRef.current?.measure((_x, _y, width, _h, px) => {
        const ratio = Math.max(0, Math.min(1, (pageX - px) / width));
        const raw = min + ratio * (max - min);
        const snapped = snap(clamp(raw));
        if (snapped !== value) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onValueChange(parseFloat(snapped.toFixed(2)));
        }
      });
    },
    [min, max, step, value, onValueChange],
  );

  const increment = () => {
    const next = snap(clamp(value + step));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onValueChange(parseFloat(next.toFixed(2)));
  };

  const decrement = () => {
    const next = snap(clamp(value - step));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onValueChange(parseFloat(next.toFixed(2)));
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.labelRow}>
        <GHText variant="caption" tone="secondary" style={styles.label}>
          {label}
        </GHText>
        <GHText variant="body" tone="accent" style={styles.valueText}>
          {value}
          {unit}
        </GHText>
      </View>

      <View style={styles.sliderRow}>
        <Pressable onPress={decrement} style={styles.stepper}>
          <GHText tone="accent" style={styles.stepperText}>
            −
          </GHText>
        </Pressable>

        <View
          ref={trackRef}
          style={styles.track}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={(e) => {
            thumbScale.value = withSpring(1.3);
            updateFromTouch(e.nativeEvent.pageX);
          }}
          onResponderMove={(e) => {
            updateFromTouch(e.nativeEvent.pageX);
          }}
          onResponderRelease={() => {
            thumbScale.value = withSpring(1);
          }}
        >
          <Animated.View style={[styles.trackFill, fillStyle]} />
          <Animated.View style={[styles.thumb, thumbStyle]} />
        </View>

        <Pressable onPress={increment} style={styles.stepper}>
          <GHText tone="accent" style={styles.stepperText}>
            +
          </GHText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontSize: 11,
    fontFamily: typography.fontFamily.medium,
  },
  valueText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  stepper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.glass.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperText: {
    fontSize: 20,
    lineHeight: 24,
    fontFamily: typography.fontFamily.bold,
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.background.tertiary,
    justifyContent: "center",
    overflow: "visible",
  },
  trackFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.accent.lime,
    borderRadius: 3,
  },
  thumb: {
    position: "absolute",
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accent.lime,
    marginLeft: -11,
    shadowColor: colors.accent.lime,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
});
