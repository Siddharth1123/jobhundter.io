import uuid
from datetime import datetime
from typing import List, Optional, Any
from sqlalchemy import String, Integer, Float, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    profile: Mapped[Optional["Profile"]] = relationship("Profile", back_populates="user", uselist=False)
    resumes: Mapped[List["Resume"]] = relationship("Resume", back_populates="user")
    applications: Mapped[List["Application"]] = relationship("Application", back_populates="user")
    matches: Mapped[List["JobMatch"]] = relationship("JobMatch", back_populates="user")


class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    headline: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    years_of_experience: Mapped[float] = mapped_column(Float, default=0.0)
    target_roles: Mapped[Optional[Any]] = mapped_column(JSON, default=list) # List[str]
    preferred_locations: Mapped[Optional[Any]] = mapped_column(JSON, default=list) # List[str]
    remote_preference: Mapped[str] = mapped_column(String(50), default="flexible") # remote, hybrid, onsite, flexible
    expected_salary: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    notice_period: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    employment_type: Mapped[str] = mapped_column(String(50), default="full-time")
    skills: Mapped[Optional[Any]] = mapped_column(JSON, default=list) # List[dict]: {name, category, level}
    education: Mapped[Optional[Any]] = mapped_column(JSON, default=list)
    work_experience: Mapped[Optional[Any]] = mapped_column(JSON, default=list)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="profile")


class Resume(Base):
    __tablename__ = "resumes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    raw_text: Mapped[str] = mapped_column(Text, nullable=False)
    parsed_data: Mapped[Optional[Any]] = mapped_column(JSON, default=dict)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="resumes")


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    company_name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    location: Mapped[str] = mapped_column(String(255), default="Remote")
    employment_type: Mapped[str] = mapped_column(String(50), default="Full-time")
    salary_range: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    experience_level: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    skills_required: Mapped[Optional[Any]] = mapped_column(JSON, default=list)
    application_url: Mapped[str] = mapped_column(String(1000), nullable=False)
    source: Mapped[str] = mapped_column(String(100), default="Direct")
    source_job_id: Mapped[Optional[str]] = mapped_column(String(255), index=True, nullable=True)
    posted_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    matches: Mapped[List["JobMatch"]] = relationship("JobMatch", back_populates="job")
    applications: Mapped[List["Application"]] = relationship("Application", back_populates="job")


class JobMatch(Base):
    __tablename__ = "job_matches"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    job_id: Mapped[str] = mapped_column(String(36), ForeignKey("jobs.id"), nullable=False)
    
    overall_score: Mapped[float] = mapped_column(Float, nullable=False) # 0 to 100
    skill_score: Mapped[float] = mapped_column(Float, default=0.0)      # max 40
    experience_score: Mapped[float] = mapped_column(Float, default=0.0) # max 20
    role_score: Mapped[float] = mapped_column(Float, default=0.0)       # max 15
    location_score: Mapped[float] = mapped_column(Float, default=0.0)   # max 10
    tool_score: Mapped[float] = mapped_column(Float, default=0.0)       # max 10
    education_score: Mapped[float] = mapped_column(Float, default=0.0)  # max 5

    matched_skills: Mapped[Optional[Any]] = mapped_column(JSON, default=list)
    missing_skills: Mapped[Optional[Any]] = mapped_column(JSON, default=list) # List[{skill, importance, reason}]
    recommendation: Mapped[str] = mapped_column(String(50), default="CONSIDER") # APPLY, HIGHLY_RECOMMENDED, CONSIDER, PASS
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="matches")
    job: Mapped["Job"] = relationship("Job", back_populates="matches")


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    job_id: Mapped[str] = mapped_column(String(36), ForeignKey("jobs.id"), nullable=False)
    resume_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("resumes.id"), nullable=True)

    # CRM Stages: DISCOVERED, SAVED, APPLIED, HR_CONTACTED, INTERVIEW_SCHEDULED, TECHNICAL_ROUND, MANAGER_ROUND, HR_DISCUSSION, OFFER, ACCEPTED, REJECTED, WITHDRAWN
    stage: Mapped[str] = mapped_column(String(50), default="SAVED", index=True)
    
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    job_title: Mapped[str] = mapped_column(String(255), nullable=False)
    application_url: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)

    recruiter_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    recruiter_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    recruiter_linkedin: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    match_score: Mapped[Optional[float]] = mapped_column(Float, default=0.0)
    applied_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    follow_up_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    tailored_resume_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    outreach_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="applications")
    job: Mapped["Job"] = relationship("Job", back_populates="applications")
    activities: Mapped[List["Activity"]] = relationship("Activity", back_populates="application", cascade="all, delete-orphan")
    notes: Mapped[List["Note"]] = relationship("Note", back_populates="application", cascade="all, delete-orphan")
    interviews: Mapped[List["Interview"]] = relationship("Interview", back_populates="application", cascade="all, delete-orphan")


class Activity(Base):
    __tablename__ = "activities"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    application_id: Mapped[str] = mapped_column(String(36), ForeignKey("applications.id"), nullable=False)
    user_id: Mapped[str] = mapped_column(String(36), nullable=False)
    
    # Types: APPLICATION, EMAIL, PHONE_CALL, LINKEDIN_MESSAGE, INTERVIEW, FOLLOW_UP, STATUS_CHANGE, NOTE
    activity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    application: Mapped["Application"] = relationship("Application", back_populates="activities")


class Note(Base):
    __tablename__ = "notes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    application_id: Mapped[str] = mapped_column(String(36), ForeignKey("applications.id"), nullable=False)
    user_id: Mapped[str] = mapped_column(String(36), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    author_name: Mapped[str] = mapped_column(String(255), default="User")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    application: Mapped["Application"] = relationship("Application", back_populates="notes")


class Interview(Base):
    __tablename__ = "interviews"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    application_id: Mapped[str] = mapped_column(String(36), ForeignKey("applications.id"), nullable=False)
    user_id: Mapped[str] = mapped_column(String(36), nullable=False)
    
    round_name: Mapped[str] = mapped_column(String(255), nullable=False) # HR Screen, Tech Round 1, Tech Round 2, Manager, HR Discussion
    scheduled_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=45)
    interviewer_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    meeting_url: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    
    # Status: SCHEDULED, COMPLETED, CANCELLED, RESCHEDULED, NO_SHOW
    status: Mapped[str] = mapped_column(String(50), default="SCHEDULED")
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    application: Mapped["Application"] = relationship("Application", back_populates="interviews")
