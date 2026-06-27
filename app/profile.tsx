import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors, radius, spacing, typography } from "../constants/tokens";
import { useAuthStore } from "../store/authStore";
import { toApiLanguage, type AppLang } from "../lib/mappers";
import ArabicText from "../components/shared/ArabicText";
import Button from "../components/ui/Button";
import ContentCard from "../components/ui/ContentCard";
import { LiquidGlassContainer } from "../components/ui/LiquidGlassContainer";

// Editable languages (Tamazight is shown but locked, mirroring the onboarding
// picker in app/(auth)/language.tsx).
const LANGUAGES: { id: AppLang; label: string; sublabel: string; disabled?: boolean }[] = [
  { id: "dar", label: "دارجة", sublabel: "العربية الجزائرية" },
  { id: "ar", label: "عربية", sublabel: "Modern Standard Arabic" },
  { id: "fr", label: "Français", sublabel: "Langue française" },
  { id: "ber", label: "ⴰⵣⵉⵖⴻⵏ", sublabel: "Tamazight", disabled: true },
];

// Pull a human message out of an axios error (backend 400s carry { message }).
function errorMessage(e: any): string {
  const m = e?.response?.data?.message;
  if (Array.isArray(m)) return m.join("\n");
  if (typeof m === "string") return m;
  if (e?.response?.status === 401) return "انتهت الجلسة. سجّل الدخول من جديد.";
  return "تعذّر حفظ التغييرات. حاول مجددًا.";
}

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const logout = useAuthStore((s) => s.logout);

  const [name, setName] = useState(user?.name ?? "");
  const [nin, setNin] = useState(user?.nin ?? "");
  const [lang, setLang] = useState<AppLang>(user?.language ?? "dar");
  const [saving, setSaving] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  // Single source of truth is the profile (brief §4): re-fetch on open so the
  // form reflects the server, then seed the inputs from the fresh values.
  useEffect(() => {
    refreshProfile().catch(() => {
      /* keep cached values if offline */
    });
  }, [refreshProfile]);

  useEffect(() => {
    setName(user?.name ?? "");
    setNin(user?.nin ?? "");
    setLang(user?.language ?? "dar");
  }, [user]);

  // Only the fields that actually changed go into the PATCH (brief §3).
  const patch = useMemo(() => {
    const p: { displayName?: string; nin?: string; language?: ReturnType<typeof toApiLanguage> } = {};
    const trimmedName = name.trim();
    const trimmedNin = nin.trim();
    if (trimmedName !== (user?.name ?? "")) p.displayName = trimmedName;
    // NIN must be 1–18 chars; never send an empty string (would 400).
    if (trimmedNin && trimmedNin !== (user?.nin ?? "")) p.nin = trimmedNin;
    if (lang !== (user?.language ?? "dar")) p.language = toApiLanguage(lang);
    return p;
  }, [name, nin, lang, user]);

  const dirty = Object.keys(patch).length > 0;

  const handleSave = async () => {
    if (!dirty) return;
    setSaving(true);
    setFieldError(null);
    try {
      await updateProfile(patch);
      Alert.alert("تم", "تم تحديث ملفك الشخصي.");
    } catch (e) {
      setFieldError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("تسجيل الخروج", "هل تريد تسجيل الخروج؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "خروج",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/language");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Glass header ─────────────────────────────────────────── */}
      <View style={styles.headerWrap}>
        <LiquidGlassContainer radius={radius.lg} padding={spacing.md}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => router.back()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="arrow-forward" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
            <ArabicText weight="semibold" color={colors.textPrimary}>
              ملفي الشخصي
            </ArabicText>
            <View style={styles.headerBtn} />
          </View>
        </LiquidGlassContainer>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Phone — read-only (changes only via OTP) */}
        <ContentCard>
          <ArabicText size="caption" color={colors.textMuted} style={styles.label}>
            رقم الهاتف
          </ArabicText>
          <View style={styles.phoneRow}>
            {user?.id ? (
              <View
                style={[
                  styles.verifyBadge,
                  { backgroundColor: `${colors.safe}1F` },
                ]}
              >
                <Ionicons name="shield-checkmark" size={13} color={colors.safe} />
                <ArabicText size="caption" color={colors.safe}>موثّق</ArabicText>
              </View>
            ) : null}
            <ArabicText
              weight="medium"
              color={colors.textPrimary}
              style={styles.phoneText}
            >
              {user?.phone ?? "—"}
            </ArabicText>
          </View>
          <ArabicText size="caption" color={colors.textMuted} style={styles.hint}>
            لا يمكن تغيير الرقم من هنا — يتم عبر التحقق برمز SMS.
          </ArabicText>
        </ContentCard>

        {/* Display name */}
        <ContentCard>
          <ArabicText size="caption" color={colors.textMuted} style={styles.label}>
            الاسم المعروض
          </ArabicText>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="مثال: أمين ب."
            placeholderTextColor={colors.textMuted}
            maxLength={120}
            textAlign="right"
          />
        </ContentCard>

        {/* NIN */}
        <ContentCard>
          <ArabicText size="caption" color={colors.textMuted} style={styles.label}>
            رقم التعريف الوطني (NIN)
          </ArabicText>
          <TextInput
            style={[styles.input, styles.ninInput]}
            value={nin}
            onChangeText={setNin}
            placeholder="١٨ رقمًا"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            maxLength={18}
            textAlign="center"
          />
          <ArabicText size="caption" color={colors.textMuted} style={styles.hint}>
            يُستخدم لتعبئة الرسائل والوثائق تلقائيًا.
          </ArabicText>
        </ContentCard>

        {/* Language */}
        <ContentCard>
          <ArabicText size="caption" color={colors.textMuted} style={styles.label}>
            لغة المساعد والردود
          </ArabicText>
          <View style={styles.langGrid}>
            {LANGUAGES.map((l) => {
              const active = lang === l.id;
              return (
                <TouchableOpacity
                  key={l.id}
                  disabled={l.disabled}
                  onPress={() => setLang(l.id)}
                  activeOpacity={0.85}
                  style={[
                    styles.langCard,
                    active && styles.langCardActive,
                    l.disabled && styles.langCardDisabled,
                  ]}
                >
                  <View style={[styles.checkSlot, active && styles.checkSlotActive]}>
                    {active ? (
                      <Ionicons name="checkmark" size={14} color={colors.inkBlue} />
                    ) : l.disabled ? (
                      <Ionicons name="lock-closed-outline" size={13} color={colors.textMuted} />
                    ) : null}
                  </View>
                  <View style={styles.langText}>
                    <ArabicText
                      weight="semibold"
                      color={l.disabled ? colors.textMuted : active ? colors.gold : colors.textPrimary}
                    >
                      {l.label}
                    </ArabicText>
                    <ArabicText size="caption" color={colors.textMuted}>
                      {l.disabled ? "قريباً" : l.sublabel}
                    </ArabicText>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ContentCard>

        {fieldError ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={colors.danger} />
            <ArabicText size="caption" color={colors.danger} style={{ flex: 1, textAlign: "right" }}>
              {fieldError}
            </ArabicText>
          </View>
        ) : null}

        <View style={styles.actions}>
          <Button variant="primary" onPress={handleSave} loading={saving} disabled={!dirty}>
            {saving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
          </Button>
          <Button variant="ghost" onPress={handleLogout}>
            تسجيل الخروج
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  headerWrap: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },

  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  label: { textAlign: "right", marginBottom: spacing.sm },
  hint: { textAlign: "right", marginTop: spacing.sm, lineHeight: 18 },

  phoneRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  phoneText: {
    fontSize: 17,
    fontFamily: typography.fontMono,
    letterSpacing: 0.5,
    writingDirection: "ltr",
  },
  verifyBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  input: {
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.ink200,
    backgroundColor: colors.surface2,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    fontFamily: typography.fontArabic,
    color: colors.textPrimary,
  },
  ninInput: {
    fontFamily: typography.fontMono,
    letterSpacing: 2,
    writingDirection: "ltr",
  },

  langGrid: { gap: spacing.sm },
  langCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: colors.surface2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.cardBorder,
  },
  langCardActive: { borderColor: colors.gold, borderWidth: 1.5, backgroundColor: `${colors.gold}14` },
  langCardDisabled: { opacity: 0.55 },
  langText: { flex: 1, gap: 2, alignItems: "flex-end" },
  checkSlot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.18)",
  },
  checkSlotActive: { backgroundColor: colors.gold, borderColor: colors.gold },

  errorBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: `${colors.danger}14`,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  actions: { gap: spacing.sm, marginTop: spacing.sm },
});
