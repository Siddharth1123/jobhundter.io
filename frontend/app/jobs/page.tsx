'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import Link from 'next/link';
import { Search, MapPin, Building2, Flame, ArrowRight, Sparkles, Filter } from 'lucide-react';

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs', searchQuery, locationFilter],
    queryFn: () => api.getJobs(searchQuery, locationFilter),
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Job Discovery & Smart Ingestion</h1>
          <p className="text-xs text-gray-400">Discover tech jobs matched directly against your candidate profile</p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-gray-400">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>Ingest Feed: 4 Sources Active</span>
        </div>
      </div>

      {/* Smart Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-gray-800 flex flex-col md:flex-row items-center gap-3">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-sm text-gray-200 w-full">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Try natural search e.g. 'Find SRE jobs in Bangalore requiring AWS and Kubernetes'..."
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

      {/* Jobs Catalog */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-44 glass-panel rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(jobs || []).map((job, idx) => {
            const mockScore = 94 - idx * 4;
            return (
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
                      </div>
                      <h3 className="text-lg font-bold text-white mt-1">{job.title}</h3>
                    </div>

                    <div className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-extrabold flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" />
                      <span>{mockScore}% MATCH</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Skills badges */}
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
            );
          })}
        </div>
      )}
    </div>
  );
}
