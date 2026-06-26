import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ar from "../i18n/ar.json";
import fr from "../i18n/fr.json";
import dar from "../i18n/dar.json";

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    fr: { translation: fr },
    dar: { translation: dar },
  },
  lng: "ar",
  fallbackLng: "ar",
  interpolation: { escapeValue: false },
});

export default i18n;
