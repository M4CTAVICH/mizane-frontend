// Presentation metadata for backend procedure playbooks, keyed by ProcedureKey.
// The backend catalog supplies the legal content (title, steps, required docs);
// this layer supplies the UI affordances (cover art, icon, category) the API
// doesn't carry, plus the deadline-window `noticeType` where one applies.
import type { ImageSourcePropType } from "react-native";
import type { ProcedureKey } from "../types/api";

const labor: ImageSourcePropType = require("../assets/images/figma/proc-labor.jpg");
const passport: ImageSourcePropType = require("../assets/images/figma/proc-passport.jpg");
const inheritance: ImageSourcePropType = require("../assets/images/figma/proc-inheritance.jpg");
const eviction: ImageSourcePropType = require("../assets/images/figma/proc-eviction.jpg");

export type ProcedureCategory = "housing" | "labor" | "family" | "documents";

export interface ProcedureMeta {
  image: ImageSourcePropType;
  icon: string;
  category: ProcedureCategory;
  categoryLabel: string;
  duration: string;
  // Deadline-window key from the backend calculator, when the procedure has a
  // legal response window. Undefined → no deadline calculator is shown.
  noticeType?: string;
}

export const PROCEDURE_META: Record<ProcedureKey, ProcedureMeta> = {
  TENANT_DISPUTE: {
    image: eviction,
    icon: "home-outline",
    category: "housing",
    categoryLabel: "السكن",
    duration: "١٥–٣٠ يومًا",
    noticeType: "TENANT_EVICTION_RESPONSE",
  },
  LABOR_COMPLAINT: {
    image: labor,
    icon: "briefcase-outline",
    category: "labor",
    categoryLabel: "العمل",
    duration: "٣٠–٩٠ يومًا",
    noticeType: "LABOR_DISMISSAL_CHALLENGE",
  },
  MARRIAGE_FILE: {
    image: inheritance,
    icon: "heart-outline",
    category: "family",
    categoryLabel: "الأسرة",
    duration: "٢–٤ أسابيع",
  },
  INHERITANCE: {
    image: inheritance,
    icon: "people-outline",
    category: "family",
    categoryLabel: "الأسرة",
    duration: "٣–٦ أشهر",
  },
  PASSPORT_RENEWAL: {
    image: passport,
    icon: "airplane-outline",
    category: "documents",
    categoryLabel: "الوثائق",
    duration: "٢–٤ أسابيع",
  },
  DIVORCE: {
    image: inheritance,
    icon: "document-text-outline",
    category: "family",
    categoryLabel: "الأسرة",
    duration: "٣–٦ أشهر",
  },
  LOST_DRIVER_LICENSE: {
    image: passport,
    icon: "car-outline",
    category: "documents",
    categoryLabel: "الوثائق",
    duration: "١–٣ أسابيع",
  },
};

export const PROCEDURE_FILTERS: { id: "all" | ProcedureCategory; label: string }[] = [
  { id: "all", label: "الكل" },
  { id: "housing", label: "السكن" },
  { id: "labor", label: "العمل" },
  { id: "family", label: "الأسرة" },
  { id: "documents", label: "الوثائق" },
];
