import { create } from "zustand";
import type { DocumentTypeKey } from "../constants/tokens";

export interface VaultDocument {
  id: string;
  type: DocumentTypeKey;
  name: string;
  fileRef?: string;
  issuedAt?: string;
  expiresAt?: string;
  status: "valid" | "expiring" | "expired" | "missing" | "unverified";
  hash?: string;
  anchorRef?: string;
  createdAt: string;
}

interface VaultState {
  documents: VaultDocument[];
  isLoading: boolean;
  setDocuments: (docs: VaultDocument[]) => void;
  addDocument: (doc: VaultDocument) => void;
  removeDocument: (id: string) => void;
  updateDocument: (id: string, updates: Partial<VaultDocument>) => void;
  setLoading: (loading: boolean) => void;
}

// Demo documents
export const DEMO_DOCS: VaultDocument[] = [
  {
    id: "doc-001",
    type: "acte_naissance_12s",
    name: "عقد الميلاد 12S",
    status: "valid",
    expiresAt: "2027-03-15",
    anchorRef: "demo_anchor_1",
    createdAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "doc-002",
    type: "certificat_residence",
    name: "شهادة الإقامة",
    status: "expiring",
    expiresAt: "2026-07-08",
    createdAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "doc-003",
    type: "carte_nationale",
    name: "بطاقة وطنية",
    status: "expired",
    expiresAt: "2024-01-20",
    createdAt: "2020-01-15T10:00:00Z",
  },
  {
    id: "doc-004",
    type: "fiche_familiale",
    name: "الوثيقة العائلية",
    status: "valid",
    expiresAt: "2026-12-31",
    createdAt: "2024-03-01T10:00:00Z",
  },
];

export const useVaultStore = create<VaultState>((set) => ({
  documents: DEMO_DOCS,
  isLoading: false,

  setDocuments: (documents) => set({ documents }),
  addDocument: (doc) =>
    set((state) => ({ documents: [doc, ...state.documents] })),
  removeDocument: (id) =>
    set((state) => ({
      documents: state.documents.filter((d) => d.id !== id),
    })),
  updateDocument: (id, updates) =>
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      ),
    })),
  setLoading: (isLoading) => set({ isLoading }),
}));
