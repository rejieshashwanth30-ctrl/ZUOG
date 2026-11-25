import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { UserRepository } from '@/lib/db/repositories/userRepository';
import { WorkspaceRepository } from '@/lib/db/repositories/workspaceRepository';
import { AiComplianceService } from '@/lib/ai/aiService';

/**
 * POST /api/ai/ask
 * Evaluates a natural language question against verified workspace database records.
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

    const workspace = await WorkspaceRepository.getWorkspaceForUser(dbUser.id);
    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found.' }, { status: 404 });
    }

    const body = await request.json();
    const query = body.query?.trim();

    if (!query) {
      return NextResponse.json({ error: 'Query string is required.' }, { status: 400 });
    }

    const response = await AiComplianceService.askZuog(workspace.id, query, dbUser.id);

    return NextResponse.json({ response }, { status: 200 });
  } catch (error: any) {
    console.error('[API /api/ai/ask POST] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Error processing AI query.' },
      { status: 500 }
    );
  }
}
