import { DocumentItem, DocumentStatus } from '@/types';

/**
 * Production Document Service Layer
 *
 * Strictly interfaces with the Next.js App Router API (/api/documents).
 * All verification, rejection, and uploads execute against Neon PostgreSQL.
 * Silent localStorage and mock fallbacks have been removed.
 */
export class DocumentService {
  /**
   * Retrieves all documents for the authenticated user's workspace.
   */
  static async getAllDocuments(): Promise<DocumentItem[]> {
    if (typeof window === 'undefined') return [];

    const res = await fetch('/api/documents', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Unable to load documents from Neon database.');
    }

    const json = await res.json();
    return Array.isArray(json.documents) ? json.documents : [];
  }

  /**
   * Retrieves documents for a specific supplier.
   */
  static async getDocumentsByVendorId(vendorId: string): Promise<DocumentItem[]> {
    if (typeof window === 'undefined') return [];

    const res = await fetch(`/api/documents?vendorId=${encodeURIComponent(vendorId)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Unable to load documents for vendor ${vendorId}.`);
    }

    const json = await res.json();
    return Array.isArray(json.documents) ? json.documents : [];
  }

  /**
   * Marks a document as verified with auditor attribution.
   */
  static async verifyDocument(id: string): Promise<DocumentItem> {
    const res = await fetch(`/api/documents/${encodeURIComponent(id)}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to verify document in Neon database.');
    }

    const json = await res.json();
    return json.document;
  }

  /**
   * Rejects a document with an audit-recorded reason.
   */
  static async rejectDocument(id: string, reason: string): Promise<DocumentItem> {
    const res = await fetch(`/api/documents/${encodeURIComponent(id)}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to reject document in Neon database.');
    }

    const json = await res.json();
    return json.document;
  }

  /**
   * Uploads a real binary file with metadata to the secure storage and Neon database.
   */
  static async uploadRealFile(formData: FormData): Promise<DocumentItem> {
    const res = await fetch('/api/documents/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to upload document file.');
    }

    const json = await res.json();
    return json.document;
  }

  /**
   * Deletes a document and its associated storage file.
   */
  static async deleteDocument(id: string): Promise<boolean> {
    const res = await fetch(`/api/documents/${encodeURIComponent(id)}/preview`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete document.');
    }

    return true;
  }

  /**
   * Records a newly uploaded document in Neon PostgreSQL.
   */
  static async uploadDocument(data: {
    vendorId: string;
    vendorName?: string;
    type: string;
    fileName: string;
    fileSize?: string;
    expiryDate?: string;
    documentNumber?: string;
    notes?: string;
  }): Promise<DocumentItem> {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to upload document to Neon database.');
    }

    const json = await res.json();
    return json.document;
  }
}
