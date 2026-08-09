'use client';

import React from 'react';
import { Application, ApplicationStage } from '../types';
import { Building2, Calendar, Flame, ChevronRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface KanbanBoardProps {
  applications: Application[];
  onStageChange: (id: string, newStage: ApplicationStage) => void;
}

const STAGES: { id: ApplicationStage; title: string; color: string }[] = [
  { id: 'DISCOVERED', title: 'Discovered', color: 'border-gray-700 text-gray-400' },
  { id: 'SAVED', title: 'Saved', color: 'border-blue-500/40 text-blue-400' },
  { id: 'APPLIED', title: 'Applied', color: 'border-cyan-500/40 text-cyan-400' },
  { id: 'HR_CONTACTED', title: 'HR Contacted', color: 'border-amber-500/40 text-amber-400' },
  { id: 'INTERVIEW_SCHEDULED', title: 'Interview Scheduled', color: 'border-purple-500/40 text-purple-400' },
  { id: 'TECHNICAL_ROUND', title: 'Technical Round', color: 'border-indigo-500/40 text-indigo-400' },
  { id: 'OFFER', title: 'Offer Received', color: 'border-emerald-500/40 text-emerald-400' },
];

export default function KanbanBoard({ applications, onStageChange }: KanbanBoardProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-2">
      {STAGES.map((col) => {
        const stageApps = applications.filter((a) => a.stage === col.id);
        return (
          <div key={col.id} className="w-80 min-w-[320px] flex-shrink-0 flex flex-col gap-3">
            {/* Column Header */}
            <div className={`flex items-center justify-between p-3 rounded-xl bg-gray-900/60 border ${col.color}`}>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs uppercase tracking-wider">{col.title}</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-gray-800 text-gray-300">
                  {stageApps.length}
                </span>
              </div>
            </div>

            {/* Column Body Cards */}
            <div className="flex flex-col gap-3 min-h-[500px] p-2 rounded-2xl bg-gray-950/40 border border-gray-800/40">
              {stageApps.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-xs text-gray-600 border border-dashed border-gray-800/60 rounded-xl">
                  No applications in stage
                </div>
              ) : (
                stageApps.map((app) => (
                  <div
                    key={app.id}
                    className="glass-panel glass-panel-hover p-4 rounded-xl space-y-3 relative group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <Link
                          href={`/applications/${app.id}`}
                          className="font-bold text-sm text-white hover:text-blue-400 transition"
                        >
                          {app.job_title}
                        </Link>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-gray-500" />
                          <span>{app.company_name}</span>
                        </div>
                      </div>

                      {app.match_score ? (
                        <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {app.match_score}%
                        </span>
                      ) : null}
                    </div>

                    {/* Meta info */}
                    <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-gray-800/60">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-500" />
                        <span>{app.applied_date ? new Date(app.applied_date).toLocaleDateString() : 'Draft'}</span>
                      </div>

                      {/* Quick stage transition button */}
                      <select
                        value={app.stage}
                        onChange={(e) => onStageChange(app.id, e.target.value as ApplicationStage)}
                        className="bg-gray-900 text-gray-300 border border-gray-700 text-[11px] rounded px-1.5 py-0.5 focus:outline-none focus:border-blue-500"
                      >
                        {STAGES.map((s) => (
                          <option key={s.id} value={s.id}>
                            Move to: {s.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
