'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import KanbanBoard from '../../components/KanbanBoard';
import { ApplicationStage } from '../../types';
import { Kanban, List, Plus, Sparkles } from 'lucide-react';

export default function ApplicationsPage() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  const { data: applications, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => api.getApplications(),
  });

  const updateStageMutation = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: ApplicationStage }) =>
      api.updateApplicationStage(id, stage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  const handleStageChange = (id: string, newStage: ApplicationStage) => {
    updateStageMutation.mutate({ id, stage: newStage });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Job Search Application CRM</h1>
          <p className="text-xs text-gray-400">Salesforce-style CRM pipeline for candidate applications, recruiter calls, & interviews</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-1 rounded-xl bg-gray-900 border border-gray-800 flex items-center gap-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'kanban' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main View */}
      {isLoading ? (
        <div className="h-64 glass-panel rounded-2xl animate-pulse" />
      ) : viewMode === 'kanban' ? (
        <KanbanBoard applications={applications || []} onStageChange={handleStageChange} />
      ) : (
        <div className="glass-panel rounded-2xl border border-gray-800 overflow-hidden">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-900/80 text-gray-400 font-semibold uppercase tracking-wider border-b border-gray-800">
              <tr>
                <th className="p-4">Job Title</th>
                <th className="p-4">Company</th>
                <th className="p-4">Match %</th>
                <th className="p-4">Stage</th>
                <th className="p-4">Applied Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {(applications || []).map((app) => (
                <tr key={app.id} className="hover:bg-gray-900/40 transition">
                  <td className="p-4 font-bold text-white">{app.job_title}</td>
                  <td className="p-4">{app.company_name}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {app.match_score || 92}%
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/30">
                      {app.stage}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400">
                    {app.applied_date ? new Date(app.applied_date).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
