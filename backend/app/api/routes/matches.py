from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.models import JobMatch, Job, Profile
from app.schemas.schemas import JobMatchResponse
from app.api.routes.users import ensure_default_user, DEFAULT_USER_ID
from app.services.matching_engine import compute_deterministic_match

router = APIRouter()

@router.post("/jobs/{id}/match", response_model=JobMatchResponse)
async def match_job(id: str, db: AsyncSession = Depends(get_db)):
    await ensure_default_user(db)

    # Fetch Job
    job_res = await db.execute(select(Job).where(Job.id == id))
    job = job_res.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Fetch Profile
    prof_res = await db.execute(select(Profile).where(Profile.user_id == DEFAULT_USER_ID))
    profile = prof_res.scalar_one_or_none()
    
    cand_profile_dict = {
        "skills": profile.skills if profile else [],
        "years_of_experience": profile.years_of_experience if profile else 2.0,
        "target_roles": profile.target_roles if profile else ["DevOps Engineer"],
        "location": profile.location if profile else "Bangalore",
        "preferred_locations": profile.preferred_locations if profile else [],
        "remote_preference": profile.remote_preference if profile else "flexible",
        "education": profile.education if profile else []
    }

    job_data_dict = {
        "title": job.title,
        "description": job.description,
        "skills_required": job.skills_required or [],
        "location": job.location
    }

    # Run Deterministic Match
    match_result = compute_deterministic_match(cand_profile_dict, job_data_dict)

    # Check existing match
    exist_res = await db.execute(
        select(JobMatch).where(JobMatch.job_id == id, JobMatch.user_id == DEFAULT_USER_ID)
    )
    existing_match = exist_res.scalar_one_or_none()

    if existing_match:
        for key, val in match_result.items():
            setattr(existing_match, key, val)
        match_record = existing_match
    else:
        match_record = JobMatch(
            user_id=DEFAULT_USER_ID,
            job_id=id,
            **match_result
        )
        db.add(match_record)

    await db.commit()
    await db.refresh(match_record)
    
    # Attach job relationship for full response
    match_record.job = job
    return match_record

@router.get("/matches", response_model=List[JobMatchResponse])
async def list_matches(db: AsyncSession = Depends(get_db)):
    await ensure_default_user(db)
    result = await db.execute(
        select(JobMatch)
        .where(JobMatch.user_id == DEFAULT_USER_ID)
        .order_by(JobMatch.overall_score.desc())
    )
    matches = result.scalars().all()
    
    # Eager load jobs
    for m in matches:
        j_res = await db.execute(select(Job).where(Job.id == m.job_id))
        m.job = j_res.scalar_one_or_none()
    return matches
