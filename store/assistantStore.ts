import { create } from "zustand";
import { storage } from "../lib/storage";

// Persist the active conversation id so a chat survives an app restart; the
// transcript endpoint (PROMPT.md §3.3) rehydrates the messages from it.
export const CONVERSATION_KEY = "assistant_conversation_id";

export interface Citation {
  article: string;
  law: string;
  text: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  timestamp: Date;
  isLoading?: boolean;
}

interface AssistantState {
  messages: Message[];
  conversationId: string | null;
  isTyping: boolean;
  escalationOffered: boolean;
  addMessage: (msg: Message) => void;
  setMessages: (msgs: Message[]) => void;
  updateLastMessage: (updates: Partial<Message>) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  setTyping: (typing: boolean) => void;
  setConversationId: (id: string) => void;
  setEscalationOffered: (offered: boolean) => void;
  clearMessages: () => void;
}

export const useAssistantStore = create<AssistantState>((set) => ({
  messages: [],
  conversationId: null,
  isTyping: false,
  escalationOffered: false,

  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),

  setMessages: (messages) => set({ messages }),

  updateLastMessage: (updates) =>
    set((state) => {
      const messages = [...state.messages];
      if (messages.length > 0) {
        messages[messages.length - 1] = {
          ...messages[messages.length - 1],
          ...updates,
        };
      }
      return { messages };
    }),

  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    })),

  setTyping: (isTyping) => set({ isTyping }),
  setConversationId: (conversationId) => {
    set({ conversationId });
    // Fire-and-forget: keep the persisted copy in sync with the live id.
    void storage.setItem(CONVERSATION_KEY, conversationId);
  },
  setEscalationOffered: (escalationOffered) => set({ escalationOffered }),
  clearMessages: () => {
    set({ messages: [], conversationId: null, escalationOffered: false });
    void storage.removeItem(CONVERSATION_KEY);
  },
}));
