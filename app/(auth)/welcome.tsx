import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Animated,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing, typography, textScale } from "../../constants/tokens";
import Button from "../../components/ui/Button";
import ArabicText from "../../components/shared/ArabicText";
import { Ionicons } from "@expo/vector-icons";

export default function WelcomeScreen() {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 60,
        friction: 10,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe}>
        <Animated.View
          style={[
            styles.content,
            { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
          ]}
        >
          {/* Logo area */}
          <View style={styles.logoArea}>
            <View style={styles.logoCircle}>
              <Ionicons name="scale-outline" size={56} color={colors.gold} />
            </View>
            <Text style={textScale.label}>MIZANE · LEGAL AI</Text>
            <ArabicText
              size="display"
              weight="semibold"
              color={colors.gold}
              style={styles.title}
            >
              ميزان
            </ArabicText>
          </View>

          {/* Tagline */}
          <View style={styles.taglines}>
            <ArabicText
              size="heading"
              weight="medium"
              color={colors.textSecondary}
              style={styles.taglineAr}
            >
              مساعدك القانوني في جيبك
            </ArabicText>
            <ArabicText
              size="body"
              color={colors.textMuted}
              style={styles.taglineFr}
            >
              Votre assistant juridique
            </ArabicText>
          </View>

          {/* Feature pills */}
          <View style={styles.features}>
            {["اعرف حقوقك", "نظّم وثائقك", "اتخذ إجراءً"].map((f) => (
              <View key={f} style={styles.featurePill}>
                <ArabicText size="caption" color={colors.gold}>
                  {f}
                </ArabicText>
              </View>
            ))}
          </View>
        </Animated.View>

        <View style={styles.cta}>
          <Button
            variant="primary"
            size="lg"
            onPress={() => router.push("/(auth)/language")}
          >
            ابدأ / Commencer
          </Button>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  safe: {
    flex: 1,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
  },
  logoArea: {
    alignItems: "center",
    gap: spacing.md,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.glassFill,
  },
  title: {
    fontSize: 48,
    letterSpacing: 4,
    textAlign: "center",
  },
  taglines: { alignItems: "center", gap: spacing.xs },
  taglineAr: { textAlign: "center" },
  taglineFr: {
    fontFamily: typography.fontLatin,
    textAlign: "center",
    fontSize: 16,
  },
  features: {
    flexDirection: "row-reverse",
    gap: spacing.sm,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  featurePill: {
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.glassFill,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  cta: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
});
