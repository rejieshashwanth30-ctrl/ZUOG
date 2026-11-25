import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { StorageProvider } from '../types';

export class LocalStorageProvider implements StorageProvider {
  providerName = 'LOCAL_PRIVATE_STORAGE';

  private baseDir = path.join(process.cwd(), 'private_storage', 'documents');
  private signingSecret =
    process.env.STORAGE_SIGNING_SECRET ||
    process.env.CRON_SECRET ||
    'adyk-zuog-private-storage-signing-secret-2026';

  private async ensureDirectory(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch {
      // already exists
    }
  }

  private resolveSafePath(storageKey: string): string {
    // Prevent path traversal
    const safeKey = storageKey.replace(/\\/g, '/').replace(/\.\./g, '');
    const resolved = path.resolve(this.baseDir, safeKey);
    if (!resolved.startsWith(this.baseDir)) {
      throw new Error('Illegal storage path traversal attempt detected.');
    }
    return resolved;
  }

  async upload(
    fileBuffer: Buffer,
    storageKey: string,
    _mimeType: string
  ): Promise<{ success: boolean; storageKey: string; error?: string }> {
    try {
      const fullPath = this.resolveSafePath(storageKey);
      await this.ensureDirectory(path.dirname(fullPath));
      await fs.writeFile(fullPath, fileBuffer);
      return { success: true, storageKey };
    } catch (err: any) {
      console.error('[LocalStorageProvider] Upload write error:', err);
      return { success: false, storageKey, error: err?.message || 'File write failure' };
    }
  }

  async getSignedUrl(storageKey: string, expiresInSeconds = 900): Promise<string | null> {
    try {
      const exists = await this.exists(storageKey);
      if (!exists) return null;

      const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
      const signature = crypto
        .createHmac('sha256', this.signingSecret)
        .update(`${storageKey}:${expires}`)
        .digest('hex');

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      return `${appUrl}/api/documents/file?key=${encodeURIComponent(storageKey)}&expires=${expires}&sig=${signature}`;
    } catch (err) {
      console.error('[LocalStorageProvider] Signed URL generation error:', err);
      return null;
    }
  }

  verifySignature(storageKey: string, expires: number, signature: string): boolean {
    try {
      const now = Math.floor(Date.now() / 1000);
      if (now > expires) return false;

      const expectedSig = crypto
        .createHmac('sha256', this.signingSecret)
        .update(`${storageKey}:${expires}`)
        .digest('hex');

      const sigBuf = Buffer.from(signature, 'hex');
      const expectedBuf = Buffer.from(expectedSig, 'hex');

      if (sigBuf.length !== expectedBuf.length) {
        return false;
      }

      return crypto.timingSafeEqual(sigBuf, expectedBuf);
    } catch {
      return false;
    }
  }

  async getFileBuffer(
    storageKey: string
  ): Promise<{ buffer: Buffer; mimeType: string; size: number } | null> {
    try {
      const fullPath = this.resolveSafePath(storageKey);
      const buffer = await fs.readFile(fullPath);
      const stat = await fs.stat(fullPath);

      // Guess MIME from extension
      const ext = path.extname(storageKey).toLowerCase();
      let mimeType = 'application/octet-stream';
      if (ext === '.pdf') mimeType = 'application/pdf';
      else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
      else if (ext === '.png') mimeType = 'image/png';
      else if (ext === '.webp') mimeType = 'image/webp';

      return { buffer, mimeType, size: stat.size };
    } catch {
      return null;
    }
  }

  async delete(storageKey: string): Promise<boolean> {
    try {
      const fullPath = this.resolveSafePath(storageKey);
      await fs.unlink(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  async exists(storageKey: string): Promise<boolean> {
    try {
      const fullPath = this.resolveSafePath(storageKey);
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }
}
