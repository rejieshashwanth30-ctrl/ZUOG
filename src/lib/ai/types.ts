import { AiComplianceAnalysis, AiInsight, AiPrediction, VendorRiskScore } from '@/types';

export interface RawComplianceContext {
  workspaceId: string;
  workspaceName: string;
  totalVendors: number;
  totalDocuments: number;
  compliantCount: number;
  expiringCount: number;
  expiredCount: number;
  missingCount: number;
  pendingCount: number;
  rejectedCount: number;
  vendors: Array<{
    id: string;
    name: string;
    category: string;
    totalRequiredCount: number;
    uploadedCount: number;
    status: string;
    documents: Array<{
      id: string;
      type: string;
      status: string;
      verificationStatus: string;
      expiryDate: string | null;
      daysRemaining: number | null;
    }>;
  }>;
  remindersCount: number;
  historyEventsCount: number;
}

export interface AskZuogResponse {
  query: string;
  answer: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  evidence: Array<{
    title: string;
    detail: string;
    link?: string;
  }>;
  relatedMetrics?: {
    label: string;
    value: string | number;
  }[];
  suggestedQuestions: string[];
}
