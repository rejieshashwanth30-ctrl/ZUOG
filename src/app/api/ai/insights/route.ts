import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { UserRepository } from '@/lib/db/repositories/userRepository';
import { WorkspaceRepository } from '@/lib/db/repositories/workspaceRepository';
import { AiComplianceService } from '@/lib/ai/aiService';


/**
 * GET /api/ai/insights
 * Returns real, evidence-backed AI compliance analysis and predictions scoped to the workspace.
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
      return NextResponse.json(
        {
          analysis: {
            workspaceId: '',
            generatedAt: new Date().toISOString(),
            riskLevel: 'INSUFFICIENT_DATA',
            overallScore: 0,
            summary: 'Not enough compliance history yet. Add vendors and document activity to unlock compliance predictions.',
            insights: [],
            predictions: [],
            vendorRiskRanking: [],
          },
        },
        { status: 200 }
      );
    }

    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get('refresh') === 'true';

    const analysis = await AiComplianceService.getComplianceInsights(workspace.id, {
      forceRefresh,
      userId: dbUser.id,
    });

    return NextResponse.json({ analysis }, { status: 200 });
  } catch (error: any) {
    console.error('[API /api/ai/insights GET] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate AI compliance insights.' },
      { status: 500 }
    );
  }
}
