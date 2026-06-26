import React from "react";
import { Tabs, useRouter } from "expo-router";
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, shadow, spacing, typography } from "../../constants/tokens";

function ScanButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      style={styles.scanButton}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Ionicons name="camera-outline" size={28} color="#fff" />
    </TouchableOpacity>
  );
}

export default function TabsLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.justiceGold,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
      })}
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
          tabBarButton: () => (
            <ScanButton onPress={() => router.push("/scan")} />
          ),
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

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface1,
    borderTopWidth: 1,
    borderTopColor: colors.ink200,
    height: Platform.OS === "ios" ? 84 : 64,
    paddingBottom: Platform.OS === "ios" ? 24 : 8,
    paddingTop: 8,
    ...shadow.sm,
  },
  tabLabel: {
    fontFamily: typography.fontArabic,
    fontSize: 11,
  },
  scanButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.justiceGold,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20,
    ...shadow.md,
    shadowColor: colors.justiceGold,
  },
});
