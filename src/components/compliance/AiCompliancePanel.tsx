'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  TrendingUp,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AiComplianceAnalysis, AiInsight } from '@/types';
import { AskZuogResponse } from '@/lib/ai/types';

export function AiCompliancePanel({
  initialAnalysis,
}: {
  initialAnalysis?: AiComplianceAnalysis | null;
}) {
  const [analysis, setAnalysis] = useState<AiComplianceAnalysis | null>(initialAnalysis || null);
  const [isLoading, setIsLoading] = useState(!initialAnalysis);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

  // Ask ZUOG state
  const [askQuery, setAskQuery] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [askResult, setAskResult] = useState<AskZuogResponse | null>(null);

  // Fetch or refresh analysis
  const fetchAnalysis = async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await fetch(`/api/ai/insights${refresh ? '?refresh=true' : ''}`);
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data.analysis);
      }
    } catch (err) {
      console.warn('Failed to fetch AI compliance analysis:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!initialAnalysis) {
      fetchAnalysis();
    }
  }, [initialAnalysis]);

  // Submit Ask ZUOG query
  const handleAskZuog = async (queryText?: string) => {
    const q = (queryText || askQuery).trim();
    if (!q) return;

    setIsAsking(true);
    setAskQuery(q);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      if (res.ok) {
        const data = await res.json();
        setAskResult(data.response);
      }
    } catch (err) {
      console.warn('Ask ZUOG error:', err);
    } finally {
      setIsAsking(false);
    }
  };

  // Insufficient Data State
  if (analysis?.riskLevel === 'INSUFFICIENT_DATA') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0B1E3B]/5 text-[#0B1E3B] flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-[#00A878]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0B1E3B]">AI Compliance Intelligence</h3>
              <p className="text-[11px] text-slate-500">Deterministic risk scoring and predictive pattern forecasting.</p>
            </div>
          </div>
          <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded border border-slate-200">
            INSUFFICIENT DATA
          </span>
        </div>

        <div className="py-8 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6 text-slate-400" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">Not enough compliance history yet</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Add suppliers and verify statutory documents to unlock automated risk scoring, renewal pattern analysis, and audit predictions.
          </p>
          <div className="pt-2">
            <Link href="/vendors">
              <Button size="sm">+ Add First Supplier</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const riskBadgeColor =
    analysis?.riskLevel === 'CRITICAL'
      ? 'bg-red-50 text-red-700 border-red-200'
      : analysis?.riskLevel === 'HIGH'
      ? 'bg-amber-50 text-amber-800 border-amber-200'
      : analysis?.riskLevel === 'MEDIUM'
      ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
      : 'bg-emerald-50 text-emerald-800 border-emerald-200';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0B1E3B]/5 text-[#0B1E3B] flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4 text-[#00A878]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#0B1E3B]">AI Compliance Intelligence</h3>
              <span className="text-[10px] font-semibold bg-teal-50 text-teal-800 px-2 py-0.5 rounded border border-teal-200">
                Live Evidence Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Deterministic risk scoring and predictive pattern forecasting.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-2.5 py-1 rounded text-xs font-bold border uppercase tracking-wider ${riskBadgeColor}`}>
            Risk: {analysis?.riskLevel || 'EVALUATING'}
          </div>

          <Button
            size="sm"
            variant="secondary"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
            isLoading={isRefreshing}
            onClick={() => fetchAnalysis(true)}
            title="Refresh AI analysis against latest Neon records"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Executive Summary Card */}
      {analysis?.summary && (
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-3">
          <Info className="w-4 h-4 text-[#0B1E3B] shrink-0 mt-0.5" />
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            {analysis.summary}
          </p>
        </div>
      )}

      {/* Structured Insights Grid */}
      {analysis?.insights && analysis.insights.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Prioritized Compliance Insights
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {analysis.insights.map((ins) => {
              const isExpanded = expandedInsight === ins.id;
              const borderAccent =
                ins.severity === 'critical'
                  ? 'border-red-200 hover:border-red-300 bg-red-50/10'
                  : ins.severity === 'warning'
                  ? 'border-amber-200 hover:border-amber-300 bg-amber-50/10'
                  : 'border-slate-200 hover:border-slate-300 bg-white';

              return (
                <div
                  key={ins.id}
                  className={`p-4 rounded-lg border transition-all space-y-2.5 ${borderAccent}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        ins.type === 'attention_required'
                          ? 'bg-red-100 text-red-800'
                          : ins.type === 'risk_pattern'
                          ? 'bg-amber-100 text-amber-800'
                          : ins.type === 'priority'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {ins.type.replace('_', ' ')}
                    </span>

                    {ins.evidence && ins.evidence.length > 0 && (
                      <button
                        onClick={() => setExpandedInsight(isExpanded ? null : ins.id)}
                        className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <span>{isExpanded ? 'Hide Evidence' : `Evidence (${ins.evidence.length})`}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-slate-900">{ins.title}</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{ins.description}</p>

                  {/* Expandable Evidence Lines */}
                  {isExpanded && ins.evidence && (
                    <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-[11px] space-y-1.5 animate-in fade-in">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Database Evidence:</div>
                      {ins.evidence.map((ev, i) => (
                        <div key={i} className="flex items-center justify-between text-slate-700">
                          <span className="font-semibold">{ev.vendorName}</span>
                          <span className="text-slate-500 font-mono text-[10px] truncate max-w-[200px]">{ev.detail}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 text-[11px] text-[#0B1E3B] font-medium flex items-center gap-1">
                    <ArrowRight className="w-3 h-3 text-[#00A878]" />
                    <span>Action: {ins.recommendedAction}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Predictions Section */}
      {analysis?.predictions && analysis.predictions.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#00A878]" />
            <span>Forward Expiry &amp; Audit Forecast</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {analysis.predictions.map((pred, i) => (
              <div key={i} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{pred.target}</span>
                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                    {pred.confidence} Confidence
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">{pred.predictionText}</p>
                <div className="text-[10px] text-slate-400 font-mono pt-1">
                  Basis: {pred.basis}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 15. "ASK ZUOG" NATURAL LANGUAGE COMPLIANCE QUERY INTERFACE */}
      <div className="pt-4 border-t border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B1E3B]">
            <HelpCircle className="w-4 h-4 text-[#00A878]" />
            <span>Ask ZUOG — Instant Statutory Search</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Grounded strictly in Neon PostgreSQL</span>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={askQuery}
              onChange={(e) => setAskQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskZuog()}
              placeholder="e.g. Which vendors need attention this week? or Which documents expire next month?"
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1E3B] bg-slate-50/50 focus:bg-white text-slate-900"
            />
          </div>
          <Button
            size="sm"
            isLoading={isAsking}
            onClick={() => handleAskZuog()}
          >
            Ask
          </Button>
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="text-slate-400">Suggested:</span>
          {[
            'Which vendors need attention this week?',
            'Which documents expire next month?',
            'Which vendors have the highest compliance risk?',
            'How many documents are currently expired?',
          ].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleAskZuog(suggestion)}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer text-[10px]"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Query Result Card */}
        {askResult && (
          <div className="p-4 rounded-lg bg-teal-50/30 border border-teal-200 text-xs space-y-3 animate-in fade-in">
            <div className="flex items-start justify-between gap-2">
              <span className="text-[10px] uppercase font-bold text-teal-800">Verified Answer</span>
              <span className="text-[10px] text-slate-400 font-mono">{askResult.confidence} CONFIDENCE</span>
            </div>

            <p className="text-sm font-semibold text-slate-900 leading-relaxed">
              {askResult.answer}
            </p>

            {/* Metrics */}
            {askResult.relatedMetrics && askResult.relatedMetrics.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-2 border-t border-teal-100">
                {askResult.relatedMetrics.map((m, idx) => (
                  <div key={idx} className="bg-white px-2.5 py-1 rounded border border-teal-200 text-[11px]">
                    <span className="text-slate-500 mr-1.5">{m.label}:</span>
                    <span className="font-bold text-slate-900">{m.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Evidence items */}
            {askResult.evidence && askResult.evidence.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-teal-100">
                <div className="text-[10px] uppercase font-bold text-slate-400">Linked Records:</div>
                {askResult.evidence.map((ev, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px] bg-white p-2 rounded border border-slate-100">
                    <span className="font-semibold text-slate-800">{ev.title}</span>
                    <span className="text-slate-500 text-[10px]">{ev.detail}</span>
                    {ev.link && (
                      <Link href={ev.link} className="text-[#0B1E3B] hover:text-[#00A878]">
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
