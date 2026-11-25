import { WhatsAppProvider } from './providers/WhatsAppProvider';
import { EmailProvider } from './providers/EmailProvider';
import { NotificationPayload, NotificationResult } from './types';

export class NotificationService {
  private static whatsAppProvider = new WhatsAppProvider();
  private static emailProvider = new EmailProvider();

  /**
   * Dispatches a notification across the specified channel.
   */
  static async send(payload: NotificationPayload): Promise<NotificationResult> {
    if (payload.channel === 'WHATSAPP') {
      return this.whatsAppProvider.send(payload);
    } else if (payload.channel === 'EMAIL') {
      return this.emailProvider.send(payload);
    } else {
      return {
        success: false,
        channel: payload.channel,
        recipient: payload.recipient,
        error: `Unsupported notification channel: ${payload.channel}`,
        dispatchedAt: new Date(),
      };
    }
  }

  /**
   * Returns whether a provider is live-configured with external credentials.
   */
  static getProviderStatus(): {
    whatsapp: { configured: boolean };
    email: { configured: boolean };
  } {
    return {
      whatsapp: { configured: this.whatsAppProvider.isConfigured() },
      email: { configured: this.emailProvider.isConfigured() },
    };
  }
}
