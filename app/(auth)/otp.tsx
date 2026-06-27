import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator } from "react-native";
import { colors, radius, spacing, typography } from "../../constants/tokens";
import { useAuthStore } from "../../store/authStore";
import ArabicText from "../../components/shared/ArabicText";

// Primary submit — gold gradient when actionable, flat matte when disabled
// (matches the OTP resting state in Figma 6:505).
interface SubmitButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

function SubmitButton({ label, onPress, disabled = false, loading = false }: SubmitButtonProps) {
  const inactive = disabled || loading;
  return (
    <TouchableOpacity
      style={styles.submit}
      onPress={onPress}
      disabled={inactive}
      activeOpacity={0.85}
    >
      {inactive ? (
        <View style={styles.submitMuted} />
      ) : (
        <LinearGradient
          colors={[colors.goldGradTop, colors.goldGradBottom]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      {loading ? (
        <ActivityIndicator size="small" color={colors.textMuted} />
      ) : (
        <ArabicText
          weight="semibold"
          color={inactive ? colors.textMuted : colors.inkBlue}
          style={styles.submitText}
        >
          {label}
        </ArabicText>
      )}
    </TouchableOpacity>
  );
}

// Normalize the local digits from the input into an E.164 Algerian number.
// The UI shows the +213 prefix separately, so `phone` holds only the local part.
function toE164(local: string): string {
  return `+213${local.replace(/\D/g, "").replace(/^0/, "")}`;
}

export default function OTPScreen() {
  const router = useRouter();
  const requestOtp = useAuthStore((s) => s.requestOtp);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const syncLanguage = useAuthStore((s) => s.syncLanguage);
  const chosenLanguage = useAuthStore((s) => s.language);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handleSendOtp = async () => {
    setLoading(true);
    setError("");
    try {
      await requestOtp(toE164(phone));
      setStep("otp");
      setCountdown(60);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "تعذّر إرسال الرمز، حاول مجددًا");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (val: string, idx: number) => {
    const newOtp = [...otp];
    newOtp[idx] = val.slice(-1);
    setOtp(newOtp);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleVerify = async () => {
    setLoading(true);
    setError("");
    try {
      const preferred = chosenLanguage;
      await verifyOtp(toE164(phone), otp.join(""));
      // Persist the language picked on the previous screen (verify resets it
      // to the freshly-created profile's default).
      await syncLanguage(preferred);
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "الرمز غير صحيح");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await requestOtp(toE164(phone));
      setCountdown(60);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "تعذّر إعادة الإرسال");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.safe}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.eyebrow}>MIZANE · VÉRIFICATION</Text>
              <Text style={styles.heading}>
                {step === "phone" ? "أدخل رقمك" : "أدخل الرمز"}
              </Text>
              <ArabicText color={colors.textMuted} style={styles.subtitle}>
                {step === "phone"
                  ? "سنرسل لك رمز التحقق برسالة نصية"
                  : `أُرسل الرمز إلى +213 ${phone || "555 000 001"}`}
              </ArabicText>
            </View>

            {/* Inputs */}
            <View style={styles.inputBlock}>
              {step === "phone" ? (
                <View style={styles.phoneRow}>
                  <View style={styles.prefixBox}>
                    <Text style={styles.prefixText}>+213</Text>
                  </View>
                  <View style={styles.phoneField}>
                    <TextInput
                      style={styles.phoneInput}
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      placeholder="555 000 001"
                      placeholderTextColor="rgba(245,245,247,0.5)"
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.otpRow}>
                  {otp.map((digit, idx) => (
                    <View
                      key={idx}
                      style={[styles.otpCell, digit ? styles.otpCellFilled : null]}
                    >
                      <TextInput
                        ref={(r) => {
                          inputRefs.current[idx] = r;
                        }}
                        style={[styles.otpText, digit ? styles.otpTextFilled : null]}
                        value={digit}
                        onChangeText={(v) => handleOtpChange(v, idx)}
                        keyboardType="numeric"
                        maxLength={1}
                        textAlign="center"
                      />
                    </View>
                  ))}
                </View>
              )}

              {step === "phone" ? (
                <SubmitButton
                  label="إرسال الرمز"
                  loading={loading}
                  disabled={phone.trim().length < 6}
                  onPress={handleSendOtp}
                />
              ) : (
                <>
                  <SubmitButton
                    label="تحقق"
                    loading={loading}
                    disabled={otp.join("").length < 6}
                    onPress={handleVerify}
                  />
                  <TouchableOpacity
                    disabled={countdown > 0}
                    onPress={handleResend}
                  >
                    <ArabicText
                      size="caption"
                      color={countdown > 0 ? colors.textMuted : colors.gold}
                      style={styles.resend}
                    >
                      {countdown > 0
                        ? `إعادة الإرسال خلال ${countdown}ث`
                        : "إعادة الإرسال"}
                    </ArabicText>
                  </TouchableOpacity>
                </>
              )}

              {error ? (
                <ArabicText
                  size="caption"
                  color={colors.danger}
                  style={styles.error}
                >
                  {error}
                </ArabicText>
              ) : null}
            </View>

            <View style={styles.spacer} />
          </View>
        </SafeAreaView>
      </View>
    </KeyboardAvoidingView>
  );
}

const CARD = {
  backgroundColor: colors.cardFill,
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: colors.cardBorder,
} as const;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  safe: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: 28,
    paddingBottom: spacing.xl,
  },

  // Header
  header: { alignItems: "flex-end" },
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
    marginTop: spacing.sm,
    writingDirection: "rtl",
  },
  subtitle: { fontSize: 15, lineHeight: 22.5, textAlign: "right", marginTop: spacing.sm },

  // Inputs
  inputBlock: { marginTop: spacing.xl, gap: spacing.md },
  phoneRow: { flexDirection: "row", gap: 10, height: 64 },
  prefixBox: {
    ...CARD,
    width: 72,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  prefixText: {
    fontFamily: typography.fontArabicSemiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  phoneField: {
    ...CARD,
    flex: 1,
    height: 64,
    borderRadius: 16,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  phoneInput: {
    fontFamily: typography.fontArabic,
    fontSize: 20,
    letterSpacing: 3,
    color: colors.textPrimary,
    textAlign: "left",
    writingDirection: "ltr",
  },
  submit: {
    height: 59,
    borderRadius: radius.xl,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  submitMuted: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  submitText: { fontSize: 17 },

  // OTP cells
  otpRow: { flexDirection: "row", gap: spacing.sm, justifyContent: "center" },
  otpCell: {
    ...CARD,
    flex: 1,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  otpCellFilled: { borderColor: colors.gold, borderWidth: 1.5 },
  otpText: {
    fontFamily: typography.fontMono,
    fontSize: 22,
    color: colors.textPrimary,
    width: "100%",
    height: "100%",
    padding: 0,
    textAlign: "center",
    textAlignVertical: "center",
    writingDirection: "ltr",
    includeFontPadding: false,
  },
  otpTextFilled: { color: colors.gold },

  resend: { textAlign: "center", marginTop: spacing.xs },
  error: { textAlign: "center", marginTop: spacing.xs },

  spacer: { flex: 1 },
});
