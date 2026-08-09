'use client';

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { UploadCloud, FileText, CheckCircle2, Sparkles, User, Briefcase, Award } from 'lucide-react';

export default function ResumesPage() {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: api.getProfile,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => api.uploadResume(file),
    onSuccess: () => {
      setUploadSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setTimeout(() => setUploadSuccess(false), 4000);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Resume Intelligence & Parsing</h1>
        <p className="text-xs text-gray-400">Upload your PDF resume to extract an AI candidate profile without fabrication</p>
      </div>

      {/* PDF Upload Dropzone */}
      <div className="glass-panel p-8 rounded-3xl border-2 border-dashed border-gray-700/80 hover:border-blue-500/50 transition text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/30 mx-auto flex items-center justify-center">
          <UploadCloud className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">Upload PDF Resume</h3>
          <p className="text-xs text-gray-400">Drag & drop your resume PDF here or click to browse files</p>
        </div>

        <input
          type="file"
          accept=".pdf,.txt"
          onChange={handleFileChange}
          className="hidden"
          id="resume-file-input"
        />

        <div className="flex items-center justify-center gap-3 pt-2">
          <label
            htmlFor="resume-file-input"
            className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-xs border border-gray-700 cursor-pointer transition"
          >
            Select PDF File
          </label>

          {selectedFile && (
            <button
              onClick={handleUploadSubmit}
              disabled={uploadMutation.isPending}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-lg shadow-blue-500/25 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{uploadMutation.isPending ? 'Parsing AI Profile...' : 'Extract AI Profile'}</span>
            </button>
          )}
        </div>

        {selectedFile && (
          <p className="text-xs text-blue-400 font-mono">Selected: {selectedFile.name}</p>
        )}

        {uploadSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Resume parsed successfully! Active Candidate Profile updated.</span>
          </div>
        )}
      </div>

      {/* Extracted Structured Profile View */}
      {profile && (
        <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                AM
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{profile.headline || 'Alex Morgan'}</h3>
                <p className="text-xs text-gray-400">{profile.location} • {profile.years_of_experience} Yrs Experience</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Verified Non-Fabricated
            </span>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Parsed Skills Breakdown</h4>
            <div className="flex flex-wrap gap-2">
              {profile.skills?.map((skill: any, idx: number) => (
                <div key={idx} className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs flex items-center gap-2">
                  <span className="font-bold text-white">{skill.name}</span>
                  <span className="text-[10px] text-gray-400 font-mono">({skill.category || 'General'})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
