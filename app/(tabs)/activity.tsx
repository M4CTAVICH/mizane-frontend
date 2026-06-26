import React, { useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  Animated,
  StyleSheet,
  Platform,
} from "react-native";
import { colors } from "../../constants/tokens";
import ArabicText from "../../components/shared/ArabicText";

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

const GROUPS: Group[] = [
  {
    label: "اليوم",
    events: [
      {
        id: "1",
        kind: "secured",
        title: "تم تثبيت عقد الميلاد",
        sub: "محفوظ ومُشفّر في الخزينة",
        time: "٣٢ دقيقة",
        live: true,
      },
      {
        id: "2",
        kind: "reminder",
        title: "موعد شهادة الإقامة",
        sub: "تنتهي صلاحيتها خلال ١٢ يوم",
        time: "٣ ساعات",
      },
    ],
  },
  {
    label: "هذا الأسبوع",
    events: [
      {
        id: "3",
        kind: "document",
        title: "تمت إضافة الوثيقة العائلية",
        sub: "سارية المفعول",
        time: "أمس",
      },
      {
        id: "4",
        kind: "message",
        title: "رسالة شكوى عمالية",
        sub: "تم التوليد والحفظ",
        time: "يومان",
      },
      {
        id: "5",
        kind: "procedure",
        title: "بدأت إجراء تجديد جواز السفر",
        sub: "الخطوة ١ من ٤",
        time: "٣ أيام",
      },
    ],
  },
];

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
  const color = KIND_COLOR[event.kind];
  return (
    <View style={[styles.eventRow, !isLast && styles.eventRowDivider]}>
      <View style={styles.eventContent}>
        <View style={styles.eventTextCol}>
          <ArabicText weight="semibold" color={colors.textPrimary} style={styles.title} numberOfLines={1}>
            {event.title}
          </ArabicText>
          <ArabicText color={colors.textMuted} style={styles.sub} numberOfLines={1}>
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

export default function ActivityScreen() {
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ArabicText weight="semibold" color={colors.textPrimary} style={styles.h1}>
            النشاط
          </ArabicText>
          <ArabicText color={colors.textMuted} style={styles.subtitle}>
            خمسة أحداث · آخر تحديث منذ ٣٢ دقيقة
          </ArabicText>
        </View>

        {/* Timeline sections */}
        {GROUPS.map((group) => (
          <View key={group.label} style={styles.section}>
            <ArabicText color={colors.textMuted} style={styles.eyebrow}>
              {group.label}
            </ArabicText>
            <View style={styles.sectionBody}>
              <View style={styles.rail} />
              {group.events.map((e, i) => (
                <EventRow key={e.id} event={e} isLast={i === group.events.length - 1} />
              ))}
            </View>
          </View>
        ))}
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
