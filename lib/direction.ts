import { useTranslation } from "react-i18next";

import { isRTL as isRTLLang, DEFAULT_LANGUAGE, type AppLanguage } from "./i18n";

export interface Direction {
  /** True when the active language reads right-to-left (ar, dar, ber). */
  isRTL: boolean;
  /** Natural reading-order row: content flows start→end for the language. */
  row: "row" | "row-reverse";
  /** Opposite of the natural reading order. */
  rowReverse: "row" | "row-reverse";
  /** Natural text alignment (right for RTL, left for LTR). */
  textAlign: "left" | "right";
  /** writingDirection that matches the active language. */
  writingDirection: "ltr" | "rtl";
  /** Align children to the LEADING edge (right in RTL, left in LTR). */
  alignStart: "flex-start" | "flex-end";
  /** Align children to the TRAILING edge (left in RTL, right in LTR). */
  alignEnd: "flex-start" | "flex-end";
}

/**
 * Reactive layout-direction helper. Re-renders consumers when the language
 * changes (via react-i18next), so screens flip RTL/LTR live without a reload.
 *
 * Replace hardcoded directional style props with these values:
 *   flexDirection: "row-reverse"   -> dir.row        (natural reading order)
 *   textAlign: "right"             -> dir.textAlign
 *   writingDirection: "rtl"        -> dir.writingDirection
 *   alignItems: "flex-end" (lead)  -> dir.alignStart
 */
export function useDirection(): Direction {
  const { i18n } = useTranslation();
  const rtl = isRTLLang((i18n.language as AppLanguage) || DEFAULT_LANGUAGE);
  return {
    isRTL: rtl,
    row: rtl ? "row-reverse" : "row",
    rowReverse: rtl ? "row" : "row-reverse",
    textAlign: rtl ? "right" : "left",
    writingDirection: rtl ? "rtl" : "ltr",
    alignStart: rtl ? "flex-end" : "flex-start",
    alignEnd: rtl ? "flex-start" : "flex-end",
  };
}
