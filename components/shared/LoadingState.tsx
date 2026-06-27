import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { colors } from "../../constants/tokens";
import ArabicText from "./ArabicText";

interface LoadingStateProps {
  message?: string;
  size?: "small" | "large";
  fullScreen?: boolean;
}

export default function LoadingState({
  message,
  size = "large",
  fullScreen = false,
}: LoadingStateProps) {
  const { t } = useTranslation();
  const text = message ?? t("common.loading");
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size={size} color={colors.gold} />
      {text ? (
        <ArabicText size="caption" color={colors.textMuted} style={styles.text}>
          {text}
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
