'use client';

import React from 'react';
import { JobMatch } from '../types';
import { CheckCircle2, AlertTriangle, Flame } from 'lucide-react';

interface MatchScoreBadgeProps {
  match: JobMatch;
  compact?: boolean;
}

export default function MatchScoreBadge({ match, compact = false }: MatchScoreBadgeProps) {
  const {
    overall_score,
    skill_score,
    experience_score,
    role_score,
    location_score,
    tool_score,
    education_score,
    matched_skills,
    missing_skills,
    recommendation,
    explanation
  } = match;

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'from-emerald-500 to-teal-400 text-emerald-400 border-emerald-500/30';
    if (score >= 70) return 'from-blue-500 to-cyan-400 text-blue-400 border-blue-500/30';
    if (score >= 50) return 'from-amber-500 to-yellow-400 text-amber-400 border-amber-500/30';
    return 'from-rose-500 to-red-400 text-rose-400 border-rose-500/30';
  };

  if (compact) {
    return (
      <div className={`px-2.5 py-1 rounded-lg bg-gray-900/80 border text-xs font-bold flex items-center gap-1.5 ${getScoreColor(overall_score)}`}>
        <Flame className="w-3.5 h-3.5" />
        <span>{overall_score}% MATCH</span>
      </div>
    );
  }

  const factors = [
    { label: 'Skills Alignment', score: skill_score, max: 40, weight: '40%' },
    { label: 'Experience Level', score: experience_score, max: 20, weight: '20%' },
    { label: 'Role & Title Fit', score: role_score, max: 15, weight: '15%' },
    { label: 'Location & Remote', score: location_score, max: 10, weight: '10%' },
    { label: 'Tools & Tech Stack', score: tool_score, max: 10, weight: '10%' },
    { label: 'Education Required', score: education_score, max: 5, weight: '5%' }
  ];

  return (
    <div className="glass-panel rounded-2xl p-6 border border-gray-800 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getScoreColor(overall_score)} flex flex-col items-center justify-center border shadow-lg`}>
            <span className="text-2xl font-black text-white">{overall_score}%</span>
            <span className="text-[9px] font-semibold text-gray-200 tracking-wider">MATCH</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                {recommendation.replace('_', ' ')}
              </span>
              <span className="text-xs text-gray-400">Deterministic 6-Factor AI Engine</span>
            </div>
            <p className="text-xs text-gray-300 mt-1 max-w-md">{explanation}</p>
          </div>
        </div>
      </div>

      {/* 6-Factor Progress Bars */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Explainable Score Breakdown
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {factors.map((f, i) => {
            const pct = (f.score / f.max) * 100;
            return (
              <div key={i} className="p-3 rounded-xl bg-gray-900/50 border border-gray-800/80">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-gray-300">{f.label}</span>
                  <span className="text-gray-400 font-mono text-[11px]">
                    {f.score}/{f.max} pts ({f.weight})
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Matched vs Missing Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>Matched Skills ({matched_skills.length})</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {matched_skills.map((s, idx) => (
              <span key={idx} className="px-2 py-1 rounded-lg text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                ✓ {s}
              </span>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Missing Skills ({missing_skills.length})</span>
          </div>
          <div className="space-y-1.5 pt-1">
            {missing_skills.map((m, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs bg-amber-500/10 text-amber-300 px-2.5 py-1.5 rounded-lg border border-amber-500/20">
                <span className="font-medium">⚠ {m.skill}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 uppercase">
                  {m.importance}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
