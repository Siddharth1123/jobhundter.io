export interface SkillItem {
  name: string;
  category?: string;
  years_experience?: number;
}

export interface CandidateProfile {
  id: string;
  headline?: string;
  summary?: string;
  location?: string;
  years_of_experience: number;
  target_roles: string[];
  preferred_locations: string[];
  remote_preference: string;
  expected_salary?: string;
  notice_period?: string;
  employment_type: string;
  skills: SkillItem[];
  education: any[];
  work_experience: any[];
}

export interface Job {
  id: string;
  company_name: string;
  title: string;
  location: string;
  employment_type: string;
  salary_range?: string;
  experience_level?: string;
  description: string;
  skills_required: string[];
  application_url: string;
  source: string;
  source_job_id?: string;
  posted_at: string;
}

export interface MissingSkill {
  skill: string;
  importance: 'HIGH' | 'MEDIUM' | 'LOW';
  reason?: string;
}

export interface JobMatch {
  id: string;
  user_id: string;
  job_id: string;
  overall_score: number;
  skill_score: number;
  experience_score: number;
  role_score: number;
  location_score: number;
  tool_score: number;
  education_score: number;
  matched_skills: string[];
  missing_skills: MissingSkill[];
  recommendation: 'HIGHLY_RECOMMENDED' | 'APPLY' | 'CONSIDER' | 'PASS';
  explanation: string;
  created_at: string;
  job?: Job;
}

export type ApplicationStage = 
  | 'DISCOVERED'
  | 'SAVED'
  | 'APPLIED'
  | 'HR_CONTACTED'
  | 'INTERVIEW_SCHEDULED'
  | 'TECHNICAL_ROUND'
  | 'MANAGER_ROUND'
  | 'HR_DISCUSSION'
  | 'OFFER'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface Application {
  id: string;
  user_id: string;
  job_id: string;
  stage: ApplicationStage;
  company_name: string;
  job_title: string;
  application_url?: string;
  recruiter_name?: string;
  recruiter_email?: string;
  recruiter_linkedin?: string;
  match_score?: number;
  applied_date?: string;
  follow_up_date?: string;
  tailored_resume_text?: string;
  outreach_message?: string;
  created_at: string;
  updated_at: string;
  job?: Job;
}

export interface Activity {
  id: string;
  application_id: string;
  activity_type: 'APPLICATION' | 'EMAIL' | 'PHONE_CALL' | 'LINKEDIN_MESSAGE' | 'INTERVIEW' | 'FOLLOW_UP' | 'STATUS_CHANGE' | 'NOTE';
  title: string;
  description?: string;
  created_at: string;
}

export interface Note {
  id: string;
  application_id: string;
  content: string;
  author_name: string;
  created_at: string;
}

export interface Interview {
  id: string;
  application_id: string;
  round_name: string;
  scheduled_at: string;
  duration_minutes: number;
  interviewer_name?: string;
  meeting_url?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' | 'NO_SHOW';
  notes?: string;
  feedback?: string;
  score?: number;
  created_at: string;
}

export interface DashboardMetrics {
  jobs_discovered: number;
  jobs_scanned: number;
  strong_matches: number;
  saved_jobs: number;
  total_applications: number;
  active_interviews: number;
  offers_received: number;
  rejections: number;
  waiting_responses: number;
  followups_due: number;
  funnel: Record<string, number>;
  top_missing_skills: { skill: string; count: number; importance: string; reason: string }[];
}

export interface TailorResumeResponse {
  job_id: string;
  original_resume: string;
  tailored_resume: string;
  ats_score_before: number;
  ats_score_after: number;
  key_changes: string[];
  missing_keywords_added: string[];
}

export interface OutreachResponse {
  job_id: string;
  linkedin_message: string;
  recruiter_email: string;
  follow_up_email: string;
  thank_you_email: string;
}
