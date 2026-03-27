import { colors, typography } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { Redirect, Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ActivityIndicator, View } from "react-native";

export default function TabLayout() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background.primary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color={colors.accent.lime} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent.lime,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 18,
          borderRadius: 999,
          borderTopWidth: 0,
          backgroundColor: "rgba(20,20,20,0.82)",
          height: 68,
          paddingBottom: 10,
          paddingTop: 8,
          borderColor: colors.glass.border,
          borderWidth: 1,
        },
        tabBarLabelStyle: {
          fontFamily: typography.fontFamily.medium,
          fontSize: 10,
          letterSpacing: 0.6,
          textTransform: "uppercase",
        },
        sceneStyle: {
          backgroundColor: colors.background.primary,
        },
        headerStyle: {
          backgroundColor: colors.background.secondary,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontFamily: typography.fontFamily.semibold,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Hub",
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "home-variant" : "home-variant-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="calculator"
        options={{
          title: "Calculator",
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "calculator-variant" : "calculator-variant-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="garage"
        options={{
          title: "Garage",
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "car-multiple" : "car-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="logs"
        options={{
          title: "Logs",
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "clipboard-text-clock" : "clipboard-text-clock-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "cog" : "cog-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
