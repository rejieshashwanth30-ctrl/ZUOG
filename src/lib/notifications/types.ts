export type NotificationChannel = 'WHATSAPP' | 'EMAIL';
export type NotificationRecipientType = 'VENDOR' | 'INTERNAL';
export type ReminderType = '30_days' | '15_days' | '7_days' | '1_day' | 'expired';

export interface NotificationTemplateData {
  vendorName: string;
  companyName: string;
  documentName: string;
  documentNumber?: string;
  expiryDate: string;
  daysRemaining: number;
  portalUrl: string;
  timing: ReminderType;
  recipientPhone?: string;
  recipientEmail?: string;
  recipientName?: string;
}

export interface NotificationPayload {
  channel: NotificationChannel;
  recipient: string; // Phone number for WhatsApp, email address for Email
  recipientName: string;
  templateData: NotificationTemplateData;
}

export interface NotificationResult {
  success: boolean;
  channel: NotificationChannel;
  recipient: string;
  providerMessageId?: string;
  providerResponse?: unknown;
  error?: string;
  dispatchedAt: Date;
}
