import { Vendor, ComplianceStatus } from '@/types';
import { apiFetch } from '@/lib/api/apiClient';

/**
 * Production Vendor Service Layer
 *
 * Strictly interfaces with the Next.js App Router API (/api/vendors).
 * All data persists to and originates from Neon PostgreSQL.
 * Silent localStorage and mock data fallbacks have been eliminated.
 */
export class VendorService {
  /**
   * Retrieves all vendors scoped to the authenticated user's workspace.
   */
  static async getAllVendors(): Promise<Vendor[]> {
    if (typeof window === 'undefined') return [];

    const res = await apiFetch('/api/vendors', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Unable to load vendors from Neon database.');
    }

    const json = await res.json();
    return Array.isArray(json.vendors) ? json.vendors : [];
  }

  /**
   * Retrieves a single vendor by ID within the user's workspace.
   */
  static async getVendorById(id: string): Promise<Vendor | null> {
    if (typeof window === 'undefined') return null;

    const res = await apiFetch(`/api/vendors/${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (res.status === 404) return null;

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Unable to load vendor ${id}.`);
    }

    const json = await res.json();
    return json.vendor || null;
  }

  /**
   * Creates a new supplier record in Neon PostgreSQL.
   */
  static async createVendor(data: Omit<Vendor, 'id' | 'createdAt' | 'lastUpdated'>): Promise<Vendor> {
    const res = await apiFetch('/api/vendors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create vendor in Neon database.');
    }

    const json = await res.json();
    if (!json.vendor) {
      throw new Error('Invalid response received from server.');
    }

    return json.vendor;
  }

  /**
   * Updates an existing supplier record in Neon PostgreSQL.
   */
  static async updateVendor(id: string, updates: Partial<Vendor>): Promise<Vendor> {
    const res = await apiFetch(`/api/vendors/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update vendor in Neon database.');
    }

    const json = await res.json();
    return json.vendor;
  }

  /**
   * Deletes a supplier from the workspace in Neon PostgreSQL.
   */
  static async deleteVendor(id: string): Promise<boolean> {
    const res = await apiFetch(`/api/vendors/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete vendor from Neon database.');
    }

    const json = await res.json();
    return Boolean(json.success);
  }

  /**
   * Updates compliance status for a vendor.
   */
  static async updateComplianceStatus(id: string, status: ComplianceStatus): Promise<Vendor> {
    return this.updateVendor(id, { status });
  }
}
