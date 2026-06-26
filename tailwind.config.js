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
        gold: "#E8BE6A",
        // Liquid Glass material (functional layer)
        glass: {
          fill: "rgba(255,255,255,0.04)",
          fillStrong: "rgba(255,255,255,0.08)",
          border: "rgba(255,255,255,0.15)",
          highlight: "rgba(255,255,255,0.25)",
        },
        // Fluid mesh ambient light
        mesh: {
          indigo: "rgba(99,102,241,0.06)",
          cyan: "rgba(20,184,166,0.04)",
        },
        // Semantic — brightened for black canvas
        safe: "#2DD4A7",
        safeLight: "rgba(45,212,167,0.14)",
        caution: "#FB923C",
        cautionLight: "rgba(251,146,60,0.14)",
        danger: "#F87171",
        dangerLight: "rgba(248,113,113,0.14)",
        // Neutral scale — translucent whites
        ink100: "rgba(255,255,255,0.92)",
        ink200: "rgba(255,255,255,0.10)",
        ink300: "rgba(255,255,255,0.18)",
        ink400: "rgba(255,255,255,0.40)",
        ink500: "rgba(255,255,255,0.55)",
        ink600: "rgba(255,255,255,0.70)",
        ink700: "rgba(255,255,255,0.85)",
        ink800: "#0D1B2A",
        // Content layer surfaces
        surface0: "#000000",
        surface1: "#0B0B0D",
        surface2: "#141417",
        // Text — Apple vibrancy
        textPrimary: "#FFFFFF",
        textSecondary: "rgba(255,255,255,0.60)",
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
        glass: "28px",
      },
    },
  },
  plugins: [],
};
