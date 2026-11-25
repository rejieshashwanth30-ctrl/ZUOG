import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { UserRepository } from '@/lib/db/repositories/userRepository';
import { WorkspaceRepository } from '@/lib/db/repositories/workspaceRepository';
import { VendorRepository } from '@/lib/db/repositories/vendorRepository';

/**
 * GET /api/vendors
 * Retrieves vendors scoped strictly to the authenticated user's workspace.
 * Starts from a fresh empty state with zero mock records.
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await UserRepository.syncAuthUser({
      authUserId: authUser.authUserId,
      email: authUser.email,
      fullName: authUser.name,
    });

    const workspace = await WorkspaceRepository.getWorkspaceForUser(dbUser.id);
    if (!workspace) {
      return NextResponse.json({ vendors: [] }, { status: 200 });
    }

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;

    const dbVendors = await VendorRepository.getVendorsByWorkspace(workspace.id, {
      category,
      search,
    });

    // Map Prisma models to frontend Vendor format
    const vendors = dbVendors.map((v) => ({
      id: v.id,
      name: v.vendorName,
      contactPerson: v.contactPerson || 'Authorized Representative',
      phone: v.phone || '—',
      email: v.email || '—',
      category: v.category as any,
      address: v.address || '—',
      city: v.city || '—',
      state: v.state || '—',
      gstin: v.gstin || '—',
      pan: v.pan || '—',
      status: v.status.toLowerCase() as any,
      requiredDocumentTypes: ['GST Certificate', 'PAN Card', 'Udyam Registration', 'Insurance Certificate', 'ISO 9001'],
      uploadedDocumentsCount: (v as any).documents?.length || 0,
      totalRequiredCount: 5,
      nextExpiryDate: null,
      createdAt: v.createdAt.toISOString().split('T')[0],
      lastUpdated: 'Recently synced',
    }));

    return NextResponse.json({ vendors }, { status: 200 });
  } catch (error) {
    console.error('[API /api/vendors GET] Error querying Neon database:', error);
    return NextResponse.json(
      { error: 'Unable to load vendors from database.', vendors: [] },
      { status: 500 }
    );
  }
}

/**
 * POST /api/vendors
 * Adds a new vendor scoped to the authenticated user's workspace in Neon PostgreSQL.
 */
export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await UserRepository.syncAuthUser({
      authUserId: authUser.authUserId,
      email: authUser.email,
      fullName: authUser.name,
    });

    let workspace = await WorkspaceRepository.getWorkspaceForUser(dbUser.id);
    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found. Please complete setup.' }, { status: 404 });
    }

    const body = await request.json();
    const { name, contactPerson, phone, email, category, address, city, state, gstin, pan } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Vendor name is required.' }, { status: 400 });
    }

    const created = await VendorRepository.createVendor(
      workspace.id,
      dbUser.id,
      {
        vendorName: name.trim(),
        contactPerson: contactPerson || 'Authorized Representative',
        phone: phone || '—',
        email: email || '—',
        category: category || 'Raw Materials',
        address,
        city,
        state,
        gstin,
        pan,
      }
    );

    const vendor = {
      id: created.id,
      name: created.vendorName,
      contactPerson: created.contactPerson || 'Authorized Representative',
      phone: created.phone || '—',
      email: created.email || '—',
      category: created.category as any,
      address: created.address || '—',
      city: created.city || '—',
      state: created.state || '—',
      gstin: created.gstin || '—',
      pan: created.pan || '—',
      status: created.status.toLowerCase() as any,
      requiredDocumentTypes: ['GST Certificate', 'PAN Card', 'Udyam Registration', 'Insurance Certificate', 'ISO 9001'],
      uploadedDocumentsCount: 0,
      totalRequiredCount: 5,
      nextExpiryDate: null,
      createdAt: created.createdAt.toISOString().split('T')[0],
      lastUpdated: 'Just now',
    };

    return NextResponse.json({ vendor }, { status: 201 });
  } catch (error) {
    console.error('[API /api/vendors POST] Failed to create vendor in Neon:', error);
    return NextResponse.json({ error: 'Failed to create vendor in database.' }, { status: 500 });
  }
}
