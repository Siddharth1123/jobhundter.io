'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import Link from 'next/link';
import { Search, MapPin, Building2, Flame, ArrowRight, Sparkles, Link as LinkIcon, Globe } from 'lucide-react';

export default function JobsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [jobUrlInput, setJobUrlInput] = useState('');

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs', searchQuery, locationFilter],
    queryFn: () => api.getJobs(searchQuery, locationFilter),
  });

  const importUrlMutation = useMutation({
    mutationFn: (url: string) => api.importJobFromUrl(url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      setJobUrlInput('');
    },
  });

  const handleImportSubmit = () => {
    if (jobUrlInput.trim()) {
      importUrlMutation.mutate(jobUrlInput.trim());
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Job Discovery & Web Scraper</h1>
          <p className="text-xs text-gray-400">Discover or scrape jobs from live URLs and auto-match against your resume</p>
        </div>
      </div>

      <div className="glass-panel p-5 rounded-2xl border border-blue-500/30 space-y-3 bg-gradient-to-r from-blue-950/20 to-indigo-950/20">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Import & Scrape Job Posting from Web Link</h3>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white w-full">
            <LinkIcon className="w-4 h-4 text-gray-500" />
            <input
              type="url"
              placeholder="Paste any live Job URL (e.g. https://careers.example.com/job/sre-engineer)..."
              value={jobUrlInput}
              onChange={(e) => setJobUrlInput(e.target.value)}
              className="bg-transparent border-none outline-none text-xs w-full text-white placeholder-gray-500"
            />
          </div>

          <button
            onClick={handleImportSubmit}
            disabled={importUrlMutation.isPending || !jobUrlInput.trim()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{importUrlMutation.isPending ? 'Scraping Web URL...' : 'Scrape & Auto-Match'}</span>
          </button>
        </div>
        {importUrlMutation.isSuccess && (
          <p className="text-xs text-emerald-400 font-semibold">✓ Job successfully scraped and auto-matched against your resume!</p>
        )}
      </div>

      <div className="glass-panel p-4 rounded-2xl border border-gray-800 flex flex-col md:flex-row items-center gap-3">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-sm text-gray-200 w-full">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Filter catalog by keyword e.g. 'AWS', 'Kubernetes'..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-xs w-full text-white placeholder-gray-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-gray-200">
            <MapPin className="w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              placeholder="Location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="bg-transparent border-none outline-none text-xs w-28 text-white placeholder-gray-500"
            />
          </div>

          <button
            onClick={() => { setSearchQuery(''); setLocationFilter(''); }}
            className="px-3 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs font-semibold hover:bg-gray-700 transition"
          >
            Clear
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-44 glass-panel rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (jobs || []).length === 0 ? (
        <div className="glass-panel p-8 rounded-2xl border border-dashed border-gray-800 text-center space-y-2">
          <p className="text-sm font-bold text-gray-300">No jobs in catalog yet</p>
          <p className="text-xs text-gray-500">Paste a job posting URL above to scrape and auto-match your first role!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(jobs || []).map((job) => (
            <div
              key={job.id}
              className="glass-panel glass-panel-hover p-6 rounded-2xl border border-gray-800 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs font-semibold text-gray-400">{job.company_name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {job.source}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-1">{job.title}</h3>
                  </div>
                </div>

                <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job.skills_required.slice(0, 6).map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-900 text-gray-300 border border-gray-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gray-500" />
                    {job.location}
                  </span>
                  <span>•</span>
                  <span>{job.employment_type}</span>
                </div>

                <Link
                  href={`/jobs/${job.id}`}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-md shadow-blue-500/20 flex items-center gap-1.5"
                >
                  <span>View Match Breakdown</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
