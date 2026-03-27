export const colors = {
  background: {
    primary: "#0a0a0a",
    secondary: "#141414",
    tertiary: "#1a1a1a",
  },
  accent: {
    lime: "#d5fe7c",
    limeLight: "#e8ffb3",
    limeDark: "#a8cc5c",
  },
  text: {
    primary: "#ffffff",
    secondary: "#a1a1a1",
    muted: "#666666",
  },
  status: {
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
  },
  glass: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "rgba(255, 255, 255, 0.1)",
  },
} as const;

export const typography = {
  fontFamily: {
    light: "Inter_300Light",
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    semibold: "Inter_600SemiBold",
    bold: "Inter_700Bold",
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
    "5xl": 48,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
} as const;
