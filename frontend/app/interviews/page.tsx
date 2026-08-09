'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { CalendarDays, Clock, UserCheck, Video, Award } from 'lucide-react';

export default function InterviewsPage() {
  const { data: interviews, isLoading } = useQuery({
    queryKey: ['interviews'],
    queryFn: api.getInterviews,
  });

  const sampleInterviews = [
    {
      id: 'int-001',
      round_name: 'Technical Round 1 — Architecture & K8s',
      scheduled_at: '2026-08-11T14:00:00Z',
      duration_minutes: 60,
      interviewer_name: 'Rahul Verma (Principal SRE)',
      meeting_url: 'https://meet.google.com/abc-defg-hij',
      status: 'SCHEDULED',
      notes: 'Focus on Kubernetes network policies, ingress controllers, and Terraform state management.'
    },
    {
      id: 'int-002',
      round_name: 'HR Screening Call',
      scheduled_at: '2026-08-08T11:00:00Z',
      duration_minutes: 30,
      interviewer_name: 'Priya Sharma',
      meeting_url: 'https://zoom.us/j/9918237',
      status: 'COMPLETED',
      notes: 'Discussed salary expectations ($120k) and notice period (30 days).'
    }
  ];

  const displayList = (interviews && interviews.length > 0) ? interviews : sampleInterviews;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Centralized Interview Tracker</h1>
          <p className="text-xs text-gray-400">Track all technical rounds, recruiter screens, and interview prep in one workspace</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayList.map((item) => (
          <div key={item.id} className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  {item.status}
                </span>
                <h3 className="text-base font-bold text-white mt-1">{item.round_name}</h3>
              </div>
            </div>

            <div className="space-y-2 text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-3.5 h-3.5 text-gray-500" />
                <span>{new Date(item.scheduled_at).toLocaleString()} ({item.duration_minutes} mins)</span>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className="w-3.5 h-3.5 text-gray-500" />
                <span>Interviewer: {item.interviewer_name || 'Hiring Panel'}</span>
              </div>
            </div>

            {item.notes && (
              <p className="text-xs text-gray-400 bg-gray-900/60 p-3 rounded-xl border border-gray-800">
                💡 <strong className="text-gray-300">Prep Note:</strong> {item.notes}
              </p>
            )}

            {item.meeting_url && (
              <a
                href={item.meeting_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition"
              >
                <Video className="w-4 h-4" />
                <span>Join Video Meeting</span>
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
