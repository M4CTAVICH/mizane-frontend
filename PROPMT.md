# MIZAN — Frontend ↔ Backend Integration

**Claude Code Local Execution Guide**

> Run this in Claude Code with access to the full monorepo. Backend is NestJS on localhost:3000. Frontend is Expo React Native.

---

## 0. Before Anything — Verify Backend is Alive

```bash
curl http://localhost:3000/health
```

If no health endpoint exists yet:

```bash
curl http://localhost:3000/auth/request-otp \
  -X POST -H "Content-Type: application/json" \
  -d '{"phone": "+213555000001"}'
```

Then check what routes actually exist:

```bash
# From the backend folder
cd /desktop/mizan-backend
cat src/main.ts
ls src/modules/
```

Map what's built vs what the frontend needs — we'll only wire up what's ready, and mock what isn't.

---

## 1. Audit: What's Actually Built

Run these to understand the current state before touching anything:

```bash
# Backend structure
find /desktop/mizan-backend/src/modules -name "*.controller.ts" | sort

# What routes exist
grep -r "@Get\|@Post\|@Put\|@Delete\|@Patch" /desktop/mizam-backend/src --include="*.ts" -l

# Frontend: where API calls currently live
find . -name "*.ts" -o -name "*.tsx" | xargs grep -l "fetch\|axios\|api\." 2>/dev/null | grep -v node_modules

# Check if axios/fetch client already exists in frontend
find . -name "api.ts" -o -name "api.client.ts" -o -name "client.ts" | grep -v node_modules
```

---

## 2. Install Dependencies (Frontend)

```bash
# In the Expo app root
npm install axios @tanstack/react-query zustand @react-native-async-storage/async-storage

# If not already installed
npx expo install expo-secure-store expo-file-system
```

---

## 3. Create the API Client Layer

This is the single file all hooks and services talk through. Create it at:
`src/lib/api.ts` (or wherever the frontend `lib/` folder is)

```ts
// src/lib/api.ts
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";

const BASE_URL = __DEV__
  ? "http://localhost:3000" // iOS simulator
  : // ? 'http://10.0.2.2:3000'    // Android emulator — uncomment if on Android
    "https://your-prod-url.com";

const TOKEN_KEY = "mizan_jwt";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
      headers: { "Content-Type": "application/json" },
    });

    // Request interceptor: attach JWT
    this.client.interceptors.request.use(async (config) => {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor: handle 401 globally
    this.client.interceptors.response.use(
      (res) => res,
      async (error) => {
        if (error.response?.status === 401) {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          // TODO: navigate to auth screen — wire to your nav ref
        }
        return Promise.reject(error);
      },
    );
  }

  async saveToken(token: string) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }

  async clearToken() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.client.get<T>(url, config);
    return res.data;
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const res = await this.client.post<T>(url, data, config);
    return res.data;
  }

  async patch<T>(url: string, data?: unknown): Promise<T> {
    const res = await this.client.patch<T>(url, data);
    return res.data;
  }

  async delete<T>(url: string): Promise<T> {
    const res = await this.client.delete<T>(url);
    return res.data;
  }

  // For file uploads (vault, scan)
  async upload<T>(url: string, formData: FormData): Promise<T> {
    const res = await this.client.post<T>(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000, // longer for file uploads
    });
    return res.data;
  }
}

export const api = new ApiClient();
```

---

## 4. Types — Shared Contracts

Create `src/types/api.types.ts`:

