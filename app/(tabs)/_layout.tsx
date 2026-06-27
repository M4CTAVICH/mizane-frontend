import React from "react";
import { Tabs, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View, StyleSheet, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { colors, shadow, typography } from "../../constants/tokens";

/** Frosted-glass dock (reference `.vault-glass`): blur(20) + translucent dark
 *  fill + hairline edge + inset top highlight. */
function DockBackground() {
  return (
    <View style={[StyleSheet.absoluteFill, styles.dockOuter]}>
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, styles.dockFill]} pointerEvents="none" />
      <View style={styles.dockHighlight} pointerEvents="none" />
    </View>
  );
}

/** Gold gradient primary action, centered within the dock (Figma 1:80). */
function ScanButton({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.scanWrap} pointerEvents="box-none">
      <TouchableOpacity
        style={styles.scanButton}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={[colors.goldGradTop, colors.goldGradBottom]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <Ionicons name="scan-outline" size={24} color={colors.inkBlue} />
      </TouchableOpacity>
    </View>
  );
}

export default function TabsLayout() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Tabs
      sceneContainerStyle={{ backgroundColor: "transparent" }}
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => <DockBackground />,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIconStyle: styles.tabIcon,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      {/* Order matches Figma 1:53 (L→R): النشاط · الإجراءات · [scan] · الخزينة · المساعد */}
      <Tabs.Screen
        name="activity"
        options={{
          title: t("nav.activity"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="time-outline" size={21} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="procedures"
        options={{
          title: t("nav.procedures"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="list-outline" size={21} color={color} />
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
        name="vault"
        options={{
          title: t("nav.vault"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="lock-closed-outline" size={21} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: t("nav.assistant"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="chatbubble-ellipses-outline" size={21} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const TAB_BAR_RADIUS = 24;

const styles = StyleSheet.create({
  // Floating dock, detached from the screen edges; scales with screen width.
  tabBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: Platform.OS === "ios" ? 28 : 18,
    height: 70,
    borderRadius: TAB_BAR_RADIUS,
    borderTopWidth: 0,
    paddingHorizontal: 8,
    paddingTop: 11,
    paddingBottom: 11,
    backgroundColor: "transparent",
    ...shadow.glass,
  },
  // Frosted-glass dock surface.
  dockOuter: {
    borderRadius: TAB_BAR_RADIUS,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.cardBorder,
    overflow: "hidden",
  },
  dockFill: {
    backgroundColor: colors.cardFill,
  },
  dockHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.cardHighlight,
  },
  tabItem: {
    paddingVertical: 4,
  },
  tabIcon: {
    // 21px icon centered above the label
    marginTop: 2,
  },
  tabLabel: {
    fontFamily: typography.fontArabic,
    fontSize: 10.5,
    lineHeight: 15.75,
    marginTop: 4,
  },
  // Gold action centered in the middle slot, level with the tabs.
  scanWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scanButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    // Gold glow (reference: 0 8px 24px rgba(224,182,77,0.4)).
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
