// ─────────────────────────────────────────────────────────────────────────
// API client — single axios instance + typed domain modules.
//
// The backend wraps every success in { data, meta }; `unwrap` strips the
// envelope so callers receive the bare DTO. Errors are NOT wrapped — they are
// { statusCode, error, message } and surface as the axios error (read
// err.response?.data?.message).
// ─────────────────────────────────────────────────────────────────────────
import axios, { type AxiosResponse } from "axios";
import { Platform } from "react-native";
import { storage } from "./storage";
import type {
  AnchorResponse,
  AssistantReply,
  AuthToken,
  CollectiveInsights,
  Conversation,
  CreateDeadlineBody,
  DeadlineDto,
  DeadlineResult,
  EscalationEntry,
  GeneratedLetter,
  Language,
  LetterPdf,
  LetterTemplate,
  ProcedureDto,
  ProcedureInstance,
  ProcedureKey,
  RequestOtpResponse,
  RetrievedChunk,
  ScanResult,
  Transcript,
  UserProfile,
  VaultDocumentDetailDto,
  VaultDocumentDto,
  VerifyResponse,
} from "@/types/api";

// Android emulator reaches the host machine via 10.0.2.2, not localhost.
const DEV_HOST = Platform.OS === "android" ? "10.0.2.2" : "localhost";
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? `http://${DEV_HOST}:3000`;

export const TOKEN_KEY = "jwt_token";

export const http = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use(async (config) => {
  const token = await storage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await storage.removeItem(TOKEN_KEY);
    }
    return Promise.reject(error);
  },
);

/** Strip the { data, meta } envelope. Tolerates non-enveloped bodies too. */
async function unwrap<T>(p: Promise<AxiosResponse<{ data: T } | T>>): Promise<T> {
  const res = await p;
  const body = res.data as { data?: T };
  return (body && typeof body === "object" && "data" in body
    ? (body.data as T)
    : (res.data as T));
}

const MULTIPART = { headers: { "Content-Type": "multipart/form-data" }, timeout: 60000 };

// ── Token helpers ────────────────────────────────────────────────────────
export const tokens = {
  save: (token: string) => storage.setItem(TOKEN_KEY, token),
  clear: () => storage.removeItem(TOKEN_KEY),
  get: () => storage.getItem(TOKEN_KEY),
};

// ── Auth ─────────────────────────────────────────────────────────────────
export const authApi = {
  requestOtp: (phone: string) =>
    unwrap<RequestOtpResponse>(http.post("/auth/request-otp", { phone })),
  verifyOtp: (phone: string, code: string) =>
    unwrap<AuthToken>(http.post("/auth/verify-otp", { phone, code })),
};

// ── Users ────────────────────────────────────────────────────────────────
export const usersApi = {
  me: () => unwrap<UserProfile>(http.get("/users/me")),
  update: (body: { language?: Language; nin?: string; displayName?: string }) =>
    unwrap<UserProfile>(http.patch("/users/me", body)),
};

// ── Assistant ────────────────────────────────────────────────────────────
export const assistantApi = {
  startConversation: (language?: Language) =>
    unwrap<Conversation>(
      http.post("/assistant/conversations", language ? { language } : {}),
    ),
  sendMessage: (
    conversationId: string,
    content: string,
    contentType: "TEXT" | "VOICE" = "TEXT",
  ) =>
    unwrap<AssistantReply>(
      http.post(`/assistant/conversations/${conversationId}/messages`, {
        content,
        contentType,
      }),
    ),
  transcript: (conversationId: string) =>
    unwrap<Transcript>(http.get(`/assistant/conversations/${conversationId}`)),
};

// ── Vault / Documents ────────────────────────────────────────────────────
export const documentsApi = {
  list: () => unwrap<VaultDocumentDto[]>(http.get("/documents")),
  get: (id: string) =>
    unwrap<VaultDocumentDetailDto>(http.get(`/documents/${id}`)),
  upload: (formData: FormData) =>
    unwrap<VaultDocumentDto>(http.post("/documents", formData, MULTIPART)),
  delete: (id: string) => unwrap<void>(http.delete(`/documents/${id}`)),
};

// ── Scan ─────────────────────────────────────────────────────────────────
export const scanApi = {
  // Provide a multipart `file` OR scan an existing vault `documentId`.
  scanFile: (formData: FormData) =>
    unwrap<ScanResult>(http.post("/scan", formData, MULTIPART)),
  scanDocument: (documentId: string) =>
    unwrap<ScanResult>(http.post("/scan", { documentId })),
};

// ── Letters ──────────────────────────────────────────────────────────────
export const lettersApi = {
  templates: () => unwrap<LetterTemplate[]>(http.get("/letters/templates")),
  generate: (body: {
    templateKey: string;
    situation: string;
    recipientName?: string;
    recipientAddress?: string;
  }) => unwrap<GeneratedLetter>(http.post("/letters", body)),
  pdf: (id: string) => unwrap<LetterPdf>(http.post(`/letters/${id}/pdf`)),
};

// ── Procedures ───────────────────────────────────────────────────────────
export const proceduresApi = {
  catalog: () => unwrap<ProcedureDto[]>(http.get("/procedures")),
  myInstances: () =>
    unwrap<ProcedureInstance[]>(http.get("/procedures/instances/me")),
  start: (key: ProcedureKey) =>
    unwrap<ProcedureInstance>(http.post(`/procedures/${key}/start`)),
  deadlineCalc: (body: {
    noticeType: string;
    noticeDate: string;
    jurisdiction?: string;
  }) => unwrap<DeadlineResult>(http.post("/procedures/deadline-calc", body)),
};

// ── Proof ────────────────────────────────────────────────────────────────
export const proofApi = {
  anchor: (sha256: string) =>
    unwrap<AnchorResponse>(http.post("/proof/anchor", { sha256 })),
  verify: (sha256: string) =>
    unwrap<VerifyResponse>(http.get(`/proof/${sha256}/verify`)),
};

// ── Escalation ───────────────────────────────────────────────────────────
export const escalationApi = {
  list: (params?: { region?: string; language?: Language }) =>
    unwrap<EscalationEntry[]>(http.get("/escalation", { params })),
};

// ── Deadlines (reminders) ────────────────────────────────────────────────
export const deadlinesApi = {
  list: () => unwrap<DeadlineDto[]>(http.get("/deadlines")),
  create: (body: CreateDeadlineBody) =>
    unwrap<DeadlineDto>(http.post("/deadlines", body)),
};

// ── Collective (anonymized insights) ─────────────────────────────────────
export const collectiveApi = {
  insights: () => unwrap<CollectiveInsights>(http.get("/collective/insights")),
  contribute: (body: {
    situationType: string;
    actionTaken: string;
    outcome: string;
    region: string;
    consent?: boolean;
  }) => unwrap<{ recorded: true }>(http.post("/collective/contribute", body)),
};

// ── Legal knowledge (RAG retrieval probe) ────────────────────────────────
export const legalApi = {
  search: (q: string, opts?: { topK?: number; language?: Language }) =>
    unwrap<RetrievedChunk[]>(
      http.get("/legal/search", { params: { q, ...opts } }),
    ),
};
