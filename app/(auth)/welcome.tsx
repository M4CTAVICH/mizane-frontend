import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  Animated,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Defs, RadialGradient, Stop, Circle } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography } from "../../constants/tokens";
import { WELCOME_BG_IMAGE } from "../../constants/assets";
import ArabicText from "../../components/shared/ArabicText";
import MizanLogo from "../../components/ui/MizanLogo";
import { useDirection } from "../../lib/direction";

const FEATURE_KEYS = [
  "welcome.feature_rights",
  "welcome.feature_organize",
  "welcome.feature_act",
] as const;

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const dir = useDirection();
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
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
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background image — absolute fill so it never grows the layout */}
      <Image
        source={WELCOME_BG_IMAGE}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      {/* Black gradient: mosque visible up top, fades to solid black at the bottom */}
      <LinearGradient
        colors={["rgba(5,5,6,0.25)", "rgba(5,5,6,0.6)", "#050506"]}
        locations={[0, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe}>
          <Animated.View
            style={[
              styles.hero,
              { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
            ]}
          >
            {/* Logo with a soft gold bloom */}
            <View style={styles.logoWrap}>
              <Svg width={210} height={210} viewBox="0 0 210 210" style={styles.logoGlow}>
                <Defs>
                  <RadialGradient id="logoGlow" cx="50%" cy="50%" r="50%">
                    <Stop offset="0" stopColor="#F7DD8C" stopOpacity={0.4} />
                    <Stop offset="0.3" stopColor="#E0B64D" stopOpacity={0.2} />
                    <Stop offset="0.58" stopColor="#705B27" stopOpacity={0.08} />
                    <Stop offset="0.72" stopColor="#000000" stopOpacity={0} />
                  </RadialGradient>
                </Defs>
                <Circle cx={105} cy={105} r={105} fill="url(#logoGlow)" />
              </Svg>
              <MizanLogo size={104} />
            </View>

            <Text style={styles.wordmark}>ميزان</Text>
            <Text style={styles.latinMark}>MIZAN</Text>

            <View style={styles.taglines}>
              <ArabicText weight="medium" color={colors.textPrimary} style={styles.taglineAr}>
                {t("welcome.subtitle")}
              </ArabicText>
              <Text style={styles.taglineFr}>{t("welcome.subtitle_fr")}</Text>
            </View>

            <View style={[styles.features, { flexDirection: dir.row }]}>
              {FEATURE_KEYS.map((key) => (
                <View key={key} style={styles.featurePill}>
                  <ArabicText size="caption" weight="medium" color={colors.textPrimary} style={styles.featureText}>
                    {t(key)}
                  </ArabicText>
                </View>
              ))}
            </View>
          </Animated.View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cta}
              activeOpacity={0.9}
              onPress={() => router.push("/(auth)/language")}
            >
              <LinearGradient
                colors={[colors.goldGradTop, colors.goldGradBottom]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Ionicons name="arrow-back" size={19} color={colors.inkBlue} />
              <ArabicText weight="semibold" color={colors.inkBlue} style={styles.ctaText}>
                {t("welcome.cta")}
              </ArabicText>
            </TouchableOpacity>

            <ArabicText size="caption" color={colors.textMuted} style={styles.privacy}>
              {t("welcome.privacy")}
            </ArabicText>
          </View>
        </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface0, overflow: "hidden" },
  safe: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },

  hero: {
    flex: 1,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  logoWrap: {
    width: 104,
    height: 104,
    alignItems: "center",
    justifyContent: "center",
  },
  logoGlow: { position: "absolute" },
  wordmark: {
    fontFamily: typography.fontDisplay,
    fontSize: 64,
    lineHeight: 72,
    color: colors.textPrimary,
    textAlign: "center",
    marginTop: 28,
    writingDirection: "rtl",
  },
  latinMark: {
    fontFamily: typography.fontLatin,
    fontSize: 14,
    letterSpacing: 8,
    color: colors.goldDeep,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  taglines: { alignItems: "center", marginTop: 36 },
  taglineAr: { fontSize: 20, lineHeight: 30, textAlign: "center" },
  taglineFr: {
    fontFamily: typography.fontLatin,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  features: {
    flexDirection: "row-reverse",
    gap: spacing.sm,
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 36,
  },
  featurePill: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.cardBorder,
    backgroundColor: colors.cardFill,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  featureText: { fontSize: 13, lineHeight: 19 },

  footer: { alignSelf: "stretch", alignItems: "center", paddingHorizontal: 28 },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    height: 61,
    borderRadius: 24,
    overflow: "hidden",
    alignSelf: "stretch",
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 6,
  },
  ctaText: { fontSize: 17 },
  privacy: { fontSize: 11.5, marginTop: spacing.md, textAlign: "center" },
});
