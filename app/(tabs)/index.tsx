import React, { useState, useRef, useCallback } from "react";
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, typography } from "../../constants/tokens";
import { useAssistantStore } from "../../store/assistantStore";
import { useAuthStore } from "../../store/authStore";
import { assistantApi } from "../../lib/api";
import ArabicText from "../../components/shared/ArabicText";
import ChatBubble from "../../components/assistant/ChatBubble";
import QuickActions from "../../components/assistant/QuickActions";
import type { Message } from "../../store/assistantStore";

function generateId() {
  return Math.random().toString(36).slice(2);
}

export default function AssistantScreen() {
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
        const res = await assistantApi.chat(trimmed, language, conversationId ?? undefined);
        const { reply, citations, conversationId: newConvId } = res.data;
        if (newConvId) setConversationId(newConvId);
        updateLastMessage({ content: reply, citations, isLoading: false });
      } catch {
        // Demo fallback response
        const demoResponse = getDemoResponse(trimmed);
        updateLastMessage({
          content: demoResponse.content,
          citations: demoResponse.citations,
          isLoading: false,
        });
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="notifications-outline" size={22} color={colors.goldLight} />
          </TouchableOpacity>
          <ArabicText
            size="heading"
            weight="semibold"
            color={colors.justiceGold}
            style={styles.headerTitle}
          >
            ميزان
          </ArabicText>
        </View>

        {/* Chat list */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={[
            styles.chatContent,
            messages.length === 0 && styles.chatEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <QuickActions onActionPress={sendMessage} />
          }
          onContentSizeChange={() =>
            messages.length > 0 &&
            flatListRef.current?.scrollToEnd({ animated: false })
          }
        />

        {/* Input row */}
        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.micBtn} activeOpacity={0.7}>
            <Ionicons name="mic-outline" size={22} color={colors.textMuted} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="اكتب سؤالك..."
            placeholderTextColor={colors.textMuted}
            multiline
            returnKeyType="send"
            onSubmitEditing={() => sendMessage(input)}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim()}
            activeOpacity={0.8}
          >
            <Ionicons
              name="arrow-up"
              size={20}
              color={input.trim() ? colors.inkBlue : colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Demo fallback responses
function getDemoResponse(query: string): { content: string; citations: any[] } {
  const lower = query.toLowerCase();
  if (lower.includes("إخلاء") || lower.includes("خلاء") || lower.includes("إيجار") || lower.includes("بيت")) {
    return {
      content:
        "حسب القانون الجزائري، المؤجر لا يمكنه إخلاءك من السكن قبل انتهاء عقد الإيجار إلا في حالات محددة. عندك الحق في الرد على إشعار الإخلاء خلال 15 يوم وطلب تأجيل التنفيذ. يمكنني مساعدتك في كتابة رد رسمي.",
      citations: [
        {
          article: "المادة 507",
          law: "القانون رقم 90-25",
          text: "لا يجوز للمؤجر إخلاء المستأجر قبل انتهاء العقد إلا لأسباب محددة ومنصوص عليها في القانون.",
        },
      ],
    };
  }
  if (lower.includes("عمل") || lower.includes("فصل") || lower.includes("راتب")) {
    return {
      content:
        "حسب قانون العمل الجزائري رقم 90-11، لا يجوز فصلك من العمل دون إشعار مسبق مدته 30 يومًا على الأقل. إذا تم فصلك بشكل تعسفي، يحق لك المطالبة بتعويض أمام مفتشية العمل.",
      citations: [
        {
          article: "المادة 73",
          law: "القانون رقم 90-11",
          text: "لا يجوز فصل العامل دون إخطار مسبق مدته 30 يومًا على الأقل.",
        },
      ],
    };
  }
  return {
    content:
      "أنا ميزان، مساعدك القانوني في الجزائر. يمكنني مساعدتك في فهم حقوقك، تحليل الوثائق القانونية، وإنشاء رسائل رسمية. اسألني عن أي موضوع قانوني!",
    citations: [],
  };
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface0 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.inkBlue,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: { fontSize: 22 },
  chatContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  chatEmpty: { flex: 1 },
  inputRow: {
    flexDirection: "row-reverse",
    alignItems: "flex-end",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface1,
    borderTopWidth: 1,
    borderTopColor: colors.ink200,
    gap: spacing.sm,
  },
  micBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: colors.surface2,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    fontFamily: typography.fontArabic,
    color: colors.textPrimary,
    textAlignVertical: "center",
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.justiceGold,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    backgroundColor: colors.ink200,
  },
});
