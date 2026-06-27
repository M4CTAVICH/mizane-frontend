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

export const useVaultStore = create<VaultState>((set) => ({
  documents: [],
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
