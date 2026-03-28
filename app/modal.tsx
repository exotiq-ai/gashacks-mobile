import { Stack, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { GHButton } from "@/components/ui/GHButton";
import { colors, spacing } from "@/constants/theme";

export default function ModalScreen() {
  const router = useRouter();
  return (
    <>
      <Stack.Screen options={{ title: "Modal" }} />
      <View style={styles.container}>
        <Text style={styles.title}>Modal</Text>
        <GHButton label="Dismiss" variant="ghost" onPress={() => router.back()} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text.primary,
  },
});
