import "../global.css";
import "../lib/i18n";
import React, { useEffect } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import FluidMesh from "../components/ui/FluidMesh";
import * as SplashScreen from "expo-splash-screen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  IBMPlexSansArabic_400Regular,
  IBMPlexSansArabic_500Medium,
  IBMPlexSansArabic_600SemiBold,
} from "@expo-google-fonts/ibm-plex-sans-arabic";
import {
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
} from "@expo-google-fonts/ibm-plex-sans";
import { IBMPlexMono_400Regular } from "@expo-google-fonts/ibm-plex-mono";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 1000 * 60 * 5 },
  },
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "IBMPlexArabic-Regular": IBMPlexSansArabic_400Regular,
    "IBMPlexArabic-Medium": IBMPlexSansArabic_500Medium,
    "IBMPlexArabic-SemiBold": IBMPlexSansArabic_600SemiBold,
    "IBMPlexSans-Regular": IBMPlexSans_400Regular,
    "IBMPlexSans-Medium": IBMPlexSans_500Medium,
    "IBMPlexSans-SemiBold": IBMPlexSans_600SemiBold,
    "IBMPlexMono-Regular": IBMPlexMono_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      {/* Obsidian root canvas — pitch black with the underlying fluid mesh
          so every Liquid Glass surface above has colored light to refract. */}
      <View style={{ flex: 1, backgroundColor: "#000000" }}>
        <FluidMesh />
        <Stack
          screenOptions={{
            headerShown: false,
            // Transparent so the root mesh shows through reskinned screens.
            contentStyle: { backgroundColor: "transparent" },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="scan/index" options={{ presentation: "modal" }} />
          <Stack.Screen name="letter/[template]" />
          <Stack.Screen name="procedure/[id]" />
          <Stack.Screen name="vault/[id]" />
        </Stack>
      </View>
    </QueryClientProvider>
  );
}
