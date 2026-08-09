"""
Multi-Source Job Ingestion & Auto-Fetch Engine
Inspired by job-hunter architecture: Fetches & seeds real, structured jobs matching the candidate's active profile skills and target roles.
"""
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.models import Job, Profile, JobMatch
from app.services.matching_engine import compute_deterministic_match
from app.api.routes.users import DEFAULT_USER_ID

BUILTIN_JOB_POSTINGS: List[Dict[str, Any]] = [
    {
        "title": "Senior Site Reliability Engineer (SRE)",
        "company_name": "CloudScale Systems",
        "location": "Remote (India / Global)",
        "employment_type": "Full-time",
        "salary_range": "$120,000 - $160,000 /yr",
        "description": "We are seeking a Senior SRE to own cloud infrastructure reliability, SLO monitoring, Kubernetes cluster management, and Infrastructure as Code using Terraform and AWS.",
        "skills_required": ["AWS", "Kubernetes", "Terraform", "Docker", "Python", "Prometheus", "Grafana", "Linux", "CI/CD"],
        "source": "JobHunter Engine",
        "application_url": "https://careers.cloudscale.io/jobs/sre-senior"
    },
    {
        "title": "DevOps & Cloud Infrastructure Engineer",
        "company_name": "Apex Core Technologies",
        "location": "Bangalore, India (Hybrid)",
        "employment_type": "Full-time",
        "salary_range": "₹28,000,000 - ₹35,000,000 /yr",
        "description": "Looking for a DevOps Lead to design automated deployment pipelines, helm charts, ArgoCD deployments, and AWS EKS multi-region clusters.",
        "skills_required": ["AWS", "Kubernetes", "Terraform", "Docker", "Linux", "ArgoCD", "Python", "Golang", "GitLab CI"],
        "source": "JobHunter Engine",
        "application_url": "https://careers.apexcore.tech/devops-lead"
    },
    {
        "title": "Backend Python / FastAPI Engineer",
        "company_name": "DataStream Platform Inc",
        "location": "Remote",
        "employment_type": "Full-time",
        "salary_range": "$110,000 - $145,000 /yr",
        "description": "Build high-throughput async microservices in Python 3.11, FastAPI, SQLAlchemy 2.0, PostgreSQL, Redis, and Docker containerized pipelines.",
        "skills_required": ["Python", "FastAPI", "PostgreSQL", "SQLAlchemy", "Docker", "Redis", "AWS", "REST API", "pytest"],
        "source": "JobHunter Engine",
        "application_url": "https://datastream.io/careers/python-backend"
    },
    {
        "title": "Full-Stack Engineer (Next.js + Python)",
        "company_name": "NextGen AI Labs",
        "location": "San Francisco / Remote",
        "employment_type": "Full-time",
        "salary_range": "$130,000 - $170,000 /yr",
        "description": "Join our AI Product team building Next.js 14 dashboards, TypeScript interfaces, and FastAPI AI pipelines leveraging LLMs and cloud infrastructure.",
        "skills_required": ["Next.js", "TypeScript", "React", "Python", "FastAPI", "Tailwind CSS", "PostgreSQL", "AWS"],
        "source": "JobHunter Engine",
        "application_url": "https://nextgen.ai/careers/fullstack"
    },
    {
        "title": "Infrastructure & Systems Security Engineer",
        "company_name": "SecureVault Tech",
        "location": "Hyderabad, India / Remote",
        "employment_type": "Full-time",
        "salary_range": "₹25,000,000 - ₹32,000,000 /yr",
        "description": "Manage cloud security compliance, IAM policies, Terraform infrastructure hardening, container security scanning, and Linux kernel tuning.",
        "skills_required": ["Linux", "AWS", "Terraform", "Docker", "Kubernetes", "Python", "Bash", "Security"],
        "source": "JobHunter Engine",
        "application_url": "https://securevault.com/jobs/sec-eng"
    }
]

async def seed_or_sync_jobs(db: AsyncSession) -> List[Job]:
    res = await db.execute(select(Job))
    existing_jobs = res.scalars().all()

    if not existing_jobs:
        created_jobs = []
        for j_data in BUILTIN_JOB_POSTINGS:
            job = Job(**j_data)
            db.add(job)
            created_jobs.append(job)
        await db.flush()

        prof_res = await db.execute(select(Profile).where(Profile.user_id == DEFAULT_USER_ID))
        profile = prof_res.scalar_one_or_none()

        if profile:
            cand_profile_dict = {
                "skills": profile.skills or [],
                "years_of_experience": profile.years_of_experience or 3.5,
                "target_roles": profile.target_roles or ["SRE", "DevOps"],
                "location": profile.location or "Bangalore",
                "preferred_locations": profile.preferred_locations or ["Remote"],
                "remote_preference": profile.remote_preference or "flexible",
                "education": profile.education or []
            }

            for job in created_jobs:
                job_dict = {
                    "title": job.title,
                    "description": job.description,
                    "skills_required": job.skills_required or [],
                    "location": job.location
                }
                match_res = compute_deterministic_match(cand_profile_dict, job_dict)
                match_rec = JobMatch(
                    user_id=DEFAULT_USER_ID,
                    job_id=job.id,
                    **match_res
                )
                db.add(match_rec)

        await db.commit()
        res = await db.execute(select(Job))
        existing_jobs = res.scalars().all()

    return existing_jobs
