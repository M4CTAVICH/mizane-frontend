import React from "react";
import { View, StyleSheet } from "react-native";
import { colors, radius, spacing } from "../../constants/tokens";
import ArabicText from "../shared/ArabicText";
import CitationCard from "./CitationCard";
import type { Message } from "../../store/assistantStore";

interface ChatBubbleProps {
  message: Message;
}

function TypingDots() {
  return (
    <View style={styles.dotsContainer}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={[styles.dot, { opacity: 0.3 + i * 0.35 }]} />
      ))}
    </View>
  );
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user";

  return (
    <View style={[styles.wrapper, isUser ? styles.wrapperUser : styles.wrapperAssistant]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        {message.isLoading ? (
          <TypingDots />
        ) : (
          <ArabicText
            color={isUser ? colors.inkBlue : colors.textPrimary}
            style={styles.text}
          >
            {message.content}
          </ArabicText>
        )}
      </View>
      {message.citations?.map((citation, idx) => (
        <CitationCard key={idx} citation={citation} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: spacing.xs,
    maxWidth: "85%",
    gap: spacing.xs,
  },
  wrapperUser: { alignSelf: "flex-end", alignItems: "flex-end" },
  wrapperAssistant: { alignSelf: "flex-start", alignItems: "flex-start" },
  bubble: {
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  bubbleUser: {
    backgroundColor: colors.justiceGold,
    borderBottomRightRadius: radius.sm,
  },
  bubbleAssistant: {
    backgroundColor: colors.surface1,
    borderBottomLeftRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.ink200,
  },
  text: {
    fontSize: 15,
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.justiceGold,
  },
});
