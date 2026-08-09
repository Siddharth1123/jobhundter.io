'use client';

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { UploadCloud, FileText, CheckCircle2, Sparkles, User, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ResumesPage() {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawTextPaste, setRawTextPaste] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: api.getProfile,
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      setErrorMessage(null);
      if (selectedFile) {
        return api.uploadResume(selectedFile);
      } else if (rawTextPaste.trim()) {
        const file = new File([rawTextPaste], 'Siddharth-SRE-DevOps-resume.txt', { type: 'text/plain' });
        return api.uploadResume(file);
      }
      throw new Error('Please select a PDF file or paste resume text first.');
    },
    onSuccess: () => {
      setUploadSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      setSelectedFile(null);
      setRawTextPaste('');
      setTimeout(() => setUploadSuccess(false), 5000);
    },
    onError: (err: any) => {
      setErrorMessage(err?.message || 'Resume upload failed. Please try again.');
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMessage(null);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Resume Intelligence & Extraction</h1>
        <p className="text-xs text-gray-400">Upload your PDF resume or paste text to extract an AI candidate profile with zero fabrication</p>
      </div>

      <div className="glass-panel p-8 rounded-3xl border-2 border-dashed border-gray-700/80 hover:border-blue-500/50 transition text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/30 mx-auto flex items-center justify-center">
          <UploadCloud className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">Upload PDF Resume or Paste Resume Text</h3>
          <p className="text-xs text-gray-400">Drag & drop your resume PDF file or paste text below</p>
        </div>

        <input
          type="file"
          accept=".pdf,.txt"
          onChange={handleFileChange}
          className="hidden"
          id="resume-file-input"
        />

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <label
            htmlFor="resume-file-input"
            className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-xs border border-gray-700 cursor-pointer transition"
          >
            Select PDF File
          </label>

          <span className="text-xs text-gray-500">or</span>

          <button
            onClick={() => uploadMutation.mutate()}
            disabled={uploadMutation.isPending || (!selectedFile && !rawTextPaste.trim())}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-lg shadow-blue-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{uploadMutation.isPending ? 'Extracting AI Profile...' : 'Extract & Sync Candidate Profile'}</span>
          </button>
        </div>

        {selectedFile && (
          <p className="text-xs text-blue-400 font-mono">Selected File: {selectedFile.name}</p>
        )}

        <div className="pt-3 max-w-2xl mx-auto">
          <textarea
            placeholder="Or paste raw resume text here..."
            value={rawTextPaste}
            onChange={(e) => setRawTextPaste(e.target.value)}
            className="w-full h-24 bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500 font-mono"
          />
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMessage}</span>
          </div>
        )}

        {uploadSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Resume parsed & Candidate Profile synchronized across entire app!</span>
          </div>
        )}
      </div>

      {profile && (
        <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                AM
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{profile.headline || 'Active Candidate Profile'}</h3>
                <p className="text-xs text-gray-400">{profile.location || 'Location Not Set'} • {profile.years_of_experience} Yrs Experience</p>
              </div>
            </div>

            <Link
              href="/jobs"
              className="px-4 py-2 rounded-xl bg-blue-600/20 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 hover:bg-blue-600/30 transition"
            >
              <span>Auto-Match Jobs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Extracted Profile Skills ({profile.skills?.length || 0})</h4>
            {(!profile.skills || profile.skills.length === 0) ? (
              <p className="text-xs text-gray-500">No skills extracted yet. Upload your PDF or paste resume text above to extract your skills.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill: any, idx: number) => (
                  <div key={idx} className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs flex items-center gap-2">
                    <span className="font-bold text-white">{skill.name || String(skill)}</span>
                    {skill.category && <span className="text-[10px] text-gray-400 font-mono">({skill.category})</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
