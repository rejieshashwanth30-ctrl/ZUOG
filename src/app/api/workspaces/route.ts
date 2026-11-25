import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { UserRepository } from '@/lib/db/repositories/userRepository';
import { WorkspaceRepository } from '@/lib/db/repositories/workspaceRepository';

/**
 * GET /api/workspaces
 * Retrieves the active workspace for the authenticated user from Neon PostgreSQL.
 * Starts from a fresh empty state without injecting fabricated mock workspaces.
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

    return NextResponse.json({ workspace: workspace || null }, { status: 200 });
  } catch (error) {
    console.error('[API /api/workspaces GET] Error querying Neon database:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve workspace from database.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workspaces
 * Creates a new organization workspace in Neon PostgreSQL.
 */
export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { companyName, companyEmail, companyPhone, gstin, address, city, state } = body;

    if (!companyName || !companyName.trim()) {
      return NextResponse.json({ error: 'Company name is required.' }, { status: 400 });
    }

    const dbUser = await UserRepository.syncAuthUser({
      authUserId: authUser.authUserId,
      email: authUser.email,
      fullName: authUser.name,
    });

    // Idempotent check: If user already has an organization workspace, return it
    const existing = await WorkspaceRepository.getWorkspaceForUser(dbUser.id);
    if (existing) {
      return NextResponse.json(
        { workspace: existing, message: 'Existing workspace resolved.' },
        { status: 200 }
      );
    }

    const workspace = await WorkspaceRepository.createWorkspace({
      ownerId: dbUser.id,
      name: companyName.trim(),
      companyName: companyName.trim(),
      companyEmail: companyEmail || authUser.email,
      companyPhone,
      gstin,
      address,
      city,
      state,
    });

    return NextResponse.json({ workspace }, { status: 201 });
  } catch (error) {
    console.error('[API /api/workspaces POST] Failed to create workspace in Neon:', error);
    return NextResponse.json(
      { error: 'Failed to create workspace in Neon PostgreSQL.' },
      { status: 500 }
    );
  }
}
