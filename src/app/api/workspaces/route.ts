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
  let stage = 'AUTH_RESOLUTION';
  try {
    stage = 'AUTH_RESOLUTION';
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    stage = 'USER_SYNC';
    const dbUser = await UserRepository.syncAuthUser({
      authUserId: authUser.authUserId,
      email: authUser.email,
      fullName: authUser.name,
    });

    stage = 'WORKSPACE_FETCH';
    const workspace = await WorkspaceRepository.getWorkspaceForUser(dbUser.id);

    return NextResponse.json({ workspace: workspace || null }, { status: 200 });
  } catch (error: any) {
    const errMessage = error instanceof Error ? error.message : 'Unknown database error';
    console.error(`[API /api/workspaces GET] Error at stage [${stage}]:`, error);
    return NextResponse.json(
      { error: `Failed to retrieve workspace from database. (${stage}: ${errMessage})` },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workspaces
 * Creates a new organization workspace in Neon PostgreSQL.
 * Structured with granular stage tracking for production reliability and diagnostics.
 */
export async function POST(request: NextRequest) {
  let stage = 'AUTH_RESOLUTION';
  try {
    // Stage 1: Auth Resolution
    stage = 'AUTH_RESOLUTION';
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      console.warn('[WORKSPACE_CREATION] Failed at AUTH_RESOLUTION: No authenticated user resolved');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log(`[WORKSPACE_CREATION] Stage 1: Auth resolved for email=${authUser.email} authUserId=${authUser.authUserId}`);

    // Stage 2: Request Body Parsing & Validation
    stage = 'BODY_PARSE';
    const body = await request.json().catch(() => ({}));
    const { companyName, companyEmail, companyPhone, gstin, address, city, state } = body;

    if (!companyName || !companyName.trim()) {
      return NextResponse.json({ error: 'Company name is required.' }, { status: 400 });
    }

    // Stage 3: User Synchronization into Neon
    stage = 'USER_SYNC';
    console.log(`[WORKSPACE_CREATION] Stage 2: User sync started for ${authUser.email}`);
    const dbUser = await UserRepository.syncAuthUser({
      authUserId: authUser.authUserId,
      email: authUser.email,
      fullName: authUser.name,
    });
    console.log(`[WORKSPACE_CREATION] Stage 3: User synced successfully in Neon id=${dbUser.id}`);

    // Stage 4: Idempotency Check
    stage = 'EXISTING_WORKSPACE_CHECK';
    const existing = await WorkspaceRepository.getWorkspaceForUser(dbUser.id);
    if (existing) {
      console.log(`[WORKSPACE_CREATION] Existing workspace resolved: id=${existing.id}`);
      return NextResponse.json(
        { workspace: existing, message: 'Existing workspace resolved.' },
        { status: 200 }
      );
    }

    // Stage 5: Workspace Creation & Default Catalog Initialization
    stage = 'WORKSPACE_CREATE';
    console.log(`[WORKSPACE_CREATION] Stage 4: Creating workspace for ownerId=${dbUser.id} companyName=${companyName.trim()}`);
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
    console.log(`[WORKSPACE_CREATION] Stage 5: Workspace created successfully id=${workspace.id}`);

    return NextResponse.json({ workspace }, { status: 201 });
  } catch (error: any) {
    const errMessage = error instanceof Error ? error.message : 'Unknown database error';
    const errCode = error?.code || error?.name || 'UNKNOWN';

    console.error(`[WORKSPACE_CREATION] Failed at stage [${stage}]:`, {
      name: error?.name,
      code: error?.code,
      message: errMessage,
      stack: error?.stack,
    });

    return NextResponse.json(
      {
        error: `Failed to create workspace in Neon PostgreSQL. (${stage}: ${errMessage})`,
        stage,
        code: errCode,
        details: errMessage,
      },
      { status: 500 }
    );
  }
}
