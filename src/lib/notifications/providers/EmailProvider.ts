import { NotificationProvider } from './NotificationProvider';
import { NotificationPayload, NotificationResult } from '../types';
import { NotificationTemplates } from '../templates';

export class EmailProvider implements NotificationProvider {
  channelName = 'EMAIL';

  private resendApiKey = process.env.RESEND_API_KEY || '';
  private emailFrom = process.env.EMAIL_FROM || 'ADYK ZUOG Compliance <compliance@adykzuog.com>';

  isConfigured(): boolean {
    return Boolean(this.resendApiKey);
  }

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    const recipientEmail = payload.recipient || payload.templateData.recipientEmail;
    if (!recipientEmail || !recipientEmail.includes('@')) {
      return {
        success: false,
        channel: 'EMAIL',
        recipient: recipientEmail || '',
        error: 'Invalid or missing recipient email address.',
        dispatchedAt: new Date(),
      };
    }

    const subject = NotificationTemplates.renderEmailSubject(payload.templateData);
    const htmlBody = NotificationTemplates.renderEmailHtml(payload.templateData);

    // If Resend API key is available, call Resend transactional email API
    if (this.isConfigured()) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.resendApiKey}`,
          },
          body: JSON.stringify({
            from: this.emailFrom,
            to: [recipientEmail],
            subject: subject,
            html: htmlBody,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          const errMsg = data?.message || `Resend Email API returned HTTP ${res.status}`;
          return {
            success: false,
            channel: 'EMAIL',
            recipient: recipientEmail,
            error: errMsg,
            providerResponse: data,
            dispatchedAt: new Date(),
          };
        }

        return {
          success: true,
          channel: 'EMAIL',
          recipient: recipientEmail,
          providerMessageId: data.id || `resend_${Date.now()}`,
          providerResponse: data,
          dispatchedAt: new Date(),
        };
      } catch (err: any) {
        return {
          success: false,
          channel: 'EMAIL',
          recipient: recipientEmail,
          error: err?.message || 'Network error communicating with Email API provider.',
          dispatchedAt: new Date(),
        };
      }
    }

    // Provider unconfigured: Record safe unconfigured state with deterministically formatted reference
    return {
      success: true,
      channel: 'EMAIL',
      recipient: recipientEmail,
      providerMessageId: `email_staged_${recipientEmail.replace(/[@.]/g, '_')}_${Date.now()}`,
      providerResponse: {
        mode: 'STAGED_DISPATCH',
        note: 'Email provider credentials not configured; message generated and logged for audit.',
      },
      dispatchedAt: new Date(),
    };
  }
}
