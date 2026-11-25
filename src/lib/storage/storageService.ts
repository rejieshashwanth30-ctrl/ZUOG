import path from 'path';
import crypto from 'crypto';
import { StorageProvider, StoredFileResult } from './types';
import { LocalStorageProvider } from './providers/LocalStorageProvider';
import { SupabaseStorageProvider } from './providers/SupabaseStorageProvider';

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

export const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export class StorageService {
  private static localProvider = new LocalStorageProvider();
  private static supabaseProvider = new SupabaseStorageProvider();

  /**
   * Formats raw bytes into a human-readable string (e.g. "1.2 MB" or "840 KB")
   */
  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  /**
   * Validates file mime-type and extension server-side.
   */
  static validateFile(
    fileName: string,
    mimeType: string,
    fileSize: number
  ): { valid: boolean; error?: string } {
    const ext = path.extname(fileName).toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return {
        valid: false,
        error: `Unsupported file extension (${ext}). Allowed: PDF, JPG, JPEG, PNG, WEBP.`,
      };
    }

    if (!ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase())) {
      return {
        valid: false,
        error: `Unsupported MIME type (${mimeType}). Allowed: application/pdf, image/jpeg, image/png, image/webp.`,
      };
    }

    if (fileSize > MAX_FILE_SIZE_BYTES) {
      return {
        valid: false,
        error: `File size (${this.formatBytes(fileSize)}) exceeds the maximum allowed limit of 25 MB.`,
      };
    }

    return { valid: true };
  }

  /**
   * Generates a safe, randomized, unique storage path key preventing path traversal.
   * Format: {workspaceId}/{vendorId}/{documentId}/{uuid}-{safeFileName}
   */
  static generateStorageKey(
    workspaceId: string,
    vendorId: string,
    documentId: string,
    originalFileName: string
  ): string {
    const ext = path.extname(originalFileName).toLowerCase();
    const baseName = path
      .basename(originalFileName, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 40);

    const safeUid = crypto.randomUUID().substring(0, 8);
    const safeName = `${safeUid}_${baseName}${ext}`;

    const cleanWorkspace = workspaceId.replace(/[^a-zA-Z0-9_-]/g, '');
    const cleanVendor = vendorId.replace(/[^a-zA-Z0-9_-]/g, '');
    const cleanDoc = documentId.replace(/[^a-zA-Z0-9_-]/g, '');

    return `${cleanWorkspace}/${cleanVendor}/${cleanDoc}/${safeName}`;
  }

  /**
   * Resolves the active storage provider.
   */
  private static getActiveProvider(): StorageProvider {
    if (process.env.STORAGE_PROVIDER === 'supabase' && this.supabaseProvider.isAvailable()) {
      return this.supabaseProvider;
    }
    return this.localProvider;
  }

  /**
   * Securely saves the binary file to private storage.
   */
  static async uploadFile(
    fileBuffer: Buffer,
    workspaceId: string,
    vendorId: string,
    documentId: string,
    originalFileName: string,
    mimeType: string
  ): Promise<StoredFileResult> {
    const sizeBytes = fileBuffer.length;
    const sizeFormatted = this.formatBytes(sizeBytes);

    const validation = this.validateFile(originalFileName, mimeType, sizeBytes);
    if (!validation.valid) {
      return {
        success: false,
        storageKey: '',
        originalName: originalFileName,
        mimeType,
        sizeBytes,
        sizeFormatted,
        error: validation.error,
      };
    }

    const storageKey = this.generateStorageKey(
      workspaceId,
      vendorId,
      documentId,
      originalFileName
    );

    const provider = this.getActiveProvider();
    const result = await provider.upload(fileBuffer, storageKey, mimeType);

    if (!result.success) {
      // Fallback to local provider if remote failed
      if (provider !== this.localProvider) {
        const localResult = await this.localProvider.upload(fileBuffer, storageKey, mimeType);
        if (localResult.success) {
          return {
            success: true,
            storageKey,
            originalName: originalFileName,
            mimeType,
            sizeBytes,
            sizeFormatted,
          };
        }
      }

      return {
        success: false,
        storageKey: '',
        originalName: originalFileName,
        mimeType,
        sizeBytes,
        sizeFormatted,
        error: result.error || 'Failed to persist file in storage.',
      };
    }

    return {
      success: true,
      storageKey,
      originalName: originalFileName,
      mimeType,
      sizeBytes,
      sizeFormatted,
    };
  }

  /**
   * Generates a short-lived signed URL for secure viewing or downloading.
   */
  static async getSignedUrl(storageKey: string, expiresInSeconds = 900): Promise<string | null> {
    const provider = this.getActiveProvider();
    const url = await provider.getSignedUrl(storageKey, expiresInSeconds);
    if (!url && provider !== this.localProvider) {
      return this.localProvider.getSignedUrl(storageKey, expiresInSeconds);
    }
    return url;
  }

  /**
   * Retrieves the raw file buffer and MIME type for streaming.
   */
  static async getFileBuffer(
    storageKey: string
  ): Promise<{ buffer: Buffer; mimeType: string; size: number } | null> {
    const provider = this.getActiveProvider();
    const result = await provider.getFileBuffer(storageKey);
    if (!result && provider !== this.localProvider) {
      return this.localProvider.getFileBuffer(storageKey);
    }
    return result;
  }

  /**
   * Deletes a stored file when its corresponding record is deleted.
   */
  static async deleteFile(storageKey: string): Promise<boolean> {
    const provider = this.getActiveProvider();
    const deleted = await provider.delete(storageKey);
    if (!deleted && provider !== this.localProvider) {
      return this.localProvider.delete(storageKey);
    }
    return deleted;
  }

  /**
   * Verifies local token signature for direct file streaming.
   */
  static verifyLocalSignature(storageKey: string, expires: number, signature: string): boolean {
    return this.localProvider.verifySignature(storageKey, expires, signature);
  }
}
