'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../../services/api';
import MatchScoreBadge from '../../../components/MatchScoreBadge';
import {
  Building2, MapPin, DollarSign, Briefcase, ExternalLink,
  Wand2, MessageSquare, CheckCircle2, Bookmark, ArrowLeft, Copy, X
} from 'lucide-react';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showTailorModal, setShowTailorModal] = useState(false);
  const [showOutreachModal, setShowOutreachModal] = useState(false);

  const [tailorResult, setTailorResult] = useState<any>(null);
  const [outreachResult, setOutreachResult] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { data: job, isLoading: isJobLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => api.getJob(id),
    enabled: !!id,
  });

  const { data: match, isLoading: isMatchLoading } = useQuery({
    queryKey: ['jobMatch', id],
    queryFn: () => api.matchJob(id),
    enabled: !!id,
  });

  const tailorMutation = useMutation({
    mutationFn: () => api.tailorResume(id),
    onSuccess: (data) => setTailorResult(data),
  });

  const outreachMutation = useMutation({
    mutationFn: () => api.generateOutreach(id),
    onSuccess: (data) => setOutreachResult(data),
  });

  const applyMutation = useMutation({
    mutationFn: () => api.createApplication(id, 'APPLIED'),
    onSuccess: () => {
      setShowApplyModal(false);
      router.push('/applications');
    },
  });

  const handleApplyClick = () => {
    if (job?.application_url) {
      window.open(job.application_url, '_blank');
    }
    setShowApplyModal(true);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (isJobLoading || isMatchLoading || !job) {
    return (
      <div className="max-w-5xl mx-auto p-8 space-y-6 animate-pulse">
        <div className="h-20 glass-panel rounded-2xl" />
        <div className="h-64 glass-panel rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Navigation */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Jobs</span>
      </button>

      {/* Header Info */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-400 font-semibold">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span>{job.company_name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{job.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 pt-1">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-500" />
                {job.location}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-gray-500" />
                {job.employment_type}
              </span>
              {job.salary_range && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <DollarSign className="w-3.5 h-3.5" />
                    {job.salary_range}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Action Bar Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setShowTailorModal(true);
                if (!tailorResult) tailorMutation.mutate();
              }}
              className="px-4 py-2.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 font-semibold text-xs transition flex items-center gap-2"
            >
              <Wand2 className="w-4 h-4 text-purple-400" />
              <span>Tailor Resume</span>
            </button>

            <button
              onClick={() => {
                setShowOutreachModal(true);
                if (!outreachResult) outreachMutation.mutate();
              }}
              className="px-4 py-2.5 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 font-semibold text-xs transition flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>Generate Outreach</span>
            </button>

            <button
              onClick={handleApplyClick}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-blue-500/25 flex items-center gap-2"
            >
              <span>Apply Now</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Match Score Visual Card */}
      {match && <MatchScoreBadge match={match} />}

      {/* Job Description */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <h3 className="text-base font-bold text-white">Job Description & Responsibilities</h3>
        <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-line border-t border-gray-800/80 pt-4">
          {job.description}
        </div>
      </div>

      {/* Modal 1: Apply Redirect Confirmation */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-gray-800 max-w-md w-full space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Application Confirmation</h3>
              <button onClick={() => setShowApplyModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              We redirected you to official application portal for <strong className="text-white">{job.company_name}</strong>.
            </p>

            <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/30 space-y-1">
              <p className="text-xs font-semibold text-blue-300">Did you submit the application?</p>
              <p className="text-[11px] text-gray-400">Clicking yes will automatically create a CRM tracking record on your Kanban pipeline.</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => applyMutation.mutate()}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
              >
                Yes, Mark as Applied
              </button>
              <button
                onClick={() => setShowApplyModal(false)}
                className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 font-semibold text-xs hover:bg-gray-700 transition"
              >
                Not Yet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Resume Tailoring */}
      {showTailorModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-gray-800 max-w-4xl w-full max-h-[85vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">AI Resume Tailoring (Non-Fabricating)</h3>
              </div>
              <button onClick={() => setShowTailorModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {tailorMutation.isPending ? (
              <div className="h-48 flex items-center justify-center text-xs text-purple-400">
                Optimizing keyword density & ATS alignment...
              </div>
            ) : tailorResult ? (
              <div className="space-y-6">
                {/* ATS Score Improvement Header */}
                <div className="flex items-center justify-around p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30">
                  <div className="text-center">
                    <p className="text-xs text-gray-400">ATS Score Before</p>
                    <p className="text-xl font-bold text-amber-400">{tailorResult.ats_score_before}/100</p>
                  </div>
                  <div className="text-purple-400 font-bold text-sm">➔</div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">ATS Score After</p>
                    <p className="text-xl font-bold text-emerald-400">{tailorResult.ats_score_after}/100</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Key Optimizations Made</h4>
                  <ul className="list-disc list-inside text-xs text-gray-300 space-y-1">
                    {tailorResult.key_changes?.map((c: string, idx: number) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Tailored Markdown Resume</h4>
                    <button
                      onClick={() => copyToClipboard(tailorResult.tailored_resume, 'resume')}
                      className="px-3 py-1 rounded-lg bg-purple-600/30 text-purple-300 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedField === 'resume' ? 'Copied!' : 'Copy Resume'}</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl bg-gray-950 border border-gray-800 text-xs text-gray-300 whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">
                    {tailorResult.tailored_resume}
                  </pre>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Modal 3: Recruiter Outreach */}
      {showOutreachModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-gray-800 max-w-3xl w-full max-h-[85vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">AI Recruiter Outreach Suite</h3>
              </div>
              <button onClick={() => setShowOutreachModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {outreachMutation.isPending ? (
              <div className="h-48 flex items-center justify-center text-xs text-indigo-400">
                Crafting recruiter outreach messages...
              </div>
            ) : outreachResult ? (
              <div className="space-y-6">
                {[
                  { label: 'LinkedIn Connection Note', text: outreachResult.linkedin_message, key: 'linkedin' },
                  { label: 'Recruiter Direct Email', text: outreachResult.recruiter_email, key: 'email' },
                  { label: 'Follow-Up Email (5 Days)', text: outreachResult.follow_up_email, key: 'followup' },
                  { label: 'Post-Interview Thank You', text: outreachResult.thank_you_email, key: 'thankyou' },
                ].map((item) => (
                  <div key={item.key} className="space-y-2 p-4 rounded-2xl bg-gray-900/60 border border-gray-800">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">{item.label}</h4>
                      <button
                        onClick={() => copyToClipboard(item.text, item.key)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600/30 text-indigo-300 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedField === item.key ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-xs text-gray-300 whitespace-pre-line font-mono bg-gray-950 p-3 rounded-xl border border-gray-800">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
