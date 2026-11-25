import { VendorRiskScore } from '@/types';
import { RawComplianceContext } from './types';

export class DeterministicRiskScorer {
  /**
   * Computes a transparent, evidence-based compliance risk score for an individual vendor.
   */
  static evaluateVendor(vendor: RawComplianceContext['vendors'][0]): VendorRiskScore {
    let score = 0;
    const factors: string[] = [];

    const now = new Date();

    // 1. Expired documents (+35 pts each)
    const expiredDocs = vendor.documents.filter(
      (d) => d.status === 'EXPIRED' || (d.daysRemaining !== null && d.daysRemaining <= 0)
    );
    if (expiredDocs.length > 0) {
      score += expiredDocs.length * 35;
      factors.push(`${expiredDocs.length} expired statutory document${expiredDocs.length > 1 ? 's' : ''} (${expiredDocs.map((d) => d.type).join(', ')})`);
    }

    // 2. Imminent expiry <= 7 days (+20 pts each)
    const imminentDocs = vendor.documents.filter(
      (d) => d.daysRemaining !== null && d.daysRemaining > 0 && d.daysRemaining <= 7
    );
    if (imminentDocs.length > 0) {
      score += imminentDocs.length * 20;
      factors.push(`${imminentDocs.length} document${imminentDocs.length > 1 ? 's' : ''} expiring within 7 days`);
    }

    // 3. Medium expiry 8-15 days (+10 pts each)
    const warningDocs = vendor.documents.filter(
      (d) => d.daysRemaining !== null && d.daysRemaining > 7 && d.daysRemaining <= 15
    );
    if (warningDocs.length > 0) {
      score += warningDocs.length * 10;
      factors.push(`${warningDocs.length} document${warningDocs.length > 1 ? 's' : ''} expiring within 15 days`);
    }

    // 4. Missing mandatory documents (+15 pts each)
    const missingCount = Math.max(0, vendor.totalRequiredCount - vendor.uploadedCount);
    if (missingCount > 0) {
      score += missingCount * 15;
      factors.push(`${missingCount} mandatory certificate${missingCount > 1 ? 's' : ''} missing from checklist`);
    }

    // 5. Rejected documents (+25 pts each)
    const rejectedDocs = vendor.documents.filter(
      (d) => d.verificationStatus === 'REJECTED' || d.status === 'REJECTED'
    );
    if (rejectedDocs.length > 0) {
      score += rejectedDocs.length * 25;
      factors.push(`${rejectedDocs.length} rejected document${rejectedDocs.length > 1 ? 's' : ''} awaiting resubmission`);
    }

    // 6. Pending verification (+5 pts each)
    const pendingDocs = vendor.documents.filter(
      (d) => d.verificationStatus === 'PENDING'
    );
    if (pendingDocs.length > 0) {
      score += pendingDocs.length * 5;
      factors.push(`${pendingDocs.length} document${pendingDocs.length > 1 ? 's' : ''} awaiting auditor verification`);
    }

    // Cap score at 100 for normalization
    const normalizedScore = Math.min(100, Math.max(0, score));

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (normalizedScore >= 76 || expiredDocs.length >= 2) {
      riskLevel = 'CRITICAL';
    } else if (normalizedScore >= 35 || expiredDocs.length >= 1) {
      riskLevel = 'HIGH';
    } else if (normalizedScore >= 20) {
      riskLevel = 'MEDIUM';
    } else {
      riskLevel = 'LOW';
      if (factors.length === 0) {
        factors.push('All required certificates verified and up to date');
      }
    }

    return {
      vendorId: vendor.id,
      vendorName: vendor.name,
      riskLevel,
      score: normalizedScore,
      factors,
    };
  }

  /**
   * Evaluates the entire workspace compliance health and ranks vendors by priority.
   */
  static evaluateWorkspace(context: RawComplianceContext): {
    overallScore: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'INSUFFICIENT_DATA';
    vendorRankings: VendorRiskScore[];
  } {
    if (context.totalVendors === 0) {
      return {
        overallScore: 0,
        riskLevel: 'INSUFFICIENT_DATA',
        vendorRankings: [],
      };
    }

    const vendorRankings = context.vendors
      .map((v) => this.evaluateVendor(v))
      .sort((a, b) => b.score - a.score);

    const totalScore = vendorRankings.reduce((sum, v) => sum + v.score, 0);
    const avgScore = Math.round(totalScore / context.totalVendors);

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (avgScore >= 76 || context.expiredCount > 0) {
      riskLevel = context.expiredCount >= 3 ? 'CRITICAL' : 'HIGH';
    } else if (avgScore >= 46 || context.expiringCount > 0) {
      riskLevel = 'HIGH';
    } else if (avgScore >= 21 || context.missingCount > 0) {
      riskLevel = 'MEDIUM';
    } else {
      riskLevel = 'LOW';
    }

    return {
      overallScore: avgScore,
      riskLevel,
      vendorRankings,
    };
  }
}
