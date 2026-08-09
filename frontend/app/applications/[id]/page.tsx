'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../services/api';
import {
  Building2, Calendar, PhoneCall, Mail, FileText, Plus,
  CheckCircle2, Clock, MessageSquare, ArrowLeft, Send
} from 'lucide-react';

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params?.id as string;

  const [activeTab, setActiveTab] = useState<'overview' | 'activities' | 'notes' | 'interviews' | 'coach'>('overview');
  
  // Form states
  const [activityType, setActivityType] = useState('PHONE_CALL');
  const [activityTitle, setActivityTitle] = useState('');
  const [activityDesc, setActivityDesc] = useState('');
  
  const [noteContent, setNoteContent] = useState('');

  const [roundName, setRoundName] = useState('Technical Round 1');
  const [interviewer, setInterviewer] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');

  const { data: application } = useQuery({
    queryKey: ['application', id],
    queryFn: () => api.getApplication(id),
    enabled: !!id,
  });

  const { data: activities } = useQuery({
    queryKey: ['activities', id],
    queryFn: () => api.getActivities(id),
    enabled: !!id,
  });

  const { data: notes } = useQuery({
    queryKey: ['notes', id],
    queryFn: () => api.getNotes(id),
    enabled: !!id,
  });

  const activityMutation = useMutation({
    mutationFn: () => api.createActivity(id, activityType, activityTitle, activityDesc),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', id] });
      setActivityTitle('');
      setActivityDesc('');
    },
  });

  const noteMutation = useMutation({
    mutationFn: () => api.createNote(id, noteContent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', id] });
      setNoteContent('');
    },
  });

  const interviewMutation = useMutation({
    mutationFn: () => api.createInterview(id, roundName, scheduledAt || new Date().toISOString(), interviewer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      queryClient.invalidateQueries({ queryKey: ['application', id] });
      setInterviewer('');
    },
  });

  if (!application) {
    return (
      <div className="max-w-5xl mx-auto p-8 space-y-6 animate-pulse">
        <div className="h-20 glass-panel rounded-2xl" />
        <div className="h-64 glass-panel rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Application Pipeline</span>
      </button>

      {/* Application Workspace Header */}
      <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold text-gray-400">{application.company_name}</span>
            </div>
            <h1 className="text-2xl font-bold text-white">{application.job_title}</h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-xs font-bold rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 uppercase tracking-wider">
              {application.stage}
            </span>
            <span className="px-3 py-1 text-xs font-bold rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {application.match_score || 94}% MATCH
            </span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 pt-4 border-t border-gray-800/80 overflow-x-auto text-xs">
          {[
            { id: 'overview', label: 'Overview & Timeline' },
            { id: 'activities', label: `Activity Log (${activities?.length || 0})` },
            { id: 'notes', label: `Notes (${notes?.length || 0})` },
            { id: 'interviews', label: 'Interview Rounds' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Overview & Timeline */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 glass-panel p-6 rounded-2xl border border-gray-800 space-y-6">
            <h3 className="text-base font-bold text-white">Application Journey Timeline</h3>
            <div className="relative pl-6 border-l-2 border-blue-500/30 space-y-6">
              {[
                { title: 'Job Discovered & Saved', date: '2026-08-08', status: 'Completed' },
                { title: 'Resume Tailored & ATS Checked', date: '2026-08-08', status: 'Completed' },
                { title: 'Application Submitted via Official URL', date: application.applied_date || '2026-08-08', status: 'Completed' },
                { title: 'HR Screening Call Scheduled', date: '2026-08-11', status: 'Upcoming' },
                { title: 'Technical Round 1', date: 'Pending', status: 'Future' },
              ].map((step, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-[#090d16]" />
                  <div>
                    <h4 className="text-xs font-bold text-white">{step.title}</h4>
                    <p className="text-[11px] text-gray-400">{step.date} • {step.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
            <h3 className="text-base font-bold text-white">Recruiter Contact</h3>
            <div className="space-y-3 text-xs text-gray-300">
              <div>
                <p className="text-[11px] text-gray-500 uppercase font-semibold">Contact Person</p>
                <p className="font-bold text-white">{application.recruiter_name || 'Priya Sharma (Tech Recruiter)'}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500 uppercase font-semibold">Email</p>
                <p className="font-mono text-blue-400">{application.recruiter_email || 'priya.s@cloudscalesystems.example.com'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Activities */}
      {activeTab === 'activities' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
            <h3 className="text-base font-bold text-white">Log New CRM Activity</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className="bg-gray-900 border border-gray-800 text-xs text-white rounded-xl p-2.5 outline-none"
              >
                <option value="PHONE_CALL">Phone Call</option>
                <option value="EMAIL">Email</option>
                <option value="LINKEDIN_MESSAGE">LinkedIn Message</option>
                <option value="INTERVIEW">Interview Round</option>
                <option value="NOTE">General Activity</option>
              </select>

              <input
                type="text"
                placeholder="Title e.g. 'HR Screening Call regarding notice period'"
                value={activityTitle}
                onChange={(e) => setActivityTitle(e.target.value)}
                className="bg-gray-900 border border-gray-800 text-xs text-white rounded-xl p-2.5 outline-none md:col-span-2"
              />
            </div>

            <textarea
              placeholder="Description & details..."
              value={activityDesc}
              onChange={(e) => setActivityDesc(e.target.value)}
              className="bg-gray-900 border border-gray-800 text-xs text-white rounded-xl p-2.5 outline-none w-full h-20"
            />

            <button
              onClick={() => activityMutation.mutate()}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition"
            >
              Log Activity
            </button>
          </div>

          {/* Activity Feed */}
          <div className="space-y-3">
            {(activities || []).map((act) => (
              <div key={act.id} className="glass-panel p-4 rounded-xl border border-gray-800 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 uppercase">
                      {act.activity_type}
                    </span>
                    <h4 className="font-bold text-xs text-white">{act.title}</h4>
                  </div>
                  {act.description && <p className="text-xs text-gray-300 mt-1">{act.description}</p>}
                </div>
                <span className="text-[11px] text-gray-500">{new Date(act.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Notes */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
            <h3 className="text-base font-bold text-white">Add Candidate Note</h3>
            <textarea
              placeholder="Add note e.g. 'HR mentioned the team relies heavily on EKS and Terraform Cloud...'"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="bg-gray-900 border border-gray-800 text-xs text-white rounded-xl p-3 outline-none w-full h-24"
            />
            <button
              onClick={() => noteMutation.mutate()}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition"
            >
              Save Note
            </button>
          </div>

          <div className="space-y-3">
            {(notes || []).map((n) => (
              <div key={n.id} className="glass-panel p-4 rounded-xl border border-gray-800 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-400">{n.author_name}</span>
                  <span className="text-gray-500 text-[11px]">{new Date(n.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-gray-300">{n.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Interviews */}
      {activeTab === 'interviews' && (
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
          <h3 className="text-base font-bold text-white">Schedule Interview Round</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Round Name e.g. Technical Round 1"
              value={roundName}
              onChange={(e) => setRoundName(e.target.value)}
              className="bg-gray-900 border border-gray-800 text-xs text-white rounded-xl p-2.5 outline-none"
            />
            <input
              type="text"
              placeholder="Interviewer Name"
              value={interviewer}
              onChange={(e) => setInterviewer(e.target.value)}
              className="bg-gray-900 border border-gray-800 text-xs text-white rounded-xl p-2.5 outline-none"
            />
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="bg-gray-900 border border-gray-800 text-xs text-white rounded-xl p-2.5 outline-none"
            />
          </div>

          <button
            onClick={() => interviewMutation.mutate()}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
          >
            Create Interview Round
          </button>
        </div>
      )}
    </div>
  );
}
