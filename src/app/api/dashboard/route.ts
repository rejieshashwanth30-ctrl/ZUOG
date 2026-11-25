import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { UserRepository } from '@/lib/db/repositories/userRepository';
import { WorkspaceRepository } from '@/lib/db/repositories/workspaceRepository';
import { ComplianceService } from '@/lib/db/complianceService';


/**
 * GET /api/dashboard
 * Returns dynamic compliance metrics calculated directly from Neon PostgreSQL records.
 * For an empty workspace, strictly returns genuine zero-state metrics.
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
      return NextResponse.json({
        metrics: {
          totalVendors: 0,
          compliant: 0,
          expiringSoon: 0,
          expired: 0,
          missingDocuments: 0,
          underReview: 0,
          verificationRate: 0,
        },
      }, { status: 200 });
    }

    const metrics = await ComplianceService.getWorkspaceMetrics(workspace.id);

    return NextResponse.json({
      metrics: {
        totalVendors: metrics.totalVendors,
        compliant: metrics.compliant,
        expiringSoon: metrics.expiringSoon,
        expired: metrics.expired,
        missingDocuments: metrics.missingDocuments,
        underReview: metrics.pendingVerification,
        verificationRate: metrics.complianceRate,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('[API /api/dashboard GET] Error querying Neon database:', error);
    return NextResponse.json(
      { error: 'Failed to compute compliance metrics from database.' },
      { status: 500 }
    );
  }
}
