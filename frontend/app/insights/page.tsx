'use client';

import React from 'react';
import { TrendingUp, AlertTriangle, BookOpen, CheckCircle2, Zap } from 'lucide-react';

export default function InsightsPage() {
  const skillGaps = [
    {
      skill: 'Prometheus',
      importance: 'HIGH',
      occurrences: '8 of 10 matched SRE jobs',
      reason: 'Prometheus alerts & metrics collection is required for on-call SRE roles.',
      learning: 'Week 1: Prometheus architecture, PromQL queries, Alertmanager configuration.'
    },
    {
      skill: 'Grafana',
      importance: 'MEDIUM',
      occurrences: '6 of 10 matched SRE jobs',
      reason: 'Grafana dashboard creation for Kubernetes cluster visualization.',
      learning: 'Week 2: Custom dashboard panels, Datasource provisioning, Loki logging.'
    },
    {
      skill: 'ArgoCD',
      importance: 'MEDIUM',
      occurrences: '5 of 10 matched SRE jobs',
      reason: 'GitOps declarative continuous deployment paradigm.',
      learning: 'Week 3: Application manifests, sync strategies, multi-cluster deployments.'
    }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Career Insights & Skill Gap Intelligence</h1>
        <p className="text-xs text-gray-400">Market technology demand signals and personalized skill acquisition roadmaps</p>
      </div>

      {/* Market Demand Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Most Requested Tech', value: 'Kubernetes & AWS', detail: 'Appears in 95% of target roles' },
          { label: 'Fastest Growing Skill', value: 'ArgoCD / GitOps', detail: '+45% demand quarter over quarter' },
          { label: 'Avg Match Competitiveness', value: 'Top 8%', detail: 'Strong background in cloud & SRE' },
        ].map((item, idx) => (
          <div key={idx} className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-1">
            <span className="text-xs text-gray-400 font-medium">{item.label}</span>
            <p className="text-lg font-bold text-white">{item.value}</p>
            <p className="text-[11px] text-gray-500">{item.detail}</p>
          </div>
        ))}
      </div>

      {/* Skill Gap Cards */}
      <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Target Role Skill Gap Matrix</h3>
            <p className="text-xs text-gray-400">High impact missing requirements identified across matched jobs</p>
          </div>
        </div>

        <div className="space-y-4">
          {skillGaps.map((gap, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-white">{gap.skill}</h4>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase">
                    {gap.importance} IMPORTANCE
                  </span>
                </div>
                <span className="text-xs text-gray-400 font-mono">{gap.occurrences}</span>
              </div>

              <p className="text-xs text-gray-300">{gap.reason}</p>

              <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/20 flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <p className="text-xs text-blue-300">
                  <strong className="text-white">Suggested Learning Roadmap:</strong> {gap.learning}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
