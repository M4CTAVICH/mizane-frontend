import CryptoJS from "crypto-js";
import { proofApi } from "./api";
import type { AnchorResponse } from "../types/api";

export async function anchorDocument(
  fileContent: ArrayBuffer
): Promise<AnchorResponse> {
  const wordArray = CryptoJS.lib.WordArray.create(
    Array.from(new Uint8Array(fileContent))
  );
  const sha256 = CryptoJS.SHA256(wordArray).toString();
  // Backend accepts only the 64-char hex hash; it queues anchoring async.
  return proofApi.anchor(sha256);
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
