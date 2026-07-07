import { GHText } from "@/components/ui/GHText";
import { Link, Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View style={styles.container}>
        <GHText variant="subtitle" style={styles.title}>
          This screen doesn't exist.
        </GHText>

        <Link href="/" style={styles.link}>
          <GHText tone="accent" style={styles.linkText}>
            Go to home screen
          </GHText>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: "#050505",
  },
  title: {
    textAlign: "center",
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
