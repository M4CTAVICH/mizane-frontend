import React from "react";
import { Tabs, useRouter } from "expo-router";
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors, shadow, typography } from "../../constants/tokens";
import { LiquidGlassContainer } from "../../components/ui/LiquidGlassContainer";

/** Floating Liquid Glass background for the tab bar (functional layer). */
function GlassTabBackground() {
  return (
    <LiquidGlassContainer
      style={StyleSheet.absoluteFill}
      radius={TAB_BAR_RADIUS}
      padding={0}
      intensity={50}
    >
      <View style={StyleSheet.absoluteFill} />
    </LiquidGlassContainer>
  );
}

/** Glowing "liquid gold" primary action — raised above the bar. */
function ScanButton({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.scanWrap} pointerEvents="box-none">
      <TouchableOpacity
        style={styles.scanButton}
        onPress={onPress}
        activeOpacity={0.85}
      >
        {/* Specular top highlight on the gold dome */}
        <LinearGradient
          colors={["rgba(255,255,255,0.45)", "rgba(255,255,255,0.05)", "transparent"]}
          locations={[0, 0.4, 0.75]}
          start={{ x: 0.3, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <Ionicons name="scan-outline" size={26} color={colors.inkBlue} />
      </TouchableOpacity>
    </View>
  );
}

export default function TabsLayout() {
  const router = useRouter();

  return (
    <Tabs
      sceneContainerStyle={{ backgroundColor: "transparent" }}
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => <GlassTabBackground />,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "المساعد",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="vault"
        options={{
          title: "الخزينة",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="lock-closed-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan-tab"
        options={{
          title: "",
          tabBarIcon: () => null,
          tabBarButton: () => <ScanButton onPress={() => router.push("/scan")} />,
        }}
      />
      <Tabs.Screen
        name="procedures"
        options={{
          title: "الإجراءات",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "النشاط",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const TAB_BAR_RADIUS = 28;

const styles = StyleSheet.create({
  // Floating glass pill, detached from the screen edges.
  tabBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: Platform.OS === "ios" ? 28 : 18,
    height: 66,
    borderRadius: TAB_BAR_RADIUS,
    borderTopWidth: 0,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "transparent",
    ...shadow.glass,
  },
  tabItem: {
    paddingTop: 4,
  },
  tabLabel: {
    fontFamily: typography.fontArabic,
    fontSize: 10,
    marginTop: 2,
  },
  // Raised gold dome breaking the top edge of the bar.
  scanWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scanButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    marginTop: -26,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    ...shadow.gold,
  },
});
