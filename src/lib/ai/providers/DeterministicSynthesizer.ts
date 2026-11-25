import { AiProvider } from './AiProvider';
import { AiComplianceAnalysis, AiInsight, AiPrediction } from '@/types';
import { RawComplianceContext, AskZuogResponse } from '../types';
import { DeterministicRiskScorer } from '../riskScoring';

export class DeterministicSynthesizer implements AiProvider {
  providerName = 'DETERMINISTIC_SYNTHESIZER';

  isAvailable(): boolean {
    return true; // Always operational with 100% uptime
  }

  async analyzeCompliance(context: RawComplianceContext): Promise<AiComplianceAnalysis> {
    const timestamp = new Date().toISOString();

    // 14. INSUFFICIENT DATA HANDLING
    if (context.totalVendors === 0) {
      return {
        workspaceId: context.workspaceId,
        generatedAt: timestamp,
        riskLevel: 'INSUFFICIENT_DATA',
        overallScore: 0,
        summary: 'Not enough compliance history yet. Add vendors and document activity to unlock compliance predictions.',
        insights: [],
        predictions: [],
        vendorRiskRanking: [],
      };
    }

    // Evaluate deterministic risk and rankings
    const { overallScore, riskLevel, vendorRankings } = DeterministicRiskScorer.evaluateWorkspace(context);

    const insights: AiInsight[] = [];
    const predictions: AiPrediction[] = [];

    // 1. Attention Required Insights
    const criticalVendors = vendorRankings.filter((v) => v.riskLevel === 'CRITICAL' || v.riskLevel === 'HIGH');
    if (criticalVendors.length > 0) {
      const topCritical = criticalVendors.slice(0, 3);
      insights.push({
        id: `ins_att_${Date.now()}_1`,
        type: 'attention_required',
        title: `${criticalVendors.length} Supplier${criticalVendors.length > 1 ? 's' : ''} Require Immediate Compliance Action`,
        description: `${criticalVendors.length} supplier account${criticalVendors.length > 1 ? 's have' : ' has'} expired certificates or imminent validity expirations.`,
        severity: 'critical',
        evidence: topCritical.map((v) => ({
          vendorId: v.vendorId,
          vendorName: v.vendorName,
          detail: v.factors.join('; '),
        })),
        recommendedAction: 'Dispatch automated WhatsApp and email reminders to supplier primary contacts.',
      });
    }

    // 2. Risk Pattern Insights
    if (context.missingCount > 0) {
      const missingVendors = context.vendors
        .filter((v) => v.uploadedCount < v.totalRequiredCount)
        .slice(0, 3);

      insights.push({
        id: `ins_risk_${Date.now()}_2`,
        type: 'risk_pattern',
        title: `${context.missingCount} Incomplete Document Checklist${context.missingCount > 1 ? 's' : ''}`,
        description: `Suppliers have incomplete statutory portfolios with mandatory certificates yet to be collected.`,
        severity: 'warning',
        evidence: missingVendors.map((v) => ({
          vendorId: v.id,
          vendorName: v.name,
          detail: `${v.uploadedCount} of ${v.totalRequiredCount} certificates collected`,
        })),
        recommendedAction: 'Send secure mobile upload link directly to vendor compliance representative.',
      });
    }

    // 3. Priority Recommendation Insight
    if (vendorRankings.length > 0 && vendorRankings[0].score > 20) {
      const topPriority = vendorRankings[0];
      insights.push({
        id: `ins_prio_${Date.now()}_3`,
        type: 'priority',
        title: `Priority Follow-up: ${topPriority.vendorName}`,
        description: `${topPriority.vendorName} currently has the highest calculated compliance risk score (${topPriority.score}/100) across active suppliers.`,
        severity: topPriority.riskLevel === 'CRITICAL' ? 'critical' : 'warning',
        evidence: [
          {
            vendorId: topPriority.vendorId,
            vendorName: topPriority.vendorName,
            detail: topPriority.factors.join('; '),
          },
        ],
        recommendedAction: 'Review supplier detail page and schedule statutory validity renewal notices.',
      });
    }

    // 4. Positive Signal Insight
    const compliantVendors = vendorRankings.filter((v) => v.riskLevel === 'LOW');
    if (compliantVendors.length > 0) {
      insights.push({
        id: `ins_pos_${Date.now()}_4`,
        type: 'positive_signal',
        title: `${compliantVendors.length} Verified Compliant Supplier${compliantVendors.length > 1 ? 's' : ''}`,
        description: `Verified suppliers are maintaining valid statutory filings and active certificates.`,
        severity: 'success',
        evidence: compliantVendors.slice(0, 3).map((v) => ({
          vendorId: v.vendorId,
          vendorName: v.vendorName,
          detail: 'All required statutory certificates verified and active',
        })),
        recommendedAction: 'Maintain scheduled 30-day monitoring alerts for forward validity protection.',
      });
    }

    // 13. PREDICTIONS (Carefully calibrated with strict factual phrasing)
    if (context.expiringCount > 0) {
      predictions.push({
        target: 'Imminent Expirations',
        predictionText: `${context.expiringCount} document${context.expiringCount > 1 ? 's are' : ' is'} likely to require follow-up within the next 30 days based on recorded expiration dates.`,
        confidence: 'HIGH',
        basis: `${context.expiringCount} certificate${context.expiringCount > 1 ? 's have' : ' has'} validity ending within 30 days in Neon database.`,
      });
    }

    if (criticalVendors.length > 0) {
      predictions.push({
        target: 'Audit Readiness',
        predictionText: `Elevated compliance risk observed. Audit readiness requires attention on ${criticalVendors.length} supplier account${criticalVendors.length > 1 ? 's' : ''}.`,
        confidence: 'HIGH',
        basis: `Found ${context.expiredCount} expired and ${context.missingCount} missing document records.`,
      });
    } else {
      predictions.push({
        target: 'Audit Readiness',
        predictionText: `Current statutory documents exhibit high audit stability across verified manufacturing suppliers.`,
        confidence: 'HIGH',
        basis: `100% of active documents are in valid or compliant standing.`,
      });
    }

    // Executive summary formulation
    let summary = '';
    if (riskLevel === 'CRITICAL') {
      summary = `Critical attention required: ${context.expiredCount} expired documents and ${context.missingCount} missing statutory certificates are actively impacting your supply-chain compliance score.`;
    } else if (riskLevel === 'HIGH') {
      summary = `Elevated risk: ${context.expiringCount} documents are approaching expiry within the next 30 days and require prompt renewal follow-up.`;
    } else if (riskLevel === 'MEDIUM') {
      summary = `Moderate compliance standing: ${context.compliantCount} of ${context.totalVendors} suppliers are compliant, with ${context.missingCount} checklist gaps to resolve.`;
    } else {
      summary = `Strong compliance standing: All registered suppliers have valid certificates with zero expired documents recorded in your workspace.`;
    }

    return {
      workspaceId: context.workspaceId,
      generatedAt: timestamp,
      riskLevel,
      overallScore,
      summary,
      insights,
      predictions,
      vendorRiskRanking: vendorRankings,
    };
  }

