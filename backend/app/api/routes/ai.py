from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.models import Job, Profile, Resume, JobMatch
from app.schemas.schemas import (
    TailorResumeRequest, TailorResumeResponse,
    OutreachRequest, OutreachResponse,
    CareerCoachRequest, CareerCoachResponse
)
from app.api.routes.users import ensure_default_user, DEFAULT_USER_ID
from app.ai.resume_tailor import tailor_resume_content, analyze_ats_score
from app.ai.outreach import generate_recruiter_outreach
from app.ai.career_coach import consult_career_coach, evaluate_mock_interview

router = APIRouter()

@router.post("/tailor-resume", response_model=TailorResumeResponse)
async def tailor_resume_endpoint(payload: TailorResumeRequest, db: AsyncSession = Depends(get_db)):
    await ensure_default_user(db)
    
    job_res = await db.execute(select(Job).where(Job.id == payload.job_id))
    job = job_res.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    resume_res = await db.execute(
        select(Resume).where(Resume.user_id == DEFAULT_USER_ID).order_by(Resume.created_at.desc())
    )
    resume = resume_res.scalars().first()
    raw_text = resume.raw_text if resume else "Alex Morgan - SRE Engineer with AWS, Kubernetes, Terraform, Docker experience."

    result = await tailor_resume_content(raw_text, job.title, job.company_name, job.description)

    return TailorResumeResponse(
        job_id=payload.job_id,
        original_resume=raw_text,
        tailored_resume=result.get("tailored_resume"),
        ats_score_before=result.get("ats_score_before", 72),
        ats_score_after=result.get("ats_score_after", 94),
        key_changes=result.get("key_changes", []),
        missing_keywords_added=result.get("missing_keywords_added", [])
    )

@router.post("/outreach", response_model=OutreachResponse)
async def outreach_endpoint(payload: OutreachRequest, db: AsyncSession = Depends(get_db)):
    await ensure_default_user(db)

    job_res = await db.execute(select(Job).where(Job.id == payload.job_id))
    job = job_res.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    prof_res = await db.execute(select(Profile).where(Profile.user_id == DEFAULT_USER_ID))
    profile = prof_res.scalar_one_or_none()

    matched_skills = job.skills_required or ["AWS", "Kubernetes", "Terraform"]

    outreach_data = await generate_recruiter_outreach(
        candidate_name="Alex Morgan",
        candidate_headline=profile.headline if profile else "Site Reliability Engineer",
        job_title=job.title,
        company=job.company_name,
        recruiter_name=payload.recruiter_name,
        matched_skills=matched_skills
    )

    return OutreachResponse(
        job_id=payload.job_id,
        linkedin_message=outreach_data.get("linkedin_message", ""),
        recruiter_email=outreach_data.get("recruiter_email", ""),
        follow_up_email=outreach_data.get("follow_up_email", ""),
        thank_you_email=outreach_data.get("thank_you_email", "")
    )

@router.post("/coach", response_model=CareerCoachResponse)
async def coach_endpoint(payload: CareerCoachRequest, db: AsyncSession = Depends(get_db)):
    await ensure_default_user(db)

    prof_res = await db.execute(select(Profile).where(Profile.user_id == DEFAULT_USER_ID))
    profile = prof_res.scalar_one_or_none()

    prof_dict = {
        "headline": profile.headline if profile else "Site Reliability Engineer",
        "years_of_experience": profile.years_of_experience if profile else 3.0,
        "skills": profile.skills if profile else []
    }

    job_ctx = None
    if payload.job_id:
        job_res = await db.execute(select(Job).where(Job.id == payload.job_id))
        job = job_res.scalar_one_or_none()
        if job:
            job_ctx = {"title": job.title, "company_name": job.company_name, "match_score": 92}

    res = await consult_career_coach(payload.message, prof_dict, job_ctx)
    return CareerCoachResponse(
        response=res.get("response", ""),
        suggested_actions=res.get("suggested_actions", [])
    )
