import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { colors } from "../../constants/tokens";
import ArabicText from "./ArabicText";

interface LoadingStateProps {
  message?: string;
  size?: "small" | "large";
  fullScreen?: boolean;
}

export default function LoadingState({
  message = "جارٍ التحميل...",
  size = "large",
  fullScreen = false,
}: LoadingStateProps) {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size={size} color={colors.gold} />
      {message ? (
        <ArabicText size="caption" color={colors.textMuted} style={styles.text}>
          {message}
        </ArabicText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: "transparent", // let the root fluid mesh show through
  },
  text: {
    marginTop: 8,
    textAlign: "center",
  },
});