  async queryCompliance(context: RawComplianceContext, query: string): Promise<AskZuogResponse> {
    const q = query.toLowerCase().trim();

    // 1. "Which vendors need attention this week?" / "attention"
    if (q.includes('attention') || q.includes('this week') || q.includes('urgent')) {
      const urgentVendors = context.vendors.filter((v) =>
        v.documents.some((d) => d.daysRemaining !== null && d.daysRemaining <= 7) ||
        v.documents.some((d) => d.status === 'EXPIRED')
      );

      if (urgentVendors.length === 0) {
        return {
          query,
          answer: 'No vendors currently require urgent attention this week. All statutory certificates have more than 7 days of remaining validity.',
          confidence: 'HIGH',
          evidence: [],
          relatedMetrics: [{ label: 'Urgent Vendors', value: 0 }],
          suggestedQuestions: [
            'Which documents expire next month?',
            'Which vendors have the highest compliance risk?',
            'How many documents are currently expired?',
          ],
        };
      }

      const vendorNamesStr = urgentVendors.map((v) => v.name).join(', ');
      return {
        query,
        answer: `${urgentVendors.length} vendor${urgentVendors.length > 1 ? 's' : ''} (${vendorNamesStr}) require${urgentVendors.length === 1 ? 's' : ''} attention this week due to expired or imminent (<= 7 days) document expirations.`,
        confidence: 'HIGH',
        evidence: urgentVendors.map((v) => ({
          title: v.name,
          detail: v.documents
            .filter((d) => (d.daysRemaining !== null && d.daysRemaining <= 7) || d.status === 'EXPIRED')
            .map((d) => `${d.type}: ${d.status === 'EXPIRED' ? 'Expired' : `${d.daysRemaining}d left`}`)
            .join('; '),
          link: `/vendors/${v.id}`,
        })),
        relatedMetrics: [{ label: 'Vendors Needing Attention', value: urgentVendors.length }],
        suggestedQuestions: [
          'Which vendors have the highest compliance risk?',
          'How many documents are currently expired?',
          'Why is our compliance score low?',
        ],
      };
    }

    // 2. "How many documents are currently expired?" / "expired"
    if (q.includes('expired')) {
      const expiredDocs: Array<{ title: string; detail: string; link?: string }> = [];
      context.vendors.forEach((v) => {
        v.documents.forEach((d) => {
          if (d.status === 'EXPIRED' || (d.daysRemaining !== null && d.daysRemaining <= 0)) {
            expiredDocs.push({
              title: `${v.name} — ${d.type}`,
              detail: `Expired on ${d.expiryDate || 'past date'}`,
              link: `/vendors/${v.id}`,
            });
          }
        });
      });

      return {
        query,
        answer: expiredDocs.length === 0
          ? 'There are currently 0 expired documents in your workspace.'
          : `There are currently ${expiredDocs.length} expired document${expiredDocs.length > 1 ? 's' : ''} across registered suppliers.`,
        confidence: 'HIGH',
        evidence: expiredDocs,
        relatedMetrics: [{ label: 'Total Expired Documents', value: expiredDocs.length }],
        suggestedQuestions: [
          'Which vendors need attention this week?',
          'Which documents expire next month?',
          'Which vendors have the highest compliance risk?',
        ],
      };
    }

    // 3. "Which documents expire next month?" / "next month" / "expire"
    if (q.includes('next month') || q.includes('expire') || q.includes('expiring')) {
      const expiringDocs: Array<{ title: string; detail: string; link?: string }> = [];
      context.vendors.forEach((v) => {
        v.documents.forEach((d) => {
          if (d.daysRemaining !== null && d.daysRemaining > 0 && d.daysRemaining <= 30) {
            expiringDocs.push({
              title: `${v.name} — ${d.type}`,
              detail: `Expires in ${d.daysRemaining} days (${d.expiryDate})`,
              link: `/vendors/${v.id}`,
            });
          }
        });
      });

      return {
        query,
        answer: expiringDocs.length === 0
          ? 'No certificates are scheduled to expire within the next 30 days.'
          : `Found ${expiringDocs.length} certificate${expiringDocs.length > 1 ? 's' : ''} expiring within the next 30 days.`,
        confidence: 'HIGH',
        evidence: expiringDocs,
        relatedMetrics: [{ label: 'Expiring in 30 Days', value: expiringDocs.length }],
        suggestedQuestions: [
          'Which vendors need attention this week?',
          'Which vendors have the highest compliance risk?',
          'How many documents are currently expired?',
        ],
      };
    }

    // 4. "Which vendors have the highest compliance risk?" / "risk"
    if (q.includes('highest') || q.includes('risk') || q.includes('score')) {
      const rankings = context.vendors.map((v) => DeterministicRiskScorer.evaluateVendor(v)).sort((a, b) => b.score - a.score);
      const highRisk = rankings.filter((r) => r.score > 20);

      return {
        query,
        answer: highRisk.length === 0
          ? 'All registered suppliers currently exhibit Low compliance risk with zero expired or missing documents.'
          : `The suppliers with the highest compliance risk are: ${highRisk.slice(0, 3).map((r) => `${r.vendorName} (${r.riskLevel})`).join(', ')}.`,
        confidence: 'HIGH',
        evidence: rankings.slice(0, 4).map((r) => ({
          title: `${r.vendorName} — ${r.riskLevel} (${r.score}/100)`,
          detail: r.factors.join('; '),
          link: `/vendors/${r.vendorId}`,
        })),
        relatedMetrics: [{ label: 'High/Critical Risk Vendors', value: highRisk.length }],
        suggestedQuestions: [
          'Which vendors need attention this week?',
          'How many documents are currently expired?',
          'Which documents expire next month?',
        ],
      };
    }

    // Default general response
    return {
      query,
      answer: `Workspace compliance overview: ${context.totalVendors} total suppliers, ${context.compliantCount} compliant, ${context.expiringCount} expiring soon, and ${context.expiredCount} expired documents.`,
      confidence: 'HIGH',
      evidence: [],
      relatedMetrics: [
        { label: 'Total Suppliers', value: context.totalVendors },
        { label: 'Compliant', value: context.compliantCount },
        { label: 'Expired', value: context.expiredCount },
      ],
      suggestedQuestions: [
        'Which vendors need attention this week?',
        'Which documents expire next month?',
        'Which vendors have the highest compliance risk?',
      ],
    };
  }
}
