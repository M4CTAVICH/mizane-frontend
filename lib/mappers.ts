// ─────────────────────────────────────────────────────────────────────────
// Mappers — translate between backend wire values (UPPER_SNAKE enums) and the
// frontend's established store shapes (lowercase keys used by the UI + tokens).
//
// The UI was built before the API contract; rather than churn every screen, we
// adapt at the boundary here.
// ─────────────────────────────────────────────────────────────────────────
import { DocumentType as DOC_TOKENS, type DocumentTypeKey } from "@/constants/tokens";
import type {
  AssistantMessage,
  Citation as ApiCitation,
  DocumentStatus,
  DocumentType,
  Language,
  VaultDocumentDto,
} from "@/types/api";
import type {
  Citation as StoreCitation,
  Message as StoreMessage,
} from "@/store/assistantStore";
import type { VaultDocument } from "@/store/vaultStore";

// ── Language ─────────────────────────────────────────────────────────────
export type AppLang = "ar" | "fr" | "dar" | "ber";

const APP_TO_API_LANG: Record<AppLang, Language> = {
  dar: "AR_DZ",
  ar: "AR",
  fr: "FR",
  ber: "BER",
};

const API_TO_APP_LANG: Record<Language, AppLang> = {
  AR_DZ: "dar",
  AR: "ar",
  FR: "fr",
  BER: "ber",
};

export const toApiLanguage = (lang: AppLang): Language => APP_TO_API_LANG[lang] ?? "AR_DZ";
export const toAppLanguage = (lang: Language | null | undefined): AppLang =>
  (lang && API_TO_APP_LANG[lang]) || "dar";

// ── Document type ────────────────────────────────────────────────────────
const API_TO_APP_DOCTYPE: Record<DocumentType, DocumentTypeKey> = {
  ACTE_NAISSANCE_12S: "acte_naissance_12s",
  FICHE_FAMILIALE: "fiche_familiale",
  CERTIFICAT_RESIDENCE: "certificat_residence",
  CERTIFICAT_NATIONALITE: "certificat_nationalite",
  CNI: "carte_nationale",
  PASSEPORT: "passport",
  CONTRAT: "contrat_travail",
  MISE_EN_DEMEURE: "other",
  OTHER: "other",
};

const APP_TO_API_DOCTYPE: Record<DocumentTypeKey, DocumentType> = {
  acte_naissance_12s: "ACTE_NAISSANCE_12S",
  fiche_familiale: "FICHE_FAMILIALE",
  certificat_residence: "CERTIFICAT_RESIDENCE",
  certificat_nationalite: "CERTIFICAT_NATIONALITE",
  carte_nationale: "CNI",
  passport: "PASSEPORT",
  contrat_travail: "CONTRAT",
  contrat_bail: "CONTRAT",
  other: "OTHER",
};

export const toAppDocType = (t: DocumentType): DocumentTypeKey =>
  API_TO_APP_DOCTYPE[t] ?? "other";
export const toApiDocType = (t: DocumentTypeKey): DocumentType =>
  APP_TO_API_DOCTYPE[t] ?? "OTHER";

// ── Document status ──────────────────────────────────────────────────────
const API_TO_APP_STATUS: Record<DocumentStatus, VaultDocument["status"]> = {
  VALID: "valid",
  EXPIRING_SOON: "expiring",
  EXPIRED: "expired",
};

export const toAppDocStatus = (s: DocumentStatus): VaultDocument["status"] =>
  API_TO_APP_STATUS[s] ?? "unverified";

// ── Vault document ───────────────────────────────────────────────────────
export function toStoreDocument(d: VaultDocumentDto): VaultDocument {
  const type = toAppDocType(d.type);
  return {
    id: d.id,
    type,
    name: DOC_TOKENS[type]?.label ?? "وثيقة",
    status: toAppDocStatus(d.status),
    issuedAt: d.issuedAt ?? undefined,
    expiresAt: d.expiresAt ?? undefined,
    hash: d.sha256 ?? undefined,
    createdAt: d.createdAt,
  };
}

// ── Letter templates ─────────────────────────────────────────────────────
// The UI offers more categories than the backend has playbooks for; unmatched
// ones fall back to the generic formal-notice template.
const APP_TO_API_TEMPLATE: Record<string, string> = {
  labor_complaint: "PLAINTE_TRAVAIL",
  eviction_response: "REPONSE_EXPULSION",
  inheritance_req: "MISE_EN_DEMEURE",
  consumer_complaint: "MISE_EN_DEMEURE",
};

export const toApiTemplateKey = (id: string): string =>
  APP_TO_API_TEMPLATE[id] ?? "MISE_EN_DEMEURE";

// ── Citations ────────────────────────────────────────────────────────────
// The backend citation carries no inline text (it references a chunk by id),
// so the UI shows the article reference + source law.
export function toStoreCitations(citations: ApiCitation[] = []): StoreCitation[] {
  return citations.map((c) => ({
    article: c.articleRef ?? "",
    law: c.source ?? "",
    text: "",
  }));
}

// ── Transcript message → store message ───────────────────────────────────
// Used to rehydrate a chat from GET /assistant/conversations/:id (PROMPT.md
// §3.3). Backend roles are USER | ASSISTANT | SYSTEM; the UI only renders two
// sides, so anything that isn't a USER turn lands on the assistant side.
export function toStoreMessage(m: AssistantMessage): StoreMessage {
  return {
    id: m.id,
    role: m.role === "USER" ? "user" : "assistant",
    content: m.content ?? "",
    citations: toStoreCitations(m.citations),
    timestamp: new Date(m.createdAt),
  };
}
