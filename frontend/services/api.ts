import {
  CandidateProfile, Job, JobMatch, Application,
  Activity, Note, Interview, DashboardMetrics,
  TailorResumeResponse, OutreachResponse, ApplicationStage
} from '../types';

const API_BASE_URL = typeof window !== 'undefined' ? '/api/v1' : (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1');

async function fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    }
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

export const api = {
  getHealth: () => fetchJSON<{ status: string }>('/health'),
  getProfile: () => fetchJSON<CandidateProfile>('/profile'),
  updateProfile: (data: Partial<CandidateProfile>) =>
    fetchJSON<CandidateProfile>('/profile', { method: 'PUT', body: JSON.stringify(data) }),

  uploadResume: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE_URL}/resumes/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Resume upload failed');
    return res.json();
  },

  getJobs: (query?: string, location?: string) => {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (location) params.append('location', location);
    return fetchJSON<Job[]>(`/jobs?${params.toString()}`);
  },
  getJob: (id: string) => fetchJSON<Job>(`/jobs/${id}`),
  importJobFromUrl: (url: string) => fetchJSON<{ job: Job; match: JobMatch }>('/jobs/import-url', {
    method: 'POST',
    body: JSON.stringify({ url })
  }),
  matchJob: (id: string) => fetchJSON<JobMatch>(`/jobs/${id}/match`, { method: 'POST' }),
  getMatches: () => fetchJSON<JobMatch[]>('/matches'),

  getApplications: (stage?: string) =>
    fetchJSON<Application[]>(`/applications${stage ? `?stage=${stage}` : ''}`),
  getApplication: (id: string) => fetchJSON<Application>(`/applications/${id}`),
  createApplication: (jobId: string, stage: ApplicationStage = 'SAVED') =>
    fetchJSON<Application>('/applications', {
      method: 'POST',
      body: JSON.stringify({ job_id: jobId, stage })
    }),
  updateApplicationStage: (id: string, stage: ApplicationStage) =>
    fetchJSON<Application>(`/applications/${id}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({ stage })
    }),

  createActivity: (appId: string, activityType: string, title: string, description?: string) =>
    fetchJSON<Activity>(`/applications/${appId}/activities`, {
      method: 'POST',
      body: JSON.stringify({ activity_type: activityType, title, description })
    }),
  getActivities: (appId: string) => fetchJSON<Activity[]>(`/applications/${appId}/activities`),

  createNote: (appId: string, content: string) =>
    fetchJSON<Note>(`/applications/${appId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ content })
    }),
  getNotes: (appId: string) => fetchJSON<Note[]>(`/applications/${appId}/notes`),

  createInterview: (appId: string, roundName: string, scheduledAt: string, interviewerName?: string, notes?: string) =>
    fetchJSON<Interview>(`/applications/${appId}/interviews`, {
      method: 'POST',
      body: JSON.stringify({
        round_name: roundName,
        scheduled_at: scheduledAt,
        duration_minutes: 45,
        interviewer_name: interviewerName,
        notes
      })
    }),
  getInterviews: () => fetchJSON<Interview[]>('/interviews'),

  tailorResume: (jobId: string) =>
    fetchJSON<TailorResumeResponse>('/ai/tailor-resume', {
      method: 'POST',
      body: JSON.stringify({ job_id: jobId })
    }),
  generateOutreach: (jobId: string, recruiterName?: string) =>
    fetchJSON<OutreachResponse>('/ai/outreach', {
      method: 'POST',
      body: JSON.stringify({ job_id: jobId, recruiter_name: recruiterName })
    }),
  askCoach: (message: string, jobId?: string) =>
    fetchJSON<{ response: string; suggested_actions: string[] }>('/ai/coach', {
      method: 'POST',
      body: JSON.stringify({ message, job_id: jobId })
    }),

  getDashboardMetrics: () => fetchJSON<DashboardMetrics>('/dashboard')
};
