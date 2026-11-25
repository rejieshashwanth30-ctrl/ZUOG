import { NotificationPayload, NotificationResult } from '../types';

export interface NotificationProvider {
  channelName: string;
  isConfigured(): boolean;
  send(payload: NotificationPayload): Promise<NotificationResult>;
}
