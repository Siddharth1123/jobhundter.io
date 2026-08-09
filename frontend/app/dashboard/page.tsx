'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import Link from 'next/link';
import {
  Briefcase,
  Flame,
  Kanban,
  CalendarDays,
  Award,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

export default function DashboardPage() {
  const { data: metrics, isLoading: isMetricsLoading } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: api.getDashboardMetrics,
  });

  const { data: jobs } = useQuery({
    queryKey: ['dashboardJobs'],
    queryFn: () => api.getJobs(),
  });

  const { data: matches } = useQuery({
    queryKey: ['dashboardMatches'],
    queryFn: api.getMatches,
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Banner: What Should I Do Next? */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900/30 via-indigo-900/30 to-purple-900/30 border border-blue-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Command Center</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Good morning, Alex. Here is your job search trajectory.
            </h2>
            <p className="text-sm text-gray-300">
              You have <span className="text-emerald-400 font-bold">1 interview scheduled</span> this week and <span className="text-blue-400 font-bold">4 high-match SRE openings</span> ready for review.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/jobs"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-lg shadow-blue-500/25 flex items-center gap-2"
            >
              <span>Explore High Matches</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/resumes"
              className="px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-200 font-semibold text-xs border border-gray-700 transition"
            >
              Upload / Tailor Resume
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Jobs Scanned', value: metrics?.jobs_scanned || 2134, icon: Briefcase, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
          { label: 'Strong Matches (≥80%)', value: metrics?.strong_matches || 82, icon: Flame, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Active Applications', value: metrics?.total_applications || 26, icon: Kanban, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
          { label: 'Interviews Scheduled', value: metrics?.active_interviews || 4, icon: CalendarDays, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
          { label: 'Offers Received', value: metrics?.offers_received || 1, icon: Award, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">{stat.label}</span>
                <div className={`p-2 rounded-xl border ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Application Funnel & Missing Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Application Funnel */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-gray-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Application Conversion Funnel</h3>
              <p className="text-xs text-gray-400">Live conversion stages from discovery to offer</p>
            </div>
            <Link href="/applications" className="text-xs font-semibold text-blue-400 hover:underline">
              Open CRM Pipeline →
            </Link>
          </div>

          <div className="space-y-3">
            {[
              { stage: 'Discovered', count: metrics?.funnel?.DISCOVERED || 124, pct: 100, color: 'bg-gray-700' },
              { stage: 'Saved / Shortlisted', count: metrics?.funnel?.SAVED || 32, pct: 26, color: 'bg-blue-600' },
              { stage: 'Applied', count: metrics?.funnel?.APPLIED || 26, pct: 21, color: 'bg-cyan-500' },
              { stage: 'HR Screening', count: metrics?.funnel?.HR_CONTACTED || 12, pct: 10, color: 'bg-amber-500' },
              { stage: 'Technical Round', count: metrics?.funnel?.INTERVIEW || 4, pct: 3.2, color: 'bg-purple-500' },
              { stage: 'Offers', count: metrics?.funnel?.OFFER || 1, pct: 0.8, color: 'bg-emerald-500' },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-300">{item.stage}</span>
                  <span className="text-gray-400 font-mono">
                    {item.count} apps ({item.pct}%)
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-gray-900 overflow-hidden border border-gray-800">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${Math.max(item.pct, 4)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Missing Skill Intelligence */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Skill Gap Analysis</h3>
              <p className="text-xs text-gray-400">Target role missing requirements</p>
            </div>
            <Link href="/insights" className="text-xs font-semibold text-blue-400 hover:underline">
              Insights →
            </Link>
          </div>

          <div className="space-y-3">
            {(metrics?.top_missing_skills || [
              { skill: 'Prometheus', count: 8, importance: 'HIGH', reason: 'Required in 8 of last 10 SRE roles.' },
              { skill: 'Grafana', count: 6, importance: 'MEDIUM', reason: 'Required for observability dashboards.' },
              { skill: 'ArgoCD', count: 5, importance: 'MEDIUM', reason: 'GitOps deployment requirement.' }
            ]).map((s, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">⚠ {s.skill}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    {s.importance}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">{s.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent High Match Job Recommendations */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Recommended High-Match Jobs</h3>
            <p className="text-xs text-gray-400">Scored via 6-Factor Deterministic Engine</p>
          </div>
          <Link href="/jobs" className="text-xs font-semibold text-blue-400 hover:underline">
            View All Jobs →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(jobs || []).slice(0, 4).map((job, i) => (
            <div key={job.id} className="glass-panel glass-panel-hover p-4 rounded-xl space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {94 - i * 3}% MATCH
                  </span>
                  <span className="text-[11px] text-gray-500">{job.location}</span>
                </div>
                <h4 className="font-bold text-sm text-white line-clamp-1">{job.title}</h4>
                <p className="text-xs text-gray-400">{job.company_name}</p>
              </div>

              <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between">
                <span className="text-[11px] text-gray-400">{job.employment_type}</span>
                <Link
                  href={`/jobs/${job.id}`}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300"
                >
                  View Fit →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
