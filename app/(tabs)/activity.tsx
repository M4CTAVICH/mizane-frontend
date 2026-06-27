import React, { useEffect, useRef, useState } from "react";
import {
  View,
  ScrollView,
  Animated,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import { colors } from "../../constants/tokens";
import ArabicText from "../../components/shared/ArabicText";
import { useDirection } from "../../lib/direction";
import { deadlinesApi, documentsApi, proceduresApi } from "../../lib/api";
import { toStoreDocument } from "../../lib/mappers";
import { PROCEDURE_META } from "../../constants/procedureMeta";
import type { ProcedureKey } from "../../types/api";

type Kind = "secured" | "reminder" | "document" | "message" | "procedure";

const KIND_COLOR: Record<Kind, string> = {
  secured: "#5FB38A",
  reminder: "#D4756B",
  document: "#E0B64D",
  message: "#D8A64A",
  procedure: "#E08A3C",
};

interface ActivityEvent {
  id: string;
  kind: Kind;
  title: string;
  sub: string;
  time: string;
  live?: boolean;
}

interface Group {
  label: string;
  events: ActivityEvent[];
}

// An event with its absolute timestamp, before grouping by recency.
interface DatedEvent extends Omit<ActivityEvent, "time"> {
  at: number;
}

function toArabicDigits(value: string | number): string {
  const map = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(value).replace(/[0-9]/g, (d) => map[Number(d)]);
}

function relativeTime(at: number): string {
  const mins = Math.max(0, Math.round((Date.now() - at) / 60000));
  if (mins < 1) return "الآن";
  if (mins < 60) return `${toArabicDigits(mins)} دقيقة`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${toArabicDigits(hours)} ساعة`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${toArabicDigits(days)} يوم`;
  return new Date(at).toLocaleDateString("ar-DZ");
}

// Bucket events into today / this week / older, sorted newest-first.
function buildGroups(events: DatedEvent[]): Group[] {
  const now = Date.now();
  const DAY = 86400000;
  const sorted = [...events].sort((a, b) => b.at - a.at);
  const buckets: Record<string, ActivityEvent[]> = {
    اليوم: [],
    "هذا الأسبوع": [],
    أقدم: [],
  };
  for (const e of sorted) {
    const age = now - e.at;
    const label = age < DAY ? "اليوم" : age < 7 * DAY ? "هذا الأسبوع" : "أقدم";
    const { at, ...rest } = e;
    buckets[label].push({ ...rest, time: relativeTime(at) });
  }
  return Object.entries(buckets)
    .filter(([, evs]) => evs.length > 0)
    .map(([label, evs]) => ({ label, events: evs }));
}

/** Pulsing ring for a live timeline node. */
function PulseRing({ color }: { color: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(anim, { toValue: 1, duration: 1800, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.pulseRing,
        {
          borderColor: color,
          opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
          transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2] }) }],
        },
      ]}
    />
  );
}

function EventRow({ event, isLast }: { event: ActivityEvent; isLast: boolean }) {
  const dir = useDirection();
  const color = KIND_COLOR[event.kind];
  return (
    <View style={[styles.eventRow, !isLast && styles.eventRowDivider]}>
      <View style={[styles.eventContent, { flexDirection: dir.row }]}>
        <View style={[styles.eventTextCol, { alignItems: dir.alignStart }]}>
          <ArabicText weight="semibold" color={colors.textPrimary} style={[styles.title, { textAlign: dir.textAlign }]} numberOfLines={1}>
            {event.title}
          </ArabicText>
          <ArabicText color={colors.textMuted} style={[styles.sub, { textAlign: dir.textAlign }]} numberOfLines={1}>
            {event.sub}
          </ArabicText>
        </View>
        <ArabicText color={colors.textMuted} style={styles.time}>
          {event.time}
        </ArabicText>
      </View>

      {/* Node on the rail */}
      <View style={styles.node}>
        {event.live ? <PulseRing color={color} /> : null}
        <View style={[styles.dot, { backgroundColor: color }]} />
        {event.live ? (
          <View style={[styles.liveRing, { borderColor: color }]} pointerEvents="none" />
        ) : null}
      </View>
    </View>
  );
}

const DOC_STATUS_AR: Record<string, string> = {
  valid: "سارية المفعول",
  expiring: "تنتهي قريبًا",
  expired: "منتهية الصلاحية",
};

