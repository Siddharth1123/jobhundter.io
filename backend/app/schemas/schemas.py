from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr, ConfigDict

# User & Auth
class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Candidate Profile
class SkillItem(BaseModel):
    name: str
    category: Optional[str] = "General"
    years_experience: Optional[float] = 1.0

class ProfileBase(BaseModel):
    headline: Optional[str] = None
    summary: Optional[str] = None
    location: Optional[str] = None
    years_of_experience: float = 0.0
    target_roles: List[str] = []
    preferred_locations: List[str] = []
    remote_preference: str = "flexible"
    expected_salary: Optional[str] = None
    notice_period: Optional[str] = None
    employment_type: str = "full-time"
    skills: List[SkillItem] = []
    education: List[Dict[str, Any]] = []
    work_experience: List[Dict[str, Any]] = []

class ProfileUpdate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    id: str
    user_id: str
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Resume
class ResumeResponse(BaseModel):
    id: str
    filename: str
    file_path: Optional[str] = None
    raw_text: str
    parsed_data: Dict[str, Any]
    is_primary: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Job
class JobBase(BaseModel):
    company_name: str
    title: str
    location: str = "Remote"
    employment_type: str = "Full-time"
    salary_range: Optional[str] = None
    experience_level: Optional[str] = None
    description: str
    skills_required: List[str] = []
    application_url: str
    source: str = "Direct"
    source_job_id: Optional[str] = None

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: str
    posted_at: datetime
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# 6-Factor Deterministic Match
class MissingSkillItem(BaseModel):
    skill: str
    importance: str = "HIGH" # HIGH, MEDIUM, LOW
    reason: Optional[str] = None

class JobMatchResponse(BaseModel):
    id: str
    user_id: str
    job_id: str
    overall_score: float
    skill_score: float
    experience_score: float
    role_score: float
    location_score: float
    tool_score: float
    education_score: float
    matched_skills: List[str]
    missing_skills: List[MissingSkillItem]
    recommendation: str
    explanation: str
    created_at: datetime
    job: Optional[JobResponse] = None
    model_config = ConfigDict(from_attributes=True)

# CRM Applications
class ApplicationCreate(BaseModel):
    job_id: str
    stage: str = "SAVED"
    resume_id: Optional[str] = None
    applied_date: Optional[datetime] = None
    notes: Optional[str] = None

class ApplicationUpdateStage(BaseModel):
    stage: str
    applied_date: Optional[datetime] = None

class ApplicationResponse(BaseModel):
    id: str
    user_id: str
    job_id: str
    resume_id: Optional[str] = None
    stage: str
    company_name: str
    job_title: str
    application_url: Optional[str] = None
    recruiter_name: Optional[str] = None
    recruiter_email: Optional[str] = None
    recruiter_linkedin: Optional[str] = None
    match_score: Optional[float] = 0.0
    applied_date: Optional[datetime] = None
    follow_up_date: Optional[datetime] = None
    tailored_resume_text: Optional[str] = None
    outreach_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    job: Optional[JobResponse] = None
    model_config = ConfigDict(from_attributes=True)

# Activities
class ActivityCreate(BaseModel):
    activity_type: str
    title: str
    description: Optional[str] = None

class ActivityResponse(BaseModel):
    id: str
    application_id: str
    user_id: str
    activity_type: str
    title: str
    description: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Notes
class NoteCreate(BaseModel):
    content: str
    author_name: Optional[str] = "User"

class NoteResponse(BaseModel):
    id: str
    application_id: str
    user_id: str
    content: str
    author_name: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Interviews
class InterviewCreate(BaseModel):
    round_name: str
    scheduled_at: datetime
    duration_minutes: int = 45
    interviewer_name: Optional[str] = None
    meeting_url: Optional[str] = None
    status: str = "SCHEDULED"
    notes: Optional[str] = None

class InterviewUpdate(BaseModel):
    status: Optional[str] = None
    feedback: Optional[str] = None
    score: Optional[float] = None
    notes: Optional[str] = None

class InterviewResponse(BaseModel):
    id: str
    application_id: str
    user_id: str
    round_name: str
    scheduled_at: datetime
    duration_minutes: int
    interviewer_name: Optional[str] = None
    meeting_url: Optional[str] = None
    status: str
    notes: Optional[str] = None
    feedback: Optional[str] = None
    score: Optional[float] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# AI Tooling Schemas
class TailorResumeRequest(BaseModel):
    job_id: str
    resume_id: Optional[str] = None

class TailorResumeResponse(BaseModel):
    job_id: str
    original_resume: str
    tailored_resume: str
    ats_score_before: int
    ats_score_after: int
    key_changes: List[str]
    missing_keywords_added: List[str]

class OutreachRequest(BaseModel):
    job_id: str
    recruiter_name: Optional[str] = "Hiring Manager"

class OutreachResponse(BaseModel):
    job_id: str
    linkedin_message: str
    recruiter_email: str
    follow_up_email: str
    thank_you_email: str

class CareerCoachRequest(BaseModel):
    message: str
    job_id: Optional[str] = None

class CareerCoachResponse(BaseModel):
    response: str
    suggested_actions: List[str] = []

class DashboardMetricsResponse(BaseModel):
    jobs_discovered: int
    jobs_scanned: int
    strong_matches: int
    saved_jobs: int
    total_applications: int
    active_interviews: int
    offers_received: int
    rejections: int
    waiting_responses: int
    followups_due: int
    funnel: Dict[str, int]
    top_missing_skills: List[Dict[str, Any]]