```ts
// src/types/api.types.ts

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

export interface UserProfile {
  id: string;
  phone: string;
  language: Language;
  displayName: string | null;
  nin: string | null;
  address: string | null;
}

export interface Citation {
  articleRef: string;
  source: string;
  text: string;
  chunkId: string;
}

export interface AssistantMessage {
  id: string;
  conversationId: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  citations?: Citation[];
  createdAt: string;
}

export interface AssistantReply {
  reply: string;
  citations: Citation[];
  conversationId: string;
  confident: boolean;
}

export interface VaultDocument {
  id: string;
  type: DocumentType;
  status: DocumentStatus;
  issuedAt: string | null;
  expiresAt: string | null;
  sha256: string;
  anchorId: string | null;
  createdAt: string;
}

export interface VaultDocumentDetail extends VaultDocument {
  downloadUrl: string;
}

export interface DnaCheck {
  id: string;
  label: string;
  passed: boolean;
}

export interface AbusiveClause {
  clause: string;
  reason: string;
  law: string;
}

export interface ScanResult {
  analysisId: string;
  documentType: string;
  ocrText: string;
  summaryDarija: string;
  summaryFr: string;
  dnaResult: {
    authentic: boolean;
    confidence: number;
    anomalies: DnaCheck[];
  };
  flags: AbusiveClause[];
}

export interface LetterTemplate {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export interface GeneratedLetter {
  letterId: string;
  content: string;
  citations: Citation[];
}

export interface Procedure {
  id: string;
  key: string;
  title: { AR: string; FR: string };
  stepsCount: number;
  requiredDocTypes: DocumentType[];
}

export interface UserProcedure {
  id: string;
  procedureKey: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  currentStep: number;
  progress: { step: number; completed: boolean }[];
  startedAt: string;
}

export interface DeadlineResult {
  deadline: string;
  daysLeft: number;
  legalBasis: string;
}

export interface ProofAnchor {
  anchorId: string;
  status: "PENDING" | "ANCHORED" | "FAILED";
  timestamp: string;
}

export interface ProofVerification {
  valid: boolean;
  status: "PENDING" | "ANCHORED" | "FAILED";
  anchored_at: string | null;
  verificationUrl: string;
  method: "OPENTIMESTAMPS" | "POLYGON_TESTNET";
}

export interface EscalationEntry {
  id: string;
  name: string;
  specialty: string;
  region: string;
  phone: string;
  language: string[];
}
```

---

## 5. Zustand Auth Store

Create or update `src/store/authStore.ts`:

```ts
// src/store/authStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/lib/api";
import type { UserProfile, Language } from "@/types/api.types";

interface AuthState {
  user: UserProfile | null;
  conversationId: string | null;
  isAuthenticated: boolean;

  // Actions
  requestOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, code: string) => Promise<void>;
  updateLanguage: (language: Language) => Promise<void>;
  logout: () => Promise<void>;
  setConversationId: (id: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      conversationId: null,
      isAuthenticated: false,

      requestOtp: async (phone) => {
        await api.post("/auth/request-otp", { phone });
        // 200 = success, throws on error
      },

      verifyOtp: async (phone, code) => {
        const res = await api.post<{ token: string; user: UserProfile }>(
          "/auth/verify-otp",
          { phone, code },
        );
        await api.saveToken(res.token);
        set({ user: res.user, isAuthenticated: true });
      },

      updateLanguage: async (language) => {
        const user = await api.patch<UserProfile>("/users/me", { language });
        set({ user });
      },

      logout: async () => {
        await api.clearToken();
        set({ user: null, conversationId: null, isAuthenticated: false });
      },

      setConversationId: (id) => set({ conversationId: id }),
    }),
    {
      name: "mizan-auth",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        conversationId: state.conversationId,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
```

---

## 6. React Query Setup

In your root layout (`app/_layout.tsx`), wrap with QueryClientProvider:

```tsx
// app/_layout.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
```

---

## 7. Hooks — One File Per Domain

### `src/hooks/useAssistant.ts`

```ts
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { AssistantReply, AssistantMessage } from "@/types/api.types";

export function useAssistant() {
  const { conversationId, setConversationId } = useAuthStore();

  // Start or get conversation
  const startConversation = useMutation({
    mutationFn: async () => {
      const res = await api.post<{ conversationId: string }>(
        "/assistant/conversations",
      );
      setConversationId(res.conversationId);
      return res.conversationId;
    },
  });

  // Send a message
  const sendMessage = useMutation({
    mutationFn: async ({
      message,
      contentType = "TEXT",
    }: {
      message: string;
      contentType?: "TEXT" | "VOICE";
    }) => {
      // Create conversation if none exists
      let convId = conversationId;
      if (!convId) {
        convId = await startConversation.mutateAsync();
      }
      return api.post<AssistantReply>(
        `/assistant/conversations/${convId}/messages`,
        { message, contentType },
      );
    },
  });

  // Get full conversation history
  const conversation = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () =>
      conversationId
        ? api.get<{ messages: AssistantMessage[] }>(
            `/assistant/conversations/${conversationId}`,
          )
        : null,
    enabled: !!conversationId,
  });

  return { sendMessage, conversation, startConversation };
}
```

### `src/hooks/useVault.ts`

```ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { VaultDocument, VaultDocumentDetail } from "@/types/api.types";

export function useVault() {
  const qc = useQueryClient();

  const documents = useQuery({
    queryKey: ["vault"],
    queryFn: () => api.get<VaultDocument[]>("/documents"),
  });

  const uploadDocument = useMutation({
    mutationFn: async ({
      file,
      type,
      issuedAt,
      expiresAt,
    }: {
      file: { uri: string; name: string; type: string };
      type: string;
      issuedAt?: string;
      expiresAt?: string;
    }) => {
      const formData = new FormData();
      formData.append("file", file as any);
      formData.append("type", type);
      if (issuedAt) formData.append("issuedAt", issuedAt);
      if (expiresAt) formData.append("expiresAt", expiresAt);
      return api.upload<VaultDocument>("/documents", formData);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vault"] }),
  });

  const deleteDocument = useMutation({
    mutationFn: (id: string) => api.delete(`/documents/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vault"] }),
  });

  const getDocument = (id: string) =>
    useQuery({
      queryKey: ["vault", id],
      queryFn: () => api.get<VaultDocumentDetail>(`/documents/${id}`),
      staleTime: 1000 * 60, // presigned URL ~1 min cache
    });

  return { documents, uploadDocument, deleteDocument, getDocument };
}
```

### `src/hooks/useScan.ts`

```ts
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ScanResult } from "@/types/api.types";

export function useScan() {
  const scanDocument = useMutation({
    mutationFn: async (imageUri: string) => {
      const formData = new FormData();
      const filename = imageUri.split("/").pop() ?? "scan.jpg";
      const ext = filename.split(".").pop() ?? "jpg";
      formData.append("image", {
        uri: imageUri,
        name: filename,
        type: `image/${ext}`,
      } as any);
      return api.upload<ScanResult>("/scan", formData);
    },
  });

  return { scanDocument };
}
```

### `src/hooks/useLetters.ts`

```ts
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { LetterTemplate, GeneratedLetter } from "@/types/api.types";

export function useLetters() {
  const templates = useQuery({
    queryKey: ["letter-templates"],
    queryFn: () => api.get<LetterTemplate[]>("/letters/templates"),
    staleTime: Infinity, // templates don't change
  });

  const generateLetter = useMutation({
    mutationFn: ({
      templateId,
      situationData,
    }: {
      templateId: string;
      situationData: Record<string, unknown>;
    }) => api.post<GeneratedLetter>("/letters", { templateId, situationData }),
  });

  const downloadPdf = useMutation({
    mutationFn: (letterId: string) =>
      api.post<{ downloadUrl: string }>(`/letters/${letterId}/pdf`),
  });

  return { templates, generateLetter, downloadPdf };
}
```

### `src/hooks/useProcedures.ts`

```ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  Procedure,
  UserProcedure,
  DeadlineResult,
} from "@/types/api.types";

