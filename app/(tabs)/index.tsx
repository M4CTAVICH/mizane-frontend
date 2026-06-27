import React, { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors, spacing, radius, typography } from "../../constants/tokens";
import { useAssistantStore } from "../../store/assistantStore";
import { useAuthStore } from "../../store/authStore";
import { assistantApi } from "../../lib/api";
import { toApiLanguage, toStoreCitations } from "../../lib/mappers";
import ArabicText from "../../components/shared/ArabicText";
import { LiquidGlassContainer } from "../../components/ui/LiquidGlassContainer";
import ChatBubble from "../../components/assistant/ChatBubble";
import QuickActions from "../../components/assistant/QuickActions";
import { useDirection } from "../../lib/direction";
import type { Message } from "../../store/assistantStore";

function generateId() {
  return Math.random().toString(36).slice(2);
}

export default function AssistantScreen() {
  const { t } = useTranslation();
  const dir = useDirection();
  const { messages, addMessage, updateLastMessage, setTyping, isTyping, conversationId, setConversationId } =
    useAssistantStore();
  const user = useAuthStore((s) => s.user);
  const language = useAuthStore((s) => s.language);
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setInput("");

      // Add user message
      const userMsg: Message = {
        id: generateId(),
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };
      addMessage(userMsg);

      // Add loading placeholder
      const loadingMsg: Message = {
        id: generateId(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isLoading: true,
      };
      addMessage(loadingMsg);
      setTyping(true);

      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

      try {
        // Lazily open a conversation, then send the turn.
        let convId = conversationId;
        if (!convId) {
          const conv = await assistantApi.startConversation(toApiLanguage(language));
          convId = conv.id;
          setConversationId(convId);
        }
        const res = await assistantApi.sendMessage(convId, trimmed);
        updateLastMessage({
          content: res.message.content ?? "",
          citations: toStoreCitations(res.message.citations),
          isLoading: false,
        });
      } catch (e: any) {
        const msg =
          e?.response?.status === 401
            ? "انتهت الجلسة. يرجى تسجيل الدخول من جديد."
            : "عذرًا، تعذّر الاتصال بالخادم. حاول مجددًا.";
        updateLastMessage({ content: msg, citations: [], isLoading: false });
      } finally {
        setTyping(false);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      }
    },
    [language, conversationId]
  );

  const renderItem = useCallback(
    ({ item }: { item: Message }) => <ChatBubble message={item} />,
    []
  );

  const keyExtractor = useCallback((item: Message) => item.id, []);

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {/* ── Floating glass header pill (functional layer) ─────────── */}
        <View style={styles.headerWrap}>
          <LiquidGlassContainer radius={radius.lg} padding={spacing.md}>
            <View style={styles.headerRow}>
              <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="notifications-outline" size={22} color={colors.textMuted} />
              </TouchableOpacity>
              <ArabicText
                size="heading"
                weight="semibold"
                color={colors.textPrimary}
                style={styles.headerTitle}
              >
                ميزان
              </ArabicText>
            </View>
          </LiquidGlassContainer>
        </View>

        {/* ── Chat list (transparent — fluid mesh shows through) ─────── */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          style={styles.list}
          contentContainerStyle={[
            styles.chatContent,
            messages.length === 0 && styles.chatEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<QuickActions onActionPress={sendMessage} />}
          onContentSizeChange={() =>
            messages.length > 0 &&
            flatListRef.current?.scrollToEnd({ animated: false })
          }
        />

        {/* ── Glass composer pill (floats above the glass tab bar) ───── */}
        <View style={styles.composerWrap}>
          <View style={styles.composer}>
            <View style={styles.composerHighlight} pointerEvents="none" />
            <View style={[styles.inputRow, { flexDirection: dir.row }]}>
              <TouchableOpacity style={styles.micBtn} activeOpacity={0.7}>
                <Ionicons name="mic-outline" size={18} color={colors.textMuted} />
              </TouchableOpacity>
              <TextInput
                style={[styles.input, { textAlign: dir.textAlign }]}
                value={input}
                onChangeText={setInput}
                placeholder={t("assistant.placeholder")}
                placeholderTextColor={colors.textMuted}
                multiline
                returnKeyType="send"
                onSubmitEditing={() => sendMessage(input)}
              />
              <TouchableOpacity
                style={styles.sendBtn}
                onPress={() => sendMessage(input)}
                disabled={!input.trim()}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.goldGradTop, colors.goldGradBottom]}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <Ionicons name="arrow-up" size={18} color={colors.inkBlue} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },

  // Floating glass header
  headerWrap: {
    paddingTop: Platform.OS === "ios" ? 56 : 28,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { fontSize: 24, lineHeight: 30 },

  // Chat list
  list: { flex: 1, backgroundColor: "transparent" },
  chatContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: 250, // clear composer + floating tab bar
    gap: spacing.xs,
  },
  chatEmpty: { flexGrow: 1 },

  // Composer
  composerWrap: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: Platform.OS === "ios" ? 140 : 124, // clear the floating dock with breathing room
  },
  // Flat matte composer pill (Figma 1:41).
  composer: {
    backgroundColor: colors.cardFill,
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.cardBorder,
    paddingHorizontal: 13,
    paddingVertical: 10,
    overflow: "hidden",
  },
  composerHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.cardHighlight,
  },
  inputRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  micBtn: {
    width: 24,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    minHeight: 36,
    maxHeight: 120,
    paddingHorizontal: 0,
    paddingVertical: 0,
    fontSize: 15,
    fontFamily: typography.fontArabic,
    color: colors.textPrimary,
    textAlign: "right",
    textAlignVertical: "center",
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: colors.glassFillStrong,
    alignItems: "center",
    justifyContent: "center",
  },
});
