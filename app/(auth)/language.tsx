import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../../constants/tokens";
import { useAuthStore } from "../../store/authStore";
import Button from "../../components/ui/Button";
import ArabicText from "../../components/shared/ArabicText";

type Lang = "ar" | "fr" | "dar" | "ber";

const LANGUAGES: {
  id: Lang;
  flag: string;
  label: string;
  sublabel: string;
  disabled?: boolean;
}[] = [
  { id: "dar", flag: "🇩🇿", label: "دارجة", sublabel: "العربية الجزائرية" },
  { id: "ar", flag: "🌍", label: "عربية", sublabel: "Modern Standard Arabic" },
  { id: "fr", flag: "🇫🇷", label: "Français", sublabel: "Langue française" },
  {
    id: "ber",
    flag: "ⵣ",
    label: "ⴰⵣⵉⵖⴻⵏ",
    sublabel: "Tamazight",
    disabled: true,
  },
];

export default function LanguageScreen() {
  const router = useRouter();
  const setLanguage = useAuthStore((s) => s.setLanguage);
  const [selected, setSelected] = useState<Lang | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    setLanguage(selected);
    router.push("/(auth)/otp");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.eyebrow}>MIZANE · LANGUE</Text>
            <Text style={styles.heading}>اختر لغتك</Text>
            <Text style={styles.headerFr}>Choisissez votre langue</Text>
          </View>

          {/* Language cards */}
          <View style={styles.grid}>
            {LANGUAGES.map((lang) => {
              const isSelected = selected === lang.id;
              return (
                <TouchableOpacity
                  key={lang.id}
                  onPress={() => !lang.disabled && setSelected(lang.id)}
                  activeOpacity={lang.disabled ? 1 : 0.85}
                  style={[
                    styles.card,
                    isSelected && styles.cardSelected,
                    lang.disabled && styles.cardDisabled,
                  ]}
                >
                  <View
                    style={[
                      styles.checkSlot,
                      isSelected && styles.checkSlotActive,
                    ]}
                  >
                    {isSelected ? (
                      <Ionicons name="checkmark" size={16} color={colors.inkBlue} />
                    ) : lang.disabled ? (
                      <Ionicons
                        name="lock-closed-outline"
                        size={16}
                        color={colors.textMuted}
                      />
                    ) : null}
                  </View>

                  <View style={styles.cardText}>
                    <ArabicText
                      weight="semibold"
                      color={
                        lang.disabled
                          ? colors.textMuted
                          : isSelected
                            ? colors.gold
                            : colors.textPrimary
                      }
                      style={styles.cardLabel}
                    >
                      {lang.label}
                    </ArabicText>
                    <ArabicText
                      size="caption"
                      color={lang.disabled ? colors.ink300 : colors.textMuted}
                    >
                      {lang.disabled ? "قريباً / Bientôt" : lang.sublabel}
                    </ArabicText>
                  </View>

                  <Text style={styles.flag}>{lang.flag}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            variant="primary"
            size="lg"
            disabled={!selected}
            onPress={handleContinue}
          >
            متابعة / Continuer
          </Button>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  safe: { flex: 1 },
  scroll: {
    padding: spacing.xl,
    gap: spacing.xl,
    flexGrow: 1,
  },
  header: { gap: spacing.xs, alignItems: "flex-end" },
  eyebrow: {
    fontFamily: typography.fontArabic,
    fontSize: 11.5,
    letterSpacing: 3,
    color: colors.goldDeep,
    textAlign: "right",
  },
  heading: {
    fontFamily: typography.fontDisplay,
    fontSize: 36,
    lineHeight: 46,
    color: colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
  },
  headerFr: {
    fontFamily: typography.fontLatin,
    fontSize: 16,
    color: colors.textMuted,
    textAlign: "right",
  },
  grid: { gap: spacing.sm },
  card: {
    flexDirection: "row-reverse",
    alignItems: "center",
    borderRadius: 20,
    padding: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.cardFill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.cardBorder,
  },
  cardSelected: {
    borderColor: colors.gold,
    borderWidth: 1.5,
    backgroundColor: `${colors.gold}14`,
  },
  cardDisabled: { opacity: 0.55 },
  flag: { fontSize: 28, textAlign: "center", width: 40 },
  cardText: { flex: 1, gap: 2, alignItems: "flex-end" },
  cardLabel: { fontSize: 17 },
  // Trailing selection indicator — a quiet ring that fills gold when chosen.
  checkSlot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.18)",
  },
  checkSlotActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
});