export function useProcedures() {
  const qc = useQueryClient();

  const procedures = useQuery({
    queryKey: ["procedures"],
    queryFn: () => api.get<Procedure[]>("/procedures"),
    staleTime: Infinity,
  });

  const myProcedures = useQuery({
    queryKey: ["my-procedures"],
    queryFn: () => api.get<UserProcedure[]>("/procedures/instances/me"),
  });

  const startProcedure = useMutation({
    mutationFn: (procedureKey: string) =>
      api.post<UserProcedure>(`/procedures/${procedureKey}/start`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-procedures"] }),
  });

  const updateProgress = useMutation({
    mutationFn: ({ id, step }: { id: string; step: number }) =>
      api.put<UserProcedure>(`/procedures/instances/${id}/progress`, { step }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-procedures"] }),
  });

  const calculateDeadline = useMutation({
    mutationFn: ({
      procedureKey,
      eventDate,
    }: {
      procedureKey: string;
      eventDate: string;
    }) =>
      api.post<DeadlineResult>("/procedures/deadline-calc", {
        procedureKey,
        eventDate,
      }),
  });

  return {
    procedures,
    myProcedures,
    startProcedure,
    updateProgress,
    calculateDeadline,
  };
}

// Add api.put if missing in api.ts:
// async put<T>(url: string, data?: unknown): Promise<T> {
//   const res = await this.client.put<T>(url, data);
//   return res.data;
// }
```

### `src/hooks/useProof.ts`

```ts
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ProofAnchor, ProofVerification } from "@/types/api.types";

export function useProof() {
  const anchor = useMutation({
    mutationFn: ({
      sha256,
      documentId,
      letterId,
    }: {
      sha256: string;
      documentId?: string;
      letterId?: string;
    }) =>
      api.post<ProofAnchor>("/proof/anchor", { sha256, documentId, letterId }),
  });

  const verify = (sha256: string) =>
    useQuery({
      queryKey: ["proof", sha256],
      queryFn: () => api.get<ProofVerification>(`/proof/${sha256}/verify`),
      refetchInterval: (data) => (data?.status === "PENDING" ? 5000 : false), // poll while pending
    });

  return { anchor, verify };
}
```

---

## 8. Wire the Auth Flow (OTP Screens)

### `app/(auth)/otp.tsx` — update to use real API

```tsx
// Replace any mock auth with:
import { useAuthStore } from "@/store/authStore";
import { router } from "expo-router";

export default function OtpScreen() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { requestOtp, verifyOtp } = useAuthStore();

  const handleRequestOtp = async () => {
    setLoading(true);
    setError("");
    try {
      await requestOtp(`+213${phone.replace(/^0/, "")}`);
      setStep("otp");
    } catch (e: any) {
      setError(e.response?.data?.message ?? "حدث خطأ، حاول مجددًا");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError("");
    try {
      await verifyOtp(`+213${phone.replace(/^0/, "")}`, code);
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e.response?.data?.message ?? "الرمز غير صحيح");
    } finally {
      setLoading(false);
    }
  };

  // ... rest of your existing UI, replace mock handlers with above
}
```

---

## 9. Wire the Assistant Tab

In `app/(tabs)/index.tsx` (Assistant home), replace any mock AI calls:

```tsx
import { useAssistant } from "@/hooks/useAssistant";
import { useAuthStore } from "@/store/authStore";

// Inside component:
const { sendMessage } = useAssistant();
const { user } = useAuthStore();

const handleSend = async (text: string) => {
  if (!text.trim()) return;

  // Optimistically add user message to local state
  addMessage({ role: "USER", content: text, id: Date.now().toString() });
  setInputText("");

  try {
    const reply = await sendMessage.mutateAsync({ message: text });

    addMessage({
      role: "ASSISTANT",
      content: reply.reply,
      citations: reply.citations,
      id: Date.now().toString(),
      confident: reply.confident,
    });

    // If not confident, show escalation prompt
    if (!reply.confident) {
      setShowEscalation(true);
    }
  } catch (e) {
    addMessage({
      role: "ASSISTANT",
      content: "عذرًا، حدث خطأ. يرجى المحاولة مجددًا.",
      id: Date.now().toString(),
    });
  }
};
```

---

## 10. Wire the Vault Tab

In `app/(tabs)/vault.tsx`:

```tsx
import { useVault } from "@/hooks/useVault";

// Replace mock data with:
const { documents, uploadDocument } = useVault();

// Loading state
if (documents.isLoading) return <LoadingState />;

// Error state
if (documents.isError)
  return <ErrorState onRetry={() => documents.refetch()} />;

// Data
const docs = documents.data ?? [];

// Status summary (computed from real data):
const valid = docs.filter((d) => d.status === "VALID").length;
const expiring = docs.filter((d) => d.status === "EXPIRING_SOON").length;
const expired = docs.filter((d) => d.status === "EXPIRED").length;
```

---

## 11. Wire the Scan Flow

In `app/scan/index.tsx`:

```tsx
import { useScan } from "@/hooks/useScan";

const { scanDocument } = useScan();

const handleCapture = async (imageUri: string) => {
  setStep("processing");
  try {
    const result = await scanDocument.mutateAsync(imageUri);
    setScanResult(result);
    setStep("results");
  } catch (e) {
    setStep("error");
  }
};

// In results view, map dnaResult.anomalies to DnaCheckRow components
// Map flags to AbusiveClauseCard components
// Use result.summaryDarija or summaryFr based on user.language
```

---

## 12. Wire the Letter Generator

In `app/letter/[template].tsx`:

```tsx
import { useLetters } from "@/hooks/useLetters";
import * as Linking from "expo-linking";

const { templates, generateLetter, downloadPdf } = useLetters();

const handleGenerate = async () => {
  const result = await generateLetter.mutateAsync({
    templateId: route.params.template,
    situationData: formValues,
  });
  setLetter(result);
};

