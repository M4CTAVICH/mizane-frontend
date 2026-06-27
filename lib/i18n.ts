import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { I18nManager } from "react-native";
import { getLocales } from "expo-localization";

import { storage } from "./storage";
import ar from "../i18n/ar.json";
import fr from "../i18n/fr.json";
import dar from "../i18n/dar.json";

export type AppLanguage = "ar" | "fr" | "dar" | "ber";

export const SUPPORTED_LANGUAGES: AppLanguage[] = ["ar", "fr", "dar", "ber"];
export const DEFAULT_LANGUAGE: AppLanguage = "ar";
export const LANGUAGE_STORAGE_KEY = "app_language";

// Languages that render right-to-left. Tamazight (ber) has no bundle yet and
// falls back to Arabic, which is RTL.
const RTL_LANGUAGES: AppLanguage[] = ["ar", "dar", "ber"];

export function isRTL(lang: AppLanguage): boolean {
  return RTL_LANGUAGES.includes(lang);
}

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    fr: { translation: fr },
    dar: { translation: dar },
    // Tamazight is selectable but not yet translated — fall back to Arabic.
    ber: { translation: ar },
  },
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  // Our keys are flat and contain dots ("vault.status.valid"), so disable the
  // default "." key separator and ":" namespace separator — otherwise i18next
  // treats them as nested lookups and returns the raw key.
  keySeparator: false,
  nsSeparator: false,
  // Hermes lacks full Intl.PluralRules; v3 plural handling keeps {{count}}
  // interpolation working without it.
  compatibilityJSON: "v3",
  interpolation: { escapeValue: false },
});

/** Best-effort device language, constrained to what we support. */
function detectDeviceLanguage(): AppLanguage {
  try {
    const code = getLocales()[0]?.languageCode?.toLowerCase();
    if (code === "fr") return "fr";
    if (code === "ar") return "ar";
  } catch {
    // expo-localization can throw in some environments — fall through.
  }
  return DEFAULT_LANGUAGE;
}

function normalizeLanguage(value: string | null | undefined): AppLanguage | null {
  if (value && (SUPPORTED_LANGUAGES as string[]).includes(value)) {
    return value as AppLanguage;
  }
  return null;
}

/**
 * Change the active language, persist the choice, and align layout direction.
 * Returns whether the writing direction changed — callers may need to reload
 * the app for a native RTL/LTR flip to fully take effect.
 */
export async function setAppLanguage(lang: AppLanguage): Promise<{ directionChanged: boolean }> {
  const shouldBeRTL = isRTL(lang);
  const directionChanged = I18nManager.isRTL !== shouldBeRTL;

  await i18n.changeLanguage(lang);
  await storage.setItem(LANGUAGE_STORAGE_KEY, lang);

  if (directionChanged) {
    I18nManager.allowRTL(shouldBeRTL);
    I18nManager.forceRTL(shouldBeRTL);
  }

  return { directionChanged };
}

/**
 * Resolve the startup language: persisted choice → device locale → default.
 * Applies it to i18next and I18nManager. Call once during app bootstrap.
 */
export async function initLanguage(): Promise<AppLanguage> {
  const stored = normalizeLanguage(await storage.getItem(LANGUAGE_STORAGE_KEY));
  const lang = stored ?? detectDeviceLanguage();

  const shouldBeRTL = isRTL(lang);
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.allowRTL(shouldBeRTL);
    I18nManager.forceRTL(shouldBeRTL);
  }

  if (i18n.language !== lang) {
    await i18n.changeLanguage(lang);
  }

  return lang;
}

export default i18n;
