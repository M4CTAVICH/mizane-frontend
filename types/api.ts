// ─────────────────────────────────────────────────────────────────────────
// API contracts — mirror the Mizan NestJS backend DTOs exactly.
//
// Every successful response is wrapped server-side in { data, meta }; the API
// client in lib/api.ts unwraps `data` before it reaches these types, so the
// shapes here describe the UNWRAPPED payloads.
//
// Source of truth: mizan-backend/src/modules/**/dto/*.ts
// ─────────────────────────────────────────────────────────────────────────

// ── Enums (backend wire values) ──────────────────────────────────────────
export type Language = "AR_DZ" | "AR" | "FR" | "BER";

export type DocumentType =
  | "ACTE_NAISSANCE_12S"
  | "FICHE_FAMILIALE"
  | "CERTIFICAT_RESIDENCE"
  | "CERTIFICAT_NATIONALITE"
  | "CNI"
  | "PASSEPORT"
  | "CONTRAT"
  | "MISE_EN_DEMEURE"
  | "OTHER";

export type DocumentStatus = "VALID" | "EXPIRING_SOON" | "EXPIRED";

export type MessageRole = "USER" | "ASSISTANT" | "SYSTEM";
export type ContentType = "TEXT" | "VOICE";
export type ProcedureKey =
  | "TENANT_DISPUTE"
  | "LABOR_COMPLAINT"
  | "MARRIAGE_FILE"
  | "INHERITANCE"
  | "PASSPORT_RENEWAL"
  | "DIVORCE"
  | "LOST_DRIVER_LICENSE";

// ── Auth / Users ─────────────────────────────────────────────────────────
export interface UserProfile {
  id: string;
  phone: string;
  phoneVerified: boolean;
  language: Language;
  nin: string | null;
  displayName: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface AuthToken {
  accessToken: string;
  tokenType: string;
  expiresIn: string;
  user: UserProfile;
}

export interface RequestOtpResponse {
  message: string;
}

// ── Assistant ────────────────────────────────────────────────────────────
export interface Citation {
  articleRef: string | null;
  source: string | null;
  chunkId: string;
}

export interface AssistantMessage {
  id: string;
  role: MessageRole;
  contentType: ContentType;
  content: string | null;
  citations: Citation[];
  createdAt: string;
}

export interface Conversation {
  id: string;
  channel: string;
  language: Language;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface AssistantReply {
  message: AssistantMessage;
  confidence: number;
  grounded: boolean;
  escalationOffered: boolean;
}

export interface Transcript {
  conversation: Conversation;
  messages: AssistantMessage[];
}

// ── Vault / Documents ────────────────────────────────────────────────────
export interface VaultDocumentDto {
  id: string;
  type: DocumentType;
  mimeType: string | null;
  sizeBytes: number | null;
  issuedAt: string | null;
  expiresAt: string | null;
  status: DocumentStatus;
  sha256: string | null;
  createdAt: string;
}

export interface VaultDocumentDetailDto extends VaultDocumentDto {
  downloadUrl: string;
}

// ── Scan ─────────────────────────────────────────────────────────────────
export interface DnaResult {
  authentic: boolean;
  confidence: number;
  anomalies: string[];
}

export interface ClauseFlag {
  clause: string;
  issue: string;
  articleRef: string | null;
  source: string | null;
  severity: "LOW" | "MEDIUM" | "HIGH";
}

export interface ScanResult {
  id: string;
  documentId: string | null;
  language: Language | null;
  dna: DnaResult | null;
  flags: ClauseFlag[];
  summary: string | null;
  ocrText: string | null;
  createdAt: string;
}

// ── Letters ──────────────────────────────────────────────────────────────
export interface LetterTemplate {
  key: string;
  title: { ar: string; fr: string };
  description: { ar: string; fr: string };
}

export interface LetterCitation {
  articleRef: string | null;
  source: string | null;
  [k: string]: unknown;
}

export interface GeneratedLetter {
  id: string;
  templateKey: string | null;
  language: Language | null;
  content: string;
  sha256: string | null;
  citations: LetterCitation[];
  createdAt: string;
}

export interface LetterPdf {
  id: string;
  downloadUrl: string;
}

// ── Procedures ───────────────────────────────────────────────────────────
export interface ProcedureStep {
  title: { ar: string; fr: string };
  description: { ar: string; fr: string };
  requiresDocs: boolean;
}

export interface ProcedureDto {
  id: string;
  key: ProcedureKey;
  title: { ar: string; fr: string } | null;
  jurisdiction: string | null;
  steps: ProcedureStep[] | null;
  requiredDocTypes: DocumentType[] | null;
}

export interface Readiness {
  required: DocumentType[];
  present: DocumentType[];
  missing: DocumentType[];
  ready: boolean;
}

export interface ProcedureInstance {
  id: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | string;
  procedure: ProcedureDto;
  readiness: Readiness;
  startedAt: string;
}

export interface DeadlineResult {
  noticeType: string;
  jurisdiction: string;
  noticeDate: string;
  dueDate: string;
  days: number;
  mode: "CALENDAR" | "BUSINESS" | string;
  rolledForward: boolean;
  label: { ar: string; fr: string };
  source: string;
  sample: boolean;
  caveat?: string;
}

// ── Proof ────────────────────────────────────────────────────────────────
export type AnchorStatus = "PENDING" | "ANCHORED" | "FAILED" | string;

export interface AnchorResponse {
  id: string;
  sha256: string;
  status: AnchorStatus;
  method: string | null;
  createdAt: string;
}

export interface VerifyResponse {
  found: boolean;
  sha256: string;
  status?: AnchorStatus;
  method?: string;
  anchoredAt?: string | null;
  matchesDigest?: boolean;
  proofInfo?: string;
  proof?: string | null;
}

// ── Deadlines (reminders) ────────────────────────────────────────────────
export interface DeadlineDto {
  id: string;
  label: string | null;
  dueDate: string;
  reminderState: string;
  procedureInstanceId: string | null;
  documentId: string | null;
  createdAt: string;
}

export interface CreateDeadlineBody {
  label: string;
  dueDate: string;
  procedureInstanceId?: string;
  documentId?: string;
}

// ── Collective (anonymized insights) ─────────────────────────────────────
export interface CountBucket {
  key: string | null;
  count: number;
}

export interface ClusterBucket {
  region: string | null;
  situationType: string | null;
  count: number;
}

export interface CollectiveInsights {
  total: number;
  byRegion: CountBucket[];
  bySituation: CountBucket[];
  byOutcome: CountBucket[];
  clusters: ClusterBucket[];
}

// ── Legal knowledge (RAG retrieval probe) ────────────────────────────────
export interface RetrievedChunk {
  articleRef: string | null;
  source: string | null;
  text?: string;
  similarity?: number;
  [k: string]: unknown;
}

// ── Escalation ───────────────────────────────────────────────────────────
export interface EscalationEntry {
  name: string;
  type: "LEGAL_AID" | "LAWYER_DIRECTORY" | "NGO" | "HOTLINE" | string;
  region: string;
  languages: Language[];
  phone: string | null;
  url: string | null;
  note?: string;
}
