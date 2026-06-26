import React from "react";
import {
  View,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, shadow, spacing } from "../../constants/tokens";
import ArabicText from "../../components/shared/ArabicText";

type ActivityCategory = "deadline" | "letter" | "proof" | "vault" | "procedure";

interface ActivityItem {
  id: string;
  category: ActivityCategory;
  title: string;
  subtitle: string;
  date: Date;
}

const ICON_MAP: Record<ActivityCategory, { icon: string; color: string }> = {
  deadline: { icon: "alarm-outline", color: colors.danger },
  letter: { icon: "mail-outline", color: colors.justiceGold },
  proof: { icon: "shield-checkmark-outline", color: colors.safe },
  vault: { icon: "document-outline", color: colors.justiceGold },
  procedure: { icon: "list-outline", color: colors.caution },
};

const DEMO_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    category: "proof",
    title: "تم تثبيت عقد الميلاد",
    subtitle: "OTS-demo_anchor_1",
    date: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: "act-2",
    category: "deadline",
    title: "موعد شهادة الإقامة",
    subtitle: "تنتهي خلال 12 يوم",
    date: new Date(Date.now() - 1000 * 60 * 60 * 3),
  },
  {
    id: "act-3",
    category: "vault",
    title: "تمت إضافة الوثيقة العائلية",
    subtitle: "الوثيقة العائلية · صالحة",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: "act-4",
    category: "letter",
    title: "رسالة شكوى عمالية",
    subtitle: "تم التوليد والحفظ",
    date: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
  {
    id: "act-5",
    category: "procedure",
    title: "بدأت إجراء تجديد جواز السفر",
    subtitle: "الخطوة 1 من 4",
    date: new Date(Date.now() - 1000 * 60 * 60 * 72),
  },
];

function formatDate(d: Date): string {
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  if (hours < 24) return `منذ ${hours} ساعة`;
  return `منذ ${days} يوم`;
}

function ActivityRow({ item, isLast }: { item: ActivityItem; isLast: boolean }) {
  const meta = ICON_MAP[item.category];
  return (
    <View style={styles.row}>
      {/* Timeline column */}
      <View style={styles.timelineCol}>
        <View style={[styles.dot, { backgroundColor: meta.color }]} />
        {!isLast && <View style={styles.line} />}
      </View>

      {/* Content */}
      <View style={styles.rowContent}>
        <View style={[styles.iconCircle, { backgroundColor: `${meta.color}15` }]}>
          <Ionicons name={meta.icon as any} size={18} color={meta.color} />
        </View>
        <View style={styles.rowText}>
          <ArabicText weight="medium" color={colors.textPrimary} numberOfLines={1}>
            {item.title}
          </ArabicText>
          <ArabicText size="caption" color={colors.textMuted} numberOfLines={1}>
            {item.subtitle}
          </ArabicText>
        </View>
        <ArabicText size="caption" color={colors.justiceGold} style={styles.dateText}>
          {formatDate(item.date)}
        </ArabicText>
      </View>
    </View>
  );
}

export default function ActivityScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ArabicText size="heading" weight="semibold" color={colors.textPrimary}>
          النشاط
        </ArabicText>
      </View>

      <FlatList
        data={DEMO_ACTIVITIES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <ActivityRow
            item={item}
            isLast={index === DEMO_ACTIVITIES.length - 1}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={48} color={colors.ink300} />
            <ArabicText color={colors.textMuted} style={{ textAlign: "center" }}>
              لا يوجد نشاط بعد — ابدأ بفحص وثيقة
            </ArabicText>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface0 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface1,
    borderBottomWidth: 1,
    borderBottomColor: colors.ink200,
    alignItems: "flex-end",
  },
  listContent: {
    padding: spacing.md,
  },
  row: {
    flexDirection: "row-reverse",
    gap: spacing.md,
    minHeight: 72,
  },
  timelineCol: {
    alignItems: "center",
    width: 16,
    paddingTop: 4,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 1,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: colors.ink200,
    marginTop: 2,
  },
  rowContent: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.ink200,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rowText: {
    flex: 1,
    gap: 2,
    alignItems: "flex-end",
  },
  dateText: {
    flexShrink: 0,
    fontSize: 11,
    textAlign: "right",
    writingDirection: "ltr",
  },
  emptyState: {
    alignItems: "center",
    paddingTop: spacing.xxl * 2,
    gap: spacing.md,
  },
});