const handleDownloadPdf = async () => {
  const { downloadUrl } = await downloadPdf.mutateAsync(letter.letterId);
  await Linking.openURL(downloadUrl); // opens in browser / PDF viewer
};
```

---

## 13. CORS — Backend Must Allow Expo Dev Client

Check `/desktop/mizan-backend/src/main.ts`. It should have:

```ts
// In main.ts
app.enableCors({
  origin: [
    "http://localhost:8081", // Expo dev server
    "http://localhost:19006", // Expo web
    "exp://localhost:8081",
    "*", // Open for hackathon — tighten in prod
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});
```

If it doesn't have this, add it **before** `app.listen()`.

---

## 14. Android Emulator Network Fix

If testing on Android emulator, `localhost` won't reach the host machine. Use:

```ts
// In src/lib/api.ts, update BASE_URL:
const BASE_URL = __DEV__
  ? Platform.OS === "android"
    ? "http://10.0.2.2:3000" // Android emulator → host machine
    : "http://localhost:3000" // iOS simulator / web
  : "https://your-prod-url.com";
```

```ts
// Add import at top of api.ts:
import { Platform } from "react-native";
```

---

## 15. Mock Fallbacks — For Features Not Yet Built on Backend

If certain backend endpoints aren't ready yet, use fallback mocks so the UI doesn't break:

```ts
// src/lib/mockFallback.ts
// Wrap any unbuilt endpoint with this

export async function withFallback<T>(
  apiCall: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await apiCall();
  } catch (e: any) {
    if (e.response?.status === 404 || e.code === "ECONNREFUSED") {
      console.warn("[MOCK FALLBACK] Using mock data for:", e.config?.url);
      return fallback;
    }
    throw e;
  }
}

// Usage example in useVault.ts:
// queryFn: () => withFallback(
//   () => api.get<VaultDocument[]>('/documents'),
//   MOCK_DOCUMENTS
// ),
```

---

## 16. Verify Integration — Checklist

After wiring everything, verify each flow works end-to-end:

```bash
# 1. Auth flow
curl -X POST http://localhost:3000/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+213555000001"}'
# Expected: 200 (OTP logged to console in dev)

# 2. Verify OTP (use whatever was logged)
curl -X POST http://localhost:3000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+213555000001", "code": "123456"}'
# Expected: { token: "...", user: {...} }

# 3. Authenticated request
TOKEN="paste_token_here"
curl http://localhost:3000/documents \
  -H "Authorization: Bearer $TOKEN"
# Expected: []

# 4. Assistant
curl -X POST http://localhost:3000/assistant/conversations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
# Expected: { conversationId: "..." }
```

---

## 17. File Structure After Integration

```
src/
├── lib/
│   ├── api.ts              ← NEW: axios client with JWT interceptor
│   └── mockFallback.ts     ← NEW: graceful fallback for unbuilt endpoints
├── types/
│   └── api.types.ts        ← NEW: all shared TypeScript interfaces
├── store/
│   └── authStore.ts        ← UPDATED: real OTP/JWT auth
├── hooks/
│   ├── useAssistant.ts     ← NEW: conversation + message hooks
│   ├── useVault.ts         ← NEW: vault CRUD hooks
│   ├── useScan.ts          ← NEW: scan mutation hook
│   ├── useLetters.ts       ← NEW: letter gen + PDF hooks
│   ├── useProcedures.ts    ← NEW: procedure + deadline hooks
│   └── useProof.ts         ← NEW: anchor + verify hooks
└── app/
    ├── _layout.tsx         ← UPDATED: QueryClientProvider added
    ├── (auth)/
    │   └── otp.tsx         ← UPDATED: real auth calls
    └── (tabs)/
        ├── index.tsx       ← UPDATED: real assistant
        └── vault.tsx       ← UPDATED: real vault data
```

---

## 18. What to Do If Backend Route Doesn't Exist Yet

Don't break the UI. Use the mock fallback pattern (§15) and add a `// TODO: remove mock` comment. The UI should always render — even if it's seeded data — so the demo never crashes.

Priority order for integration (match backend build phases):

1. Auth (OTP + JWT) — must be live, no mock acceptable
2. Assistant chat — core demo, must be live
3. Vault list — live (even if empty)
4. Scan — live
5. Letter generator — live
6. Procedures + deadline calc — can use mock if not built
7. Proof anchoring — can show PENDING state as mock
8. Escalation — static/mock fine

---

_End — run this in Claude Code on your local machine where `/desktop/mizan-backend` is accessible._
