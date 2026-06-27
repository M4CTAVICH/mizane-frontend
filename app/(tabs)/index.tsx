import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { colors, spacing, radius, typography } from "../../constants/tokens";
import {
  useAssistantStore,
  CONVERSATION_KEY,
} from "../../store/assistantStore";
import { useAuthStore } from "../../store/authStore";
import { assistantApi, escalationApi } from "../../lib/api";
import { storage } from "../../lib/storage";
import {
  toApiLanguage,
  toStoreCitations,
  toStoreMessage,
} from "../../lib/mappers";
import ArabicText from "../../components/shared/ArabicText";
import { LiquidGlassContainer } from "../../components/ui/LiquidGlassContainer";
import ChatBubble from "../../components/assistant/ChatBubble";
import QuickActions from "../../components/assistant/QuickActions";
import type { Message } from "../../store/assistantStore";

function generateId() {
  return Math.random().toString(36).slice(2);
}

// Read a recording URI into raw base64. Native reads the file directly; web
// fetches the blob: URI and strips the data-URL prefix.
async function uriToBase64(uri: string): Promise<string> {
  if (Platform.OS === "web") {
    const blob = await (await fetch(uri)).blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () =>
        resolve((reader.result as string).split(",")[1] ?? "");
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  return FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
}

export default function AssistantScreen() {
  const {
    messages,
    addMessage,
    setMessages,
    updateLastMessage,
    updateMessage,
    setTyping,
    isTyping,
    conversationId,
    setConversationId,
    escalationOffered,
    setEscalationOffered,
  } = useAssistantStore();
  const user = useAuthStore((s) => s.user);
  const language = useAuthStore((s) => s.language);
  const router = useRouter();
  const [input, setInput] = useState("");
  const [recording, setRecording] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const flatListRef = useRef<FlatList>(null);
  // Holds an in-flight conversation-creation promise so concurrent callers
  // (the on-open effect + a fast first message) share one POST, never two.
  const convPromiseRef = useRef<Promise<string> | null>(null);

  const ensureConversation = useCallback(async () => {
    if (conversationId) return conversationId;
    if (convPromiseRef.current) return convPromiseRef.current;
    const p = (async () => {
      const conv = await assistantApi.startConversation(toApiLanguage(language));
      setConversationId(conv.id);
      return conv.id;
    })();
    convPromiseRef.current = p;
    try {
      return await p;
    } finally {
      convPromiseRef.current = null;
    }
  }, [conversationId, language, setConversationId]);

  // On mount: rehydrate the last conversation from its persisted id via the
  // transcript endpoint (PROMPT.md §3.3) so history survives an app restart.
  // If nothing is stored (or it's gone/404), open a fresh conversation so the
  // id is ready before the first message.
  useEffect(() => {
    // Already active in this session (e.g. a tab remount) — keep state as-is.
    if (conversationId) return;
    let cancelled = false;
    (async () => {
      const stored = await storage.getItem(CONVERSATION_KEY);
      if (stored && !cancelled) {
        try {
          const t = await assistantApi.transcript(stored);
          if (cancelled) return;
          setConversationId(stored);
          setMessages(t.messages.map(toStoreMessage));
          return;
        } catch {
          // 404/expired/not-owned → discard the stale id and start fresh.
          await storage.removeItem(CONVERSATION_KEY);
        }
      }
      if (!cancelled) {
        ensureConversation().catch(() => {
          /* will retry on first send */
        });
      }
    })();
    return () => {
      cancelled = true;
    };
    // Only on mount / when no conversation exists yet.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        // Conversation is opened on screen mount; reuse it (or create on demand).
        const convId = await ensureConversation();
        const res = await assistantApi.sendMessage(convId, trimmed);
        updateLastMessage({
          content: res.message.content ?? "",
          citations: toStoreCitations(res.message.citations),
          isLoading: false,
        });
        setEscalationOffered(res.escalationOffered);
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
    [ensureConversation, addMessage, updateLastMessage, setTyping, setEscalationOffered]
  );

  // ── Escalation CTA → open a real professional contact ──────────────────
  const openEscalation = useCallback(async () => {
    try {
      const list = await escalationApi.list({ language: toApiLanguage(language) });
      const entry = list.find((e) => e.phone) ?? list.find((e) => e.url) ?? list[0];
      if (entry?.phone) {
        await Linking.openURL(`tel:${entry.phone.replace(/\s+/g, "")}`);
      } else if (entry?.url) {
        await Linking.openURL(entry.url);
      } else if (entry) {
        // No dialable contact (sample/national entries) — surface the guidance.
        Alert.alert(entry.name, entry.note ?? `${entry.type} — ${entry.region}`);
      } else {
        Alert.alert("المساعدة القانونية", "لا تتوفر جهة اتصال حاليًا. حاول لاحقًا.");
      }
    } catch {
      Alert.alert("خطأ", "تعذّر جلب جهات المساعدة القانونية.");
    }
  }, [language]);

  // ── Voice: record → transcribe (server-side) → grounded reply ──────────
  const sendVoiceMessage = useCallback(
    async (uri: string) => {
      const userMsgId = generateId();
      addMessage({
        id: userMsgId,
        role: "user",
        content: "🎙️ رسالة صوتية",
        timestamp: new Date(),
      });
      const loadingId = generateId();
      addMessage({
        id: loadingId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isLoading: true,
      });
      setTyping(true);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

      try {
        const base64 = await uriToBase64(uri);
        if (!base64) throw new Error("empty audio");
        const convId = await ensureConversation();
        const res = await assistantApi.sendVoice(convId, base64);
        updateMessage(loadingId, {
          content: res.message.content ?? "",
          citations: toStoreCitations(res.message.citations),
          isLoading: false,
        });
        setEscalationOffered(res.escalationOffered);
        // Replace the placeholder with the actual transcription (free DB read).
        try {
          const t = await assistantApi.transcript(convId);
          const lastUser = [...t.messages]
            .reverse()
            .find((m) => m.role === "USER");
          if (lastUser?.content) updateMessage(userMsgId, { content: lastUser.content });
        } catch {
          /* transcription display is best-effort */
        }
      } catch (e: any) {
        const msg =
          e?.response?.status === 401
            ? "انتهت الجلسة. سجّل الدخول من جديد."
            : e?.response?.data
              ? "تعذّر فهم التسجيل. حاول مرة أخرى وتكلّم بوضوح."
              : "عذرًا، تعذّر معالجة الرسالة الصوتية.";
        updateMessage(loadingId, { content: msg, isLoading: false });
      } finally {
        setTyping(false);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      }
    },
    [ensureConversation, addMessage, updateMessage, setTyping, setEscalationOffered]
  );

  const startRecording = useCallback(async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("الميكروفون", "نحتاج إذن الميكروفون لتسجيل الرسائل الصوتية.");
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = rec;
      setRecording(true);
    } catch {
      Alert.alert("خطأ", "تعذّر بدء التسجيل.");
    }
  }, []);

  const stopRecording = useCallback(async () => {
    const rec = recordingRef.current;
    recordingRef.current = null;
    setRecording(false);
    if (!rec) return;
    try {
      await rec.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = rec.getURI();
      if (uri) await sendVoiceMessage(uri);
    } catch {
      Alert.alert("خطأ", "تعذّر إنهاء التسجيل.");
    }
  }, [sendVoiceMessage]);

  const toggleRecording = useCallback(() => {
    if (recording) stopRecording();
    else startRecording();
  }, [recording, startRecording, stopRecording]);

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
              <TouchableOpacity
                onPress={() => router.push("/profile" as never)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="person-circle-outline" size={24} color={colors.textMuted} />
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

        {/* ── Escalation CTA — shown when the reply offers a professional ── */}
        {escalationOffered && !isTyping && (
          <TouchableOpacity
            style={styles.escalationCta}
            activeOpacity={0.85}
            onPress={openEscalation}
          >
            <Ionicons name="people-outline" size={18} color={colors.inkBlue} />
            <ArabicText
              size="body"
              weight="semibold"
              color={colors.inkBlue}
              style={styles.escalationText}
            >
              تحدّث إلى مختص قانوني
            </ArabicText>
          </TouchableOpacity>
        )}

        {/* ── Glass composer pill (floats above the glass tab bar) ───── */}
        <View style={styles.composerWrap}>
          <View style={styles.composer}>
            <View style={styles.composerHighlight} pointerEvents="none" />
            <View style={styles.inputRow}>
              <TouchableOpacity
                style={styles.micBtn}
                activeOpacity={0.7}
                onPress={toggleRecording}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={recording ? "stop-circle" : "mic-outline"}
                  size={recording ? 22 : 18}
                  color={recording ? colors.danger : colors.textMuted}
                />
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder={
                  recording ? "جارٍ التسجيل... اضغط ◼ للإرسال" : "اكتب سؤالك..."
                }
                placeholderTextColor={recording ? colors.danger : colors.textMuted}
                editable={!recording}
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

  // Escalation CTA — sits just above the composer pill.
  escalationCta: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: Platform.OS === "ios" ? 200 : 184,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.gold,
    borderRadius: 22,
    paddingVertical: 11,
    paddingHorizontal: 16,
  },
  escalationText: { fontSize: 15 },

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
    // Hug a single line so the row can vertically center it against the 36px
    // mic/send buttons; grows up to maxHeight for longer questions.
    minHeight: 24,
    maxHeight: 100,
    paddingHorizontal: 0,
    paddingVertical: 0,
    fontSize: 15,
    lineHeight: 20,
    fontFamily: typography.fontArabic,
    color: colors.textPrimary,
    textAlign: "right",
    textAlignVertical: "center",
    includeFontPadding: false,
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
