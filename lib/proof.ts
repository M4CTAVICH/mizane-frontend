import CryptoJS from "crypto-js";
import { api } from "./api";

export async function anchorDocument(
  fileContent: ArrayBuffer,
  documentId: string
): Promise<{ anchorRef: string; verificationUrl: string; timestamp: string }> {
  const wordArray = CryptoJS.lib.WordArray.create(
    Array.from(new Uint8Array(fileContent))
  );
  const hash = CryptoJS.SHA256(wordArray).toString();

  const response = await api.post("/proof/anchor", {
    hash,
    documentId,
    timestamp: new Date().toISOString(),
  });

  return response.data;
}

export function verifyDocument(
  fileContent: ArrayBuffer,
  storedHash: string
): boolean {
  const wordArray = CryptoJS.lib.WordArray.create(
    Array.from(new Uint8Array(fileContent))
  );
  const computedHash = CryptoJS.SHA256(wordArray).toString();
  return computedHash === storedHash;
}

export function hashString(content: string): string {
  return CryptoJS.SHA256(content).toString();
}

// Mock anchor for demo
export function mockAnchor(documentId: string): {
  anchorRef: string;
  verificationUrl: string;
  timestamp: string;
} {
  const timestamp = new Date().toISOString();
  const anchorRef = `OTS-${hashString(documentId + timestamp).substring(0, 16)}`;
  return {
    anchorRef,
    verificationUrl: `mizan://proof/verify/${anchorRef}`,
    timestamp,
  };
}
