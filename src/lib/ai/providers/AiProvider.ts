import { AiComplianceAnalysis } from '@/types';
import { RawComplianceContext, AskZuogResponse } from '../types';

export interface AiProvider {
  providerName: string;
  isAvailable(): boolean;
  analyzeCompliance(context: RawComplianceContext): Promise<AiComplianceAnalysis | null>;
  queryCompliance(context: RawComplianceContext, query: string): Promise<AskZuogResponse | null>;
}
