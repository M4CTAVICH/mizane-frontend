import { create } from "zustand";

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
  addMessage: (msg: Message) => void;
  updateLastMessage: (updates: Partial<Message>) => void;
  setTyping: (typing: boolean) => void;
  setConversationId: (id: string) => void;
  clearMessages: () => void;
}

export const useAssistantStore = create<AssistantState>((set) => ({
  messages: [],
  conversationId: null,
  isTyping: false,

  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),

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

  setTyping: (isTyping) => set({ isTyping }),
  setConversationId: (conversationId) => set({ conversationId }),
  clearMessages: () => set({ messages: [], conversationId: null }),
}));
