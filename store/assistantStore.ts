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

// Demo conversation
export const DEMO_MESSAGES: Message[] = [
  {
    id: "demo-1",
    role: "user",
    content: "وصلني ورق إخلاء، شنو نعمل؟",
    timestamp: new Date(Date.now() - 60000 * 5),
  },
  {
    id: "demo-2",
    role: "assistant",
    content:
      "وصلتك ورقة إخلاء؟ خاصك تعرف حقوقك أولاً.\n\nحسب القانون الجزائري رقم 90-25 المتعلق بالإيجار، المؤجر لا يمكنه إخلاءك إلا في حالات محددة جداً، ومن بينها:\n\n• عدم دفع الإيجار بعد إنذار رسمي\n• انتهاء العقد وعدم التجديد\n• الاستخدام مخالف لشروط العقد\n\nعندك الحق في الرد على هذا الإشعار خلال 15 يومًا. يمكنني مساعدتك في كتابة رد رسمي.",
    citations: [
      {
        article: "المادة 507",
        law: "القانون رقم 90-25",
        text: "لا يجوز للمؤجر إخلاء المستأجر قبل انتهاء العقد إلا لأسباب محددة...",
      },
    ],
    timestamp: new Date(Date.now() - 60000 * 4),
  },
];

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
