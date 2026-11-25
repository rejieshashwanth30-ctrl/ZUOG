import { StorageProvider } from '../types';
import { supabaseServer } from '@/lib/supabase/server';

export class SupabaseStorageProvider implements StorageProvider {
  providerName = 'SUPABASE_STORAGE';

  private bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'vendor-documents';

  isAvailable(): boolean {
    return Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
    );
  }

  async upload(
    fileBuffer: Buffer,
    storageKey: string,
    mimeType: string
  ): Promise<{ success: boolean; storageKey: string; error?: string }> {
    try {
      const { data, error } = await supabaseServer.storage
        .from(this.bucketName)
        .upload(storageKey, fileBuffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (error) {
        return { success: false, storageKey, error: error.message };
      }

      return { success: true, storageKey: data.path || storageKey };
    } catch (err: any) {
      return { success: false, storageKey, error: err?.message || 'Supabase storage upload error' };
    }
  }

  async getSignedUrl(storageKey: string, expiresInSeconds = 900): Promise<string | null> {
    try {
      const { data, error } = await supabaseServer.storage
        .from(this.bucketName)
        .createSignedUrl(storageKey, expiresInSeconds);

      if (error || !data) return null;
      return data.signedUrl;
    } catch {
      return null;
    }
  }

  async getFileBuffer(
    storageKey: string
  ): Promise<{ buffer: Buffer; mimeType: string; size: number } | null> {
    try {
      const { data, error } = await supabaseServer.storage
        .from(this.bucketName)
        .download(storageKey);

      if (error || !data) return null;
      const arrayBuffer = await data.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      return {
        buffer,
        mimeType: data.type || 'application/octet-stream',
        size: buffer.length,
      };
    } catch {
      return null;
    }
  }

  async delete(storageKey: string): Promise<boolean> {
    try {
      const { error } = await supabaseServer.storage
        .from(this.bucketName)
        .remove([storageKey]);

      return !error;
    } catch {
      return false;
    }
  }

  async exists(storageKey: string): Promise<boolean> {
    try {
      const { data, error } = await supabaseServer.storage
        .from(this.bucketName)
        .list(storageKey.split('/').slice(0, -1).join('/'), {
          search: storageKey.split('/').pop(),
        });

      return !error && Boolean(data && data.length > 0);
    } catch {
      return false;
    }
  }
}
