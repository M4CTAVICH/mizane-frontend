import React, { useState, useRef } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { colors, radius, spacing } from "../../constants/tokens";
import ArabicText from "../../components/shared/ArabicText";
import LoadingState from "../../components/shared/LoadingState";
import BottomSheet from "../../components/ui/BottomSheet";
import DNAResult from "../../components/scan/DNAResult";
import Button from "../../components/ui/Button";
import ContentCard from "../../components/ui/ContentCard";
import { LiquidGlassContainer } from "../../components/ui/LiquidGlassContainer";
import { scanApi } from "../../lib/api";
import type { ScanResult as ApiScanResult } from "../../types/api";

const DNA_CHECKS_DEMO = [
  { id: "official_stamp", label: "ختم رسمي موجود", passed: true },
  { id: "article_valid", label: "مراجع قانونية صحيحة", passed: true },
  { id: "date_format", label: "تاريخ صحيح", passed: true },
  { id: "registration_no", label: "رقم التسجيل", passed: false },
  { id: "signatory", label: "توقيع / ختم مُوقِّع", passed: true },
];

const FLAGS_DEMO = [
  { clause: "المادة 666", reason: "هذه المادة لا وجود لها في القانون الجزائري" },
];

interface ScanResult {
  documentType: string;
  summaryDarija: string;
  dnaChecks: typeof DNA_CHECKS_DEMO;
  flags: typeof FLAGS_DEMO;
  authentic: boolean;
}

