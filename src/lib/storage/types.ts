export interface StoredFileResult {
  success: boolean;
  storageKey: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  sizeFormatted: string;
  error?: string;
}

export interface StorageProvider {
  providerName: string;
  upload(
    fileBuffer: Buffer,
    storageKey: string,
    mimeType: string
  ): Promise<{ success: boolean; storageKey: string; error?: string }>;
  getSignedUrl(storageKey: string, expiresInSeconds?: number): Promise<string | null>;
  getFileBuffer(storageKey: string): Promise<{ buffer: Buffer; mimeType: string; size: number } | null>;
  delete(storageKey: string): Promise<boolean>;
  exists(storageKey: string): Promise<boolean>;
}
