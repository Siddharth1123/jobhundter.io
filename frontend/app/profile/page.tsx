'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { User, Save, MapPin, DollarSign, Clock, Briefcase } from 'lucide-react';

export default function ProfilePage() {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: api.getProfile,
  });

  const [headline, setHeadline] = useState('');
  const [summary, setSummary] = useState('');
  const [location, setLocation] = useState('');
  const [yearsExp, setYearsExp] = useState(3.0);
  const [noticePeriod, setNoticePeriod] = useState('30 Days');
  const [expectedSalary, setExpectedSalary] = useState('$120,000');

  React.useEffect(() => {
    if (profile) {
      setHeadline(profile.headline || '');
      setSummary(profile.summary || '');
      setLocation(profile.location || '');
      setYearsExp(profile.years_of_experience || 3.0);
      setNoticePeriod(profile.notice_period || '30 Days');
      setExpectedSalary(profile.expected_salary || '$120,000');
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      headline,
      summary,
      location,
      years_of_experience: Number(yearsExp),
      notice_period: noticePeriod,
      expected_salary: expectedSalary,
    });
  };

  if (isLoading) return <div className="h-64 glass-panel rounded-2xl animate-pulse max-w-4xl mx-auto" />;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Candidate Profile Editor</h1>
          <p className="text-xs text-gray-400">Edit preferences and skills parsed from your resume</p>
        </div>

        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-lg shadow-blue-500/25 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{updateMutation.isPending ? 'Saving...' : 'Save Profile'}</span>
        </button>
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Professional Headline</label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Years Experience</label>
            <input
              type="number"
              step="0.5"
              value={yearsExp}
              onChange={(e) => setYearsExp(Number(e.target.value))}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Notice Period</label>
            <input
              type="text"
              value={noticePeriod}
              onChange={(e) => setNoticePeriod(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Professional Summary</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full h-32 bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