export default function ActivityScreen() {
  const { t } = useTranslation();
  const dir = useDirection();
  const [groups, setGroups] = useState<Group[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setError(false);
      const [docsRes, instRes, dlRes] = await Promise.allSettled([
        documentsApi.list(),
        proceduresApi.myInstances(),
        deadlinesApi.list(),
      ]);
      if (!active) return;

      // If everything failed, surface an error; otherwise show what we got.
      if (
        docsRes.status === "rejected" &&
        instRes.status === "rejected" &&
        dlRes.status === "rejected"
      ) {
        setError(true);
        setLoading(false);
        return;
      }

      const events: DatedEvent[] = [];

      if (docsRes.status === "fulfilled") {
        for (const raw of docsRes.value) {
          const d = toStoreDocument(raw);
          const at = new Date(d.createdAt).getTime();
          events.push({
            id: `doc-${d.id}`,
            kind: "document",
            title: `تمت إضافة ${d.name}`,
            sub: DOC_STATUS_AR[d.status] ?? "محفوظة في الخزينة",
            at,
          });
          if (d.status === "expiring" || d.status === "expired") {
            events.push({
              id: `exp-${d.id}`,
              kind: "reminder",
              title: `موعد ${d.name}`,
              sub:
                d.status === "expired"
                  ? "انتهت الصلاحية"
                  : "تقترب من انتهاء الصلاحية",
              at,
            });
          }
        }
      }

      if (instRes.status === "fulfilled") {
        for (const inst of instRes.value) {
          const titleAr =
            inst.procedure.title?.ar ??
            PROCEDURE_META[inst.procedure.key as ProcedureKey]?.categoryLabel ??
            "إجراء";
          events.push({
            id: `inst-${inst.id}`,
            kind: "procedure",
            title: `بدأت إجراء ${titleAr}`,
            sub: inst.readiness.ready ? "جاهز للمتابعة" : "بانتظار وثائق",
            at: new Date(inst.startedAt).getTime(),
          });
        }
      }

      if (dlRes.status === "fulfilled") {
        for (const dl of dlRes.value) {
          events.push({
            id: `dl-${dl.id}`,
            kind: "reminder",
            title: dl.label ?? "موعد قانوني",
            sub: `آخر أجل: ${dl.dueDate}`,
            at: new Date(dl.createdAt).getTime(),
          });
        }
      }

      setCount(events.length);
      setGroups(buildGroups(events));
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { alignItems: dir.alignStart }]}>
          <ArabicText weight="semibold" color={colors.textPrimary} style={styles.h1}>
            {t("activity.title")}
          </ArabicText>
          <ArabicText color={colors.textMuted} style={styles.subtitle}>
            {loading
              ? t("common.loading")
              : error
                ? "تعذّر تحميل النشاط"
                : `${toArabicDigits(count)} أحداث`}
          </ArabicText>
        </View>

        {loading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator color={colors.gold} />
          </View>
        ) : !error && groups.length === 0 ? (
          <View style={styles.stateBox}>
            <ArabicText color={colors.textMuted}>{t("activity.empty")}</ArabicText>
          </View>
        ) : (
          groups.map((group) => (
            <View key={group.label} style={styles.section}>
              <ArabicText color={colors.textMuted} style={[styles.eyebrow, { textAlign: dir.textAlign }]}>
                {group.label}
              </ArabicText>
              <View style={styles.sectionBody}>
                <View style={styles.rail} />
                {group.events.map((e, i) => (
                  <EventRow key={e.id} event={e} isLast={i === group.events.length - 1} />
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

// Right-side rail position. The node box sits at right:0 with width 12 (center
// at right:6); the rail is aligned to that center.
const NODE_SIZE = 12;
const RAIL_RIGHT = NODE_SIZE / 2 - 0.5;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  stateBox: { alignItems: "center", paddingTop: 80, gap: 16 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 56 : 32,
    paddingBottom: 160,
  },

  // Header
  header: { alignItems: "flex-end", marginBottom: 36 },
  h1: { fontSize: 30, lineHeight: 33 },
  subtitle: { fontSize: 13.5, lineHeight: 20.25, marginTop: 8 },

  // Section
  section: { marginBottom: 36 },
  eyebrow: {
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 1.5,
    textAlign: "right",
  },
  sectionBody: { position: "relative", marginTop: 16 },
  rail: {
    position: "absolute",
    right: RAIL_RIGHT,
    top: 12,
    bottom: 12,
    width: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  // Event row
  eventRow: { position: "relative", paddingRight: 28, paddingBottom: 22.8 },
  eventRowDivider: {
    borderBottomWidth: 0.8,
    borderBottomColor: "rgba(255,255,255,0.05)",
    marginBottom: 22,
  },
  eventContent: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 16,
  },
  eventTextCol: { flex: 1, alignItems: "flex-end" },
  title: { fontSize: 16, lineHeight: 21.6, textAlign: "right" },
  sub: { fontSize: 13.5, lineHeight: 20.25, marginTop: 4, textAlign: "right" },
  time: { fontSize: 12, lineHeight: 18, opacity: 0.65, marginTop: 2 },

  // Node on the rail
  node: {
    position: "absolute",
    right: 0,
    top: 6,
    width: NODE_SIZE,
    height: NODE_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  liveRing: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.2,
    opacity: 0.4,
  },
  pulseRing: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.2,
  },
});
