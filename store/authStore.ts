import { create } from "zustand";
import { authApi, tokens, usersApi } from "../lib/api";
import { toApiLanguage, toAppLanguage, type AppLang } from "../lib/mappers";
import type { UserProfile } from "../types/api";

interface User {
  id: string;
  phone: string;
  name?: string;
  nin?: string;
  address?: string;
  language: AppLang;
}

interface AuthState {
  user: User | null;
  token: string | null;
  language: AppLang;
  isAuthenticated: boolean;

  setLanguage: (lang: AppLang) => void;
  logout: () => Promise<void>;
  // Restore a persisted session on launch: load the token, fetch the profile.
  // Returns true when an authenticated session is ready.
  bootstrap: () => Promise<boolean>;

  // Real backend auth
  requestOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, code: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  syncLanguage: (lang: AppLang) => Promise<void>;
}

// Maps a backend profile to the local store shape (the UI uses lowercase langs).
function toStoreUser(p: UserProfile): User {
  return {
    id: p.id,
    phone: p.phone,
    name: p.displayName ?? undefined,
    nin: p.nin ?? undefined,
    language: toAppLanguage(p.language),
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  language: "dar",
  isAuthenticated: false,

  setLanguage: (language) => set({ language }),

  logout: async () => {
    await tokens.clear();
    set({ user: null, token: null, isAuthenticated: false });
  },

  bootstrap: async () => {
    const token = await tokens.get();
    if (!token) {
      set({ isAuthenticated: false });
      return false;
    }
    set({ token });
    try {
      const profile = await usersApi.me();
      const user = toStoreUser(profile);
      set({ user, isAuthenticated: true, language: user.language });
      return true;
    } catch {
      // Token expired/invalid — drop it and route to onboarding.
      await tokens.clear();
      set({ user: null, token: null, isAuthenticated: false });
      return false;
    }
  },

  requestOtp: async (phone) => {
    // 200 on success; throws (with a generic message) otherwise.
    await authApi.requestOtp(phone);
  },

  verifyOtp: async (phone, code) => {
    const res = await authApi.verifyOtp(phone, code);
    await tokens.save(res.accessToken);
    const user = toStoreUser(res.user);
    set({
      user,
      token: res.accessToken,
      isAuthenticated: true,
      language: user.language,
    });
  },

  refreshProfile: async () => {
    const profile = await usersApi.me();
    const user = toStoreUser(profile);
    set({ user, language: user.language });
  },

  // Persist the chosen language to the profile (best-effort; ignores failure
  // when unauthenticated so the language picker still works pre-login).
  syncLanguage: async (lang) => {
    set({ language: lang });
    const { isAuthenticated } = get();
    if (!isAuthenticated) return;
    try {
      const profile = await usersApi.update({ language: toApiLanguage(lang) });
      set({ user: toStoreUser(profile) });
    } catch {
      // non-fatal
    }
  },
}));
