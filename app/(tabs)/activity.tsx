import React, { useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  Animated,
  StyleSheet,
  Platform,
} from "react-native";
import { useTranslation } from "react-i18next";
import { colors } from "../../constants/tokens";
import ArabicText from "../../components/shared/ArabicText";
import { useDirection } from "../../lib/direction";

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
  titleKey: string;
  subKey: string;
  timeKey: string;
  live?: boolean;
}

interface Group {
  labelKey: string;
  events: ActivityEvent[];
}

const GROUPS: Group[] = [
  {
    labelKey: "activity.group.today",
    events: [
      {
        id: "1",
        kind: "secured",
        titleKey: "activity.event.birth_anchored",
        subKey: "activity.event.birth_anchored_sub",
        timeKey: "activity.time.minutes_32",
        live: true,
      },
      {
        id: "2",
        kind: "reminder",
        titleKey: "activity.event.residence_due",
        subKey: "activity.event.residence_due_sub",
        timeKey: "activity.time.hours_3",
      },
    ],
  },
  {
    labelKey: "activity.group.this_week",
    events: [
      {
        id: "3",
        kind: "document",
        titleKey: "activity.event.family_doc_added",
        subKey: "activity.event.family_doc_added_sub",
        timeKey: "activity.time.yesterday",
      },
      {
        id: "4",
        kind: "message",
        titleKey: "activity.event.labor_complaint",
        subKey: "activity.event.labor_complaint_sub",
        timeKey: "activity.time.two_days",
      },
      {
        id: "5",
        kind: "procedure",
        titleKey: "activity.event.passport_started",
        subKey: "activity.event.passport_started_sub",
        timeKey: "activity.time.three_days",
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
  const { t } = useTranslation();
  const dir = useDirection();
  const color = KIND_COLOR[event.kind];
  return (
    <View style={[styles.eventRow, !isLast && styles.eventRowDivider]}>
      <View style={[styles.eventContent, { flexDirection: dir.row }]}>
        <View style={[styles.eventTextCol, { alignItems: dir.alignStart }]}>
          <ArabicText weight="semibold" color={colors.textPrimary} style={[styles.title, { textAlign: dir.textAlign }]} numberOfLines={1}>
            {t(event.titleKey)}
          </ArabicText>
          <ArabicText color={colors.textMuted} style={[styles.sub, { textAlign: dir.textAlign }]} numberOfLines={1}>
            {t(event.subKey)}
          </ArabicText>
        </View>
        <ArabicText color={colors.textMuted} style={styles.time}>
          {t(event.timeKey)}
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
  const { t } = useTranslation();
  const dir = useDirection();
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
            {t("activity.summary")}
          </ArabicText>
        </View>

        {/* Timeline sections */}
        {GROUPS.map((group) => (
          <View key={group.labelKey} style={styles.section}>
            <ArabicText color={colors.textMuted} style={[styles.eyebrow, { textAlign: dir.textAlign }]}>
              {t(group.labelKey)}
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