// Map the backend ScanResult into the bottom-sheet's view model.
function mapScanResult(r: ApiScanResult): ScanResult {
  const authentic = r.dna?.authentic ?? true;
  const anomalies = r.dna?.anomalies ?? [];
  const dnaChecks =
    anomalies.length > 0
      ? anomalies.map((label, i) => ({
          id: `anomaly_${i}`,
          label,
          passed: false,
        }))
      : [{ id: "no_anomaly", label: "لا توجد مؤشرات تزوير", passed: true }];
  return {
    documentType: "تحليل الوثيقة",
    summaryDarija: r.summary ?? "تعذّر استخراج ملخص لهذه الوثيقة.",
    dnaChecks,
    flags: r.flags.map((f) => ({ clause: f.clause, reason: f.issue })),
    authentic,
  };
}

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  // Upload an image to /scan, map the analysis, and reveal the results sheet.
  // Falls back to seeded demo data if the backend is unreachable.
  const analyze = async (uri: string) => {
    setProcessing(true);
    try {
      const name = uri.split("/").pop() ?? "scan.jpg";
      const ext = (name.split(".").pop() ?? "jpg").toLowerCase();
      const formData = new FormData();
      if (Platform.OS === "web") {
        // Web needs a real Blob; the {uri,name,type} object would be stringified.
        const blob = await (await fetch(uri)).blob();
        formData.append("file", blob, name);
      } else {
        formData.append("file", {
          uri,
          name,
          type: `image/${ext === "jpg" ? "jpeg" : ext}`,
        } as any);
      }

      const apiResult = await scanApi.scanFile(formData);
      setResult(mapScanResult(apiResult));
      setSheetVisible(true);
    } catch (e: any) {
      const msg =
        e?.response?.status === 401
          ? "انتهت الجلسة. سجّل الدخول من جديد."
          : "تعذّر تحليل الوثيقة. تأكّد من الاتصال وحاول مجددًا.";
      Alert.alert("خطأ", msg);
    } finally {
      setProcessing(false);
    }
  };

  const handleCapture = async () => {
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.7 });
      if (photo?.uri) {
        await analyze(photo.uri);
      }
    } catch {
      Alert.alert("خطأ", "فشل التقاط الصورة. حاول مجدداً.");
    }
  };

  const handleGallery = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (!res.canceled && res.assets[0]) {
      await analyze(res.assets[0].uri);
    }
  };

  if (!permission?.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permContainer}>
          <Ionicons name="camera-outline" size={64} color={colors.gold} />
          <ArabicText size="heading" weight="semibold" color={colors.textPrimary} style={{ textAlign: "center" }}>
            نحتاج صلاحية الكاميرا
          </ArabicText>
          <Button variant="primary" onPress={requestPermission}>
            منح الصلاحية
          </Button>
          <TouchableOpacity onPress={() => router.back()}>
            <ArabicText size="caption" color={colors.textSecondary}>
              إغلاق
            </ArabicText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
      />

      {/* Overlay */}
      <View style={StyleSheet.absoluteFill}>
        {/* Top bar — glass chrome over the camera feed */}
        <SafeAreaView>
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <LiquidGlassContainer radius={radius.full} padding={8} intensity={40}>
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </LiquidGlassContainer>
            </TouchableOpacity>
            <ArabicText weight="semibold" color={colors.textPrimary} style={styles.topTitle}>
              فحص وثيقة
            </ArabicText>
          </View>
        </SafeAreaView>

        {/* Scan frame */}
        <View style={styles.frameContainer}>
          <View style={styles.frame}>
            {/* Corner guides */}
            {["TL", "TR", "BL", "BR"].map((corner) => (
              <View
                key={corner}
                style={[styles.corner, styles[`corner${corner}` as keyof typeof styles] as any]}
              />
            ))}
          </View>
          <ArabicText color="rgba(255,255,255,0.8)" style={{ textAlign: "center", marginTop: spacing.md }}>
            اصوّر الوثيقة داخل الإطار
          </ArabicText>
        </View>

        {/* Processing overlay */}
        {processing && (
          <View style={styles.processingOverlay}>
            <LoadingState
              message="جارٍ تحليل الوثيقة..."
              fullScreen={false}
            />
          </View>
        )}

        {/* Bottom controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.galleryBtn} onPress={handleGallery}>
            <Ionicons name="images-outline" size={22} color="#fff" />
            <ArabicText size="caption" color="#fff">
              المعرض
            </ArabicText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.captureBtn}
            onPress={handleCapture}
            disabled={processing}
            activeOpacity={0.8}
          >
            <View style={styles.captureBtnInner} />
          </TouchableOpacity>
          <View style={{ width: 60 }} />
        </View>
      </View>

      {/* Results bottom sheet */}
      <BottomSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        title="نتائج الفحص"
        maxHeight={680}
      >
        {result && (
          <View style={styles.resultsContent}>
            {/* Document type */}
            <ContentCard variant={result.authentic ? "verified" : "flagged"}>
              <View style={styles.resultRow}>
                <Ionicons
                  name={result.authentic ? "checkmark-circle" : "warning"}
                  size={22}
                  color={result.authentic ? colors.safe : colors.danger}
                />
                <View style={{ flex: 1, alignItems: "flex-end" }}>
                  <ArabicText weight="semibold" color={colors.textPrimary}>
                    {result.documentType}
                  </ArabicText>
                </View>
              </View>
            </ContentCard>

            {/* Summary in Darija */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="chatbubble-outline" size={16} color={colors.gold} />
                <ArabicText weight="medium" color={colors.textPrimary}>
                  ملخص بالدارجة
                </ArabicText>
              </View>
              <ContentCard>
                <ArabicText color={colors.textSecondary} style={{ lineHeight: 24 }}>
                  {result.summaryDarija}
                </ArabicText>
              </ContentCard>
            </View>

            {/* DNA checks */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="fitness-outline" size={16} color={colors.gold} />
                <ArabicText weight="medium" color={colors.textPrimary}>
                  فحص الأصالة
                </ArabicText>
              </View>
              <DNAResult checks={result.dnaChecks} authentic={result.authentic} />
            </View>

            {/* Abusive clauses */}
            {result.flags.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="warning-outline" size={16} color={colors.danger} />
                  <ArabicText weight="medium" color={colors.danger}>
                    بنود مشبوهة
                  </ArabicText>
                </View>
                <ContentCard variant="flagged">
                  {result.flags.map((flag, idx) => (
                    <View key={idx} style={styles.flagItem}>
                      <ArabicText weight="medium" color={colors.danger}>
                        • {flag.clause}
                      </ArabicText>
                      <ArabicText size="caption" color={colors.textSecondary}>
                        {flag.reason}
                      </ArabicText>
                    </View>
                  ))}
                </ContentCard>
              </View>
            )}

            {/* CTA buttons */}
            <View style={styles.ctaRow}>
              <Button
                variant="secondary"
                size="md"
                fullWidth={false}
                style={{ flex: 1 }}
                onPress={() => {
                  setSheetVisible(false);
                  router.push("/(tabs)");
                }}
              >
                اسأل ميزان
              </Button>
              <Button
                variant="primary"
                size="md"
                fullWidth={false}
                style={{ flex: 1 }}
                onPress={() => {
                  setSheetVisible(false);
                  router.push("/letter/eviction_response");
                }}
              >
                أنشئ ردًّا
              </Button>
            </View>
          </View>
        )}
      </BottomSheet>
    </View>
  );
}

const CORNER_SIZE = 24;
const CORNER_THICKNESS = 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  permContainer: {
    flex: 1,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  topBar: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  topTitle: { fontSize: 17 },
  frameContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  frame: {
    width: 280,
    height: 380,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: colors.gold,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderBottomRightRadius: 4,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: Platform.OS === "ios" ? 48 : 32,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  galleryBtn: {
    alignItems: "center",
    gap: 4,
    width: 60,
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  captureBtnInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.gold,
  },
  resultsContent: { gap: spacing.md },
  section: { gap: spacing.sm },
  sectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
  },
  resultRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
  },
  flagItem: {
    gap: 4,
    alignItems: "flex-end",
    paddingVertical: spacing.xs,
  },
  ctaRow: {
    flexDirection: "row-reverse",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
