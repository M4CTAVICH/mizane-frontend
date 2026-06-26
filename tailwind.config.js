/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Obsidian canvas
        black: "#000000",
        // Brand
        inkBlue: "#0D1B2A",
        parchment: "#F5F0E8",
        justiceGold: "#C9992A",
        goldLight: "#E8BE6A",
        gold: "#D8A93D",
        // Glass material (chrome layer only)
        glass: {
          fill: "rgba(255,255,255,0.05)",
          fillStrong: "rgba(255,255,255,0.09)",
          border: "rgba(255,255,255,0.10)",
          highlight: "rgba(255,255,255,0.14)",
        },
        // Retained for compatibility — ambient mesh is now neutral
        mesh: {
          indigo: "rgba(255,255,255,0.02)",
          cyan: "rgba(255,255,255,0.015)",
        },
        // Semantic — legible on dark, not candy-bright
        safe: "#34D399",
        safeLight: "rgba(52,211,153,0.12)",
        caution: "#F59E0B",
        cautionLight: "rgba(245,158,11,0.12)",
        danger: "#F87171",
        dangerLight: "rgba(248,113,113,0.12)",
        // Neutral scale — translucent whites
        ink100: "rgba(255,255,255,0.92)",
        ink200: "rgba(255,255,255,0.08)",
        ink300: "rgba(255,255,255,0.14)",
        ink400: "rgba(255,255,255,0.40)",
        ink500: "rgba(255,255,255,0.55)",
        ink600: "rgba(255,255,255,0.70)",
        ink700: "rgba(255,255,255,0.85)",
        ink800: "#0D1B2A",
        // Neutral elevation surfaces
        surface0: "#000000",
        surface1: "#121214",
        surface2: "#1B1B1F",
        surface3: "#26262B",
        // Text
        textPrimary: "#FFFFFF",
        textSecondary: "rgba(255,255,255,0.62)",
        textMuted: "rgba(255,255,255,0.40)",
      },
      fontFamily: {
        // Geometric system sans — SF Pro (iOS) / Roboto (Android)
        sans: ["System"],
        "plex-arabic": ["IBMPlexArabic-Regular"],
        "plex-arabic-medium": ["IBMPlexArabic-Medium"],
        "plex-arabic-semibold": ["IBMPlexArabic-SemiBold"],
        "plex-sans": ["IBMPlexSans-Regular"],
        "plex-sans-medium": ["IBMPlexSans-Medium"],
        "plex-sans-semibold": ["IBMPlexSans-SemiBold"],
        "plex-mono": ["IBMPlexMono-Regular"],
      },
      borderRadius: {
        glass: "24px",
      },
    },
  },
  plugins: [],
};
