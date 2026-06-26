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
import { colors, radius, spacing, typography, textScale } from "../../constants/tokens";
import { useAuthStore } from "../../store/authStore";
import Button from "../../components/ui/Button";
import ArabicText from "../../components/shared/ArabicText";
import ContentCard from "../../components/ui/ContentCard";

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
            <Text style={[textScale.label, styles.eyebrow]}>MIZANE · LANGUE</Text>
            <ArabicText size="display" weight="semibold" color={colors.textPrimary}>
              اختر لغتك
            </ArabicText>
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
                  activeOpacity={lang.disabled ? 1 : 0.8}
                >
                  <ContentCard
                    variant={isSelected ? "raised" : "default"}
                    style={[
                      styles.card,
                      isSelected && styles.cardSelected,
                      lang.disabled && styles.cardDisabled,
                    ]}
                  >
                    <Text style={styles.flag}>{lang.flag}</Text>
                    <View style={styles.cardText}>
                      <ArabicText
                        weight="medium"
                        color={
                          lang.disabled
                            ? colors.textMuted
                            : isSelected
                              ? colors.gold
                              : colors.textPrimary
                        }
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
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={colors.gold}
                      />
                    )}
                    {lang.disabled && (
                      <Ionicons
                        name="lock-closed-outline"
                        size={18}
                        color={colors.textMuted}
                      />
                    )}
                  </ContentCard>
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
  eyebrow: { textAlign: "right" },
  headerFr: {
    fontFamily: typography.fontLatin,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "right",
  },
  grid: { gap: spacing.sm },
  card: {
    flexDirection: "row-reverse",
    alignItems: "center",
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1.5,
  },
  cardSelected: {
    borderColor: colors.gold,
    backgroundColor: `${colors.gold}14`,
  },
  cardDisabled: { opacity: 0.5 },
  flag: { fontSize: 28, textAlign: "center", width: 40 },
  cardText: { flex: 1, gap: 2, alignItems: "flex-end" },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
});
