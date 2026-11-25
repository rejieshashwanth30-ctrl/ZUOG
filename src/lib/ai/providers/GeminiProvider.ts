import { AiProvider } from './AiProvider';
import { AiComplianceAnalysis } from '@/types';
import { RawComplianceContext, AskZuogResponse } from '../types';

export class GeminiProvider implements AiProvider {
  providerName = 'GEMINI_2_FLASH';

  private apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY || '';
  private model = 'gemini-2.0-flash';

  isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }

  async analyzeCompliance(context: RawComplianceContext): Promise<AiComplianceAnalysis | null> {
    if (!this.isAvailable()) return null;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

      const systemPrompt = `You are ADYK ZUOG's AI Compliance Intelligence Engine for manufacturing vendor compliance.
Analyze the following verified facts from the company's PostgreSQL database.
STRICT RULES:
1. NEVER invent or hallucinate suppliers, documents, numbers, or facts.
2. Rely strictly on the provided JSON data.
3. Use calibrated, factual phrasing: "Likely to require follow-up within 15 days because...", "Elevated compliance risk observed due to...", "Requires attention based on...".
4. Output MUST be valid JSON adhering strictly to the schema.`;

      const prompt = `Context: ${JSON.stringify(context, null, 2)}

Respond with JSON:
{
  "workspaceId": "${context.workspaceId}",
  "generatedAt": "${new Date().toISOString()}",
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | "INSUFFICIENT_DATA",
  "overallScore": number,
  "summary": "string",
  "insights": [
    {
      "id": "string",
      "type": "attention_required" | "risk_pattern" | "priority" | "positive_signal",
      "title": "string",
      "description": "string",
      "severity": "info" | "warning" | "critical" | "success",
      "evidence": [{ "vendorId": "string", "vendorName": "string", "detail": "string" }],
      "recommendedAction": "string"
    }
  ],
  "predictions": [
    {
      "target": "string",
      "predictionText": "string",
      "confidence": "HIGH" | "MEDIUM" | "LOW",
      "basis": "string"
    }
  ],
  "vendorRiskRanking": [
    {
      "vendorId": "string",
      "vendorName": "string",
      "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      "score": number,
      "factors": ["string"]
    }
  ]
}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\n${prompt}` }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        }),
      });

      if (!response.ok) {
        console.warn(`[GeminiProvider] API HTTP error: ${response.status}`);
        return null;
      }

      const resData = await response.json();
      const rawText = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) return null;

      const parsed = JSON.parse(rawText) as AiComplianceAnalysis;
      if (!parsed.summary || !Array.isArray(parsed.insights)) return null;

      return parsed;
    } catch (err) {
      console.warn('[GeminiProvider] Error generating AI analysis, using fallback:', err);
      return null;
    }
  }

  async queryCompliance(context: RawComplianceContext, query: string): Promise<AskZuogResponse | null> {
    if (!this.isAvailable()) return null;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

      const prompt = `You are "Ask ZUOG", the compliance intelligence assistant. Answer the user question based strictly on this database context:
${JSON.stringify(context, null, 2)}

User Question: "${query}"

Respond with JSON:
{
  "query": "${query}",
  "answer": "Concise factual answer with clear numbers and supplier names.",
  "confidence": "HIGH",
  "evidence": [{ "title": "string", "detail": "string", "link": "/vendors/id" }],
  "relatedMetrics": [{ "label": "string", "value": "string or number" }],
  "suggestedQuestions": ["string", "string"]
}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
        }),
      });

      if (!response.ok) return null;
      const resData = await response.json();
      const rawText = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) return null;

      return JSON.parse(rawText) as AskZuogResponse;
    } catch (err) {
      console.warn('[GeminiProvider] Error answering query, using fallback:', err);
      return null;
    }
  }
}
