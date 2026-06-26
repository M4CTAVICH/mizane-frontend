import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { colors, radius, spacing, typography } from "../../constants/tokens";
import { useAuthStore, DEMO_USER } from "../../store/authStore";
import Button from "../../components/ui/Button";
import ArabicText from "../../components/shared/ArabicText";

export default function OTPScreen() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const language = useAuthStore((s) => s.language);

  const [phone, setPhone] = useState("555 000 001");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handleSendOtp = () => {
    setStep("otp");
    setCountdown(60);
    // Auto-fill demo OTP
    setTimeout(() => {
      const demoOtp = ["1", "2", "3", "4", "5", "6"];
      setOtp(demoOtp);
    }, 500);
  };

  const handleOtpChange = (val: string, idx: number) => {
    const newOtp = [...otp];
    newOtp[idx] = val.slice(-1);
    setOtp(newOtp);
    if (val && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    // Demo: skip verification, directly login
    setTimeout(async () => {
      await setUser(DEMO_USER, "demo_jwt_token_123");
      setLoading(false);
      router.replace("/(tabs)");
    }, 800);
  };

  const handleSkip = async () => {
    await setUser(DEMO_USER, "demo_jwt_token_123");
    router.replace("/(tabs)");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <ArabicText size="display" weight="semibold" color={colors.textPrimary}>
                {step === "phone" ? "أدخل رقمك" : "أدخل الرمز"}
              </ArabicText>
              <ArabicText size="body" color={colors.textMuted}>
                {step === "phone"
                  ? "سنرسل لك رمز التحقق"
                  : `أُرسل الرمز إلى +213 ${phone}`}
              </ArabicText>
            </View>

            {step === "phone" ? (
              <View style={styles.phoneRow}>
                <View style={styles.prefix}>
                  <ArabicText color={colors.textSecondary} style={{ textAlign: "left" }}>
                    +213
                  </ArabicText>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder="555 000 001"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            ) : (
              <View style={styles.otpRow}>
                {otp.map((digit, idx) => (
                  <TextInput
                    key={idx}
                    ref={(r) => (inputRefs.current[idx] = r)}
                    style={[styles.otpCell, digit ? styles.otpCellFilled : {}]}
                    value={digit}
                    onChangeText={(v) => handleOtpChange(v, idx)}
                    keyboardType="numeric"
                    maxLength={1}
                    textAlign="center"
                  />
                ))}
              </View>
            )}

            {step === "phone" ? (
              <Button variant="primary" size="lg" onPress={handleSendOtp}>
                إرسال الرمز
              </Button>
            ) : (
              <>
                <Button
                  variant="primary"
                  size="lg"
                  loading={loading}
                  disabled={otp.join("").length < 6}
                  onPress={handleVerify}
                >
                  تحقق
                </Button>
                <TouchableOpacity
                  disabled={countdown > 0}
                  onPress={() => setCountdown(60)}
                >
                  <ArabicText
                    size="caption"
                    color={countdown > 0 ? colors.textMuted : colors.justiceGold}
                    style={{ textAlign: "center", marginTop: spacing.sm }}
                  >
                    {countdown > 0
                      ? `إعادة الإرسال خلال ${countdown}ث`
                      : "إعادة الإرسال"}
                  </ArabicText>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Skip */}
          <TouchableOpacity style={styles.skip} onPress={handleSkip}>
            <ArabicText size="caption" color={colors.textMuted}>
              تخطي (وضع العرض)
            </ArabicText>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.parchment },
  safe: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    gap: spacing.lg,
  },
  header: { gap: spacing.sm, alignItems: "flex-end" },
  phoneRow: {
    flexDirection: "row-reverse",
    gap: spacing.sm,
    alignItems: "center",
  },
  prefix: {
    height: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.ink200,
    backgroundColor: colors.surface2,
    justifyContent: "center",
    minWidth: 64,
    alignItems: "center",
  },
  phoneInput: {
    flex: 1,
    height: 48,
    backgroundColor: colors.surface1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.ink200,
    paddingHorizontal: spacing.md,
    fontSize: 18,
    fontFamily: typography.fontMono,
    color: colors.textPrimary,
    letterSpacing: 2,
    textAlign: "left",
    writingDirection: "ltr",
  },
  otpRow: {
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
  },
  otpCell: {
    width: 44,
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.ink200,
    backgroundColor: colors.surface1,
    fontSize: 22,
    fontFamily: typography.fontMono,
    color: colors.textPrimary,
    textAlign: "center",
  },
  otpCellFilled: {
    borderColor: colors.justiceGold,
    backgroundColor: `${colors.justiceGold}08`,
  },
  skip: {
    paddingBottom: spacing.xl,
    alignItems: "center",
  },
});
