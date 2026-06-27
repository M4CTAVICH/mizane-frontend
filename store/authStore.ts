import { create } from "zustand";
import { storage } from "../lib/storage";
import { setAppLanguage, initLanguage, type AppLanguage } from "../lib/i18n";

interface User {
  id: string;
  phone: string;
  name?: string;
  nin?: string;
  address?: string;
  language: AppLanguage;
}

interface AuthState {
  user: User | null;
  token: string | null;
  language: AppLanguage;
  isAuthenticated: boolean;
  setUser: (user: User, token: string) => Promise<void>;
  setLanguage: (lang: AppLanguage) => Promise<void>;
  loadLanguage: () => Promise<void>;
  logout: () => Promise<void>;
  loadToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  language: "ar",
  isAuthenticated: false,

  setUser: async (user, token) => {
    await storage.setItem("jwt_token", token);
    set({ user, token, isAuthenticated: true });
  },

  setLanguage: async (language) => {
    set({ language });
    // Keep i18next + layout direction + persisted preference in sync.
    await setAppLanguage(language);
  },

  loadLanguage: async () => {
    // Resolve persisted choice → device locale → default, apply to i18next,
    // and reflect it in the store. Call once at app startup.
    const language = await initLanguage();
    set({ language });
  },

  logout: async () => {
    await storage.removeItem("jwt_token");
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadToken: async () => {
    const token = await storage.getItem("jwt_token");
    if (token) {
      set({ token, isAuthenticated: true });
    }
  },
}));

// Demo user for hackathon
export const DEMO_USER: User = {
  id: "demo-001",
  phone: "+213555000001",
  name: "أمل حميدي",
  language: "dar",
  nin: "123456789012345678",
  address: "حي 20 أوت، وهران",
};
