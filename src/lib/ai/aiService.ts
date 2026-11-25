import { prisma } from '../db/prisma';
import { AiComplianceAnalysis } from '@/types';
import { RawComplianceContext, AskZuogResponse } from './types';
import { GeminiProvider } from './providers/GeminiProvider';
import { DeterministicSynthesizer } from './providers/DeterministicSynthesizer';

export class AiComplianceService {
  private static geminiProvider = new GeminiProvider();
  private static fallbackSynthesizer = new DeterministicSynthesizer();

  /**
   * Builds the strictly scoped, factual compliance context from Neon database records.
   */
  static async extractWorkspaceContext(workspaceId: string): Promise<RawComplianceContext> {
    const now = new Date();

    const [workspace, vendors, totalRequiredTypes, remindersCount, auditEventsCount] = await Promise.all([
      prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { id: true, name: true, companyName: true },
      }),
      prisma.vendor.findMany({
        where: { workspaceId },
        include: {
          documents: {
            include: {
              documentType: true,
            },
          },
        },
      }),
      prisma.documentType.count({
        where: {
          OR: [{ workspaceId }, { workspaceId: null, isRequiredDefault: true }],
        },
      }),
      prisma.reminder.count({ where: { workspaceId } }),
      prisma.auditLog.count({ where: { workspaceId } }),
    ]);

    let compliantCount = 0;
    let expiringCount = 0;
    let expiredCount = 0;
    let missingCount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;

    const vendorContexts = vendors.map((v) => {
      const docs = v.documents;
      const uploadedCount = docs.length;

      let vendorExpired = false;
      let vendorExpiring = false;

      const docContexts = docs.map((d) => {
        let daysRemaining: number | null = null;
        if (d.expiryDate) {
          const diffMs = new Date(d.expiryDate).getTime() - now.getTime();
          daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        }

        if (d.status === 'EXPIRED' || (daysRemaining !== null && daysRemaining <= 0)) {
          expiredCount++;
          vendorExpired = true;
        } else if (daysRemaining !== null && daysRemaining <= 30) {
          expiringCount++;
          vendorExpiring = true;
        }

        if (d.verificationStatus === 'PENDING') pendingCount++;
        if (d.verificationStatus === 'REJECTED') rejectedCount++;

        return {
          id: d.id,
          type: d.documentType?.name || 'Certificate',
          status: d.status,
          verificationStatus: d.verificationStatus,
          expiryDate: d.expiryDate ? d.expiryDate.toISOString().split('T')[0] : null,
          daysRemaining,
        };
      });

      const isMissing = uploadedCount < totalRequiredTypes;
      if (isMissing) missingCount++;

      if (vendorExpired) {
        // counted
      } else if (vendorExpiring) {
        // counted
      } else if (!isMissing && uploadedCount > 0) {
        compliantCount++;
      }

      return {
        id: v.id,
        name: v.vendorName,
        category: v.category,
        totalRequiredCount: totalRequiredTypes || 5,
        uploadedCount,
        status: v.status,
        documents: docContexts,
      };
    });

    return {
      workspaceId,
      workspaceName: workspace?.companyName || workspace?.name || 'Workspace',
      totalVendors: vendors.length,
      totalDocuments: vendors.reduce((acc, v) => acc + v.documents.length, 0),
      compliantCount,
      expiringCount,
      expiredCount,
      missingCount,
      pendingCount,
      rejectedCount,
      vendors: vendorContexts,
      remindersCount,
      historyEventsCount: auditEventsCount,
    };
  }

  /**
   * Generates or retrieves cached structured compliance intelligence for a workspace.
   */
  static async getComplianceInsights(
    workspaceId: string,
    options?: { forceRefresh?: boolean; userId?: string | null }
  ): Promise<AiComplianceAnalysis> {
    const context = await this.extractWorkspaceContext(workspaceId);

    // If fresh empty workspace, return deterministic zero state immediately
    if (context.totalVendors === 0) {
      return this.fallbackSynthesizer.analyzeCompliance(context);
    }

    // Deterministic cache key based on latest document count and workspace state
    const cacheKey = `zuog_ai_insights_${workspaceId}_${context.totalVendors}_${context.totalDocuments}_${context.expiredCount}`;

    if (!options?.forceRefresh) {
      try {
        const cached = await prisma.aiAnalysisCache.findUnique({
          where: { cacheKey },
        });

        if (cached && new Date(cached.expiresAt) > new Date()) {
          const analysis = cached.data as unknown as AiComplianceAnalysis;
          return {
            ...analysis,
            isCached: true,
          };
        }
      } catch (err) {
        console.warn('[AiComplianceService] Cache read error, continuing with fresh generation:', err);
      }
    }

    // 1. Try Primary AI Provider (Gemini 2.0 Flash)
    let analysis: AiComplianceAnalysis | null = null;
    if (this.geminiProvider.isAvailable()) {
      analysis = await this.geminiProvider.analyzeCompliance(context);
    }

    // 2. Fall back to Deterministic Synthesizer if primary provider is unavailable or fails
    if (!analysis) {
      analysis = await this.fallbackSynthesizer.analyzeCompliance(context);
    }

    // 3. Store in cache with 15-minute TTL
    try {
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await prisma.aiAnalysisCache.upsert({
        where: { cacheKey },
        create: {
          workspaceId,
          analysisType: 'COMPLIANCE_INSIGHTS',
          cacheKey,
          riskLevel: analysis.riskLevel,
          data: analysis as any,
          expiresAt,
        },
        update: {
          data: analysis as any,
          riskLevel: analysis.riskLevel,
          expiresAt,
        },
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          workspaceId,
          userId: options?.userId,
          action: 'AI_ANALYSIS_GENERATED',
          entityType: 'WORKSPACE',
          entityId: workspaceId,
          metadata: {
            riskLevel: analysis.riskLevel,
            overallScore: analysis.overallScore,
            provider: analysis === null ? 'FALLBACK' : 'PRIMARY_OR_FALLBACK',
          },
        },
      });
    } catch (err) {
      console.warn('[AiComplianceService] Error caching AI analysis:', err);
    }

    return analysis;
  }

  /**
   * Answers a natural language compliance question grounded strictly in real Neon records.
   */
  static async askZuog(
    workspaceId: string,
    query: string,
    userId?: string | null
  ): Promise<AskZuogResponse> {
    const context = await this.extractWorkspaceContext(workspaceId);

    let result: AskZuogResponse | null = null;
    if (this.geminiProvider.isAvailable()) {
      result = await this.geminiProvider.queryCompliance(context, query);
    }

    if (!result) {
      result = await this.fallbackSynthesizer.queryCompliance(context, query);
    }

    // Log query in audit trail
    try {
      await prisma.auditLog.create({
        data: {
          workspaceId,
          userId,
          action: 'AI_QUERY_EXECUTED',
          entityType: 'WORKSPACE',
          entityId: workspaceId,
          metadata: {
            query,
            confidence: result.confidence,
          },
        },
      });
    } catch {
      // safe
    }

    return result;
  }
}
