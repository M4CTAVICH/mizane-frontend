import React, { useEffect, useRef } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius, spacing, shadow } from "../../constants/tokens";
import { useDirection } from "../../lib/direction";
import ArabicText from "../shared/ArabicText";
import { Ionicons } from "@expo/vector-icons";

const SCREEN_HEIGHT = Dimensions.get("window").height;

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeight?: number;
}

export default function BottomSheet({
  visible,
  onClose,
  title,
  children,
  maxHeight = SCREEN_HEIGHT * 0.85,
}: BottomSheetProps) {
  const dir = useDirection();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />
      <Animated.View
        style={[
          styles.sheet,
          { maxHeight, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Liquid Glass material — functional layer (floating sheet) */}
        <BlurView intensity={50} tint="dark" style={styles.sheetClip} />
        <View style={[styles.sheetClip, { backgroundColor: colors.glassFill }]} />
        <LinearGradient
          colors={[colors.glassHighlight, "rgba(255,255,255,0.03)", "transparent"]}
          locations={[0, 0.18, 0.5]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.sheetClip}
          pointerEvents="none"
        />
        <View style={styles.handle} />
        {title ? (
          <View style={[styles.header, { flexDirection: dir.row }]}>
            <ArabicText size="heading" weight="semibold" color={colors.textPrimary}>
              {title}
            </ArabicText>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        ) : null}
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={styles.content}
        >
          {children}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.65)", // dark backdrop
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: radius.xl, // glass container radius
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
    borderColor: colors.glassBorder, // specular hairline edge
    overflow: "hidden",
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
    ...shadow.glass,
  },
  sheetClip: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.ink300,
    alignSelf: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.ink200,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
