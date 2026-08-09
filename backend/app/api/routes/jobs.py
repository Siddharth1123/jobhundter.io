from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.db.session import get_db
from app.models.models import Job, Profile, JobMatch
from app.schemas.schemas import JobResponse, JobCreate
from app.services.job_scraper import scrape_and_parse_job_url
from app.services.job_fetcher import seed_or_sync_jobs
from app.services.matching_engine import compute_deterministic_match
from app.api.routes.users import ensure_default_user, DEFAULT_USER_ID

router = APIRouter()

class ImportJobUrlRequest(BaseModel):
    url: str

@router.get("", response_model=List[JobResponse])
async def list_jobs(
    q: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    await ensure_default_user(db)
    await seed_or_sync_jobs(db)

    query = select(Job)
    if q:
        query = query.where(
            or_(
                Job.title.ilike(f"%{q}%"),
                Job.company_name.ilike(f"%{q}%"),
                Job.description.ilike(f"%{q}%")
            )
        )
    if location:
        query = query.where(Job.location.ilike(f"%{location}%"))

    result = await db.execute(query.order_by(Job.created_at.desc()))
    return result.scalars().all()

@router.post("/import-url")
async def import_job_from_url(payload: ImportJobUrlRequest, db: AsyncSession = Depends(get_db)):
    await ensure_default_user(db)
    
    scraped_data = await scrape_and_parse_job_url(payload.url)

    job = Job(
        title=scraped_data.get("title", "Imported Role"),
        company_name=scraped_data.get("company_name", "Web Company"),
        location=scraped_data.get("location", "Remote"),
        employment_type=scraped_data.get("employment_type", "Full-time"),
        salary_range=scraped_data.get("salary_range"),
        description=scraped_data.get("description", ""),
        skills_required=scraped_data.get("skills_required", []),
        application_url=payload.url,
        source="Web URL Import"
    )
    db.add(job)
    await db.flush()

    prof_res = await db.execute(select(Profile).where(Profile.user_id == DEFAULT_USER_ID))
    profile = prof_res.scalar_one_or_none()

    cand_profile_dict = {
        "skills": profile.skills if profile else [],
        "years_of_experience": profile.years_of_experience if profile else 3.5,
        "target_roles": profile.target_roles if profile else [],
        "location": profile.location if profile else "",
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

    match_result = compute_deterministic_match(cand_profile_dict, job_data_dict)

    match_record = JobMatch(
        user_id=DEFAULT_USER_ID,
        job_id=job.id,
        **match_result
    )
    db.add(match_record)

    await db.commit()
    await db.refresh(job)
    await db.refresh(match_record)

    return {
        "job": JobResponse.model_validate(job),
        "match": match_result
    }

@router.get("/{id}", response_model=JobResponse)
async def get_job(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).where(Job.id == id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.post("", response_model=JobResponse)
async def create_job(payload: JobCreate, db: AsyncSession = Depends(get_db)):
    job = Job(**payload.model_dump())
    db.add(job)
    await db.commit()
    await db.refresh(job)
    return job
