export type ComplianceStatus = 'compliant' | 'expiring' | 'expired' | 'incomplete' | 'review';

export type DocumentStatus = 'verified' | 'pending' | 'expiring' | 'expired' | 'missing' | 'rejected';

export type DocumentType =
  | 'GST Certificate'
  | 'PAN Card'
  | 'Udyam Registration'
  | 'Insurance Certificate'
  | 'ISO 9001'
  | 'Factory License'
  | 'Trade License'
  | 'Vendor Agreement'
  | 'Quality Certificate';

export type VendorCategory =
  | 'Raw Materials'
  | 'Sheet Metal & Fabrication'
  | 'Precision Machining'
  | 'Packaging'
  | 'Electrical & Sensors'
  | 'Foundry & Castings'
  | 'Fasteners & Hardware'
  | 'Chemicals & Coatings'
  | 'Tooling & Dies';

export interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  category: VendorCategory;
  address: string;
  city: string;
  state: string;
  gstin: string;
  pan: string;
  status: ComplianceStatus;
  requiredDocumentTypes: DocumentType[];
  uploadedDocumentsCount: number;
  totalRequiredCount: number;
  nextExpiryDate: string | null;
  lastUpdated: string;
  createdAt: string;
  uploadToken?: string;
  notes?: string;
}

export interface DocumentItem {
  id: string;
  vendorId: string;
  vendorName: string;
  type: DocumentType;
  documentNumber?: string;
  status: DocumentStatus;
  issuedDate?: string;
  expiryDate: string | null;
  uploadedAt: string | null;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  mimeType?: string;
  storagePath?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface Reminder {
  id: string;
  vendorId: string;
  vendorName: string;
  documentId?: string;
  documentType: string;
  expiryDate?: string | null;
  nextReminderDate: string;
  timing: string;
  channels: ('whatsapp' | 'email')[];
  channel?: string;
  recipient?: string;
  recipients: ('vendor' | 'internal')[];
  status: 'scheduled' | 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';
  createdAt: string;
  lastSentAt?: string;
  failureReason?: string;
  retryCount?: number;
  providerMessageId?: string;
  notes?: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  vendorId?: string;
  vendorName: string;
  documentType?: string;
  type: 'upload' | 'verification' | 'reminder' | 'expiry' | 'vendor_added' | 'rejection';
  timestamp: string;
  relativeTime: string;
  user: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'warning' | 'alert' | 'info' | 'success';
  link?: string;
}

export interface KPIStats {
  totalVendors: number;
  compliant: number;
  expiringSoon: number;
  expired: number;
  missingDocuments: number;
  underReview: number;
  verificationRate: number;
}

export interface AiInsight {
  id: string;
  type: 'attention_required' | 'risk_pattern' | 'priority' | 'positive_signal';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  evidence: Array<{
    vendorId: string;
    vendorName: string;
    documentType?: string;
    detail: string;
  }>;
  recommendedAction: string;
}

export interface AiPrediction {
  target: string;
  predictionText: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  basis: string;
}

export interface VendorRiskScore {
  vendorId: string;
  vendorName: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score: number;
  factors: string[];
}

export interface AiComplianceAnalysis {
  workspaceId: string;
  generatedAt: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'INSUFFICIENT_DATA';
  overallScore: number;
  summary: string;
  insights: AiInsight[];
  predictions: AiPrediction[];
  vendorRiskRanking: VendorRiskScore[];
  isCached?: boolean;
}


export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}
