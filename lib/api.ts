import axios from "axios";
import { storage } from "./storage";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config) => {
  const token = await storage.getItem("jwt_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await storage.removeItem("jwt_token");
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  sendOtp: (phone: string) => api.post("/auth/send-otp", { phone }),
  verifyOtp: (phone: string, otp: string) =>
    api.post("/auth/verify-otp", { phone, otp }),
};

// Assistant
export const assistantApi = {
  chat: (message: string, language: string, conversationId?: string) =>
    api.post("/assistant/chat", { message, language, conversationId }),
};

// Vault
export const vaultApi = {
  list: () => api.get("/vault"),
  upload: (formData: FormData) =>
    api.post("/vault/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  get: (id: string) => api.get(`/vault/${id}`),
  delete: (id: string) => api.delete(`/vault/${id}`),
  translate: (id: string) => api.get(`/vault/${id}/translate`),
};

// Scan
export const scanApi = {
  analyze: (formData: FormData) =>
    api.post("/scan/analyze", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// Letters
export const lettersApi = {
  templates: () => api.get("/letters/templates"),
  generate: (templateId: string, userData: object, situationData: object) =>
    api.post("/letters/generate", { templateId, userData, situationData }),
  pdf: (id: string) =>
    api.post(`/letters/${id}/pdf`, {}, { responseType: "blob" }),
};

// Procedures
export const proceduresApi = {
  list: () => api.get("/procedures"),
  get: (id: string) => api.get(`/procedures/${id}`),
  start: (id: string) => api.post(`/procedures/${id}/start`),
  updateProgress: (id: string, step: number) =>
    api.put(`/procedures/${id}/progress`, { step }),
  calculateDeadline: (id: string, eventDate: string) =>
    api.post(`/procedures/${id}/deadline`, { eventDate }),
};

// Proof
export const proofApi = {
  anchor: (hash: string, documentId?: string, letterId?: string) =>
    api.post("/proof/anchor", { hash, documentId, letterId }),
  verify: (anchorRef: string) => api.get(`/proof/verify/${anchorRef}`),
};
